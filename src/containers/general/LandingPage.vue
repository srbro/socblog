<template>
  <div :class="['container', `container-${theme}`]">
    <page-header
      :hide="navigationActive"
      :active="activeSection === 'header'"
      :style="headerTransform"
      :page-title="headerTitle"
      :icon-label="loc('general_search_searchcontent')"
      button-type="search"
      :theme="theme"
      :handle-click="handleClickBack"
    />
    <card-row
      v-if="row.title !== `App's`"
      v-for="(row, index) in landingPageData"
      :background="row.background"
      :card-theme="row.theme ? row.theme : theme"
      :card-type="row.cardType"
      :card-width="row.cardWidth"
      :display-count="displayCount"
      :count="row.count"
      :expanded="!navigationActive"
      :focused="!navigationActive && activeSection === 'rows' && activeRow === index"
      :height="row.height"
      :items="row.cards"
      :key="index"
      :long-title="row.title"
      :selected="activeCards[index]"
      :short-title="row.title"
      :sub-title="row.title"
      :show-details="!navigationActive"
      :translate-y="rowTransforms[index]"
      :block-slide="row.blockSlide ? true : false"
      :faster-animation="fasterAnimation"
      :active-row="activeRow === index ? true : false"
      :handle-click="handleClick"
    />
    <no-items v-if="this.showNoItems"
    :no-items-title="loc('mylibrary_nofavorites_title')"
    :no-items-text="loc('mylibrary_nofavorites_description')"
    :no-items-icon="'my-library-favorites'"
    :icon-set="true"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { emitKeyPress } from 'helpers/keyHold'
import pick from 'lodash/fp/pick'
import { OFFSET_LEFT } from 'helpers/oneliners'
import noItems from 'components/noItems'
import { EventBus } from 'helpers/eventBus'

import PageHeader from 'components/PageHeader'
import CardRow from 'containers/general/CardRow'

export default {
  name: 'LandingPage',
  components: { PageHeader, CardRow, noItems },
  data () {
    return {
      activeSection: 'rows',
      activeCards: [0],
      activeRow: this.setActiveRow,
      fasterAnimation: false,
      showNoItems: false,
      translateMode: window.translateMode
    }
  },
  computed: {
    activeCard: {
      get () {
        return this.activeCards[this.activeRow]
      },
      set (newValue) {
        this.$set(this.activeCards, this.activeRow, newValue)
      }
    },
    translateX () {
      return OFFSET_LEFT[!this.navigationActive ? 'active' : 'inactive']
    },
    headerTransform () {
      const translateY = this.activeRow > 0 ? -170 : 0
      let transform3d = `translate3d(${this.translateX}rem, ${translateY}rem, 0)`
      let transform2d = `translate(${this.translateX}rem, ${translateY}rem)`
      return {
        transform: !this.translateMode.translate ? transform3d : transform2d
      }
    },
    rowTransforms () {
      return this.landingPageData.map((row, index) => {
        const scale = this.navigationActive ? 0.809 : 1

        const start = Math.min(this.activeRow, index)
        const end = Math.max(this.activeRow, index)
        const translateY = this.landingPageData.slice(start, end).reduce((sum, item) =>
          sum + item.height[this.navigationActive ? 'closed' : 'open'],
        0)
        const direction = this.activeRow > index ? -1 : 1
        let transform3dRow = `translate3d(${this.translateX}rem, ${translateY * direction}rem, 0) scaleX(${scale}) scaleY(${scale})`
        let transform2dRow = `translate(${this.translateX}rem, ${translateY * direction}rem) scaleX(${scale}) scaleY(${scale})`

        return {
          'transform': !this.translateMode.translate ? transform3dRow : transform2dRow
        }
      })
    },
    ...mapState({
      navigationActive: state => state.navigation.active,
      vodOption: state => state.vod.vodPolicy,
      clickedItem: state => state.clicker.lastClick
    })
  },
  methods: {
    handleKey (key) {
      switch (key) {
        case 'BACK':
          this.toggleNavigation(true)
          break
      }
      if (this.landingPageData.length === 0) {
        switch (key) {
          case 'LEFT':
            this.toggleNavigation(true)
            break
        }
      } else if (this.activeSection === 'header') {
        // Header active
        switch (key) {
          case 'DOWN':
          case 'RIGHT':
            this.activeSection = 'rows'
            break
          case 'LEFT':
            this.toggleNavigation(true)
            this.activeCards = this.landingPageData.map(() => 0)
            break
          case 'OK':
            this.$router.push({ name: 'Search' })
            break
        }
      } else if (this.activeSection === 'rows') {
        // Rows of items active
        switch (key) {
          case 'LEFT':
            if (this.activeCard === 0) {
              this.toggleNavigation(true)
              this.activeCards = this.landingPageData.map(() => 0)
            } else {
              this.moveRow(key)
            }
            break
          case 'HOLD_STOP': // l for web
            this.fasterAnimation = false
            break
          case 'LEFT_HOLD': // j for web
          case 'RIGHT_HOLD': // k for web
            if (emitKeyPress({ delay: 150 })) {
              this.moveRow(key === 'LEFT_HOLD' ? 'LEFT' : 'RIGHT')
              this.fasterAnimation = true
            }
            break
          case 'RIGHT':
            this.moveRow(key)
            break
          case 'UP':
            if (this.activeRow === 0) {
              this.activeSection = 'header'
            } else {
              this.changeRows(key)
            }
            break
          case 'DOWN':
            this.changeRows(key)
            break
          case 'UP_HOLD':
          case 'DOWN_HOLD':
            if (emitKeyPress({ delay: 250 })) {
              this.changeRows(key === 'UP_HOLD' ? 'UP' : 'DOWN')
              this.fasterAnimation = true
            }
            break
          case 'OK':
            this.selectCard()
            break
        }
      }
    },
    handleClick (direction) {
      this.moveRow(direction)
    },
    handleClickBack () {
      this.$router.push({ name: 'Search' })
    },
    changeRows (direction) {
      let offset = direction === 'UP' ? -1 : 1
      this.activeRow = Math.min(Math.max(this.activeRow + offset, 0), this.landingPageData.length - 1)
    },
    moveRow (direction) {
      const offset = direction === 'LEFT' ? -1 : 1
      const currentRow = this.landingPageData[this.activeRow]
      this.activeCard = Math.min(Math.max(this.activeCard + offset, 0), currentRow.cards.length - 1)
    },
    selectCard () {
      const row = this.landingPageData[this.activeRow]
      const element = row.cards[this.activeCard]
      if (this.$route.name !== 'VodLanding' || this.vodOption === true) {
        element.click(element, row.cardType, this.$route.name, {...pick(['sort', 'catalogueId', 'categoryId', 'genreId'], this.landingPageData[this.activeRow])})
      } else {
        this.togglePopup({
          active: true,
          data: {
            type: 'title-text',
            title: this.loc('vod_comingsoon'),
            text: '',
            priority: 2
          }
        })
      }
    },
    updateActiveCards (rows) {
      if (!this.landingPageData || this.landingPageData.length === 0) {
        this.activeSection = 'header'
      } else {
        this.activeSection = 'rows'
      }
      if (this.activeCards.length < 2) {
        this.activeCards = rows.map(() => 0)
      } else {
        this.activeCards = rows.map((row, index) => {
          return this.activeCards[index] && row.cards.length >= this.activeCards[index] ? this.activeCards[index] : 0
        })
      }
    },
    ...mapActions({
      toggleNavigation: 'navigation/toggle',
      togglePopup: 'popup/toggle'
    })
  },
  props: {
    theme: {
      type: String,
      default: 'light',
      validator: value => ['light', 'dark'].indexOf(value) > -1
    },
    landingPageData: {
      type: Array
    },
    headerTitle: String,
    displayCount: Boolean,
    setActiveRow: {
      type: Number,
      default: 0,
      required: false
    },
    cardsBlocked: {
      type: Boolean,
      default: true
    },
    prevSelectedrow: {
      type: Number,
      default: null,
      required: false
    },
    prevSelectedcard: {
      type: Number,
      default: null,
      required: false
    },
    updateSelectedrow: {
      type: Function,
      default: () => null,
      required: false
    },
    updateSelectedcard: {
      type: Function,
      default: () => null,
      required: false
    }
  },
  watch: {
    landingPageData (newRows) {
      this.updateActiveCards(newRows)
      if (!newRows || newRows.length === 0) {
        this.showNoItems = true
      } else {
        this.showNoItems = false
      }
    },
    clickedItem (newClickData) {
      if (!this.navigationActive) {
        if (['FAVORITES_LIVE', 'FAVORITES_VOD', 'BANNER', 'RADIO', 'LIVE', 'APP', 'CATALOGUE', 'VIRTUAL_CATALOGUE', 'VOD', 'CATALOGUE_VOD', 'VIRTUAL_CATALOGUE_VOD', 'CONTINUE_WATCHING'].indexOf(newClickData.className) !== -1) {
          this.activeSection = 'rows'
          if (this.activeRow !== newClickData.params.rowIndex) {
            this.activeRow = newClickData.params.rowIndex
            this.activeCard = newClickData.params.index
          } else {
            this.activeCard = newClickData.params.index
            const pressOk = this.handleKey.bind(this, 'OK')
            window.setTimeout(pressOk, 40)
          }
        }
      }
    },
    activeRow (newValue) {
      this.updateSelectedrow(newValue)
    },
    activeCard (newValue) {
      this.updateSelectedcard(newValue)
    }
  },
  created () {
    this.updateActiveCards(this.landingPageData)
    let historySave = this.doHistorySave
    this.doHistorySave = () => {
      if (this.$route.name === 'Settings') {
        historySave()
      }
    }
    if (this.$route.params && this.$route.params.toggleNavigation) {
      this.toggleNavigation(false)
    }
    if (this.prevSelectedrow !== null) {
      this.activeRow = this.prevSelectedrow
      this.updateSelectedrow(null)
    }
    if (this.prevSelectedcard !== null) {
      this.activeCard = this.prevSelectedcard
    }
  },
  mounted () {
    EventBus.$on('landing', (obj) => {
      if (obj.action === 'handleKey') {
        this.handleKey(obj.value)
      }
    })
  },
  beforeDestroy () {
    EventBus.$off('landing')
  }
}
</script>

<style scoped lang="scss">
@import 'variables';

.container {
  height: 100%;
  position: relative;
  z-index: -1;
  transition: transform $transition;
  &-dark { background-color: $grey-darker; }
  // default background is white
}
</style>
