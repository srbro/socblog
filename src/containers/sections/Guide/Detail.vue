<template>
  <detail-event
    :active="active"
    :active-cta-button="activeButtonLevel === 'cta' ? activeCtaButton : -1"
    :actors="cleanEvent.actors"
    :back-active="activeButtonLevel === 'back'"
    :background-image-url="eventPresent ? eventImageUrl : null"
    :buttons="buttons"
    :channel-logo-image-url="eventPresent ? logoUrl : null"
    :current-cutv-delay="currentCutvDelay"
    :current-event-cutv="currentEventCutv"
    :current-start-over-enabled="currentStartOverEnabled"
    :director="cleanEvent.director"
    :end-time="cleanEvent.endTime"
    :full-active="activeButtonLevel === 'full'"
    :genre="cleanEvent.genre"
    :handle-click-back="handleClickBack"
    :language="cleanEvent.language"
    :live="cleanEvent.live"
    :mkHandleButtonClick="mkHandleButtonClick"
    :open-full-text="openFullText"
    :progress="progress"
    :rating="cleanEvent.rating"
    :show-progress="showProgress"
    :start-time="cleanEvent.startTime"
    :synopsis="cleanEvent.description"
    :title="cleanEvent.title"
    :year="cleanEvent.year"
  />
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import find from 'lodash/fp/find'
import { getImage } from 'helpers/image'
import DetailScreenMixin from 'mixins/DetailScreen'
import { EventBus } from 'helpers/eventBus'

import DetailEvent from 'components/Detail/Event'
import tvLogoDefaultImage from 'assets/images/placeholders/lending_page_logo_300x168.png'
import backgroundImage from 'assets/images/placeholders/landing_page_event_detail_1920x1080.png'

const IMG_SMALL = 'STB_FHD'
const IMG_LARGE = 'STB_XL'
const TYPE_LOGO = 'LOGO_16_9'
const TYPE_EVENT = 'EVENT_16_9'

export default {
  name: 'GuideDetail',
  mixins: [ DetailScreenMixin ],
  components: { DetailEvent },
  data: () => ({
    buttonLevels: ['back', 'cta', 'full']
  }),
  props: {
    event: {
      type: Object,
      required: true
    },
    channelId: Number,
    active: Boolean,
    currentEventCutv: Boolean,
    currentCutvDelay: Boolean,
    currentStartOverEnabled: Boolean,
    selectedEvent: Object,
    progress: Number,
    showProgress: Boolean,
    goBack: Function
  },
  computed: {
    eventPresent () {
      return Object.keys(this.event).length > 0
    },
    cleanEvent () {
      return !this.eventPresent ? {} : {
        ...this.event,
        startTime: this.event.startTime,
        endTime: this.event.endTime,
        genre: this.event.categories && this.eventCategories ? this.event.categories.filter(g => find({ id: g })(this.eventCategories) && true).map(g => find({ id: g })(this.eventCategories).name).join(', ') : null,
        rating: this.event.ageRating === '0' ? null : this.event.ageRating,
        director: this.getDirectors(),
        actors: this.getStarring()
      }
    },
    logoUrl () {
      return getImage(this.cleanEvent.channelLogos, IMG_SMALL, TYPE_LOGO, tvLogoDefaultImage)
    },
    eventImageUrl () {
      return getImage(this.cleanEvent.images, IMG_LARGE, TYPE_EVENT, backgroundImage)
    },
    buttons () {
      let buttons = []
      if (this.event.id === 0) return []
      // if (!this.currentEventCutv || this.currentCutvDelay) return []

      if (this.event.startTime > Date.now()) {
        if (this.event.hasReminder) buttons.push({ id: 'delreminder', icon: 'reminders-active', text: this.loc('stb_guide_nowtv_details_reminder'), active: true })
        else buttons.push({ id: 'addreminder', icon: 'reminders', text: this.loc('stb_guide_nowtv_details_reminder'), active: false })
        if (this.currentEventCutv) {
          if (this.event.inFavorites) buttons.push({ id: 'delfavorite', icon: 'favorite-active', text: this.loc('guide_nowtv_event_details_favorites'), active: true })
          else buttons.push({ id: 'addfavorite', icon: 'favorite', text: this.loc('guide_nowtv_event_details_favorites'), active: false })
        }
        return buttons
      }

      if (this.event.endTime > Date.now()) {
        buttons.push({ id: 'watch', icon: 'watch', text: this.loc('stb_guide_nowtv_details_watch') })
      }
      if ((this.currentStartOverEnabled && this.event.endTime > Date.now()) || (this.currentEventCutv && !(this.event.endTime > Date.now()))) {
        buttons.push({ id: 'startover', icon: 'start-over', text: this.loc('stb_guide_nowtv_details_startover') })
      }
      if (this.currentEventCutv) {
        if (this.event.inFavorites) buttons.push({ id: 'delfavorite', icon: 'favorite-active', text: this.loc('guide_nowtv_event_details_favorites'), active: true })
        else buttons.push({ id: 'addfavorite', icon: 'favorite', text: this.loc('guide_nowtv_event_details_favorites'), active: false })
      }
      return buttons
    },
    ...mapState({
      eventCategories: state => state.general.eventCategories,
      playingEvent: state => state.player.playingEvent,
      ageRating: state => state.parentalRating.ageRating,
      currentTvType: state => state.player.currentTvType
    })
  },
  methods: {
    openFullText () {
      this.togglePopup({
        active: true,
        data: {
          type: 'title-text',
          title: this.event.title,
          text: this.event.description,
          priority: 2
        }
      })
    },
    getDirectors () {
      let person = ''
      for (let i = 0; i < this.event.person.length; i++) {
        if (this.event.person[i].occupation.name === 'Director' && person === '') {
          person = `${this.event.person[i].firstName} ${this.event.person[i].lastName}`
        }
      }
      return person
    },
    getStarring () {
      let person = []
      for (let i = 0; i < this.event.person.length; i++) {
        if (this.event.person[i].occupation.name === 'Actor') {
          person.push(`${this.event.person[i].firstName} ${this.event.person[i].lastName}`)
        }
      }
      return person.slice(0, 2)
    },
    handleKey (key) {
      if (this.activeButtonLevel === 'back' && key === 'OK') {
        return this.exit()
      }
      if (this.activeButtonLevel === 'cta' && this.activeCtaButton === 0 && key === 'LEFT') return this.exit()
      else {
        return this.handleKeyCommon(key)
      }
    },
    handleClickBack () {
      this.goBack()
      // return this.doHistoryBack()
    },
    mkHandleButtonClick (id, index) {
      let handleButtonClick = function () {
        this.activeCtaButton = index
        this.pressActiveButton()
      }

      return handleButtonClick.bind(this)
    },
    pressActiveButton () {
      if (this.activeButtonLevel === 'back') {
        return this.doHistoryBack()// this.exit()
      } else if (this.activeButtonLevel === 'full') {
        this.togglePopup({
          active: true,
          data: {
            type: 'title-text',
            title: this.event.title,
            text: this.event.description,
            priority: 2
          }
        })
      } else {
        let buttonPressed = this.buttons.length > 0 ? this.buttons[this.activeCtaButton] : null

        if (buttonPressed) {
          switch (buttonPressed.id) {
            case 'watch':
              return this.playLive()
            case 'startover':
              return this.playSelectedEvent()
            case 'addreminder':
              this.toggleHasReminder({
                eventId: this.event.id,
                hasReminder: true
              })
              this.selectedEvent.hasReminder = true
              break
            case 'delreminder':
              this.toggleHasReminder({
                eventId: this.event.id,
                hasReminder: false
              })
              this.selectedEvent.hasReminder = false
              break
            case 'addfavorite':
              this.toggleInFavorites({
                eventId: this.event.id,
                inFavorites: true
              })
              break
            case 'delfavorite':
              this.toggleInFavorites({
                eventId: this.event.id,
                inFavorites: false
              })
              break
          }
        }
      }
    },
    redirectParams ({ live = false }) {
      let params = {
        eventId: this.event.id,
        channelId: this.channelId,
        startHidden: true
      }
      if (!live) {
        params.startTime = this.event.startTime
      }
      if (this.event.id === this.playingEvent.id) {
        params.checkAgeRating = false
        if ((this.currentTvType === 'LIVE' && !live) || this.currentTvType === 'CUTV') {
          params.forcePlay = true
        }
      }
      return params
    },
    playEvent (params) {
      this.updateParentalPlayerMode('TV')
      this.checkChannelEventAgeRating({ channelId: this.channelId, event: this.event })

      if (this.ageRating) {
        this.updatePlayerRedirectParams(params)
        this.parentalRating({ event: this.event, forcePINEnter: true })
      } else {
        const exit = this.$parent.$options.name === 'Guide'
        this.updateSelectedEventIndex(-1)
        this.$router.push({
          name: 'PlayerTv',
          params
        })
        if (exit) {
          return this.exit()
        }
      }
    },
    playLive () {
      let params = this.redirectParams({ live: true })
      this.playEvent(params)
    },
    playSelectedEvent () {
      let params = this.redirectParams({ live: false })
      this.playEvent(params)
    },
    exit () {
      this.activeCtaButton = 0
      this.activeButtonLevel = this.buttonLevels.length !== 0 ? 'cta' : 'back'
      if (this.$parent.$options.name === 'Guide') {
        this.$parent.moveColumn('LEFT')
      } else {
        this.goBack()
      }
    },
    ...mapActions({
      toggleHasReminder: 'reminders/toggleHasReminder',
      toggleInFavorites: 'epg/toggleInFavorites',
      checkChannelEventAgeRating: 'parentalRating/checkChannelEventAgeRating',
      parentalRating: 'parentalRating/parentalRating',
      updateSelectedEventIndex: 'player/updateSelectedEventIndex'
    }),
    ...mapMutations({
      updatePlayerRedirectParams: 'parentalRating/UPDATE_PLAYER_REDIRECT_PARAMS',
      updateParentalPlayerMode: 'parentalRating/UPDATE_PLAYER_MODE'
    })
  },
  created () {
    if (this.buttons && this.buttons.length === 0) {
      this.buttonLevels = ['back', 'full']
      this.activeButtonLevel = 'back'
    }
  },
  mounted () {
    EventBus.$on('detail', (obj) => {
      if (obj.action === 'handleKey') {
        this.handleKey(obj.value)
      }
    })
  },
  beforeDestroy () {
    EventBus.$off('detail')
  }
}
</script>
