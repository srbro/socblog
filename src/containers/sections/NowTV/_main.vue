<template>
  <div
    :class="[
      'container',
      { 'no-transition-animation': !uiMode.nowTvFilterTransitionAnimation }
    ]"
    :style="containerStyle"
  >
    <page-header
      :hide="navigationActive"
      :page-title="loc('stb_guide_nowtv')"
      :active="focusSection === 'search'"
      :icon-label="loc('general_search_searchcontent')"
      :button-type="'search'"
      :handle-click="handleClickBack"
    />
    <div :class="filterClass">
      <card-selected
        v-for="(item, index) in filters"
        :key="item.id"
        :selected-title="filterLabel(item.id)"
        :selected-item="focusSection === 'filters' && index === filterSelected && !navigationActive"
        :selected-item-default="filterLabel(item.id) !== filters[index].selection && filterLabel(item.id) !== ''"
        :enable-hover="!navigationActive"
        @click.native.prevent="handleClickFilter(index)"
      />
    </div>
    <card-grid
      :items="showFakeCards ? fakeList : channels"
      :show-details="!navigationActive"
      :card-type="cardType"
      :focused="focusSection === 'cardgrid' && !navigationActive"
      :card-height="cardHeight"
      :card-width="cardWidth"
      :has-filters="true"
      :channel-focused="channelFocused"
      ref="cardGrid"
    />
  </div>
</template>

<script>
import clone from 'lodash/fp/clone'
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import { mapActions, mapState, mapGetters, mapMutations } from 'vuex'
import { OFFSET_LEFT } from 'helpers/oneliners'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'
import HistoryManager from 'mixins/HistoryManager'
import CardSelected from 'components/CardSelect'
import PageHeader from 'components/PageHeader'
import CardGrid from 'components/CardGrid'
import filterData from './filterData.json'
import { cardGridFakeCard } from 'helpers/fakeCards'
import { initialise as initialiseSelectList } from 'containers/twoSidedDialog/selectList'
// import log from 'helpers/logger'
import { EventBus } from 'helpers/eventBus'

export default {
  name: 'NowTv',
  components: {
    CardSelected,
    CardGrid,
    PageHeader
  },
  mixins: [ RegisterKeyHandler, HistoryManager ],
  data () {
    return {
      filters: [
        { id: 'now', label: 'Now', selection: this.loc('guide_nowtv_now') },
        { id: 'categories', label: 'Categories', selection: this.loc('stb_guide_categories') },
        { id: 'sort', label: 'Sort', selection: this.loc('general_sort') }
      ],
      filterItems: filterData,
      filterSelected: 0,
      channelSelected: 0,
      focusSection: 'filters',
      cardType: 'nowtv',
      filtersHidden: false,
      cardHeight: [438, 272],
      cardWidth: [300, 242],
      showDetails: false,
      isSmall: true,
      fakeList: this.generateFakeCards(10),
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
          'no-transition-animation': !this.uiMode.nowTvFilterTransitionAnimation,
          'translate': this.translateMode.translate
        }
      ]
    },
    filteredItemsNow () {
      return this.filteredSelectionItems({ values: this.filterItems.now, selectionIds: this.selectionIds.now })
    },
    filteredItemsCategories () {
      return this.filteredSelectionItems({ values: this.filterItems.categories, selectionIds: this.selectionIds.categories })
    },
    filteredItemsSort () {
      return this.filteredSelectionItems({ values: this.filterItems.sort, selectionIds: this.selectionIds.sort })
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
      showSearchButton: state => state.general.gui.showSearchButton,
      numberPage: state => state.nowtv.page,
      playingChannelId: state => state.player.currentChannelId,
      goToParentHandleKey: state => state.general.goToParentHandleKey,
      selectionIds: state => state.nowtv.selectionIds,
      eventPosition: state => state.nowtv.eventPosition,
      tvCategory: state => state.nowtv.tvCategory
    }),
    ...mapGetters({
      channels: 'nowtv/getEvents',
      categories: 'general/getNowTvTvCategories'
    })
  },
  methods: {
    filterLabel (itemId) {
      if (this.filterItems[itemId].items && this.filterItems[itemId].items.length === 0) return ''
      let result = {}
      const defaultCategory = find({default: true}, this.categories)
      if (itemId === 'categories') {
        result = find({ 'idCategory': this.tvCategory }, this.filterItems[itemId].items)
      } else {
        result = find({ 'id': this.selectionIds[itemId][0] }, this.filterItems[itemId].items)
      }
      let label = result ? this.loc(result.label) : ''
      if (!result && itemId === 'now') label = this.loc('guide_nowtv_now')
      if (!result && itemId === 'sort') label = this.loc('general_sort')
      if (!result && itemId === 'categories') {
        this.setTvCategory({ tvCategory: defaultCategory.idCategory, tvCategoryType: defaultCategory.typeCategory })
        label = defaultCategory.label
      }

      return label
    },
    filteredSelectionItems ({ values, selectionIds }) {
      let items = []
      let item
      let tempItems = []
      if (values === this.filterItems.categories) {
        items = this.filterItems.categories.items
      } else {
        items = this.locItems(values.items)
      }
      if (selectionIds.length === 0) items = this.clearSelectionSelectedItems(items)
      if (selectionIds.length !== 0) {
        tempItems = items
        item = find('selected', tempItems)
        if (item !== undefined && item.selected) delete item.selected
        if (values === this.filterItems.categories) {
          item = find({ 'idCategory': this.tvCategory }, tempItems)
        } else {
          selectionIds.forEach((id) => {
            item = find({ id }, tempItems)
          })
        }
        if (!item.children) item.selected = true
        tempItems = item.children
      }
      return {
        description: this.locDesc(values.description),
        items
      }
    },
    generateFakeCards (n) {
      let fakeCards = []
      for (let i = 0; i < n; i++) {
        let fakeCard = Object.assign({}, cardGridFakeCard)
        fakeCard.id = i
        fakeCards.push(fakeCard)
      }

      return fakeCards
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
      let item
      switch (data.id) {
        case 'now':
          currentValues = this.filteredItemsNow
          clear = false
          break
        case 'sort':
          currentValues = this.filteredItemsSort
          item = find('selected', currentValues.items)
          clear = item && item.id !== 'RECOMMENDED'
          if (this.selectionIds.sort.length === 0) {
            currentValues.items[2].selected = true
          }
          break
        case 'categories':
          currentValues = this.filteredItemsCategories
          clear = false
          break
      }
      currentValues.description = this.localizeDescription(currentValues.description)
      if (currentValues.length !== 0) {
        initialiseSelectList({
          values: currentValues,
          callback: (newValue) => {
            if (newValue !== 'EXIT' && data.id === 'sort') {
              const inx = findIndex({id: newValue[0]})(this.filterItems.sort.items)
              let typesort = this.filterItems.sort.items[inx].type
              if (inx >= 0 && this.filterItems.sort.items[inx].type) {
                typesort = typesort === 'ASC' ? 'DESC' : 'ASC'
                this.filterItems.sort.items[inx].type = this.filterItems.sort.items[inx].type === 'ASC' ? 'DESC' : 'ASC'
              }
              this.setSort({ channelSort: newValue[0], sortDir: typesort })
              this.updateSelectionIds({ newData: data.id, newSelectionIds: newValue })
            } else if (newValue !== 'EXIT' && data.id === 'categories') {
              this.setTvCategory({ tvCategory: this.categories[newValue[0]].idCategory, tvCategoryType: this.categories[newValue[0]].typeCategory })
              this.updateSelectionIds({ newData: data.id, newSelectionIds: newValue })
            } else if (newValue !== 'EXIT' && data.id === 'now') {
              this.setEventPosition({ eventPosition: newValue[0] })
              this.updateSelectionIds({ newData: data.id, newSelectionIds: newValue })
            } else if (newValue !== 'EXIT') {
              this.updateSelectionIds({ newData: data.id, newSelectionIds: newValue })
            }
          },
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
    moveFilterSelection (direction) {
      const offset = direction === 'left' ? -1 : 1
      this.filterSelected = Math.min(this.filters.length - 1, Math.max(0, this.filterSelected + offset))
    },
    handleKey (key) {
      if (key === 'BACK') {
        this.doHistoryBack()
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
            } else if (this.focusSection === 'search') {
              this.focusSection = 'filters'
            }
            break
        }
      } else if (this.focusSection === 'cardgrid') {
        EventBus.$emit('cardGrid', {action: 'handleKey', value: key})
        this.filtersHidden = this.$refs.cardGrid.selectedItem > 4
        // deo za pagining
        // if (this.numberPage * 30 <= this.$refs.cardGrid.selectedItem - 10) {
        //   this.loadMore()
        // }
      }
    },
    handleClickFilter (index) {
      if (!this.navigationActive) {
        this.showSelection(this.filters[index])
      }
    },
    handleClickBack () {
      this.$router.push({ name: 'Search' })
    },
    ...mapActions({
      toggleNavigation: 'navigation/toggle',
      setEventPosition: 'nowtv/setEventPosition',
      loadMore: 'nowtv/loadMore',
      setSort: 'nowtv/setSort',
      setTvCategory: 'nowtv/setTvCategory'
    }),
    ...mapMutations({
      updateGoToParentHandleKey: 'general/UPDATE_GOTO_PARENT_HANDLEKEY',
      updatePlayerRedirectParams: 'parentalRating/UPDATE_PLAYER_REDIRECT_PARAMS',
      updateParentalPlayerMode: 'parentalRating/UPDATE_PLAYER_MODE',
      updateSelectionIds: 'nowtv/UPDATE_SELECTION_IDS'
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
    }
  },
  created () {
    this.filterItems.categories.items = this.categories
    const defaultCat = find({default: true}, this.categories)
    if (defaultCat) {
      this.filters[1].selection = defaultCat.label
    }
    this.focusSection = (this.$route.params && this.$route.params.activeStripe) || this.focusSection
    if (this.focusSection !== 'cardgrid') {
      this.channelFocused = 0
    } else {
      this.channelFocused = this.channels.findIndex(x => x.channelId === this.playingChannelId)
    }
    if (this.$route.params && this.$route.params.toggleNavigation) {
      this.toggleNavigation(false)
    }
  },
  mounted () {
    this.showFakeCards = true
    this.$nextTick(() => {
      this.setEventPosition({eventPosition: this.eventPosition})
      setTimeout(() => {
        this.showFakeCards = false
      }, 300)
    })
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
    &:nth-child(3) {
      margin-left: 624rem;
    }
  }
  &.small {
    transform: scale3d(0.807, 0.807, 1);
    .card-selected {
      margin-right: 13rem;
      &:nth-child(3) {
        margin-left: 632rem;
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

</style>
