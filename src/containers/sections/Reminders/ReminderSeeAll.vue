<template>
  <div class="container" :style="containerStyle">
    <page-header
      :class="{'hide': filtersHidden}"
      :hide="navigationActive"
      :page-title="loc('stb_settings_personal_reminders')"
      :active="focusSection === 'search'"
      :icon-label="loc('guide_eventplaying_back')"
      button-type="back"
    />
    <div :class="['page-date', {'hide': filtersHidden}]">
      {{ this.pageTitle }}
    </div>
    <card-grid
      :items="channels"
      :show-details="!navigationActive"
      card-type="reminders"
      :focused="focusSection === 'cardgrid' && !navigationActive"
      :card-height="[438, 262]"
      :card-width="[300, 242]"
      ref="cardGrid"
    />
  </div>
</template>

<script>
import clone from 'lodash/fp/clone'
import find from 'lodash/fp/find'
import { mapActions, mapState, mapMutations } from 'vuex'
import OffsetLeft from 'containers/mixins/OffsetLeft'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'
import HistoryManager from 'containers/mixins/HistoryManager'
import PageHeader from 'components/PageHeader'
import CardGrid from 'components/CardGrid'
import { EventBus } from 'helpers/eventBus'

export default {
  name: 'ReminderSeeAll',
  components: {
    CardGrid,
    PageHeader
  },
  mixins: [ RegisterKeyHandler, OffsetLeft, HistoryManager ],
  data: () => ({
    channelSelected: 0,
    focusSection: 'cardgrid',
    filtersHidden: false,
    showDetails: false,
    isSmall: true,
    pageTitle: '',
    cards: [],
    selectionIds: {
      now: [],
      categories: [],
      sort: []
    }
  }),
  computed: {
    channels () {
      return (this.cards || []).map(event => ({
        channelId: event.channelId,
        firstRowText: event.firstRowText,
        secondRowText: event.secondRowText,
        logoUrl: event.logoUrl,
        imageUrl: event.imageUrl,
        progress: event.progress,
        categories: event.categories,
        eventId: event.eventId,
        startTime: new Date().getTime()
      }))
    },
    ...mapState({
      navigationActive: state => state.navigation.active,
      eventCategories: state => state.general.eventCategories,
      goToParentHandleKey: state => state.general.goToParentHandleKey
    })
  },
  methods: {
    filteredSelectionItems ({ itemsRaw, selectionIds }) {
      let items = clone(itemsRaw)
      if (selectionIds.length === 0) items = this.clearSelectionSelectedItems(items)
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

      return items
    },
    clearSelectionSelectedItems (items) {
      let newItems = clone(items)

      newItems.forEach((item) => {
        if (item.selected !== undefined && item.selected) delete item.selected
        if (item.children) this.clearSelectionSelectedItems(item.children)
      })

      return newItems
    },
    // fetchEvents () {
    //   let channelSort = this.selectionIds.sort.length > 0 ? this.selectionIds.sort[0] : 'RECOMMENDED'
    //   let eventPosition = this.selectionIds.now.length > 0 ? this.selectionIds.now[0] : 0
    //   let categoryId = this.selectionIds.categories.length > 0 ? this.selectionIds.categories[0] : undefined

    //   return this.fetchCurrentEvents({
    //     eventPosition,
    //     channelSort,
    //     channelType: 'TV',
    //     categoryId,
    //     page: 0,
    //     size: 1000
    //   })
    // },
    categories () {
      if (this.eventCategories.length === 0) { return [] }

      return this.eventCategories
        .map(category => ({
          id: category.id,
          label: category.name
        }))
    },
    handleKey (key) {
      if (key === 'BACK') {
        this.doHistoryBack()
        return
      }
      if (this.focusSection === 'search') {
        switch (key) {
          case 'OK':
            this.$router.push({ name: 'Reminders' })
            break
          case 'UP':
            if (this.focusSection === 'cardgrid') {
              this.focusSection = 'search'
            }
            break
          case 'DOWN':
            if (this.focusSection === 'search') {
              this.focusSection = 'cardgrid'
            }
            break
          case 'LEFT':
            if (this.focusSection === 'search') {
              this.toggleNavigation(true)
            }
            break
          case 'RIGHT':
            if (this.focusSection === 'search') {
              this.focusSection = 'cardgrid'
            }
            break
        }
      } else if (this.focusSection === 'cardgrid') {
        EventBus.$emit('cardGrid', {action: 'handleKey', value: key})
        this.filtersHidden = this.$refs.cardGrid.selectedItem > 4
      }
    },
    ...mapActions({
      toggleNavigation: 'navigation/toggle',
      fetchEventCategories: 'general/fetchEventCategories',
      fetchCurrentEvents: 'epg/fetchCurrentEvents'
    }),
    ...mapMutations({
      updateGoToParentHandleKey: 'general/UPDATE_GOTO_PARENT_HANDLEKEY'
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
    }
  },
  async created () {
    this.cards = this.$route.params.cards || this.$route.params.pageData.cards
    this.pageTitle = this.$route.params.pageTitle || this.$route.params.pageData.title
    await this.fetchEventCategories()
    // await this.fetchEvents()
    // this.filterItems.categories.items = this.categories()
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.container {
  align-content: flex-start;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  height: 100%;
  transition: transform $transition;
  width: 100%;
  .header-container {
    margin-bottom: 0;
    &.hide {
      transition: transform $transition-fast;
      @include transform(translate3d(0, -654rem, 0));

      &.translate {
        @include transform(translate(0, -654rem));
      }
    }
  }
  .page-date {
    color: $blue-medium;
    font-size: 40rem;
    transition: transform $transition;
    width: 100%;
    &.hide {
      transition: transform $transition-fast;
      @include transform(translate3d(0, -454rem, 0));

      &.translate {
        @include transform(translate(0, -454rem));
      }
    }
  }
  .cards-content {
    margin-top: 110rem;
    @include transform(translate3d(0, -70rem, 0));

    &.translate {
      @include transform(translate(0, -70rem));
    }
  }
}
</style>
