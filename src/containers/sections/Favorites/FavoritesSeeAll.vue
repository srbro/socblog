<template>
  <div
    class="container"
    :style="containerStyle"
  >
    <!--Header-->
    <page-header
      :class="{'hide': filtersHidden, 'translate': translateMode.translate}"
      :hide="navigationActive"
      :page-title="loc(this.pageTitle)"
      :active="focusSection === 'search'"
      :icon-label="loc('guide_eventplaying_back')"
      button-type="back"
    />
    <!--redaeh-->

    <!--Filters-->
<!--     <div :class="[
      'filter-container',
      {'small': navigationActive },
      {'hide': filtersHidden}
    ]"> -->

      <!--Filter cards-->
<!--       <card-selected
        v-for="item, index in filters"
        :key="item.id"
        :selected-title="filterLabel(item.id)"
        :selected-item="focusSection === 'filters' && index === filterSelected && !navigationActive"
        :selected-item-default="filterLabel(item.id) !== filters[index].selection && filterLabel(item.id) !== ''"
      />
       </div>-->
      <!--sdrac retlif-->
    <!--sretlif-->

    <!--Card grid -->

    <card-grid
      v-if="cardType === 'nowtv'"
      :items="channels"
      :show-details="!navigationActive"
      :card-type="'favorites'"
      :focused="focusSection === 'cardgrid' && !navigationActive"
      :card-height="cardHeight_nowTv"
      :card-width="cardWidth_nowTv"
      :has-filters="true"
      ref="cardGrid"
    />

     <card-grid
      v-if="cardType === 'vod'"
      class='reset-margin'
      :style="translate"
      :items="channels"
      :show-details="!navigationActive"
      :card-type="cardType"
      :focused="focusSection === 'cardgrid' && !navigationActive"
      :card-height="cardHeight_vue"
      :card-width="cardWidth_vue"
      ref="cardGrid"
    />
    <!--dirg drac-->
  </div>
</template>

<script>
import clone from 'lodash/fp/clone'
import { mapActions, mapState, mapGetters, mapMutations } from 'vuex'
import { OFFSET_LEFT } from 'helpers/oneliners'
import { EventBus } from 'helpers/eventBus'

import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'
import HistoryManager from 'containers/mixins/HistoryManager'
import CardSelected from 'components/CardSelect'
import PageHeader from 'components/PageHeader'
import CardGrid from 'components/CardGrid'
import { initialise as initialiseSelectList } from 'containers/twoSidedDialog/selectList'

export default {
  name: 'FavoritesSeeAll',
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
        // { id: 'categories', label: 'Categories' },
        { id: 'sort', label: 'Sort', selection: this.loc('general_sort') }
      ],
      // filterItems: filterData,
      filterSelected: 0,
      channelSelected: 0,
      focusSection: 'cardgrid',
      pageTitle: '',
      cardType: '',
      filtersHidden: false,
      cardHeight_nowTv: [438, 262],
      cardWidth_nowTv: [300, 242],
      cardHeight_vue: [464, 322],
      cardWidth_vue: [248, 248],
      showDetails: false,
      isSmall: true,
      selectionIds: {
        now: [],
        categories: [],
        sort: ['RECOMMENDED']
      },
      translateMode: window.translateMode
    }
  },
  computed: {
    translate () {
      let translateY = this.focusSection === 'cardgrid' ? '-276' : '0'
      translateY = 0
      let transform3d = `transform: translate3d(${OFFSET_LEFT[!this.navigationActive ? 'active' : 'inactive']}rem, ${translateY}rem, 0);`
      let transform2d = `transform: translate(${OFFSET_LEFT[!this.navigationActive ? 'active' : 'inactive']}rem, ${translateY}rem);`
      return !this.translateMode.translate ? transform3d : transform2d
    },
    channels () {
      if (this.cardType === 'vod') {
        return this.vodFavorites
      } else {
        return this.eventFavorites
      }
    },
    containerStyle () {
      const offsetX = !this.navigationActive ? OFFSET_LEFT.active : OFFSET_LEFT.inactive
      const offsetY = this.focusSection === 'cardgrid' ? 0 : 0
      let transform3d = `transform: translate3d(${offsetX}rem, ${offsetY}rem, 0);`
      let transform2d = `transform: translate(${offsetX}rem, ${offsetY}rem);`
      return !this.translateMode.translate ? transform3d : transform2d
    },
    ...mapState({
      navigationActive: state => state.navigation.active,
      // eventCategories: state => state.general.eventCategories,
      showSearchButton: state => state.general.gui.showSearchButton,
      goToParentHandleKey: state => state.general.goToParentHandleKey,
      totalElements: state => state.vod.totalElements
    }),
    ...mapGetters({
      vodFavorites: 'vod/vodFavorites',
      eventFavorites: 'eventFavorites/eventFavorites'
    })
  },
  methods: {
    // filterLabel (itemId) {
    //   if (this.filterItems[itemId].items && this.filterItems[itemId].items.length === 0) return ''
    //   let result = find({ 'id': this.selectionIds[itemId][0] }, this.filterItems[itemId].items)
    //   let label = result ? result.id === 'RECOMMENDED' ? this.loc('general_sort') : this.loc(result.label) : this.loc('stb_guide_categories')
    //   if (!result && itemId === 'now') label = this.loc('guide_nowtv_now')
    //   if (!result && itemId === 'sort') label = this.loc('general_sort')

    //   return label
    // },
    // filteredSelectionItems ({ values, selectionIds }) {
    //   let items = this.locItems(values.items)
    //   if (selectionIds.length === 0) items = this.clearSelectionSelectedItems(items)
    //   if (selectionIds.length !== 0) {
    //     let item
    //     let tempItems = items
    //     selectionIds.forEach((id) => {
    //       item = find('selected', tempItems)
    //       if (item !== undefined && item.selected) delete item.selected
    //       item = find({ id }, tempItems)
    //       if (!item.children) item.selected = true
    //       tempItems = item.children
    //     })
    //   }
    //   return {
    //     description: this.locDesc(values.description),
    //     items
    //   }
    // },
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
      if (this.filterSelected === 0) { currentValues = this.filteredItemsNow }
      if (this.filterSelected === 1) { currentValues = this.filteredItemsCategories }
      if (this.filterSelected === 1) { currentValues = this.filteredItemsSort }
      currentValues.description = this.localizeDescription(currentValues.description)

      if (currentValues.length !== 0) {
        initialiseSelectList({
          values: currentValues,
          callback: (newValue) => {
            if (newValue !== 'EXIT') {
              this.$set(this.selectionIds, data.id, newValue)
            }
          },
          clearVisible: this.filterSelected === 0,
          clearText: this.loc('stb_ondemand_genre_clearselection'),
          theme: 'dark',
          type: 'selectList'
        })
      }
    },
    localizeDescription (description) {
      let newDescription = this.locDesc(description)
      newDescription.titleAbove = `${this.loc('general_navigation_guide')} // ${this.loc('guide_nowtv')}`
      return newDescription
    },
    fetchEvents () {
      let channelSort = this.selectionIds.sort.length > 0 ? this.selectionIds.sort[0] : 'RECOMMENDED'
      let eventPosition = this.selectionIds.now.length > 0 ? this.selectionIds.now[0] : 0
      let categoryId = this.selectionIds.categories.length > 0 ? this.selectionIds.categories[0] : undefined

      return this.fetchCurrentEvents({
        eventPosition,
        channelSort,
        channelType: 'TV',
        categoryId,
        page: 0,
        size: 1000
      })
    },
    categories () {
      if (!this.eventCategories || this.eventCategories.length === 0) { return [] }
      return this.eventCategories
        .map(category => ({
          id: category.id,
          label: category.name
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
              this.$router.push({ name: 'Favorites' })
            }
            break
          case 'UP':
            if (this.focusSection === 'filters' && this.showSearchButton) {
              this.focusSection = 'search'
            }
            break
          case 'DOWN':
            // if (this.focusSection === 'filters') {
            this.focusSection = 'cardgrid'
            // } else if (this.focusSection === 'search') {
            //   this.focusSection = 'filters'
            // }
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
            if (this.focusSection === 'search') {
              this.focusSection = 'cardgrid'
            }
            this.moveFilterSelection('right')
            // if (this.focusSection === 'filters') {
            // }
            break
        }
      } else if (this.focusSection === 'cardgrid') {
        EventBus.$emit('cardGrid', {action: 'handleKey', value: key})
        if (this.cardType === 'nowtv') {
          this.filtersHidden = this.$refs.cardGrid.selectedItem > 4
        } else if (this.cardType === 'vod') {
          this.filtersHidden = this.$refs.cardGrid.selectedItem > 5
        }
      }
    },
    ...mapActions({
      toggleNavigation: 'navigation/toggle',
      fetchEventCategories: 'general/fetchEventCategories',
      fetchCurrentEvents: 'epg/fetchCurrentEvents',
      getVodAssets: 'vod/fetchAssets'
    }),
    ...mapMutations({
      updateGoToParentHandleKey: 'general/UPDATE_GOTO_PARENT_HANDLEKEY',
      resetAssets: 'vod/RESET_ASSETS'
    })
  },
  watch: {
    goToParentHandleKey (newValue) {
      if (newValue === 'focusFilters') {
        this.focusSection = 'search'
      } else if (newValue === 'openNavigation') {
        this.toggleNavigation(true)
      }
      this.updateGoToParentHandleKey('')
    },
    selectionIds: {
      handler () { this.fetchEvents() },
      deep: true
    }
  },
  async created () {
    /* await this.fetchEventCategories()
    await this.fetchEvents()
    this.filterItems.categories.items = this.categories() */
  },
  beforeMount () {
    this.resetAssets()
    this.getVodAssets({inFavorites: true, size: this.totalElements})
    this.pageTitle = this.$route.params.pageTitle || this.$route.params.pageData.title
    this.cardType = this.$route.params.cardType || this.$route.params.pageData.type
  }
}
</script>

<style scoped lang="scss">
@import "variables";
.filter-container {
  display: flex;
  height: 120rem;
  transition: all $transition;
  justify-content: space-between;
  transform-origin: left bottom;
  margin-bottom: 0;
  @include transform(translate3d(0, 0, 0));
  &.translate {
    @include transform(translate(0, 0))
  }
  &.small {
    transform: scale3d(0.807, 0.807, 1);
    .card-selected {
      margin-right: 13rem;
    }
  }
  &.hide {
    @include transform(translate3d(0, -411rem, 0) !important);
    &.translate {
      @include transform(translate(0, -411rem) !important);
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
  transition: transform $transition;
  // &.cars-content {
  //   margin-top: 200rem;
  // }
  .header-container {
    margin-bottom: 0;
    &.hide {
      @include transform(translate3d(0, -435rem, 0));
      &.translate {
        @include transform(translate(0, -435rem));
      }
    }
    transition: transform $transition-fast;
  }
}
.selected-item-container { font-size: 18rem; }
.reset-margin {
  margin-top: 115rem !important;
  left: -107rem;
}
</style>
