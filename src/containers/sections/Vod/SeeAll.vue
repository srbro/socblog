 <template>
  <div class="container">
    <page-header
      :style="translate"
      :hide="navigationActive"
      :page-title="this.$route.params.pageData.type === 'Continue' ? loc('ondemand_landingpage_continuewatching') : loc('stb_home_ondemand_videoondemand_title')"
      :active="focusSection === 'search'"
      :icon-label="this.$route.params.pageData.type === 'VOD' ? loc('general_search_searchcontent') : loc('guide_eventplaying_back')"
      :button-type="this.$route.params.pageData.type === 'VOD' ? 'search' : 'back'"
      theme="dark"
    />
    <div
      v-if="this.$route.params.pageData.type === 'VOD'"
      :class="[
        'filter-container',
        {'small': navigationActive },
        {'hide': filtersHidden}
      ]"
      :style="translate"
    >
      <card-selected
        v-for="(item, index) in headers"
        :key="item.id"
        :type="'VOD'"
        :empty="index > 2"
        :selected-title="filterLabel(item.id)"
        :selected-item="focusSection === 'filters' && index === filterSelected && !navigationActive"
        :selected-item-default="filterLabel(item.id) !== loc(headers[index].label) && filterLabel(item.id) !== ''"
        @click.native.prevent="handleClickFilter(index)"
      />
    </div>
    <item-info
      :style="translate"
      :hide="navigationActive"
      :channel-number="this.totalElements"
    />
    <card-grid
      :class="[{ 'reset-margin': this.$route.params.pageData.type === 'Continue' }]"
      :style="translate"
      :items="assets"
      :show-details="!navigationActive"
      :card-type="cardType"
      :focused="focusSection === 'cardgrid' && !navigationActive"
      :card-height="cardHeight"
      :card-width="cardWidth"
      :prev-selectedcard="previouslySelectedCardIndex"
      :update-prevselectedcardid="updatePrevSelectedCard"
      ref="cardGrid"
    />
  </div>
</template>

<script>
import clone from 'lodash/fp/clone'
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import isObject from 'lodash/fp/isObject'
import { mapActions, mapMutations, mapState, mapGetters } from 'vuex'

import { OFFSET_LEFT } from 'helpers/oneliners'
import { formatDateCard, MINUTE } from 'helpers/time'
import { getImage } from 'helpers/image'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'
import HistoryManager from 'containers/mixins/HistoryManager'
import CardSelected from 'components/CardSelect'
import PageHeader from 'components/PageHeader'
import CardGrid from 'components/CardGrid'
import ItemInfo from 'components/ItemInfo'
import filterData from './filterData.json'
import { initialise as initialiseSelectList } from 'containers/twoSidedDialog/selectList'
import vodCatalogueImage from 'assets/images/placeholders/vod_event_300x168.png'
import vodPosterImage from 'assets/images/placeholders/vod_poster_placeholder_248x366.png'
import { EventBus } from 'helpers/eventBus'

const TYPE_EVENT = 'VOD_POSTER_21_31'
const IMG_SMALL = 'STB_FHD'

const rows = [
  { id: 'search', callback: (scope) => scope.$router.push({ name: 'Search' }) },
  { id: 'filters', callback: (scope) => scope.showSelection(scope.headers[scope.filterSelected]) },
  { id: 'cardgrid', callback: (scope) => console.log('cardgrid OK') }
]

const PAGE_SIZE = 1000 // 3 x 18, 90 if needed
const ROW_ITEMS = 6
const LIMIT = Math.ceil((PAGE_SIZE / ROW_ITEMS) / 2) * ROW_ITEMS

export default {
  name: 'VodSeeAll',
  components: {
    CardSelected,
    CardGrid,
    PageHeader,
    ItemInfo
  },
  mixins: [ RegisterKeyHandler, HistoryManager ],
  data: () => ({
    headers: [
      { id: 'catalogues', label: 'ondemand_continuewatching_seeall_catalogues' },
      { id: 'categories', label: 'ondemand_categories' },
      { id: 'genres', label: 'ondemand_genre' },
      { id: 'sort', label: 'general_sort' }
    ],
    filterItems: filterData,
    filterSelected: 0,
    focusSection: 'filters',
    cardHeight: [464, 322],
    cardWidth: [248, 248],
    filtersHidden: false,
    showDetails: false,
    isSmall: true,
    translateMode: window.translateMode,
    previouslySelectedCardIndex: null
  }),
  computed: {
    cardType () {
      return this.$route.params.pageData.type.toLowerCase()
    },
    filteredItemsCatalogues () {
      return this.filteredSelectionItems({ itemsRaw: this.filterItems.catalogues, selectionIds: this.selectionIds.catalogues })
    },
    filteredItemsCategories () {
      return this.filteredSelectionItems({ itemsRaw: this.filterItems.categories, selectionIds: this.selectionIds.categories })
    },
    filteredItemsGenre () {
      return this.filteredSelectionItems({ itemsRaw: this.filterItems.genres, selectionIds: this.selectionIds.genres })
    },
    filteredItemsSort () {
      return this.filteredSelectionItems({ itemsRaw: this.filterItems.sort, selectionIds: this.selectionIds.sort })
    },
    assets () {
      return (this.vodAssets || []).map(event => {
        let secondRowText
        switch (this.vodSort) {
          case 'RELEASE_DATE':
            secondRowText = `${event.year}.`
            break
          case 'DURATION':
            secondRowText = String(Math.floor(event.duration / MINUTE)) + ' ' + this.loc('stb_settings_systempreferences_miscellaneous_zapbanner_rememberpin_mins')
            break
          case 'RATING':
            let rating = find({ metadataProviderName: 'Imdb' })(event.assetRatings)
            secondRowText = rating && rating.rating !== null ? `IMDb ${rating.rating}/10` : ''
            break
          default:
            secondRowText = formatDateCard(event.dateAdded)
            break
        }
        return {
          channelId: event.id,
          firstRowText: event.title,
          secondRowText,
          title: event.title,
          subtitle: String(event.year),
          imageUrl: getImage(event.images, IMG_SMALL, TYPE_EVENT, this.cardType === 'vod' ? vodPosterImage : vodCatalogueImage),
          categories: event.categoryIds,
          eventId: event.id,
          id: event.id,
          watched: event.watched,
          subscribed: event.subscribed,
          watchProgress: event.watchProgress,
          duration: event.duration,
          startTime: new Date().getTime()
        }
      })
    },
    translate () {
      let translateY = this.focusSection === 'cardgrid' ? '-276' : '0'
      if (this.$route.params.pageData.type === 'Continue' && this.$refs.cardGrid && this.$refs.cardGrid.selectedItem < 5) translateY = 0
      let translate2d = `transform: translate(${OFFSET_LEFT[!this.navigationActive ? 'active' : 'inactive']}rem, ${translateY}rem);`
      let translate3d = `transform: translate3d(${OFFSET_LEFT[!this.navigationActive ? 'active' : 'inactive']}rem, ${translateY}rem, 0);`
      return !this.translateMode.translate ? translate3d : translate2d
    },
    ...mapState({
      navigationActive: state => state.navigation.active,
      vodAssets: state => state.vod.assets,
      vodSort: state => state.vod.vodSort,
      goToParentHandleKey: state => state.general.goToParentHandleKey,
      totalElements: state => state.vod.totalElements,
      previouslySelectedCard: state => state.vod.selectedItems.vodSeeAllGridSelectedCard,
      selectionIds: state => state.vod.selectionIds
    }),
    ...mapGetters({
      getCatalogues: 'vod/getCatalogues',
      getCategories: 'vod/getCategories',
      getGenres: 'vod/getGenres'
    })
  },
  methods: {
    handleClickFilter (index) {
      if (!this.navigationActive) {
        this.filterSelected = index
        rows[1].callback(this)
        this.filterSelected = 0
      }
    },
    filterLabel (itemId) {
      if (this.filterItems[itemId] && this.filterItems[itemId].items && this.filterItems[itemId].items.length === 0) return ''
      let searchFrom = this.filterItems[itemId].items
      let searchBy = { 'id': this.selectionIds[itemId][0] }
      if (isObject(this.selectionIds[itemId][0])) {
        const selected = find({id: this.selectionIds[itemId][0].name})(this.filterItems[itemId].items)
        searchFrom = selected !== -1 ? selected.values : this.filterItems[itemId].items
        searchBy = { 'id': this.selectionIds[itemId][0].value }
      }
      let result = find(searchBy, searchFrom)
      let label = result ? result.id === 'RECOMMENDED' ? this.loc('general_sort') : result.label : this.loc('stb_guide_categories')
      if (result && itemId === 'categories' && result.includesAll) label = this.loc('ondemand_categories')
      if (!result && itemId === 'catalogues') label = this.loc('ondemand_continuewatching_seeall_catalogues')
      else if (result && result.includesAll && itemId === 'catalogues') label = this.loc('ondemand_continuewatching_seeall_catalogues')
      if (!result && itemId === 'genres') label = this.loc('ondemand_genre')
      else if (result && result.includesAll && itemId === 'genres') label = this.loc('ondemand_genre')
      if (!result && itemId === 'sort') label = this.loc('general_sort')
      return label
    },
    filteredSelectionItems ({ itemsRaw, selectionIds }) {
      let items = clone(itemsRaw)
      if (selectionIds.length === 0) items = this.clearSelectionSelectedItems(items)
      if (selectionIds.length !== 0) {
        let item
        let tempItems = items.items
        selectionIds.forEach((id) => {
          if (isObject(id)) {
            const result = find({id: id.name})(tempItems)
            tempItems = result !== -1 ? result.values : []
            id = id.value
          }
          item = find('selected', tempItems)
          if (item !== undefined && item.selected) delete item.selected
          item = find({ id }, tempItems)
          if (!item.children) item.selected = true
          tempItems = item.children
        })
      }

      return items
    },
    clearSelectionSelectedItems (items) {
      let newItems = clone(items)

      newItems.items.forEach((item) => {
        if (item.selected !== undefined && item.selected) delete item.selected
        if (item.children) this.clearSelectionSelectedItems(item.children)
      })

      return newItems
    },
    showSelection (data) {
      let currentValues
      let clearVisible = false
      if (this.filterSelected >= 3) clearVisible = true
      if (this.filterSelected === 0) currentValues = this.filteredItemsCatalogues
      if (this.filterSelected === 1) currentValues = this.filteredItemsCategories
      if (this.filterSelected === 2) currentValues = this.filteredItemsGenre
      if (this.filterSelected === 3) currentValues = this.filteredItemsSort
      if (this.selectionIds.sort.length === 0) {
        this.filterItems.sort.items[1].selected = true
      }
      if (currentValues.length !== 0) {
        initialiseSelectList({
          values: currentValues,
          callback: (newValue) => {
            if (newValue !== 'EXIT' && data.id === 'sort') {
              const inx = findIndex({id: newValue[0]})(this.filterItems.sort.items)

              if (inx >= 0) {
                let typesort = this.filterItems.sort.items[inx].type
                typesort = typesort === 'ASC' ? 'DESC' : 'ASC'
                this.filterItems.sort.items[inx].type = this.filterItems.sort.items[inx].type === 'ASC' ? 'DESC' : 'ASC'
                this.setSortDir(typesort)
              } else {
                this.filterItems.sort.items[1].selected = true
                this.setSortDir('DESC')
                this.filterItems.sort.items[1].type = 'DESC'
              }
              this.updateVodSort(newValue[0])
              this.setSelectionIds({ newData: data.id, newSelectionIds: newValue[0] })
            } else if (newValue !== 'EXIT') {
              this.setSelectionIds({ newData: data.id, newSelectionIds: newValue[0] })
            }
          },
          clearVisible,
          clearText: this.loc('stb_ondemand_genre_clearselection'),
          theme: 'vod',
          type: 'selectList'
        })
      }
    },
    async fetchEvents (page) {
      // PARAMS THAT API TAKES: catalogueId, categoryId, genreId, vodSort, filter, imageSize, inFavorites, page, size
      let catalogueId = this.selectionIds.catalogues.length > 0 ? this.selectionIds.catalogues[0] : undefined
      let categoryId = this.selectionIds.categories.length > 0 ? this.selectionIds.categories[0] : undefined
      let genreId = this.selectionIds.genres.length > 0 ? this.selectionIds.genres[0] : undefined
      let vodSort = this.selectionIds.sort.length > 0 ? this.selectionIds.sort[0] : 'DATE_ADDED'
      return this.fetchAssets({
        catalogueId,
        categoryId,
        genreId,
        vodSort: vodSort,
        imageSize: IMG_SMALL,
        inFavorites: false,
        page,
        size: PAGE_SIZE
      })
    },
    handleKey (key) {
      if (key === 'BACK') {
        this.doHistoryBack()
        return
      }
      if (this.focusSection !== 'cardgrid') {
        let position = findIndex({ id: this.focusSection })(rows)
        switch (key) {
          case 'OK':
            // if (position === 1) {
            //   this.showSelection(this.filters[this.filterSelected])
            // } else {
            //   this.$router.push({ name: 'Reminders' })
            // }
            rows[position].callback(this)
            break
          case 'UP':
            this.focusSection = position === 0 ? rows[0].id : rows[position - 1].id
            break
          case 'DOWN':
            if (this.$route.params.pageData.type === 'VOD') {
              this.focusSection = position === 2 ? rows[2].id : rows[position + 1].id
              break
            }
            this.focusSection = rows[2].id
            break
          case 'LEFT':
            if (this.focusSection === 'search' || this.filterSelected === 0) {
              // this.toggleNavigation(true)
              this.handleKey('BACK')
            } else {
              this.moveFilterSelection('left')
            }
            break
          case 'RIGHT':
            if (this.focusSection === 'filters') {
              this.moveFilterSelection('right')
            }
            break
        }
      } else {
        EventBus.$emit('cardGrid', {action: 'handleKey', value: key})
        if (key !== 'OK') {
          if (key === 'DOWN' || key === 'RIGHT' || key === 'DOWN_HOLD') {
            if (this.assets.length - this.$refs.cardGrid.selectedItem < LIMIT) {
              let page = Math.ceil(this.$refs.cardGrid.selectedItem / PAGE_SIZE)
              this.fetchEvents(page)
            }
          }
          this.filtersHidden = this.$route.params.pageData.type === 'VOD' ? this.$refs.cardGrid.selectedItem > 5 : this.$refs.cardGrid.selectedItem > 4
        }
      }
    },
    moveFilterSelection (direction) {
      const offset = direction === 'left' ? -1 : 1
      this.filterSelected = Math.min(this.headers.length - 1, Math.max(0, this.filterSelected + offset))
    },
    ...mapActions({
      toggleNavigation: 'navigation/toggle',
      fetchFilters: 'vod/fetchFilters',
      fetchAssets: 'vod/fetchAssets',
      setSortDir: 'vod/setSortDir',
      fetchForSelectionCCGSF: 'vod/fetchForSelectionCCGSF',
      setSelectionIds: 'vod/setSelectionIds'
    }),
    ...mapMutations({
      updateVodSort: 'vod/UPDATE_VOD_SORT',
      updateGoToParentHandleKey: 'general/UPDATE_GOTO_PARENT_HANDLEKEY',
      resetAssets: 'vod/RESET_ASSETS',
      updatePrevSelectedCard: 'vod/UPDATE_VOD_SEE_ALL_GRID_SELECTED_CARD',
      updateSelectionIds: 'vod/UPDATE_SELECTION_IDS'
    })
  },
  watch: {
    goToParentHandleKey (newValue) {
      if (newValue === 'focusFilters') {
        this.focusSection = this.$route.params.pageData.type === 'VOD' ? 'filters' : 'search'
      } else if (newValue === 'openNavigation') {
        // this.toggleNavigation(true)
        this.handleKey('BACK')
      }
      this.updateGoToParentHandleKey('')
    },
    selectionIds: {
      handler () {
        this.resetAssets()
        this.fetchEvents(0)
      },
      deep: true
    },
    assets (newAssets) {
      if (this.previouslySelectedCard) {
        let index = newAssets.findIndex(asset => asset.id === this.previouslySelectedCard)
        if (index !== -1) {
          this.focusSection = 'cardgrid'
          this.previouslySelectedCardIndex = index
        }
      } else {
        this.previouslySelectedCardIndex = null
      }
    }
  },
  async created () {
    this.filterItems = JSON.parse(JSON.stringify(filterData))
    this.headers.map(item => ({
      id: item.id,
      label: this.loc(item.label)
    }))
    this.filterItems.catalogues.items = this.getCatalogues
    this.filterItems.categories.items = this.getCategories
    this.filterItems.genres.items = this.getGenres
    this.filterItems.sort.items = this.locItems(this.filterItems.sort.items)
    Object.keys(this.filterItems).forEach((item) => {
      this.filterItems[item].description = this.locDesc(this.filterItems[item].description)
      switch (item) {
        case 'catalogues':
          this.filterItems[item].description.titleAbove = `${this.loc('home_ondemand')} ${this.loc('ondemand_criteria')}  ${this.loc('ondemand_continuewatching_seeall_catalogues')}`
          break
        case 'categories':
          this.filterItems[item].description.titleAbove = `${this.loc('home_ondemand')} ${this.loc('ondemand_criteria')}  ${this.loc('ondemand_categories')}`
          break
        case 'genres':
          this.filterItems[item].description.titleAbove = `${this.loc('home_ondemand')} ${this.loc('ondemand_criteria')}  ${this.loc('ondemand_genres')}`
          break
        case 'sort':
          this.filterItems[item].description.titleAbove = `${this.loc('home_ondemand')} ${this.loc('ondemand_criteria')}  ${this.loc('general_sort')}`
          break
      }
    })

    if (this.$route.meta && this.$route.meta.fromRoute === 'VodLanding' && this.$route.params && this.$route.params.pageData && this.$route.params.pageData.filter) {
      const initFilters = this.$route.params.pageData.filter
      let newSelectionIds = {
        catalogues: [],
        categories: [],
        genres: [],
        sort: []
      }

      if (initFilters) {
        if (initFilters.catalogId && initFilters.catalogId !== undefined) {
          newSelectionIds.catalogues = [initFilters.catalogId]
        } else {
          newSelectionIds.catalogues = []
        }
        if (initFilters.categoryId && initFilters.categoryId !== undefined) {
          newSelectionIds.categories = [initFilters.categoryId]
        } else {
          newSelectionIds.categories = []
        }
        if (initFilters.genreId && initFilters.genreId !== undefined) {
          newSelectionIds.genres = [initFilters.genreId]
        } else {
          newSelectionIds.genres = []
        }
      }
      this.updateSelectionIds(newSelectionIds)
    }

    if (this.$route.meta.fromRoute === 'VodDetail') {
      this.resetAssets()
      this.fetchEvents(0)
    } else {
      this.updatePrevSelectedCard(null)
    }

    if (this.$route.params.pageData.type !== 'VOD') {
      this.focusSection = 'cardgrid'
      this.cardType = 'continue'
      this.cardHeight = [266, 136]
      this.cardWidth = [300, 242]
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.default-image {
  background: $grey-darker;
  position: absolute;
  width: 1920rem;
  height: 100%;
  z-index: 100;
}
.filter-container {
  display: flex;
  height: 120rem;
  transition: all $transition-new;
  justify-content: space-between;
  transform-origin: left top;
  @include transform(translate3d(0, 0, 0));
  .card-selected {
    &:nth-child(4) {
      margin-left: 312rem;
    }
  }
  &.small {
    transform: scale3d(0.807, 0.807, 1);
    .card-selected {
      margin-right: 13rem;
    }
  }
  &.hide { transform: translate3d(106rem, -500rem, 0) !important; }
}
.container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  height: 100%;
  width: 100%;
  transition: transform $transition-new;
  background-color: $grey-darker;
}
.selected-item-container { font-size: 18rem; }
.reset-margin {
  margin-top: 0 !important;
}
</style>
