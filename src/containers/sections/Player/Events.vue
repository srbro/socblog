<template>
  <event-list
    v-if="display"
    :events="events"
    :selected-index="selectedIndex"
    :active="active"
    :faster-animation="fasterAnimation"
    :channels-active="channelsActive"
    :handle-click-card="handleClickCard"
    :handle-click-card-cta="handleClickCardCTA"
    :handle-click="handleClick"
  />
</template>

<script>
import findIndex from 'lodash/fp/findIndex'
import { mapActions, mapState, mapGetters } from 'vuex'
import { emitKeyPress } from 'helpers/keyHold'
import EventList from 'components/Player/EventList'
import { deviceZapClass } from 'animations'
import { EventBus } from 'helpers/eventBus'

export default {
  name: 'PlayerEvents',
  components: { EventList },
  data: () => ({
    selectedIndex: 0,
    fasterAnimation: false,
    zapAnimationDelay: deviceZapClass() === 'samsung-cell' ? 300 : 150,
    selectedEventIdOld: null
  }),
  props: {
    active: {
      type: Boolean,
      required: true
    },
    display: {
      type: Boolean,
      required: true
    },
    channelsActive: {
      type: Boolean,
      required: true
    },
    activateEvents: {
      type: Function,
      required: false
    }
  },
  computed: {
    ...mapState({
      currentEventId: state => state.player.currentEvent.id
    }),
    ...mapGetters({
      getSelectedEvent: 'player/getSelectedEvent',
      // events: 'player/getFocusedEvents'
      events: 'playerEvents/getFocusedEvents',
      getSelectedEventIndex: 'player/getSelectedEventIndex'
    })
  },
  methods: {
    handleKey (key) {
      switch (key) {
        case 'LEFT':
          this.changeCtaPosition(-1, Math.max(this.selectedIndex - 1, 0))
          break
        case 'RIGHT':
          this.changeCtaPosition(1, Math.min(this.selectedIndex + 1, this.events.length - 1))
          break
        case 'UP' :
          this.$parent.activeSection = 'controls'
          break
        case 'DOWN' :
          this.$parent.hide()
          break
        case 'BACK' :
          if (this.getSelectedEvent.ctaMode) this.toggleCtaMode(false)
          else this.$parent.hide()
          break
        case 'OK' :
          if (!this.getSelectedEvent.ctaMode && this.getSelectedEvent.ctaButtons.length > 0) {
            this.toggleCtaMode(null)
            this.updateSelectedEventIndex({ index: this.selectedIndex })
          } else if (this.getSelectedEvent.ctaButtons.length > 0) {
            const selectedEvent = this.getSelectedEvent
            let callback = selectedEvent.ctaButtons[selectedEvent.ctaSelectedPosition].callback
            // hooks for cta actions
            if (callback === 'reminder') {
              this.toggleCtaMode(true)
            } else {
              this.toggleCtaMode(false)
            }
            this[callback]()
          }
          break
        case 'HOLD_STOP': // l for web
          this.fasterAnimation = false
          const selectedEvent = this.events[this.selectedIndex]
          this.updateSelectedEvent({ id: selectedEvent.id, ctaDisplay: false })
          break
        case 'LEFT_HOLD': // j for web
        case 'RIGHT_HOLD': // k for web
          if (emitKeyPress({ delay: this.zapAnimationDelay })) {
            this.holdKey(key)
            this.fasterAnimation = true
          }
          break
      }
    },
    handleClick (direction) {
      switch (direction) {
        case 'LEFT':
          this.changeCtaPosition(-1, Math.max(this.selectedIndex - 1, 0))
          break
        case 'RIGHT':
          this.changeCtaPosition(1, Math.min(this.selectedIndex + 1, this.events.length - 1))
          break
      }
    },
    holdKey (side) {
      this.$parent.resetAutohiding()
      const direction = side === 'LEFT_HOLD' ? -1 : 1
      this.selectedIndex = Math.min(Math.max(this.selectedIndex + direction, 0), this.events.length - 1)
      if (this.selectedIndex < 11 && direction < 0) {
        this.selectedEventIdOld = this.events[this.selectedIndex].id
        this.getPageLeft()
      } else if (this.selectedIndex > this.events.length - 12 && direction >= 0) {
        this.selectedEventIdOld = this.events[this.selectedIndex].id
        this.getPageRight()
      }
    },
    handleClickCard (eventId) {
      if (this.$parent.activeSection !== 'events') {
        this.$parent.activeSection = 'events'
      }

      this.updateSelectedEvent({ id: eventId, ctaDisplay: false })
      this.focusEventWithId(eventId)

      if (!this.getSelectedEvent.ctaMode && this.getSelectedEvent.ctaButtons.length > 0) {
        this.toggleCtaMode(null)
        this.updateSelectedEventIndex({ index: this.selectedIndex })
      }
    },
    handleClickCardCTA (index) {
      if (!this.getSelectedEvent.ctaMode && this.getSelectedEvent.ctaButtons.length > 0) {
        this.toggleCtaMode(null)
      } else if (this.getSelectedEvent.ctaButtons.length > 0) {
        const selectedEvent = this.getSelectedEvent
        let callback = selectedEvent.ctaButtons[index].callback
        // hooks for cta actions
        if (callback === 'reminder') {
          this.toggleCtaMode(true)
        } else {
          this.toggleCtaMode(false)
        }
        this[callback]()
      }
    },
    focusEventWithId (id) {
      let currentEventIndex = findIndex({ id }, this.events)
      currentEventIndex = currentEventIndex < 0 ? findIndex(function (n) {
        return Date.now() < n.endTime && Date.now() > n.startTime
      }, this.events) : currentEventIndex
      this.selectedIndex = currentEventIndex || 0
    },
    changeCtaPosition (offset, selectedIndex) {
      let currentEvent = this.getSelectedEvent
      if (currentEvent.ctaMode) {
        const n = currentEvent.ctaButtons.length
        this.moveCtaPosition(currentEvent.ctaSelectedPosition === 0 ? Math.max(0, currentEvent.ctaSelectedPosition + offset) : Math.min(n - 1, currentEvent.ctaSelectedPosition + offset))
      } else {
        this.selectedIndex = selectedIndex
        const selectedEvent = this.events[this.selectedIndex]
        this.updateSelectedEvent({ id: selectedEvent.id, ctaDisplay: false })
        if (selectedIndex < 11 && offset < 0) {
          this.selectedEventIdOld = this.events[this.selectedIndex].id
          this.getPageLeft()
        } else if (selectedIndex > this.events.length - 11 && offset >= 0) {
          this.selectedEventIdOld = this.events[this.selectedIndex].id
          this.getPageRight()
        }
      }
      console.log('PLAYER_MODULE, changeCtaPosition', this.selectedIndex)
    },
    playCommon ({ live = false }) {
      const selectedEvent = this.events[this.selectedIndex]
      // Don't play future events
      if (!live && Date.now() < selectedEvent.startTime) return

      this.showNewEvent({
        id: selectedEvent.id,
        updateTime: true,
        live
      })
    },
    play () {
      this.playCommon({ live: false })
    },
    playLive () {
      this.playCommon({ live: true })
    },
    info () {
      const event = this.getSelectedEvent
      return this.fetchEventDetail({
        eventId: event.id,
        noInformationData: null
      }).then(() => {
        this.$router.push({
          name: 'EventDetail'
        })
      })
    },
    reminder () {
      this.changeReminder = true
      if (!this.events[this.selectedIndex].hasReminder) {
        this.toggleHasReminder({
          eventId: this.events[this.selectedIndex].id,
          hasReminder: true
        })
      } else {
        this.toggleHasReminder({
          eventId: this.events[this.selectedIndex].id,
          hasReminder: false
        })
      }
      this.updateSelectedEvent({ id: this.events[this.selectedIndex].id, ctaDisplay: false })
    },
    ...mapActions({
      showNewEvent: 'player/showNewEvent',
      updateSelectedEvent: 'player/updateSelectedEvent',
      toggleCtaMode: 'player/toggleCtaMode',
      moveCtaPosition: 'player/moveCtaPosition',
      fetchEventDetail: 'epg/fetchEventDetail',
      getPageRight: 'playerEvents/getPageFromFuture',
      getPageLeft: 'playerEvents/getPageFromPast',
      toggleHasReminder: 'reminders/toggleHasReminder',
      updateSelectedEventIndex: 'player/updateSelectedEventIndex'
    })
  },
  watch: {
    currentEventId (id) {
      this.focusEventWithId(id)
    },
    active () {
      if (!this.active) {
        this.toggleCtaMode(false)
        this.fasterAnimation = false
      }
      if (this.active && this.events && this.events.length > 0) {
        this.updateSelectedEvent({ id: this.events[this.selectedIndex].id, ctaDisplay: false })
      }
    },
    events () {
      this.changeReminder ? this.changeReminder = false : this.focusEventWithId(this.currentEventId)
      if (this.selectedEventIdOld) {
        this.focusEventWithId(this.selectedEventIdOld)
        this.selectedEventIdOld = null
      }
    }
  },
  mounted () {
    let selectedIndex = this.getSelectedEventIndex
    if (selectedIndex !== -1 && this.events[selectedIndex]) {
      this.selectedIndex = selectedIndex
      this.activateEvents()
      this.updateSelectedEventIndex(-1)
    } else {
      this.focusEventWithId(this.currentEventId)
    }

    EventBus.$on('events', (obj) => {
      if (obj.action === 'handleKey') {
        this.handleKey(obj.value)
      }
    })
  },
  beforeDestroy () {
    this.updateSelectedEvent(-1)
    EventBus.$off('events')
  }
}
</script>
