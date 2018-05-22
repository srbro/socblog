import clone from 'lodash/fp/clone'
import { startOfHour, YEAR, HOUR, SECOND } from 'helpers/time'
import { fetchEPG, fetchEPGEventDetail, fetchEPGCurrentEvents, toggleFavorites, fetchAgeRating } from 'helpers/api'
import { getImage } from 'helpers/image'
import { defaultEPG, uniqueID } from 'helpers/oneliners'
import { findIndex } from 'lodash/fp'
import tvEventDefaultImage from 'assets/images/placeholders/landing_page_event_300x168.png'

export default {
  namespaced: true,
  state: {
    data: [],
    eventDetail: {},
    currentEvents: [],
    radioEvents: [],
    singleEvent: {},
    ageRatingCache: {}
  },
  actions: {
    fetch ({ rootState, dispatch, commit, rootGetters }, { channelId, startTime, numberOfDays, checkIfFocused }) {
      const endTime = startTime + numberOfDays * YEAR - SECOND
      const request = fetchEPG(channelId, startTime, endTime)

      request.then((response) => {
        const relevantData = response.data[channelId].map(event => ({
          ageRating: event.ageRating,
          thumbnail: getImage(event.images, 'STB_FHD', 'EVENT_16_9', tvEventDefaultImage),
          title: event.title,
          id: event.id === 0 ? 'blank_' + uniqueID(event.startTime) + String(event.channelId) : event.id,
          startTime: event.startTime,
          endTime: event.endTime,
          channelId: event.channelId,
          hasReminder: event.hasReminder,
          inFavorites: event.inFavorites,
          selfCreated: event.id === 0 ? 1 : 0,
          live: event.live
        }))
        if (checkIfFocused) {
          if (channelId !== rootGetters['player/getFocusedChannel'].id) {
            return
          }
        }
        commit('UPDATE_DATA', relevantData)
      }).catch(() => {
        const data = defaultEPG(startOfHour(startTime), startOfHour(endTime), channelId)
        commit('UPDATE_DATA', data)
      })

      return request
    },
    fetchAgeRatingCache ({ commit }) {
      fetchAgeRating(18, 12).then((response) => {
        commit('UPDATE_AGE_RATINGS_CACHE', response.data)
      })
    },
    fetchEventDetail ({ dispatch, commit, rootGetters }, { eventId, noInformationData }) {
      if (eventId === 0) {
        return new Promise((resolve, reject) => {
          commit('UPDATE_EVENT_DETAIL', noInformationData)
          resolve()
        })
      }
      return new Promise((resolve, reject) => {
        fetchEPGEventDetail(eventId).then((response) => {
          commit('UPDATE_EVENT_DETAIL', response.data)
          resolve()
        })
      })
    },
    fetchCurrentEvents ({ dispatch, commit, rootGetters }, { eventPosition, channelSort, channelType, categoryId, page, size, imageSize }) {
      return new Promise((resolve, reject) => {
        fetchEPGCurrentEvents(eventPosition, channelSort, channelType, categoryId, page, size, imageSize)
          .then((response) => {
            channelType === 'RADIO' ? commit('UPDATE_RADIO_EVENTS', response.data) : commit('UPDATE_CURRENT_EVENTS', response.data)
            // commit('UPDATE_CURRENT_EVENTS', response.data)
            resolve()
          })
      })
    },
    fetchSingleChannelEvent ({ commit, rootGetters }, { channelId, startTime = Date.now(), checkIfFocused = true, updateNextEvent = false }) {
      const endTime = startTime + SECOND
      const request = fetchEPG(channelId, startTime, endTime)

      return request.then((response) => {
        const relevantData = response.data[channelId].map(event => ({
          ageRating: event.ageRating,
          thumbnail: getImage(event.images, 'STB_FHD', 'EVENT_16_9', tvEventDefaultImage),
          title: event.title,
          id: event.id === 0 ? 'blank_' + uniqueID(event.startTime) + String(event.channelId) : event.id,
          startTime: event.startTime,
          endTime: event.endTime,
          channelId: event.channelId,
          hasReminder: event.hasReminder,
          inFavorites: event.inFavorites,
          selfCreated: event.id === 0 ? 1 : 0,
          live: event.live
        }))
        if (updateNextEvent) {
          commit('player/UPDATE_NEXT_EVENT', relevantData[relevantData.length - 1], { root: true })
          return
        }
        if (checkIfFocused) {
          if (channelId !== rootGetters['player/getFocusedChannel'].id) {
            return
          }
        }
        commit('UPDATE_SINGLE_EVENT', relevantData[relevantData.length - 1])
      }).catch(() => {
        startTime = startOfHour(startTime)

        commit('UPDATE_SINGLE_EVENT', {
          ageRating: '',
          thumbnail: getImage('', 'STB_FHD', 'EVENT_16_9', tvEventDefaultImage),
          // title: 'FIRST THIS',
          title: 'No information',
          id: 'blank_' + uniqueID(startTime) + String(channelId),
          startTime,
          endTime: startOfHour(endTime + HOUR),
          channelId: channelId,
          hasReminder: false,
          inFavorites: false,
          selfCreated: 1,
          live: false
        })
      })
    },
    // called from reminders/toggleHasReminder
    toggleHasReminder ({ dispatch, state, commit }, { eventId, hasReminder }) {
      if (state.data) {
        let eventIndex = findIndex({ 'id': eventId })(state.data)
        if (eventIndex >= 0) {
          const newEvents = clone(state.data)
          newEvents[eventIndex].hasReminder = hasReminder
          commit('UPDATE_DATA', newEvents)
        }
      }
    },
    // called from reminders/toggleHasReminder
    eventDetailHasReminder ({ state, commit }, {eventId, hasReminder}) {
      if (state.eventDetail && state.eventDetail.id === eventId) {
        commit('UPDATE_EVENT_DETAIL_HASREMINDERS', hasReminder)
      }
    },
    toggleInFavorites ({ state, commit }, { eventId, inFavorites }) {
      if (state.data) {
        let eventIndex = findIndex({ 'id': eventId })(state.data)
        toggleFavorites(eventId, inFavorites)
        if (eventIndex >= 0) {
          const newEvents = clone(state.data)
          newEvents[eventIndex].inFavorites = inFavorites
          commit('UPDATE_DATA', newEvents)
        }

        if (state.eventDetail && state.eventDetail.id === eventId) {
          commit('UPDATE_EVENT_DETAIL_INFAVORITES', inFavorites)
        }
      }
    }
  },
  mutations: {
    UPDATE_DATA (state, newData) {
      state.data = Object.freeze(newData)
    },
    UPDATE_EVENT_DETAIL (state, newEventDetail) {
      state.eventDetail = newEventDetail
    },
    UPDATE_CURRENT_EVENTS (state, newCurrentEvents) {
      state.currentEvents = Object.freeze(newCurrentEvents)
    },
    UPDATE_RADIO_EVENTS (state, newRadioEvents) {
      state.radioEvents = Object.freeze(newRadioEvents.content)
    },
    UPDATE_EVENT_DETAIL_HASREMINDERS (state, hasReminder) {
      state.eventDetail.hasReminder = hasReminder
    },
    UPDATE_EVENT_DETAIL_INFAVORITES (state, inFavorites) {
      state.eventDetail.inFavorites = inFavorites
    },
    UPDATE_SINGLE_EVENT (state, newData) {
      state.singleEvent = newData
    },
    UPDATE_AGE_RATINGS_CACHE (state, newData) {
      state.ageRatingCache = Object.freeze(newData)
    }
  }
}
