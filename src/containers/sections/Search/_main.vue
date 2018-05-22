<template>
  <div :class="['container', `container-${theme}`]">
    <loader v-if="showLoader" />
    <input-header
      :back-active="activeSection === 'back'"
      :icon="icon"
      :style="headerTransform"
      :placeholder="placeholder"
      :text="splitText"
      :click-fn="handleInputClick"
    />
    <p v-if="noResult" class="no-search-result">{{this.loc('ondemand_nocontent_descritpion')}}</p>
    <p v-if="maxCharacters" class="no-search-result">{{this.loc('stb_search_limit_maximum_characters')}}</p>
    <!-- <card-row
      v-for="row, index in rows"
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
      :scrollable="true"
      ref="cardRow"
    /> -->
    <result-row
      v-for="(row, index) in rows"
      :active="!navigationActive && activeSection === 'rows' && activeRow === index"
      :events="row.cards"
      :expanded="true"
      :card-width="row.cardWidth"
      :count="row.count"
      :card-type="row.cardType"
      :display-count="displayCount"
      :height="row.height"
      :key="index"
      :short-title="row.title"
      :selected-index="activeCards[index]"
      :title="row.title"
      :translate="rowTransforms[index]"
      :row-transforms-x="rowTransformsX[index]"
      :faster-animation="fasterAnimation"
      :handle-click="handleClick"
      :active-row="activeRow === index ? true : false"
      :focused-rows="activeSection === 'rows' ? true : false"
      :on-result-click="mkClickSelectedCard(index)"
      ref="resultRow"
    />
    <keyboard ref="keyboard" v-if="keyboardVisible" />
  </div>
</template>
<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import InputHeader from 'components/InputHeader'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import HistoryManager from 'mixins/HistoryManager'
// import CardRow from 'containers/general/CardRow'
import Keyboard from 'containers/Keyboard'
import Loader from 'components/Loader'

import { emitKeyPress } from 'helpers/keyHold'

import ResultRow from 'containers/sections/Search/ResultRow'
import { deviceZapClass } from 'animations'

import pick from 'lodash/fp/pick'
import isEmpty from 'lodash/fp/isEmpty'
import { nowtvClick, vodClick } from 'helpers/searchActions'
import { getImage } from 'helpers/image'
import { currentEventProgress, formatTime, formatShortDateCard } from 'helpers/time'
import { OFFSET_LEFT } from 'helpers/oneliners'
import tvLogoDefaultImage from 'assets/images/placeholders/lending_page_logo_300x168.png'
import tvEventDefaultImage from 'assets/images/placeholders/landing_page_event_300x168.png'
import vodPosterImage from 'assets/images/placeholders/vod_poster_placeholder_248x366.png'
import { EventBus } from 'helpers/eventBus'

const IMG_SMALL = 'STB_FHD'
const TYPE_EVENT = 'EVENT_16_9'
const TYPE_LOGO = 'LOGO_16_9'
const TYPE_VOD_POSTER = 'VOD_POSTER_21_31'

const getConfig = (id) => {
  switch (id) {
    case 'TV':
      return {
        cardType: 'nowtv',
        cardWidth: 300,
        height: { closed: 278, open: 554 },
        mapCallback: event => {
          return {
            firstRowText: event.title,
            secondRowText: event.startTime !== null && event.endTime !== null ? formatShortDateCard(event.startTime) + ' // ' + formatTime(event.startTime) + ' - ' + formatTime(event.endTime) : '',
            logoUrl: getImage(event.channelLogos, IMG_SMALL, TYPE_LOGO, tvEventDefaultImage),
            imageUrl: getImage(event.images, IMG_SMALL, TYPE_EVENT, tvLogoDefaultImage),
            type: 'nowtv',
            id: event.id,
            channelId: event.channelId,
            startTime: new Date().getTime(),
            click: nowtvClick,
            progress: currentEventProgress(event.startTime, event.endTime),
            ...pick(['id', 'title', 'subtitle'], event)
          }
        }
      }
    case 'CUTV':
      return {
        cardType: 'nowtv',
        cardWidth: 300,
        height: { closed: 278, open: 554 },
        mapCallback: event => {
          return {
            firstRowText: event.title,
            secondRowText: event.startTime !== null && event.endTime !== null ? formatShortDateCard(event.startTime) + ' // ' + formatTime(event.startTime) + ' - ' + formatTime(event.endTime) : '',
            logoUrl: getImage(event.channelLogos, IMG_SMALL, TYPE_LOGO, tvEventDefaultImage),
            imageUrl: getImage(event.images, IMG_SMALL, TYPE_EVENT, tvLogoDefaultImage),
            type: 'nowtv',
            id: event.id,
            channelId: event.channelId,
            startTime: new Date().getTime(),
            subtitle: event.startTime !== null && event.endTime !== null ? formatShortDateCard(event.startTime) + ' // ' + formatTime(event.startTime) + ' - ' + formatTime(event.endTime) : '',
            click: nowtvClick,
            progress: currentEventProgress(event.startTime, event.endTime),
            ...pick(['id', 'title', 'subtitle'], event)
          }
        }
      }
    case 'VOD':
      return {
        cardType: 'vod',
        cardWidth: 248,
        height: { closed: 310, open: 622 },
        background: '',
        theme: 'dark',
        mapCallback: vodItem => ({
          firstRowText: vodItem.title,
          secondRowText: String(vodItem.year),
          subtitle: String(vodItem.year),
          imageUrl: getImage(vodItem.images, IMG_SMALL, TYPE_VOD_POSTER, vodPosterImage),
          click: vodClick,
          ...pick(['id', 'title'], vodItem)
        })
      }
    default:
      break
  }
}

export default {
  name: 'Search',
  mixins: [ RegisterKeyHandler, HistoryManager ],
  components: { InputHeader, ResultRow, Keyboard, Loader },
  data: () => ({
    placeholder: 'Search',
    icon: 'search',
    displayCount: true,
    theme: 'light',
    activeSection: 'rows',
    activeCards: [0],
    activeRow: 0,
    showLoader: false,
    noResult: false,
    maxCharacters: false,
    searchAnimationDelay: deviceZapClass() === 'samsung-cell' ? 300 : 150,
    fasterAnimation: false,
    translateMode: window.translateMode
  }),
  computed: {
    activeCard: {
      get () {
        return this.activeCards[this.activeRow]
      },
      set (newValue) {
        this.$set(this.activeCards, this.activeRow, newValue)
      }
    },
    rowsUnsorted () {
      return Object.keys(this.data).map(row => {
        const config = getConfig(row)
        let cards = this.data[row].map(config.mapCallback)

        return {
          ...pick(['height', 'cardType', 'cardWidth', 'background', 'theme'], config),
          cards,
          count: this.data[row].length,
          title: row
        }
      }).filter(row => {
        return row.count > 0 && (row.title !== 'VOD' || this.vodOption)
      })
    },
    rows () {
      this.rowsUnsorted.sort(function (a, b) {
        if (a.title === 'TV') {
          return -1
        }
        if (b.title === 'TV') {
          return 1
        }
        if (a.title === 'CUTV') {
          return -1
        }
        if (b.title === 'CUTV') {
          return 1
        }
        if (a.title === 'VOD') {
          return -1
        }
        if (b.title === 'VOD') {
          return 1
        }
        return 0
      })
      return this.rowsUnsorted
      // let sortedRows = this.rowsUnsorted
      // for (let i = 0; i < sortedRows.length; i++) {
      //   if (sortedRows[i].title === 'CUTV') {
      //     let element = sortedRows[i]
      //     sortedRows.splice(i, 1)
      //     sortedRows.unshift(element)
      //   } else if (sortedRows[i].title === 'TV') {
      //     let element = sortedRows[i]
      //     sortedRows.splice(i, 1)
      //     sortedRows.unshift(element)
      //   }
      // }
      // return sortedRows
    },
    translateX () {
      return OFFSET_LEFT[!this.navigationActive ? 'active' : 'inactive']
    },
    headerTransform () {
      const translateY = this.activeRow > 0 ? -170 : 0
      let transform3d = `translate3d(0rem, ${translateY}rem, 0)`
      let transform2d = `translate(0rem, ${translateY}rem)`
      return {
        transform: !this.translateMode.translate ? transform3d : transform2d
      }
    },
    rowTransformsX () {
      let translate = !this.translateMode.translate ? 'translate3d' : 'translate'
      let translateThirdParam = !this.translateMode.translate ? ', 0' : ''
      return this.rows.map((row, index) => {
        return { transform: `${translate}(${this.activeCards[index] < 5 ? 0 : -212}rem, 0rem${translateThirdParam})` }
      })
    },
    rowTransforms () {
      return this.rows.map((row, index) => {
        // const scale = this.navigationActive ? 0.809 : 1

        const start = Math.min(this.activeRow, index)
        const end = Math.max(this.activeRow, index)
        const translateY = this.rows.slice(start, end).reduce((sum, item) =>
          sum + item.height[this.navigationActive ? 'closed' : 'open'],
        0)
        const direction = this.activeRow > index ? -1 : 1

        let transformRow3d = `translate3d(${this.translateX}rem, ${translateY * direction}rem, 0)`
        let transformRow2d = `translate(${this.translateX}rem, ${translateY * direction}rem)`

        return {
          transform: !this.translateMode.translate ? transformRow3d : transformRow2d
        }
      })
    },
    ...mapState({
      keyboardVisible: state => state.keyboard.active,
      keyboardFocusSection: state => state.keyboard.focusSection,
      keyboardLastClicked: state => state.keyboard.lastClicked,
      data: state => state.search.data,
      parentRoute: state => state.search.parentRoute,
      navigationActive: state => state.navigation.active,
      vodOption: state => state.vod.vodPolicy
    }),
    ...mapGetters({
      splitText: 'keyboard/getSplitText'
    })
  },
  methods: {
    handleInputClick (parent) {
      switch (parent) {
        case 'BACK':
          this.doHistoryBack()
          break
        case 'FIELD':
          if (this.activeSection !== 'input') {
            this.activeSection = 'input'
            this.showKeyboard({text: this.splitText[0]})
          } else {
            this.hideKeyboard()
            this.activeSection = 'rows'
          }
          break
      }
    },
    handleKey (key) {
      if (key === 'BACK') {
        this.doHistoryBack()
        return
      }
      if (this.keyboardVisible) {
        EventBus.$emit('keyboard', {action: 'handleKey', value: key})
      } else if (this.activeSection === 'input') {
        // input active
        switch (key) {
          case 'DOWN':
          case 'RIGHT':
            this.activeSection = 'rows'
            break
          case 'LEFT':
            this.activeSection = 'back'
            break
        }
      } else if (this.activeSection === 'back') {
        // input active
        switch (key) {
          case 'DOWN':
            if (this.$refs.resultRow) {
              this.activeSection = 'rows'
            }
            break
          case 'RIGHT':
            this.activeSection = 'input'
            this.showKeyboard({text: this.splitText[0]})
            break
          case 'LEFT':
          case 'OK':
            // this.$router.push({name: this.parentRoute})
            this.doHistoryBack()
            break
        }
      } else if (this.activeSection === 'rows') {
        // Rows of items active
        switch (key) {
          case 'LEFT':
            // if (this.activeCard !== 0) {
            //   this.moveRow(key)
            // }
            this.moveRow(key)
            break
          case 'RIGHT':
            this.moveRow(key)
            break
          case 'UP':
            if (this.activeRow === 0) {
              this.activeSection = 'input'
              this.showKeyboard({text: this.splitText[0]})
            } else {
              this.changeRows(key)
            }
            break
          case 'DOWN':
            this.changeRows(key)
            break
          case 'OK':
            this.selectCard()
            break
          case 'HOLD_STOP': // l for web
            this.fasterAnimation = false
            break
          case 'LEFT_HOLD': // j for web
          case 'RIGHT_HOLD': // k for web
            if (emitKeyPress({ delay: this.searchAnimationDelay })) {
              this.moveRow(key === 'LEFT_HOLD' ? 'LEFT' : 'RIGHT')
              this.fasterAnimation = true
            }
            break
        }
      }
    },
    handleClick (direction) {
      this.moveRow(direction)
    },
    changeRows (direction) {
      let offset = direction === 'UP' ? -1 : 1
      this.activeRow = Math.min(Math.max(this.activeRow + offset, 0), this.rows.length - 1)
    },
    moveRow (direction) {
      const offset = direction === 'LEFT' ? -1 : 1
      const currentRow = this.rows[this.activeRow]
      this.activeCard = Math.min(Math.max(this.activeCard + offset, 0), currentRow.cards.length - 1)
    },
    selectCard () {
      const row = this.rows[this.activeRow]
      const element = row.cards[this.activeCard]
      element.click(element, row.cardType, this.$route.name, {...pick(['sort', 'catalogueId', 'categoryId', 'genreId'], this.data[row.title])})
      if (element) {
      }
    },
    mkClickSelectedCard (rowIndex) {
      return (cardIndex) => {
        return () => {
          if (this.activeSection !== 'rows') {
            this.activeSection = 'rows'
          } else if (this.activeRow !== rowIndex && this.activeSection === 'rows') {
            this.activeRow = rowIndex
            this.activeCard = cardIndex
          } else if (this.activeSection === 'rows') {
            this.activeCard = cardIndex
            const row = this.rows[this.activeRow]
            const element = row.cards[this.activeCard]
            element.click(element, row.cardType, this.$route.name, {...pick(['sort', 'catalogueId', 'categoryId', 'genreId'], this.data[row.title])})
          }
        }
      }
    },
    updateActiveCards (data) {
      this.activeCards = Object.keys(data).map(() => 0)
    },
    ...mapActions({
      showKeyboard: 'keyboard/show',
      hideKeyboard: 'keyboard/hide',
      clearText: 'keyboard/clearText',
      getSearchData: 'search/fetchSearchData',
      clearSearchData: 'search/clearSearchData'
    })
  },
  watch: {
    data (newData) {
      this.updateActiveCards(newData)
      // prikazi rezultate
      if (!isEmpty(newData) && newData.TV.length === 0 && newData.CUTV.length === 0 && newData.VOD.length === 0) {
        this.noResult = true
      } else {
        this.noResult = false
      }
      // stigli rezultati
      if (!isEmpty(newData)) this.showLoader = false
    },
    splitText (text) {
      console.log(text)
      if (this.splitText[0].length + this.splitText[1].length > 30) {
        this.clearSearchData()
        this.maxCharacters = true
      } else {
        this.maxCharacters = false
      }
    },
    keyboardVisible (active) {
      if (!active) {
        this.activeSection = 'back'
      }
    },
    keyboardFocusSection (section) {
      if (section === 'unfocused') {
        this.hideKeyboard()
      }
    },
    keyboardLastClicked (clicked) {
      console.log(clicked)
      if (clicked === 'confirm') {
        const txtLen = this.splitText[0].length + this.splitText[1].length
        this.clearSearchData()
        if (txtLen > 2 && txtLen <= 30) {
          this.showLoader = true
          this.getSearchData(this.splitText[0])
          this.hideKeyboard()
        }
      }
    }
  },
  created () {
    this.showKeyboard({text: this.splitText[0]})
    this.updateActiveCards(this.data)
    if (typeof this.$route.params.historyBackPerformed === 'undefined' || this.$route.params.historyBackPerformed === false) {
      this.clearSearchData()
      this.clearText()
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'variables';

.container {
  height: 100%;
  transition: transform $transition;
  &-dark { background-color: $grey-darker; }
  background: #f1f2f2;
  // default background is white

  .no-search-result {
    font-size: 35rem;
    color: #888a8a;
    text-align: center;
  }
}

</style>
