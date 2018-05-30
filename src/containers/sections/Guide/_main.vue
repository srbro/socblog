<template>
  <div v-bind:class="getWrapperClasses()">
    <div class="guide-container"
      :style="containerTransform"
      @transitionend.self="animateToFromDetail"
      >
      <div v-for="(columnName, index) in columns"
        :key="index"
        :class="['column', columnName, { 'is-focused': selectedColumnIndex === index, 'no-shadow': !uiMode.guideColumnTransitionAnimation }]"
        @mouseover="doColnumHover(index)">
        <scrollable-list
          v-if="columnName !== 'detail'"
          :clickFn="mkEpgItemClick(index)"
          :focused="selectedColumnIndex === index"
          :faster-animation="fasterAnimation[index]"
          :items="getComputed(columnName)"
          :selected-item-index="selectedItemsIndexes[index]"
          :column="columnName"
        />
        <detail
          v-else
          ref="detail"
          :active="selectedColumnIndex === columns.indexOf('detail')"
          :channel-id="channels[selectedItemsIndexes[1]] ? channels[selectedItemsIndexes[1]].id : 0"
          :currentCutvDelay="currentCutvDelay"
          :currentEventCutv="currentEventCutv"
          :currentStartOverEnabled="currentChannel && currentChannel.startOverEnabled ? currentChannel.startOverEnabled : false"
          :event="detailActive ? epgEventDetail : {}"
          :goBack = "doBack"
          :selectedEvent="events[selectedItemsIndexes[3]]"
        />
      </div>
      <div :class="lineClass">
        <div :class="selectionClass" :style="selectionTransforms[selectedColumnIndex]">
          <div :class="doneClass" :style="`transform: scale3d(${currentSelectionProgress}, 1, 1)`"></div>
        </div>
        <div :class="['progress', {'moveLeft': selectedColumnIndex === 3}]">
          <div :class="['done', { 'blocked': !currentEventCutv || (this.currentCutvDelay && this.currentChannel.cutvEnabled), 'no-transition-animation': !uiMode.guideColumnTransitionAnimation }]"
               :style="fasterAnimation[1] ? null : { transform: `scale3d(${this.currentEventProgress}, 1, 1)` }"></div>
        </div>
        <svg v-show="this.selectedColumnIndex < 4" class="arrow-right"
          @click="slideToDetail()"
        >
          <use xlink:href="#arrow-right"/>
        </svg>
      </div>
      <div class="arrow-live">Live</div>
    </div>
  </div>
</template>

<script>
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import { mapActions, mapState, mapMutations, mapGetters } from 'vuex'
import { emitKeyPress } from 'helpers/keyHold'
import { getImage } from 'helpers/image'

import ScrollableList from 'components/ScrollableList'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'
import Detail from 'containers/sections/Guide/Detail'
import { formatShortDate, startOfDay, isSameDay, YEAR, HOUR, adjustedMoment, currentEventProgress as helpersCurrentEventProgress } from 'helpers/time'
import { EventBus } from 'helpers/eventBus'

import defaultImage from 'assets/images/test/S_Prva_480x270.png'

import HistoryManager from 'mixins/HistoryManager'

let epgFetchTimeout = -1
let EPG_FETCH_DELAY = 300

const DEFAULT_DATE_POSITION = 7
const EPG_NUMBER_OF_DAYS = 1

let epgClickTimeout = 0

export default {
  name: 'Guide',
  mixins: [ RegisterKeyHandler, HistoryManager ],
  components: { ScrollableList, Detail },
  data: () => ({
    selectedItemsIndexes: [0, 0, DEFAULT_DATE_POSITION, 0],
    selectedColumnIndex: 0,
    columns: ['categories', 'channels', 'dates', 'events', 'detail'],
    selectionTransforms: [
      'transform: scale3d(3.14, 1, 1)',
      'transform: translate3d(315rem, 0, 0) scale3d(3.45, 1, 1)',
      'transform: translate3d(662rem, 0, 0) scale3d(1.92, 1, 1)',
      'transform: translate3d(854rem, 0, 0) scale3d(7.86, 1, 1)',
      'transform: translate3d(1980rem, 0, 0) scale3d(13.88, 1, 1)'
    ],
    detailActive: false,
    fasterAnimation: [false],
    movedToDetails: false,
    fetchDataOnSelectedItemChange: false,
    uiMode: window.uiMode,
    translateMode: window.translateMode,
    changeSelectedItemsIndex: true
  }),
  computed: {
    selectedItemIndex: {
      get () {
        return this.selectedItemsIndexes[this.selectedColumnIndex]
      },
      set (newValue) {
        this.$set(this.selectedItemsIndexes, this.selectedColumnIndex, newValue)

        // If we changed category, reset selected channel.
        if (this.selectedColumnIndex === this.columns.indexOf('categories')) {
          this.$set(this.selectedItemsIndexes, 1, 0)
        }

        // If we changed categories or channels, reset date.
        if (this.selectedColumnIndex < 2) {
          this.$set(this.selectedItemsIndexes, 2, DEFAULT_DATE_POSITION)
        }

        // If we changed anything but events, reset event position and fetch EPG.
        if (this.selectedColumnIndex < 3 && this.fetchDataOnSelectedItemChange) {
          this.fetchEPGForCurrentSelection()
        }
      }
    },
    lineClass () {
      return [
        'line',
        {
          'no-shadow': !this.uiMode.guideColumnTransitionAnimation
        }
      ]
    },
    selectionClass () {
      return [
        'selection',
        {
          'no-transition-animation': !this.uiMode.guideColumnTransitionAnimation
        }
      ]
    },
    doneClass () {
      return [
        'done',
        {
          'blocked': (!this.currentEventCutv || (this.currentCutvDelay && this.currentChannel.cutvEnabled)) && this.selectedColumnIndex >= 3,
          'no-transition-animation': !this.uiMode.guideColumnTransitionAnimation
        }
      ]
    },
    currentEvent () {
      return this.events[this.selectedItemsIndexes[3]] || {}
    },
    currentEventProgress () {
      let startTime = this.currentEvent && this.currentEvent.startTime
      let endTime = this.currentEvent && this.currentEvent.endTime

      if (this.events.length === 0 || (this.currentEvent && Object.keys(this.currentEvent).length === 0)) return 0

      return helpersCurrentEventProgress(startTime, endTime)
    },
    currentSelectionProgress () {
      return this.selectedColumnIndex >= this.columns.indexOf('events') ? this.currentEventProgress : 1
    },
    currentEventCutv () {
      if (this.events.length === 0 || Object.keys(this.currentEvent).length === 0) return ''
      return this.currentEventProgress === 1 ? this.currentChannel.cutvEnabled : true
    },
    currentCutvDelayTime () {
      return adjustedMoment() - this.currentChannel.cutvDelay
    },
    currentChannel () { // pa da predugacko je realno bolje skratiti -.-
      return this.channels[this.selectedItemsIndexes[1]]
    },
    currentCutvDelay () {
      return this.events[this.selectedItemsIndexes[3]] && this.events[this.selectedItemsIndexes[3]].startTime < this.currentCutvDelayTime
    },
    containerTransform () {
      let container3dTransform = 'translate3d(-1678rem, 0, 0)'
      let container2dTransform = 'translate(-1678rem, 0)'
      return this.selectedColumnIndex === this.columns.indexOf('detail') ? { transform: !this.translateMode.translate ? container3dTransform : container2dTransform } : {}
    },
    channels () { // koristi se u template-u bilo bi lepo da je u getteru i da categories ne bude uopste u computedu nego isto u getteru
      if (this.categories && this.categories.length === 0) return []
      return this.categories[this.selectedItemsIndexes[0]].channels.map((channel, index) => ({
        type: 'channel',
        label: channel.name,
        number: channel.position === null ? channel.id : channel.position,
        id: channel.id,
        logoUrl: getImage(channel.images, 'S', 'LOGO_16_9', defaultImage),
        cutvEnabled: channel.cutvEnabled,
        startOverEnabled: channel.startOverEnabled,
        cutvDelay: channel.cutvDelay
      }))
    },
    dates () {
      let catchupDay = Date.now() - 2 * YEAR - 2 * HOUR
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

      return [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3].map((offset) => {
        const date = Date.now() + offset * YEAR
        const dayNameFull = new Date(date).getDay()

        return {
          type: 'date',
          label: formatShortDate(date),
          todayPoint: offset === 0 && !isSameDay(date, catchupDay),
          dayName: offset === 0 ? this.loc('guide_calendar_date_today') : this.locDay(days[dayNameFull]),
          dateObject: date,
          startOfDay: startOfDay(date),
          playIcon: isSameDay(date, catchupDay),
          id: offset
        }
      })
    },
    ...mapState({
      events: state => state.guide.events,
      epgEventDetail: state => state.epg.eventDetail,
      currentPlayerEvent: state => state.player.currentEvent,
      playingEventId: state => state.player.playingEvent.id,
      currentPlayerCategory: state => state.player.currentTvCategoryId, // samo u created se koristi
      ageRating: state => state.parentalRating.ageRating
    }),
    ...mapGetters({
      categories: 'guide/getCategories',
      findChannel: 'general/findChannel'
    })
  },
  methods: {
    doBack () {
      this.handleKey('BACK')
    },
    getWrapperClasses () {
      return [
        'guide-wrapper',
        {
          'no-transition-animation': !this.uiMode.guideColumnTransitionAnimation,
          'no-shadow': !this.uiMode.guideColumnShadow
        }
      ]
    },
    slideToDetail () {
      this.selectedColumnIndex = 3
      this.handleKey('RIGHT')
    },
    epgFetcher () {
      const channelId = this.channels[this.selectedItemsIndexes[1]] ? this.channels[this.selectedItemsIndexes[1]].id : 0
      const startTime = startOfDay(this.dates[this.selectedItemsIndexes[2]].startOfDay)
      if (channelId !== 0) {
        this.fetchEvents({
          channelId,
          startTime: startTime,
          numberOfDays: EPG_NUMBER_OF_DAYS
        })
      }
    },
    scrollCurrentColumn (direction) {
      const offset = {
        UP: -1,
        DOWN: 1,
        SCROLLUP: -10,
        SCROLLDOWN: 10
      }[direction]
      const wrapAround = this.selectedColumnIndex === this.columns.indexOf('channels')
      const itemsInCurrentColumn = this[this.columns[this.selectedColumnIndex]].length
      let newPosition

      newPosition = this.selectedItemIndex + offset

      if (newPosition < 0) {
        newPosition = wrapAround && Math.abs(offset) === 1 ? itemsInCurrentColumn - 1 : 0
      } else if (newPosition >= itemsInCurrentColumn) {
        newPosition = wrapAround && Math.abs(offset) === 1 ? 0 : itemsInCurrentColumn - 1
      }

      this.selectedItemIndex = newPosition
    },
    doColnumHover (index) {
      if (!this.movedToDetails && this.selectedColumnIndex !== 4) {
        this.selectedColumnIndex = index
      }
    },
    mkEpgItemClick (columnIndex) {
      let clickFn = function (itemIndex, e) {
        window.clearTimeout(epgClickTimeout)
        if (this.selectedItemIndex === itemIndex) {
          let pressOk = this.handleKey.bind(this, 'OK')
          // Magic solution, and magic is never certain, it can fail.
          let clickTimeout = 750
          if (this.selectedColumnIndex === 3) {
            clickTimeout = 40
          }
          epgClickTimeout = window.setTimeout(pressOk, clickTimeout)
        } else {
          this.selectedItemIndex = itemIndex
        }
      }
      return clickFn.bind(this)
    },
    handleKey (key) {
      if (key === 'BACK') {
        if (!this.movedToDetails) {
          this.doHistoryBack()
        } else {
          this.moveColumn('LEFT')
        }
        return
      }

      if (this.selectedColumnIndex === this.columns.indexOf('detail')) {
        EventBus.$emit('detail', {action: 'handleKey', value: key})
        // let nesto = this.$refs.detail[0].handleKey(key)
        // if (nesto === 'exit') {
        //   this.moveColumn('LEFT')
        // }
        return
      }

      switch (key) {
        case 'LEFT':
        case 'RIGHT':
          this.moveColumn(key)
          break
        case 'UP':
        case 'DOWN':
        case 'SCROLLUP':
        case 'SCROLLDOWN':
          this.scrollCurrentColumn(key)
          break
        case 'UP_HOLD':
        case 'DOWN_HOLD':
          if (emitKeyPress({ delay: 50 })) {
            this.scrollCurrentColumn(key === 'UP_HOLD' ? 'UP' : 'DOWN')
            this.fasterAnimation[this.selectedColumnIndex] = true
          }
          break
        case 'HOLD_STOP': // l for web
          this.$set(this.fasterAnimation, this.selectedColumnIndex, false)
          break
        case 'OK':
          if (this.selectedColumnIndex === this.columns.indexOf('events')) {
            if (!this.events[this.selectedItemsIndexes[3]]) return
            let findEvent = find({id: this.events[this.selectedItemsIndexes[3]].id})(this.events)

            if (!findEvent || findEvent.startTime > Date.now()) { // check if selected event is in future
              this.changeSelectedItemsIndex = false
              if (!this.events[this.selectedItemsIndexes[3]].hasReminder) {
                this.toggleHasReminder({
                  eventId: this.events[this.selectedItemsIndexes[3]].id,
                  hasReminder: true
                })
              } else {
                this.toggleHasReminder({
                  eventId: this.events[this.selectedItemsIndexes[3]].id,
                  hasReminder: false
                })
              }
            } else if (findEvent && findEvent.endTime < Date.now()) {
              this.playSelectedEvent(
                findEvent.endTime > Date.now() ? null : findEvent.startTime
              )
            } else {
              this.playSelectedEvent()
            }
          } else if (this.selectedColumnIndex === this.columns.indexOf('channels')) {
            // play live event for selected channel
            this.playSelectedEvent()
          } else {
            this.moveColumn('RIGHT')
          }
          break
      }
    },
    getComputed (property) {
      return this[property]
    },
    playSelectedEvent (startTime) {
      if (!this.currentEventCutv) return
      if (this.currentCutvDelay && this.currentChannel.cutvEnabled) return // ubacen cutvEnabled zbog bug-a na VMS-u
      let params = {
        categoryId: this.categories[this.selectedItemsIndexes[0]].id,
        categoryType: this.categories[this.selectedItemsIndexes[0]].typeCategory,
        eventId: this.events[this.selectedItemsIndexes[3]].id,
        channelId: this.channels[this.selectedItemsIndexes[1]].id
      }
      if (startTime) {
        params.startTime = startTime
      }
      if (this.events[this.selectedItemsIndexes[3]].id === this.playingEventId && !startTime) {
        params.checkAgeRating = false
      }

      this.updateParentalPlayerMode('TV')

      this.checkChannelEventAgeRating({
        channelId: params.channelId,
        event: this.events[this.selectedItemsIndexes[3]]
      })

      if (this.ageRating) {
        this.updatePlayerRedirectParams(params)
        this.parentalRating({ event: this.events[this.selectedItemsIndexes[3]], forcePINEnter: true })
      } else {
        this.$router.push({
          name: 'PlayerTv',
          params
        })
      }
    },
    fetchEPGForCurrentSelection () {
      window.clearTimeout(epgFetchTimeout)
      epgFetchTimeout = window.setTimeout(() => {
        this.epgFetcher()
      }, EPG_FETCH_DELAY)
    },
    async moveColumn (direction) {
      const offset = direction === 'LEFT' ? -1 : 1
      const oldIndex = this.selectedColumnIndex
      const newIndex = Math.min(Math.max(oldIndex + offset, 0), this.columns.length - 1)

      if (newIndex === this.columns.indexOf('detail')) {
        this.movedToDetails = true
        if (this.events[this.selectedItemsIndexes[3]]) {
          let currentEventId = this.events[this.selectedItemsIndexes[3]].id
          if (currentEventId !== 0) {
            await this.fetchEventDetail({
              eventId: currentEventId,
              noInformationData: null
            })
          } else {
            let channelId = this.channels[this.selectedItemsIndexes[1]].id
            let categoryId = this.categories[this.selectedItemsIndexes[0]].id
            let channel = this.findChannel(channelId, categoryId)
            // Case when event has no info
            const noInformationData = {
              id: 0,
              startTime: this.events[this.selectedItemsIndexes[3]].startTime,
              endTime: this.events[this.selectedItemsIndexes[3]].endTime,
              category: this.categories[this.selectedItemsIndexes[0]].id,
              channelId: this.channels[this.selectedItemsIndexes[1]].id,
              channelLogos: channel.images,
              pictures: [],
              title: 'No Information'
            }
            await this.fetchEventDetail({
              eventId: currentEventId,
              noInformationData: noInformationData
            })
          }
        } else if (this.currentPlayerEvent) {
          this.fetchEventDetail({
            eventId: this.currentPlayerEvent.id,
            noInformationData: null
          })
        }
        this.detailActive = true
        this.hideNavigation(true)
      } else if (newIndex === this.columns.indexOf('events') && direction === 'LEFT') {
        if (!this.movedToDetails) {
          this.doHistoryBack()
          return
        }
        this.movedToDetails = false
        // Moving back from detail screen
        this.hideNavigation(false)
        this.setActiveLane('sub')
        this.setSubSelectedIndex(1)
      } else if (newIndex === this.columns.indexOf('categories') && oldIndex === newIndex) {
        // Moving from categories to navigation
        this.toggleNavigation(true)
      }
      this.selectedColumnIndex = newIndex
    },
    animateToFromDetail () {
      if (this.selectedColumnIndex <= this.columns.indexOf('events')) {
        this.detailActive = false
      }
    },
    syncOnCreatedCategory () {
      this.selectedColumnIndex = this.columns.indexOf('categories')
      const catId = findIndex({id: this.currentPlayerCategory})(this.categories)
      if (catId >= 0) {
        this.selectedItemIndex = catId
      } else {
        this.selectedItemIndex = 0
      }
    },
    syncOnCreatedChannel () {
      this.selectedColumnIndex = this.columns.indexOf('channels')
      const chaId = findIndex({id: this.evtObj.channelId})(this.channels)
      if (chaId >= 0) {
        this.selectedItemIndex = chaId
      } else {
        this.selectedItemIndex = 0
      }
    },
    syncOnCreatedDate () {
      this.selectedColumnIndex = this.columns.indexOf('dates')
      const datId = findIndex({ label: formatShortDate(this.evtObj.startTime) })(this.dates)
      if (datId >= 0) {
        this.selectedItemIndex = datId
      } else {
        this.selectedItemIndex = 0
      }
    },
    selectedColumnName () { // history uses this, do not delete
      return this.columns[this.selectedColumnIndex]
    },
    ...mapActions({
      fetchEvents: 'guide/fetchEvents',
      fetchEventDetail: 'epg/fetchEventDetail',
      toggleNavigation: 'navigation/toggle',
      hideNavigation: 'navigation/toggleHidden',
      toggleHasReminder: 'reminders/toggleHasReminder',
      checkChannelEventAgeRating: 'parentalRating/checkChannelEventAgeRating',
      parentalRating: 'parentalRating/parentalRating'
    }),
    ...mapMutations({
      setActiveLane: 'navigation/SET_ACTIVE_LANE',
      setSubSelectedIndex: 'navigation/SET_SUB_LANE_SELECTED_ITEM_INDEX',
      updatePlayerRedirectParams: 'parentalRating/UPDATE_PLAYER_REDIRECT_PARAMS',
      updateParentalPlayerMode: 'parentalRating/UPDATE_PLAYER_MODE'
    })
  },
  watch: {
    events () {
      if (!this.firstCreate) {
        const dateOffset = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3][this.selectedItemsIndexes[2]]
        const date = Date.now() + dateOffset * YEAR
        for (let i = 0; i < this.events.length; i++) {
          if (this.events[i].startTime < date && this.events[i].endTime > date && !this.firstCreate && this.changeSelectedItemsIndex) {
            this.selectedItemsIndexes[3] = i
            break
          }
        }
        this.changeSelectedItemsIndex = true
      } else {
        for (let i = 0; i < this.events.length; i++) {
          if (this.events[i].id === this.evtObj.id) {
            this.selectedItemsIndexes[3] = i
            break
          }
        }
      }
      this.firstCreate = false
    }
  },
  async created () {
    if (this.$route.params.columnToFocus || this.$route.params.detail) {
      this.firstCreate = !(this.$route.meta.fromRoute === 'HomeDetail')
      if (this.$route.params.detail) {
        this.evtObj = this.epgEventDetail
        this.detailActive = true
        this.hideNavigation(true)
        if (this.$route.params.movedToDetails) {
          this.movedToDetails = true
        }
      } else {
        this.evtObj = this.currentPlayerEvent
        this.hideNavigation(false)
      }
      this.toggleNavigation(false)

      // setting columns to the right index
      this.syncOnCreatedCategory()
      this.syncOnCreatedChannel()
      this.syncOnCreatedDate()

      // Focus the right item in the column that should be selected
      this.selectedColumnIndex = this.columns.indexOf(this.$route.params.columnToFocus.toLowerCase())
      if (this.$route.params.channelId) {
        this.selectedItemIndex = findIndex({id: this.$route.params.channelId})(this.channels)
      }
    } else {
      this.firstCreate = false
    }
    this.fetchDataOnSelectedItemChange = true
    this.fasterAnimation = this.columns.map(() => false)
  },
  mounted () {
    this.epgFetcher()
    if (this.$route.meta.fromRoute === 'PlayerTv' && !this.$route.params.columnToFocus) {
      this.hideNavigation(false)
      this.toggleNavigation(false)
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

$left-offset: 42rem;
$events-width: 787rem;

.guide-wrapper {
  height: 100%;
  position: relative;
}

.guide-container {
  // background: rgba($white-lighter, 0.9);
  display: flex;
  height: 100%;
  width: 1720rem + 1920rem;
}

.line {
  background: $white;
  box-shadow: 0 10rem 36rem $grey-dark;
  height: 5rem;
  left: $left-offset;
  position: absolute;
  top: 505rem;
  width: 1720rem + 1920rem;
  z-index: 2;
  .selection {
    background: $grey-gradient-vertical;
    height: 15rem;
    left: 0;
    position: absolute;
    top: 0;
    will-change: transform;
    transform-origin: left center;
    transition: transform $transition-fastest;
    width: 100rem;
    z-index: 2;
    .done {
      will-change: transform;
      background: $blue-gradient-vertical;
      height: 15rem;
      transform-origin: center left;
      transition: transform $transition-fastest;
      &.blocked {
        background: $grey-dark-gradient-vertical;
      }
    }

  }
  .progress {
    position: absolute;
    left: 854rem;
    width: $events-width - 2rem;
    height: 5rem;
    .done {
      background: $blue;
      height: 5rem;
      transform-origin: center left;
      transition: transform $transition-fast;
      &.blocked {
        background: $grey-dark-gradient-vertical;
        transition: transform 0s;
      }
    }

    &.moveLeft { left: 854rem; }
  }
  .arrow-right {
    bottom: 26rem;
    fill: $blue;
    height: 44rem;
    position: absolute;
    left: 1650rem;
    width: 39rem;
  }
}

.arrow-live {
  $height: 54rem;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" id="icon" viewBox="0 0 69 54"><defs><linearGradient id="linear" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0" stop-color="#be0000"/><stop offset="1" stop-color="#6b0000"/></linearGradient></defs><path fill="url(#linear)" d="M 4.3417969 0 C 1.9363577 0 0 1.9692288 0 4.4160156 L 0 49.583984 C 0 52.030771 1.9363577 54 4.3417969 54 L 42 54 L 69 27 L 42 0 L 4.3417969 0 z " /></svg>');
  color: $white;
  display: none;
  font-size: 20rem;
  height: $height;
  left: 840rem;
  line-height: $height;
  padding-left: 11rem;
  position: absolute;
  top: 435px;
  width: 69rem;
  z-index: 1;
}

.column {
  $border-width: 2px;
  $border: 2px solid $grey;
  $margin: -$border-width/2;
  border-right: $border;
  margin-left: $margin;
  margin-right: $margin;
  position: relative;
  z-index: 1;
  transform: scale3d(1, 1, 1); // adds a layer, less repainting
  &.no-shadow {
    box-shadow: none !important;
  }

  &:first-of-type {
    border-left: none;
    margin-left: 0;
  }
  &:last-of-type {
    border-right: none;
    margin-right: 0;
  }
  &.is-focused {
    box-shadow: #888a8a 0 0 30rem 10rem;
    z-index: 2;
  }

  &.categories ul {
    padding-left: $left-offset;
    width: 314rem + $left-offset;
  }

  &.channels ul {
    padding-left: 33rem;
    width: 346rem;
  }

  &.dates ul {
    padding-left: 42rem;
    width: 193rem;
  }

  &.events ul {
    padding-left: 42rem;
    width: $events-width;
    margin-top: -2rem;
  }

  &.detail {
    margin-left: -5rem;
    border: none;
  }
}
</style>
