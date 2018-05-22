import { getImage } from 'helpers/image'
import { defaultEPG, uniqueID } from 'helpers/oneliners'
import { calcDayOffset, adjustedMoment } from 'helpers/time'
import { fetchEPGn, fetchEvents } from 'helpers/api'
import tvEventDefaultImage from 'assets/images/placeholders/landing_page_event_300x168.png'

import find from 'lodash/fp/find'

const PAGE_OFFSET_ONE_SIDE = 40

let goingLeftBlock = false
let goingRightBlock = false

let leftBoundaryReached = false
let rightBoundaryReached = false

export const eventInRightBoundary = (event) => calcDayOffset(4) > event.startTime
export const eventInLeftBoundary = (event) => calcDayOffset(-7) <= event.endTime

const mapEvents = (events, cutvEnabled, startOverEnabled, goingLeft = true) => {
  let filteredEvents = []
  if (goingLeft && !eventInLeftBoundary(events[0])) {
    let now = adjustedMoment()
    filteredEvents = events.filter(event => eventInLeftBoundary(event, now))
    leftBoundaryReached = events.length > filteredEvents.length
  } else if (!goingLeft && !eventInRightBoundary(events[events.length - 1])) {
    let now = adjustedMoment()
    filteredEvents = events.filter(event => eventInRightBoundary(event, now))
    rightBoundaryReached = events.length > filteredEvents.length
  } else {
    filteredEvents = events
    leftBoundaryReached = false
    rightBoundaryReached = false
  }

  let processedEvents = filteredEvents.map(event => ({
    imageUrl: getImage(event.images, 'STB_FHD', 'EVENT_16_9', tvEventDefaultImage),
    startTime: event.startTime,
    endTime: event.endTime,
    title: event.title,
    id: event.id === 0 ? 'blank_' + uniqueID(event.startTime) + String(event.channelId) : event.id,
    channelId: event.channelId,
    ageRating: event.ageRating,
    hasReminder: event.hasReminder,
    cutvEnabled: cutvEnabled,
    startOverEnabled: startOverEnabled
  }))
  return processedEvents
}

const hasBlank = (target) => {
  return /^blank_/.test(target)
}

const findFirstNoBlank = (elements, limit, reverse = false) => {
  if (reverse) {
    for (let i = elements.length - 1; i > elements.length - limit; i--) {
      if (!hasBlank(elements[i].id)) {
        return elements[i]
      }
    }
  } else {
    for (let i = 0; i < limit; i++) {
      if (!hasBlank(elements[i].id)) {
        return elements[i]
      }
    }
  }
}

export default {
  namespaced: true,
  state: {
    events: [],
    focusedChannelId: 1,
    focusedChannelCutvEnabled: true,
    focusedChannelStartOverEnabled: true
  },
  actions: {
    fetchNewEvents ({ state, commit }, { eventId, nBefore, nAfter, goingLeft }) {
      const request = fetchEvents(eventId, nBefore, nAfter)
      return request.then((response) => {
        let events = mapEvents(response.data, state.focusedChannelCutvEnabled, state.focusedChannelStartOverEnabled, goingLeft)
        commit('UPDATE_EVENTS', events)
      }).catch((response) => {
        commit('CLEAR_EVENTS')
        commit('UPDATE_EVENTS', defaultEPG(calcDayOffset(-7), calcDayOffset(4)))
      })
    },
    fetchNEventsInitial ({ state, commit }, { channelId, eventNumberBefore, eventNumberAfter }) {
      const request = fetchEPGn(channelId, eventNumberBefore, eventNumberAfter)
      return request.then((response) => {
        let events = mapEvents(response.data[channelId], state.focusedChannelCutvEnabled, state.focusedChannelStartOverEnabled)
        commit('UPDATE_EVENTS', events)
      }).catch((response) => {
        commit('CLEAR_EVENTS')
        commit('UPDATE_EVENTS', defaultEPG(calcDayOffset(-7), calcDayOffset(4)))
      })
    },
    getInitalNEvents ({ commit, dispatch }, { channelId, eventId }) {
      commit('CLEAR_EVENTS')
      commit('UPDATE_CHANNEL_ID', channelId)
      dispatch('updatePolicies', { channelId })
      return dispatch('fetchNEventsInitial', { channelId, eventNumberBefore: PAGE_OFFSET_ONE_SIDE, eventNumberAfter: PAGE_OFFSET_ONE_SIDE })
    },
    getInitalEvents ({ commit, dispatch }, { channelId, eventId }) {
      commit('CLEAR_EVENTS')
      commit('UPDATE_CHANNEL_ID', channelId)
      dispatch('updatePolicies', { channelId })
      dispatch('fetchNewEvents', {
        eventId,
        nBefore: PAGE_OFFSET_ONE_SIDE,
        nAfter: PAGE_OFFSET_ONE_SIDE
      })
    },
    getPageFromPast ({ dispatch, state }) {
      if (!goingLeftBlock && !leftBoundaryReached) {
        goingLeftBlock = true
        dispatch('fetchNewEvents', {
          eventId: findFirstNoBlank(state.events, PAGE_OFFSET_ONE_SIDE / 2).id,
          nBefore: PAGE_OFFSET_ONE_SIDE,
          nAfter: PAGE_OFFSET_ONE_SIDE,
          goingLeft: true
        }).then(() => { goingLeftBlock = false })
      }
    },
    getPageFromFuture ({ dispatch, state }) {
      if (!goingRightBlock && !rightBoundaryReached) {
        goingRightBlock = true
        dispatch('fetchNewEvents', {
          eventId: findFirstNoBlank(state.events, PAGE_OFFSET_ONE_SIDE / 2, true).id,
          nBefore: PAGE_OFFSET_ONE_SIDE,
          nAfter: PAGE_OFFSET_ONE_SIDE,
          goingLeft: false
        }).then(() => { goingRightBlock = false })
      }
    },
    updatePolicies ({ commit, rootGetters }, { channelId }) {
      commit('UPDATE_CUTV_ENABLED', find({id: channelId})(rootGetters['player/getAllChannels']).startOverEnabled)
      commit('UPDTE_START_OVER_ENABLED', find({id: channelId})(rootGetters['player/getAllChannels']).startOverEnabled)
    }
  },
  getters: {
    getFocusedEvents: (state) => {
      return state.events
    }
  },
  mutations: {
    UPDATE_EVENTS (state, newData) {
      state.events = Object.freeze(newData)
    },
    UPDATE_CHANNEL_ID (state, newData) {
      state.focusedChannelId = newData
    },
    CLEAR_EVENTS (state) {
      state.events = []
    },
    UPDATE_CUTV_ENABLED (state, newBool) {
      state.cutvEnabled = newBool
    },
    UPDTE_START_OVER_ENABLED (state, newBool) {
      state.startOverEnabled = newBool
    }
  }
}
