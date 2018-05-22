<template>
  <div
    :class="containerClass"
    :style="containerStyle"
  >
    <page-header
      :hide="navigationActive"
      :page-title="loc('home_radio')"
      :active="focusSection === 'search'"
      :icon-label="loc('general_search_searchcontent')"
    />
    <div :class="filterClass">
      <card-selected
        v-for="(item, index) in filters"
        :key="item.id"
        :selected-title="filterLabel(item.id)"
        :selected-item="focusSection === 'filters' && index === filterSelected && !navigationActive"
        :selected-item-default="filterLabel(item.id) !== filters[index].selection && filterLabel(item.id) !== ''"
        :show-is-filtered="filters[index].id !== 'now'"
        :enable-hover="!navigationActive"
        @click.native.prevent="handleClickFilter(index)"
      />
    </div>
    <card-grid
      :setSelectedItem="selectedRadio"
      :class="[{'moveTop': scrollTop}]"
      :items="showFakeCards ? fakeList : channels"
      :show-details="!navigationActive"
      :card-type="cardType"
      :focused="focusSection === 'cardgrid' && !navigationActive"
      :card-height="cardHeight"
      :card-width="cardWidth"
      :has-filters="true"
      ref="cardGrid"
      :currentChannelId="currentChannelId"
      :channel-focused="channelFocused"
      @moveTop="moveTop"
    />
  </div>
</template>

<script>
import clone from 'lodash/fp/clone'
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import { mapActions, mapState, mapMutations } from 'vuex'
import { getImage } from 'helpers/image'
import { OFFSET_LEFT } from 'helpers/oneliners'
import { radioGridFakeCard } from 'helpers/fakeCards'
import { EventBus } from 'helpers/eventBus'

import OffsetLeft from 'containers/mixins/OffsetLeft'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'
import HistoryManager from 'containers/mixins/HistoryManager'
import CardSelected from 'components/CardSelect'
import PageHeader from 'components/PageHeader'
import CardGrid from 'components/CardGrid'
import filterData from 'containers/sections/Radio/filterData.json'
import { initialise as initialiseSelectList } from 'containers/twoSidedDialog/selectList'
import radioDefaultImage from 'assets/images/placeholders/radio_placeholder_300x168.png'
import log from 'helpers/logger'
const IMG_SMALL = 'STB_FHD'
const TYPE_LOGO = 'LOGO_16_9'

const descriptionSort = {
  'title': 'general_sort',
  'titleAbove': 'stb_guide_radiostations',
  'titleBelow': 'stb_guide_nowtv_sortevents_description',
  'svgId': 'selection-radio'
}
const descriptionCategories = {
  'title': 'stb_guide_categories',
  'titleAbove': 'stb_guide_radiostations',
  'titleBelow': 'stb_guide_radio_categories_description',
  'svgId': 'selection-radio'
}

export default {
  name: 'Radio',
  components: {
    CardSelected,
    CardGrid,
    PageHeader
  },
  mixins: [ RegisterKeyHandler, OffsetLeft, HistoryManager ],
  data () {
    return {
      filters: [
        { id: 'genres', label: 'Genres', selection: this.loc('stb_guide_categories') },
        { id: 'sort', label: 'Sort', selection: this.loc('general_sort') }
      ],
      selectionClear: true,
      filterItems: filterData,
      filterSelected: 0,
      focusSection: 'filters',
      cardType: 'radio',
      filtersHidden: false,
      cardHeight: [266, 136], // 150
      cardWidth: [300, 242],
      showDetails: false,
      isSmall: true,
      selectionIds: {
        genres: [101],
        sort: []
      },
      scrollTop: false,
      fakeList: [radioGridFakeCard, radioGridFakeCard, radioGridFakeCard, radioGridFakeCard, radioGridFakeCard, radioGridFakeCard, radioGridFakeCard, radioGridFakeCard, radioGridFakeCard, radioGridFakeCard,
        radioGridFakeCard, radioGridFakeCard, radioGridFakeCard, radioGridFakeCard, radioGridFakeCard],
      showFakeCards: true,
      uiMode: window.uiMode,
      translateMode: window.translateMode,
      channelFocused: 0
    }
  },
  computed: {
    filterClass () {
      return [
        'filter-container',
        {
          'small': this.navigationActive,
          'hide': this.filtersHidden,
          'no-transition-animation': !this.uiMode.radioFilterTransitionAnimation,
          'no-shadow': !this.uiMode.radioFilterShadow,
          'translate': this.translateMode.translate
        }
      ]
    },
    selectedRadio () {
      if (this.$refs.cardGrid && this.$refs.cardGrid.selectedItem) {
        return this.$refs.cardGrid.selectedItem
      } else if (this.$route.params && this.$route.params.selectedRadio) {
        return this.$route.params.selectedRadio
      } else {
        return 0
      }
    },
    filteredItemsCategories () {
      return this.filteredSelectionItems({ values: { items: this.categories(), description: descriptionCategories }, selectionIds: this.selectionIds.genres })
    },
    filteredItemsSort () {
      return this.filteredSelectionItems({ values: this.filterItems.sort, selectionIds: this.selectionIds.sort })
    },
    channels () {
      log.pstart('Radio_channels_data')
      if (this.genres.length === 0) { return [] }
      if (typeof find({id: this.selectionIds.genres[0]})(this.genres) === 'undefined') { return [] }
      const sortItem = find({id: this.selectionIds.sort[0]})(this.filterItems.sort.items)
      const sortDESC = sortItem && sortItem.type === 'DESC'
      let allChannels = find({id: this.selectionIds.genres[0]})(this.genres).channels.map((event, index) => ({
        ...event,
        firstRowText: event.name,
        secondRowText: this.getCategoryName(event.categories),
        upperImageUrl: getImage(event.images, IMG_SMALL, TYPE_LOGO, radioDefaultImage),
        // imageUrl: generateImagePath({ imageProperty: event.images, index: 0 }),
        // progress: this.currentEventProgress({ startTime: event.startTime, endTime: event.endTime }),
        categories: event.categories,
        channelId: event.id
      }))
        .sort((a, b) => {
          if (this.selectionIds.sort[0] === 'RECOMMENDED') return 0
          if (this.selectionIds.sort[0] === 'AZ' && sortDESC) {
            const nameA = a.name.toUpperCase()
            const nameB = b.name.toUpperCase()
            if (nameA > nameB) {
              return -1
            }
            if (nameA < nameB) {
              return 1
            }
            return 0
          } else if (this.selectionIds.sort[0] === 'AZ') {
            const nameA = a.name.toUpperCase()
            const nameB = b.name.toUpperCase()
            if (nameA < nameB) {
              return -1
            }
            if (nameA > nameB) {
              return 1
            }
            return 0
          } else if (this.selectionIds.sort[0] === 'POSITION' && sortDESC) {
            const nameA = a.position
            const nameB = b.position
            if (nameA > nameB) {
              return -1
            }
            if (nameA < nameB) {
              return 1
            }
            return 0
          } else if (this.selectionIds.sort[0] === 'POSITION') {
            const nameA = a.position
            const nameB = b.position
            if (nameA < nameB) {
              return -1
            }
            if (nameA > nameB) {
              return 1
            }
            return 0
          } else {
            return 0
          }
        })
      log.pend('Radio_channels_data')
      return allChannels
    },
    genres () {
      if (this.radioList.length === 0) { return [] }
      return this.radioList
        .filter(category => {
          if (category.type === 'CATEGORY') {
            return this.radioChannels[category.id] && this.radioChannels[category.id].length > 0
          } else if (category.type === 'CUSTOM_RADIO') {
            return this.radioFavoriteLists[category.id] && this.radioFavoriteLists[category.id].channels && this.radioFavoriteLists[category.id].channels.length > 0
          } else {
            return false
          }
        })
        .map(category => ({
          id: category.id,
          label: category.type === 'CATEGORY' ? find({id: category.id})(this.radioCategories).name : this.radioFavoriteLists[category.id].name && this.radioFavoriteLists[category.id].name,
          type: category.type,
          channels: category.type === 'CATEGORY' ? this.radioChannels[category.id] : this.radioFavoriteLists[category.id] && this.radioFavoriteLists[category.id].channels
        }))
    },
    containerClass () {
      return [
        'container',
        {
          'no-transition-animation': !this.uiMode.radioTransitionAnimation
        }
      ]
    },
    containerStyle () {
      const offsetX = !this.navigationActive ? OFFSET_LEFT.active : OFFSET_LEFT.inactive
      const offsetY = this.focusSection === 'cardgrid' ? -234 : 0
      let transform3d = `transform: translate3d(${offsetX}rem, ${offsetY}rem, 0);`
      let transform2d = `transform: translate(${offsetX}rem, ${offsetY}rem);`
      return !this.translateMode.translate ? transform3d : transform2d
    },
    ...mapState({
      navigationActive: state => state.navigation.active,
      radioCategories: state => state.general.radioCategories,
      radioFavoriteLists: state => state.favorites.radioFavoriteLists,
      showSearchButton: state => state.general.gui.showSearchButton,
      radioChannels: state => state.general.radioChannels,
      radioList: state => state.general.radioList,
      currentChannelId: state => state.player.currentChannelId,
      goToParentHandleKey: state => state.general.goToParentHandleKey
    })
  },
  methods: {
    getCategoryName (categories) {
      const category = find('primary', categories)
      return category ? find({id: category.id}, this.radioCategories).name : ''
    },
    filterLabel (itemId) {
      if (this.filterItems[itemId].items && this.filterItems[itemId].items.length === 0) return ''
      let result = find({ 'id': this.selectionIds[itemId][0] }, this.filterItems[itemId].items)
      // let label = result ? result.id === 'RECOMMENDED' ? this.loc('general_sort') : this.loc(result.label) : this.loc('stb_guide_categories')
      let label = result ? this.loc(result.label) : ''
      if (!result && itemId === 'now') label = this.loc('guide_nowtv_now')
      if (!result && itemId === 'sort') label = this.loc('general_sort')
      if (!result && itemId === 'genres') label = this.loc('stb_guide_categories')
      if (label === this.genres[0].label) label = this.loc('stb_guide_categories')
      return label
    },
    filteredSelectionItems ({ values, selectionIds }) {
      let items = this.locItems(values.items)
      if (selectionIds && selectionIds.length === 0 && this.selectionClear) items = this.clearSelectionSelectedItems(items)
      if (selectionIds.length !== 0) {
        let item
        let tempItems = items
        selectionIds.forEach((id) => {
          item = find('selected', tempItems)
          if (item !== undefined && item.selected) delete item.selected
          item = find({ id }, tempItems)
          if (!item.children) item.selected = true
          tempItems = item.children
        })
      }

      return {
        description: this.locDesc(values.description),
        items
      }
    },
    clearSelectionSelectedItems (items) {
      let newItems = clone(items)

      newItems.forEach((item) => {
        if (item.selected !== undefined && item.selected) delete item.selected
        if (item.children) this.clearSelectionSelectedItems(item.children)
      })

      return newItems
    },
    showSelection (data) {
      let currentValues
      let clear
      let callback = () => {}
      switch (data.id) {
        case 'genres':
          currentValues = this.filteredItemsCategories
          currentValues.items = currentValues.items.filter(category => {
            return category.id !== 101
          })
          currentValues.description = this.localizeDescription(descriptionCategories)
          clear = true
          callback = (newValue) => {
            if (newValue !== 'EXIT' && newValue.length !== 0) {
              this.$set(this.selectionIds, data.id, newValue)
            } else if (newValue.length === 0) {
              this.$set(this.selectionIds, data.id, [101])
            }
          }
          break
        case 'sort':
          currentValues = this.filteredItemsSort
          currentValues.description = this.localizeDescription(descriptionSort)
          const item = find('selected', currentValues.items)
          clear = item && item.id !== 'RECOMMENDED'
          callback = (newValue) => {
            if (newValue !== 'EXIT') {
              if (item && item.id === newValue[0]) {
                const inx = findIndex({id: newValue[0]})(this.filterItems.sort.items)
                this.filterItems.sort.items[inx].type = item.type === 'ASC' ? 'DESC' : 'ASC'
              }
              this.$set(this.selectionIds, data.id, newValue)
            }
          }
          if (this.selectionIds.sort.length === 0) {
            currentValues.items[2].selected = true
          }
          break
      }

      if (currentValues.length !== 0) {
        initialiseSelectList({
          values: currentValues,
          callback,
          clearVisible: clear,
          clearText: this.loc('stb_ondemand_genre_clearselection'),
          theme: 'dark',
          type: 'selectList',
          backVisible: true
        })
      }
    },
    localizeDescription (description) {
      let newDescription = this.locDesc(description)
      newDescription.titleAbove = `${this.loc('general_navigation_guide')} // ${this.loc('guide_nowtv')}`
      return newDescription
    },
    categories () {
      if (!this.radioCategories || this.radioCategories.length === 0) { return [] }
      return this.genres
        .map(genre => ({
          id: genre.id,
          label: genre.label
        }))
    },
    moveFilterSelection (direction) {
      const offset = direction === 'left' ? -1 : 1
      this.filterSelected = Math.min(this.filters.length - 1, Math.max(0, this.filterSelected + offset))
    },
    handleKey (key) {
      if (key === 'BACK') {
        this.doHistoryBack()
        return
      }
      if (this.focusSection === 'filters' || this.focusSection === 'search') {
        switch (key) {
          case 'OK':
            if (this.focusSection === 'filters') {
              this.showSelection(this.filters[this.filterSelected])
            } else if (this.focusSection === 'search') {
              this.$router.push({ name: 'Search' })
            }
            break
          case 'UP':
            if (this.focusSection === 'filters' && this.showSearchButton) {
              this.focusSection = 'search'
            }
            break
          case 'DOWN':
            if (this.focusSection === 'filters') {
              if (this.channels.length > 0) {
                this.focusSection = 'cardgrid'
              }
            } else if (this.focusSection === 'search') {
              this.focusSection = 'filters'
            }
            break
          case 'LEFT':
            if (this.filterSelected === 0) {
              this.toggleNavigation(true)
            } else if (this.focusSection === 'filters') {
              this.moveFilterSelection('left')
            } else if (this.focusSection === 'search') {
              this.toggleNavigation(true)
            }
            break
          case 'RIGHT':
            if (this.focusSection === 'filters') {
              if (this.filterSelected === this.filters.length - 1) {
                this.focusSection = 'cardgrid'
              }
              this.moveFilterSelection('right')
            }
            break
        }
      } else if (this.focusSection === 'cardgrid') {
        EventBus.$emit('cardGrid', {action: 'handleKey', value: key})
        this.filtersHidden = this.$refs.cardGrid.selectedItem > 4
      }
    },
    handleClickFilter (index) {
      if (!this.navigationActive) {
        this.showSelection(this.filters[index])
      }
    },
    moveTop (value) { // used only as hack for radio cards
      this.scrollTop = value
    },
    ...mapMutations({
      updateShowSearchButton: 'general/UPDATE_SHOW_SEARCH_BUTTON',
      updateGoToParentHandleKey: 'general/UPDATE_GOTO_PARENT_HANDLEKEY'
    }),
    ...mapActions({
      toggleNavigation: 'navigation/toggle'
    })
  },
  watch: {
    goToParentHandleKey (newValue) {
      if (newValue === 'focusFilters') {
        this.focusSection = 'filters'
      } else if (newValue === 'openNavigation') {
        this.toggleNavigation(true)
      }
      this.updateGoToParentHandleKey('')
    },
    // WTF??
    selectionIds: {
      deep: true
    }
  },
  created () {
    this.updateShowSearchButton(false)
    this.focusSection = (this.$route.params && this.$route.params.focusSection) || this.focusSection
    this.filterItems.genres.items = this.genres
    if (this.focusSection !== 'cardgrid') {
      this.channelFocused = 0
    } else {
      this.channelFocused = this.channels.findIndex(x => x.channelId === this.currentChannelId)
    }
    if (this.$route.params && this.$route.params.toggleNavigation) {
      this.toggleNavigation(false)
    }
  },
  mounted () {
    this.showFakeCards = true
    this.$nextTick(() => {
      setTimeout(() => {
        this.showFakeCards = false
      }, 300)
    })
  },
  destroyed () {
    this.updateShowSearchButton(true)
  }
}
</script>

<style scoped lang="scss">
@import "variables";
.filter-container {
  display: flex;
  height: 120rem;
  transition: all $transition-fast;
  justify-content: space-between;
  transform-origin: left bottom;
  @include transform(translate3d(0, 0, 0));
  &.translate {
    @include transform(translate(0, 0));
  }
  .card-selected {
    &:nth-child(2) {
      margin-left: 936rem;
    }
  }
  &.small {
    transform: scale3d(0.807, 0.807, 1);
    .card-selected {
      margin-right: 13rem;
      &:nth-child(2) {
        margin-left: 948rem;
      }
    }
  }
  &.hide {
    @include transform(translate3d(0, -411rem, 0));

    &.translate {
      @include transform(translate(0, -411rem));
    }
  }
}
.container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  height: 100%;
  width: 100%;
  transition: transform $transition-fast;
}
.selected-item-container { font-size: 18rem; }
.moveTop {
  @include transform(translate3d(0, -290rem, 0));

  &.translate {
    @include transform(translate(0, -290rem));
  }
}
</style>
