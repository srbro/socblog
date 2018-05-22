import { loc } from 'helpers/localization'
import { stop } from 'helpers/player'
import { checkParentalRating } from 'helpers/parental'
import { formatDateTime, YEAR } from 'helpers/time'

export default {
  namespaced: true,
  state: {
    active: false,
    pinLocked: false,
    pinLockedTime: Date.now(),
    attempts: 0,
    streamBlocked: false,
    redirectToPin: true,
    allowedEventId: 0,
    currentEventParams: {},
    previousEventParams: {
      channelId: 1
    },
    playerRedirectParams: {},
    timeOfEnteredPin: null,
    pinValidUntil: null,
    pinRemembered: false,
    ageRating: false,
    playerMode: 'TV'
  },
  actions: {
    toggle: ({ commit }, { active }) => {
      commit(active ? 'TOGGLE_ACTIVE_ON' : 'TOGGLE_ACTIVE_OFF')
    },
    setTimeOfEnteredPin: ({ state, commit }) => {
      commit('UPDATE_TIME_OF_ENTERED_PIN', formatDateTime(Date.now()))
    },
    setTimeOfPinValidFromNow: ({ state, commit }, { amount }) => {
      commit('UPDATE_PIN_VALID_FROM_NOW', formatDateTime(Date.now() + amount))
    },
    setTimeOfPinValidUntil: ({ state, commit }, { amount }) => {
      let time = new Date()
      time.setHours(amount)
      time.setMinutes(0)
      commit('UPDATE_PIN_VALID_UNTIL', formatDateTime(time.getTime() + YEAR))
    },
    setPinRemembered: ({ state, commit }, { active }) => {
      commit('UPDATE_PIN_REMEMBERED', active)
    },
    pinRemembered: ({ state, commit }) => {
      if (new Date(state.timeOfEnteredPin).getTime() < Date.now() < new Date(state.pinValidUntil).getTime()) {
        commit('UPDATE_PIN_REMEMBERED', true)
        return true
      } else {
        commit('UPDATE_PIN_REMEMBERED', false)
        return false
      }
    },
    parentalRating: ({ state, getters, rootState, commit, dispatch }, { channelId, event, forcePINEnter }) => {
      if (checkParentalRating({ channelId, event }) && state.pinRemembered === false) {
        stop()
        if (!state.streamBlocked) {
          commit('UPDATE_STREAM_BLOCKED', true)
          dispatch('playbackMessage/toggle', {
            active: true,
            description: { title: loc('message_guide_title_lockedchannel') }
          },
          { root: true })
        }
        if (state.redirectToPin) {
          if (rootState.route.name === 'PlayerTv' || rootState.route.name === 'PlayerRadio' || forcePINEnter) {
            dispatch('toggle', { active: true })
          }
        }
      }
    },
    checkChannelEventAgeRating: ({ state, rootState, commit }, { channelId, event }) => {
      const check = checkParentalRating({ channelId, event }) &&
        state.pinRemembered === false &&
        event.id !== rootState.player.playingEvent.id

      commit('UPDATE_AGE_RATING', check)
    },
    parentalRatingVOD: ({ state, dispatch }) => {
      if (state.ageRating) {
        dispatch('toggle', { active: true })
      }
    },
    checkAssetAgeRating: ({ state, rootState, commit }) => {
      let detail = rootState.route.name === 'VodDetail' ? rootState.vod.detail : rootState.vod.episodeDetail
      let check = detail && detail.ageRating && detail.ageRating >= 18 && state.pinRemembered === false

      commit('UPDATE_AGE_RATING', check)
    },
    checkStreamLock: ({ commit, dispatch, state }, { channelId, event }) => {
      dispatch('pinRemembered')
      if (checkParentalRating({ channelId, event }) && state.pinRemembered === false) {
        commit('UPDATE_ALLOWED_EVENT_ID', -1)
        commit('UPDATE_STREAM_BLOCKED', true)
        dispatch('playbackMessage/toggle', {
          active: true,
          description: { title: loc('message_guide_title_lockedchannel') }
        },
        { root: true })
      } else {
        commit('UPDATE_STREAM_BLOCKED', false)
        dispatch('playbackMessage/toggle', { active: false }, { root: true })
      }
    },
    updatePinLocked: ({ state, commit, dispatch }) => {
      if (state.pinLocked) {
        if (state.pinLockedTime < Date.now()) {
          dispatch('resetPinLocked')
        }
      } else {
        commit('UPDATE_ATTEMPTS', state.attempts + 1)
        if (state.attempts > 2) {
          commit('UPDATE_PIN_LOCKED', true)
          commit('UPDATE_PIN_LOCKED_TIME', Date.now() + 600000)
        }
      }
    },
    resetPinLocked: ({ commit }) => {
      commit('UPDATE_PIN_LOCKED_TIME', Date.now())
      commit('UPDATE_ATTEMPTS', 0)
      commit('UPDATE_PIN_LOCKED', false)
    }
  },
  mutations: {
    UPDATE_PIN_LOCKED (state, newValue) {
      state.pinLocked = newValue
    },
    UPDATE_PIN_LOCKED_TIME (state, newValue) {
      state.pinLockedTime = newValue
    },
    UPDATE_ATTEMPTS (state, newValue) {
      state.attempts = newValue
    },
    UPDATE_STREAM_BLOCKED (state, newValue) {
      state.streamBlocked = newValue
    },
    UPDATE_REDIRECT_TO_PIN (state, newValue) {
      state.redirectToPin = newValue
    },
    TOGGLE_ACTIVE_ON (state) {
      state.active = true
    },
    TOGGLE_ACTIVE_OFF (state) {
      state.active = false
    },
    UPDATE_ALLOWED_EVENT_ID (state, newValue) {
      state.allowedEventId = newValue
    },
    UPDATE_CURRENT_EVENT_PARAMS (state, newParams) {
      state.currentEventParams = newParams
    },
    UPDATE_PREVIOUS_EVENT_PARAMS (state, newParams) {
      state.previousEventParams = newParams
    },
    UPDATE_PLAYER_REDIRECT_PARAMS (state, newParams) {
      state.playerRedirectParams = newParams
    },
    UPDATE_TIME_OF_ENTERED_PIN (state, newParams) {
      state.timeOfEnteredPin = newParams
    },
    UPDATE_PIN_VALID_FROM_NOW (state, newParams) {
      state.pinValidUntil = newParams
    },
    UPDATE_PIN_VALID_UNTIL (state, newParams) {
      state.pinValidUntil = newParams
    },
    UPDATE_PIN_REMEMBERED (state, newParams) {
      state.pinRemembered = newParams
    },
    UPDATE_AGE_RATING (state, newValue) {
      state.ageRating = newValue
    },
    UPDATE_PLAYER_MODE (state, newValue) {
      state.playerMode = newValue
    }
  }
}
