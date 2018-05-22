import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import cloneDeep from 'lodash/fp/cloneDeep'
import { playVideo, playRadio, playVod, getCurrentTime, hasVideoQuality, scrubVOD } from 'helpers/player'
import { adjustedMoment, startOfDay, YEAR } from 'helpers/time'
import { checkParentalRating } from 'helpers/parental'
import { getImage } from 'helpers/image'
import tvLogoDefaultImage from 'assets/images/placeholders/lending_page_logo_300x168.png'

const findCurrentEvent = (events, currentTime = Date.now()) =>
  find(event => {
    return event.startTime < currentTime && event.endTime > currentTime
  }, events)

const CTA_BUTTONS_CATCHUP = [{id: 'player-play', callback: 'play'}, {id: 'player-info', callback: 'info'}]
const CTA_BUTTONS_CURRENT = [{id: 'player-restart', callback: 'play'}, {id: 'player-play', callback: 'playLive'}, {id: 'player-info', callback: 'info'}]
const CTA_BUTTONS_NEXT_EVENTS = (hasReminder) => [{id: hasReminder ? 'cta-has-reminder' : 'detail-reminders', callback: 'reminder'}, {id: 'player-info', callback: 'info'}]
const CTA_BUTTONS_CATCHUP_NO_INFO = [{id: 'player-play', callback: 'play'}]
const CTA_BUTTONS_CURRENT_NO_INFO = [{id: 'player-restart', callback: 'play'}, {id: 'player-play', callback: 'play'}]
const CTA_BUTTONS_CATCHUP_NO_CATCHUP = [{id: 'player-info', callback: 'info'}]
const CTA_BUTTONS_CURRENT_NO_STARTUP_NO_INFO = [{id: 'player-info', callback: 'info'}]
// const CTA_BUTTONS_CURRENT_NO_STARTUP_NO_INFO = [{id: 'player-play', callback: 'play'}]

// const EPG_FETCH_DELAY = 600
// var epgFetchTimeout = -1

const EPG_FETCH_SINGLE_DELAY = 400
var epgFetchSingleTimeout = -1
var updateCurrentEventTimeout = -1

const DELAYED_PLAY_TIMEOUT = 400
var delayedPlayTimeout = -1

export default {
  namespaced: true,
  state: {
    mode: 'TV',
    focusedChannelIndex: 0,
    focusedChannelCutvEnabled: true,
    focusedChannelCutvDelay: 0,
    focusedChannelStartOverEnabled: true,
    currentChannelId: 1,
    currentTvType: '',
    currentTvCategoryId: 1,
    currentTvCategoryType: 'CATEGORY',
    currentRadioCategoryType: 'CATEGORY',
    currentRadioCategoryId: 101,
    selectedEventIndex: -1,
    currentEvent: {
      id: -1,
      title: '',
      startTime: Date.now(),
      endTime: Date.now(),
      channelId: -1,
      thumbnail: '',
      ageRating: '0'
    },
    nextEvent: {
      id: -1,
      title: '',
      startTime: Date.now(),
      endTime: Date.now(),
      channelId: -1,
      thumbnail: '',
      ageRating: '0'
    },
    selectedEvent: {
      id: -1,
      title: '',
      startTime: Date.now(),
      endTime: Date.now(),
      channelId: -1,
      thumbnail: '',
      ageRating: '0',
      ctaMode: false,
      ctaSelectedPosition: 0,
      ctaButtons: []
    },
    playingEvent: {
      id: -1,
      title: '',
      startTime: Date.now(),
      endTime: Date.now(),
      channelId: -1,
      thumbnail: '',
      ageRating: '0'
    },
    internalPlayerStartTime: Date.now(),
    playState: 'play',
    asset: {
      id: -1,
      pp: '',
      startTime: 0,
      duration: -1
    },
    playbackTimeUpdateInterval: -1,
    playbackTime: Date.now(),
    playbackStartTime: -1,
    liveTime: Date.now(),
    radioBackground: true
  },
  actions: {
    playFirstChannel ({ rootState, state, commit, dispatch, getters }) {
      // let type = 'TV'
      // this.updatePlayerMode(type)
      let channel = getters.getAllChannels[0]
      commit(`UPDATE_CURRENT_${state.mode}_CATEGORY_ID`, rootState.general.defaultTVcategory)
      commit(`UPDATE_CURRENT_${state.mode}_CATEGORY_TYPE`, 'CATEGORY')
      dispatch('changeChannel', {
        channelId: channel.id,
        updateFocused: true
      })
    },
    nextPrevChannel ({ rootState, state, dispatch, getters }, {direction, delayedPlay}) {
      const offset = direction === 'next' ? 1 : -1
      let newIndex = findIndex({ id: state.currentChannelId }, getters.getAllChannels) + offset

      if (newIndex < 0) newIndex = getters.getAllChannels.length - 1
      if (newIndex > getters.getAllChannels.length - 1) newIndex = 0

      const newChannel = getters.getAllChannels[newIndex]

      dispatch('globalActions/changeChannel', {
        channelId: newChannel.id,
        updateFocused: true,
        delayedPlay
      }, {root: true})
    },
    changeChannelPlayer ({ state, getters, commit, dispatch }, { paused }) {
      if (paused) return
      const newChannel = getters.getAllChannels[state.focusedChannelIndex]
      // const focusedIndex = findIndex({ id: state.playingEvent.channelId }, getters.getAllChannels)
      if (state.currentChannelId !== newChannel.id) {
        dispatch('changeChannel', {
          channelId: newChannel.id,
          updateFocused: true
        })
      }
      commit('UPDATE_CURRENT_EVENT', state.playingEvent)
      dispatch('focusChannel', { newFocusedChannelIndex: newChannel, numberOfDays: 7, reFocus: true })
    },
    startOverChannelFocusedInList ({ state, dispatch, getters, commit }) {
      commit('UPDATE_NEXT_EVENT', state.currentEvent)
      dispatch('showNewEvent', { id: state.currentEvent.id, nextEvent: true, updateTime: true })
    },
    startLiveChannelFocusedInList ({ state, dispatch, getters, delayedPlay }) {
      const newChannel = getters.getAllChannels[state.focusedChannelIndex]
      dispatch('changeChannel', {
        channelId: newChannel.id,
        updateFocused: true,
        delayedPlay
      })
    },
    changeChannel ({ rootState, state, commit, dispatch, getters, rootGetters },
      { channelId, updateFocused, eventId, startTime, delayedPlay, checkAgeRating = true, forcePlay = false }) {
      if (channelId === state.currentChannelId && eventId === state.playingEvent.id && !checkAgeRating && !forcePlay) {
        dispatch('updatePlaybackTimeUpdateInterval')
        return
      } else {
        dispatch('clearPlaybackTimeUpdateInterval')
      }
      commit('UPDATE_SELECTED_EVENT_INDEX', -1)
      commit('UPDATE_CURRENT_CHANNEL_ID', channelId)

      if (checkAgeRating) {
        dispatch('parentalRating/checkStreamLock', null, { channelId: state.currentChannelId, event: state.playingEvent.id }, { root: true })
      }

      if (state.mode === 'RADIO') {
        commit('UPDATE_RADIO_BACKGROUND', !hasVideoQuality({ channelId }))
      } else {
        commit('UPDATE_RADIO_BACKGROUND', false)
      }
      if (delayedPlay) {
        window.clearTimeout(delayedPlayTimeout)
        commit('parentalRating/UPDATE_REDIRECT_TO_PIN', false, { root: true })
        delayedPlayTimeout = window.setTimeout(() => {
          commit('parentalRating/UPDATE_REDIRECT_TO_PIN', true, { root: true })
          dispatch('play', { startTime, checkAgeRating })
          commit('UPDATE_NEXT_EVENT', null)
        }, DELAYED_PLAY_TIMEOUT)
      } else {
        dispatch('play', { startTime, checkAgeRating })
        commit('UPDATE_NEXT_EVENT', null)
      }

      if (forcePlay) {
        dispatch('updatePlaybackTimeUpdateInterval')
        return
      }

      if (updateFocused) {
        const focusedIndex = findIndex({ id: channelId }, getters.getAllChannels)
        commit('UPDATE_FOCUSED_CHANNEL', focusedIndex)
        commit('UPDATE_FOCUSED_CUTV', getters.getAllChannels[focusedIndex].cutvEnabled)
        commit('UPDATE_FOCUSED_START_OVER', getters.getAllChannels[focusedIndex].startOverEnabled)
        commit('UPDATE_FOCUSED_CUTV_DELAY', getters.getAllChannels[focusedIndex].cutvDelay)
      }

      return dispatch('epg/fetchSingleChannelEvent', { channelId, startTime }, { root: true }).then(() => {
        commit('UPDATE_CURRENT_EVENT', rootState.epg.singleEvent)
        commit('UPDATE_PLAYING_EVENT', rootState.epg.singleEvent)
      })

      // window.clearTimeout(epgFetchSingleTimeout)
      // epgFetchSingleTimeout = window.setTimeout(() => {
      //   dispatch(
      //     'epg/fetch',
      //     {
      //       channelId: channelId,
      //       startTime: moment().startOf('day').subtract(7, 'days'),
      //       numberOfDays: 11,
      //       checkIfFocused: true
      //     },
      //     { root: true }
      //   ).then(() => {
      //     if (eventId) {
      //       dispatch('showNewEvent', { id: eventId, live: !startTime })
      //     } else {
      //       // Tech due
      //       const currentEvent = findCurrentEvent(rootState.playerEvents.events)
      //       // Tech due end
      //       dispatch('showNewEvent', { id: currentEvent.id, live: !startTime })
      //     }
      //   })
      // }, EPG_FETCH_SINGLE_DELAY)
    },
    findCurrentEventAndShowEvent ({ rootState, dispatch }, { startTime }) {
      // Tech due
      const currentEvent = findCurrentEvent(rootState.playerEvents.events)
      // Tech due end
      dispatch('showNewEvent', { id: currentEvent.id, live: !startTime })
    },
    showNewEvent ({ state, rootState, getters, rootGetters, commit, dispatch }, { id, updateTime, live, nextEvent }) {
      if (state.mode === 'VOD') { // TODO: Temp override
        return
      }
      let newEvent
      dispatch('clearPlaybackTimeUpdateInterval')
      if (nextEvent) {
        newEvent = state.nextEvent
        if (getters.getFocusedChannel.id === getters.getCurrentChannel.id) {
          commit('UPDATE_CURRENT_EVENT', newEvent)
        }
        commit('UPDATE_PLAYING_EVENT', newEvent)
        dispatch(
          'epg/fetchSingleChannelEvent',
          {
            channelId: newEvent.channelId,
            startTime: newEvent.endTime + 1000,
            checkIfFocused: false,
            updateNextEvent: true
          },
          { root: true }
        )
      } else {
        const newEventIndex = findIndex({ id }, rootState.playerEvents.events)
        newEvent = rootState.playerEvents.events[newEventIndex]
        // if (getters.getFocusedChannel.id === getters.getCurrentChannel.id) {
        //   commit('UPDATE_CURRENT_EVENT', newEvent)
        // }
        if (newEvent) {
          commit('UPDATE_CURRENT_EVENT', newEvent)
          commit('UPDATE_PLAYING_EVENT', newEvent)
          commit('UPDATE_NEXT_EVENT', rootState.playerEvents.events[newEventIndex + 1])
        }
      }

      if (state.playingEvent.id !== rootState.parentalRating.allowedEventId) {
        commit('parentalRating/UPDATE_ALLOWED_EVENT_ID', -1, { root: true })
      }

      if (state.mode === 'TV') {
        let channelUnlocked = state.playingEvent.id !== -1 &&
        rootState.general.tvChannelsMap[state.playingEvent.channelId].ageRating === null &&
        Number(state.playingEvent.ageRating) < 18

        if (channelUnlocked) {
          let params = {
            channelId: state.playingEvent.channelId,
            eventId: state.playingEvent.id,
            categoryId: rootState.player.currentTvCategoryId
          }
          if (!live) {
            params.startTime = state.playingEvent.startTime
          }
          commit('parentalRating/UPDATE_PREVIOUS_EVENT_PARAMS', params, { root: true })
        }
      }
      if (updateTime) {
        if (newEvent.channelId !== state.currentChannelId) {
          commit('UPDATE_CURRENT_CHANNEL_ID', newEvent.channelId)
        }
        // if (checkParentalRating({ event: state.playingEvent })) {
        //   commit('parentalRating/UPDATE_CURRENT_EVENT_PARAMS', { live: live ? 0 : state.currentEvent.startTime.valueOf() }, { root: true })
        // }
        if (live) {
          dispatch('play', {})
        } else {
          dispatch('play', { startTime: newEvent.startTime })
        }
      } else {
        if (checkParentalRating({ event: state.playingEvent })) {
          commit('parentalRating/UPDATE_CURRENT_EVENT_PARAMS', { live: 0 }, { root: true })
          if (nextEvent && rootState.parentalRating.allowedEventId !== state.playingEvent.id) {
            dispatch('parentalRating/parentalRating', { event: state.playingEvent }, { root: true })
          }
        }
      }
      dispatch('updatePlaybackTimeUpdateInterval')
    },
    restartCurrentEvent ({ state, rootGetters, commit, dispatch }) {
      dispatch('refocusChannel')
      dispatch('play', { startTime: state.playingEvent.startTime })
      dispatch('updatePlaybackTimeUpdateInterval')
    },
    backToLive ({ state, rootState, commit, dispatch }) {
      dispatch('clearPlaybackTimeUpdateInterval')
      if (state.currentChannelId === state.currentEvent.channelId) {
        const currentEvent = findCurrentEvent(rootState.epg.data)
        dispatch('showNewEvent', { id: currentEvent.id, updateTime: true, live: true })
      } else {
        dispatch('epg/fetchSingleChannelEvent', {
          channelId: state.currentChannelId,
          checkIfFocused: false },
        { root: true }
        ).then(() => {
          commit('UPDATE_NEXT_EVENT', rootState.epg.singleEvent)
          dispatch('showNewEvent', { id: state.nextEvent.id, updateTime: true, live: true, nextEvent: true })
        })
        dispatch('refocusChannel')
      }
      dispatch('updatePlaybackTimeUpdateInterval')
    },
    showEventOnPinOk ({ state, rootState, rootGetters, commit, dispatch }, { id, live }) {
      if (state.currentChannelId === state.currentEvent.channelId) {
        dispatch('showNewEvent', { id, updateTime: true, live })
      } else {
        dispatch(
          'epg/fetch',
          {
            channelId: state.currentChannelId,
            startTime: startOfDay(Date.now()) - 7 * YEAR,
            numberOfDays: 11
          },
          { root: true }
        ).then(() => {
          dispatch('showNewEvent', { id, updateTime: true, live })
          dispatch('refocusChannel')
        })
      }
    },
    focusChannel ({ rootState, state, commit, dispatch, getters }, { newFocusedChannelIndex, forcedType = '', reFocus, startTime }) {
      let focusedChannelIndex
      startTime = startTime || Date.now()

      if (!getters.getAllChannels[newFocusedChannelIndex]) return
      if (forcedType === 'TV') {
        commit('UPDATE_FOCUSED_CUTV', rootState.general.tvChannelsMap[newFocusedChannelIndex].cutvEnabled)
        commit('UPDATE_FOCUSED_START_OVER', rootState.general.tvChannelsMap[newFocusedChannelIndex].startOverEnabled)
        commit('UPDATE_FOCUSED_CUTV_DELAY', rootState.general.tvChannelsMap[newFocusedChannelIndex].cutvDelay)
        focusedChannelIndex = newFocusedChannelIndex
      } else {
        commit('UPDATE_FOCUSED_CHANNEL', newFocusedChannelIndex)
        commit('UPDATE_FOCUSED_CUTV', getters.getAllChannels[newFocusedChannelIndex].cutvEnabled)
        commit('UPDATE_FOCUSED_START_OVER', getters.getAllChannels[newFocusedChannelIndex].startOverEnabled)
        commit('UPDATE_FOCUSED_CUTV_DELAY', getters.getAllChannels[newFocusedChannelIndex].cutvDelay)
        focusedChannelIndex = getters.getAllChannels[newFocusedChannelIndex].id
      }

      if (state.currentChannelId === getters.getFocusedChannel.id) {
        window.clearTimeout(updateCurrentEventTimeout)
        updateCurrentEventTimeout = window.setTimeout(() => { commit('UPDATE_CURRENT_EVENT', state.playingEvent) }, EPG_FETCH_SINGLE_DELAY)
      }

      if (!reFocus && state.currentChannelId !== getters.getFocusedChannel.id) {
        window.clearTimeout(epgFetchSingleTimeout)
        epgFetchSingleTimeout = window.setTimeout(() => {
          dispatch('updateCurrentEvent', ({ channelId: focusedChannelIndex, startTime }))
        }, EPG_FETCH_SINGLE_DELAY)
      }
      // window.clearTimeout(epgFetchTimeout)
      // epgFetchTimeout = window.setTimeout(() => {
      //   dispatch(
      //     'epg/fetch',
      //     {
      //       channelId: focusedChannelIndex,
      //       startTime: moment().startOf('day').subtract(7, 'days'),
      //       numberOfDays: 11,
      //       checkIfFocused: true
      //     },
      //     { root: true }
      //   )
      // }, EPG_FETCH_DELAY)
    },
    refocusChannel ({ state, getters, commit, dispatch }) {
      let focusedIndex = findIndex({ id: state.playingEvent.channelId }, getters.getAllChannels)
      commit('UPDATE_CURRENT_EVENT', state.playingEvent)
      console.log('PLAYER_MODULE, focusing event wiht title ', state.playingEvent.title)
      dispatch('focusChannel', { newFocusedChannelIndex: focusedIndex, numberOfDays: 7, reFocus: true })
      dispatch('playerEvents/getInitalEvents', {
        channelId: state.playingEvent.channelId,
        eventId: state.playingEvent.id,
        startTime: state.playingEvent.startTime,
        endTime: state.playingEvent.endTime
      },
      { root: true }
      )
    },
    updateCurrentEvent ({ rootState, getters, commit, dispatch }, { channelId = getters.getFocusedChannel.id, startTime }) {
      dispatch(
        'epg/fetchSingleChannelEvent',
        {
          channelId,
          startTime
        },
        { root: true }
      ).then(() => {
        commit('UPDATE_CURRENT_EVENT', rootState.epg.singleEvent)
      })
    },
    playAsset ({ rootState, commit, dispatch, getters }, { assetId, publishingPoint, startTime, duration, drmRequired }) {
      let newAsset = {
        assetId,
        publishingPoint,
        startTime,
        duration,
        drmRequired
      }
      commit('UPDATE_ASSET', newAsset)
      commit('UPDATE_PLAYBACK_START_TIME', adjustedMoment())
      dispatch('updatePlaybackTimeUpdateInterval')
      dispatch('play', { checkAgeRating: false })
    },
    play ({ state, rootState, commit, dispatch }, { startTime, checkAgeRating = true }) {
      if (checkAgeRating && rootState.parentalRating.allowedEventId !== state.playingEvent.id) {
        dispatch('parentalRating/parentalRating', { channelId: state.currentChannelId, event: state.playingEvent }, { root: true })
      }
      // if (!checkAgeRating) {
      //   dispatch('updatePlaybackTimeUpdateInterval')
      // }

      commit(`UPDATE_PLAY_STATE`, 'play')

      if (state.mode === 'TV') {
        commit('UPDATE_CURRENT_TV_TYPE', startTime ? 'CUTV' : 'LIVE')
        playVideo({
          channelId: state.currentChannelId,
          startTime
        })
      } else if (state.mode === 'RADIO') {
        playRadio({ channelId: state.currentChannelId })
      } else {
        playVod({
          assetId: state.asset.assetId,
          publishingPoint: state.asset.publishingPoint,
          startTime,
          currentTime: state.asset.currentTime,
          drmRequired: state.asset.drmRequired
        })
      }
    },
    scrubVOD ({ state, commit }, { startTime }) {
      if (state) {
        scrubVOD({ startTime })
        commit('UPDATE_PLAYBACK_START_TIME', adjustedMoment() - startTime)
      }
    },
    updatePlaybackTime ({ state, commit, dispatch }) {
      if (state.currentEvent && state.currentEvent.channelId !== state.currentChannelId) {
        commit('UPDATE_PLAYBACK_TIME', adjustedMoment())
        if (adjustedMoment() > state.currentEvent.endTime) {
          dispatch('updateCurrentEvent', { startTime: state.currentEvent.endTime + 1 })
        }
      } else {
        commit('UPDATE_PLAYBACK_TIME', getCurrentTime())
      }
      commit('UPDATE_LIVE_TIME', adjustedMoment())
      dispatch('updateEvent')
    },
    clearPlaybackTimeUpdateInterval ({ state, commit }) {
      window.clearInterval(state.playbackTimeUpdateInterval)
      commit('UPDATE_PLAYBACK_TIME_UPDATE_INTERVAL', -1)
    },
    updatePlaybackTimeUpdateInterval ({ state, commit, dispatch }) {
      if (state.playbackTimeUpdateInterval === -1) {
        dispatch('updatePlaybackTime')
        commit('UPDATE_PLAYBACK_TIME_UPDATE_INTERVAL', window.setInterval(function () {
          dispatch('updatePlaybackTime')
        }, 1000))
      }
    },
    updateEvent ({ state, rootState, getters, commit, dispatch }) {
      // TODO this should not be fired when browsing through not focused events
      if (!state.playingEvent) {
        commit(`UPDATE_PLAYING_EVENT`, {
          id: -1,
          title: '',
          startTime: Date.now(),
          endTime: Date.now(),
          channelId: -1,
          thumbnail: '',
          ageRating: '0'
        })
      }
      if (getCurrentTime() < state.playingEvent.endTime) {
        return
      }
      if (state.playingEvent.channelId === state.currentChannelId) {
        if (state.nextEvent === null) {
          let eventIndex = findIndex({ id: state.playingEvent.id }, rootState.playerEvents.events)
          commit('UPDATE_NEXT_EVENT', rootState.playerEvents.events[++eventIndex])
        }
        dispatch('showNewEvent', { id: state.nextEvent.id, nextEvent: true })
      }
    },
    updateSelectedEventIndex ({ state, commit }, { index }) {
      commit(`UPDATE_SELECTED_EVENT_INDEX`, index)
    },
    updateCategory ({ state, commit }, {newCategoryId}) {
      commit(`UPDATE_CURRENT_${state.mode}_CATEGORY_ID`, newCategoryId)
    },
    updateCategoryType ({ state, commit }, {newCategoryType}) {
      commit(`UPDATE_CURRENT_${state.mode}_CATEGORY_TYPE`, newCategoryType)
    },
    updateTvCategory ({ state, commit }, {newCategoryId, newCategoryType}) {
      commit(`UPDATE_CURRENT_TV_CATEGORY_ID`, newCategoryId)
      commit(`UPDATE_CURRENT_TV_CATEGORY_TYPE`, newCategoryType)
    },
    moveCtaPosition ({ state, commit }, position) {
      const newEvent = { ...state.selectedEvent, ctaSelectedPosition: position }
      commit('UPDATE_SELECTED_EVENT', newEvent)
    },
    updateSelectedEvent ({ state, commit, rootState }, { id, ctaDisplay }) { // this is used only for events from same channel
      const newEventIndex = findIndex({ id }, rootState.playerEvents.events)
      const newEvent = cloneDeep(rootState.playerEvents.events[newEventIndex])
      let ctaButtons = []
      if (!newEvent) return
      if (Date.now() > newEvent.endTime) {
        if (isNaN(newEvent.id) && state.focusedChannelCutvEnabled) {
          ctaButtons = CTA_BUTTONS_CATCHUP_NO_INFO
        } else if (!isNaN(newEvent.id) && !state.focusedChannelCutvEnabled) {
          ctaButtons = CTA_BUTTONS_CATCHUP_NO_CATCHUP
        } else if (!isNaN(newEvent.id) && state.focusedChannelCutvEnabled) {
          ctaButtons = CTA_BUTTONS_CATCHUP
        }
      } else if (Date.now() > newEvent.startTime && Date.now() < newEvent.endTime) {
        if (isNaN(newEvent.id) && state.focusedChannelStartOverEnabled) {
          ctaButtons = CTA_BUTTONS_CURRENT_NO_INFO
        } else if (!isNaN(newEvent.id) && !state.focusedChannelStartOverEnabled) { // START-OVER enabled? Double check [by DDD]
          ctaButtons = CTA_BUTTONS_CURRENT_NO_STARTUP_NO_INFO
        } else if (isNaN(newEvent.id) && !state.focusedChannelStartOverEnabled) {
          // ctaButtons = CTA_BUTTONS_CURRENT_NO_STARTUP_NO_INFO
        } else {
          ctaButtons = CTA_BUTTONS_CURRENT
        }
      } else if (Date.now() < newEvent.startTime) {
        if (!isNaN(newEvent.id)) {
          ctaButtons = CTA_BUTTONS_NEXT_EVENTS(newEvent.hasReminder)
        }
      }
      newEvent.ctaMode = ctaDisplay
      newEvent.ctaSelectedPosition = 0
      newEvent.ctaButtons = ctaButtons
      commit('UPDATE_SELECTED_EVENT', newEvent)
    },
    toggleCtaMode ({ state, commit }, forcedValue) {
      const newEvent = {
        ...state.selectedEvent,
        ctaMode: forcedValue !== null ? forcedValue : !state.selectedEvent.ctaMode
      }
      commit('UPDATE_SELECTED_EVENT', newEvent)
    },
    setVODOffset ({ state, commit }, offset) {
      commit('UPDATE_PLAYBACK_START_TIME', state.liveTime - offset)
    }
  },
  getters: {
    currentCategoryName: (state, getters, rootState) => {
      if (state.currentTvCategoryType === 'CATEGORY') {
        return rootState.general.tvCategories.length > 0 ? find({ id: state.currentTvCategoryId })(rootState.general.tvCategories).name : '' // :'name'
      } else if (state.currentTvCategoryType === 'CUSTOM_TV') {
        return rootState.favorites.tvFavoriteLists[state.currentTvCategoryId] ? rootState.favorites.tvFavoriteLists[state.currentTvCategoryId].name : ''
      } else {
        return ''
      }
    },
    getRadioBackground: (state) => state.radioBackground,
    getCurrentChannel: (state, getters) => find({ id: state.currentChannelId }, getters.getAllChannels),
    getCurrentChannelId: (state) => state.currentChannelId,
    getCurrentEventId: (state) => state.currentEvent.id,
    getFocusedChannel: (state, getters) => getters.getAllChannels[state.focusedChannelIndex],
    getAllTvChannels: (state, getters, rootState, rootGetters) => {
      let channels
      if (getters.getCategoryType === 'CUSTOM_TV') {
        channels = rootState.favorites.tvFavoriteLists[getters.getCategoryId] ? rootState.favorites.tvFavoriteLists[getters.getCategoryId].channels : []
        return channels
      } else {
        channels = rootState.general.tvChannels[getters.getCategoryId] ? rootState.general.tvChannels[getters.getCategoryId] : []
        return channels
      }
    },
    getAllChannels: (state, getters, rootState, rootGetters) => {
      let channels
      if (state.mode === 'TV') {
        if (getters.getCategoryType === 'CUSTOM_TV') {
          channels = rootState.favorites.tvFavoriteLists[getters.getCategoryId] ? rootState.favorites.tvFavoriteLists[getters.getCategoryId].channels : []
          return channels
        } else {
          channels = rootState.general.tvChannels[getters.getCategoryId] ? rootState.general.tvChannels[getters.getCategoryId] : []
          return channels
        }
      } else {
        return rootState.general.radioChannels[state.currentRadioCategoryId]
      }
    },
    getChannelList: (state, getters) => {
      return (getters.getAllChannels || []).map(
        (channel, index) => ({
          number: channel.position,
          imgUrl: getImage(channel.images, 'STB_FHD', 'LOGO_16_9', tvLogoDefaultImage),
          id: channel.id
        })
      )
    },
    getCategoryType: (state) => {
      return state.mode === 'TV' ? state.currentTvCategoryType : state.currentRadioCategoryType
    },
    getCategoryId: (state) => {
      return state.mode === 'TV' ? state.currentTvCategoryId : state.currentRadioCategoryId
    },
    getRouteName: state => ({ TV: 'PlayerTv', RADIO: 'PlayerRadio' }[state.mode]),
    getSelectedEvent: state => state.selectedEvent,
    getCurrentEvent: state => state.currentEvent,
    getAsset: state => state.asset,
    getCurrentCategory: (state, getters, rootState) => {
      const catId = find({ id: state.currentTvCategoryId }, rootState.general.tvCategories)
      return catId ? catId.name : ''
    },
    getFocusedEvents: (state, getters, rootState) => {
      const cutvEnabled = state.focusedChannelCutvEnabled
      const startOverEnabled = state.focusedChannelStartOverEnabled
      const resp = rootState.epg.data.map(event => ({
        imageUrl: event.thumbnail,
        startTime: event.startTime,
        endTime: event.endTime,
        title: event.title,
        id: event.id,
        channelId: event.channelId,
        ageRating: event.ageRating,
        hasReminder: event.hasReminder,
        cutvEnabled: cutvEnabled,
        startOverEnabled: startOverEnabled
      }))
      return resp
    },
    getSelectedEventIndex (state) { return state.selectedEventIndex }
  },
  mutations: {
    UPDATE_MODE (state, newMode) {
      state.mode = newMode
    },
    UPDATE_FOCUSED_CHANNEL (state, newIndex) {
      state.focusedChannelIndex = newIndex
    },
    UPDATE_FOCUSED_START_OVER (state, newIndex) {
      state.focusedChannelStartOverEnabled = newIndex
    },
    UPDATE_FOCUSED_CUTV (state, newIndex) {
      state.focusedChannelCutvEnabled = newIndex
    },
    UPDATE_FOCUSED_CUTV_DELAY (state, newIndex) {
      state.focusedChannelCutvDelay = newIndex
    },
    UPDATE_CURRENT_CHANNEL_ID (state, newId) {
      state.currentChannelId = newId
    },
    UPDATE_CURRENT_EVENT (state, newEvent) {
      console.log('PLAYER_MODULE, old =', state.currentEvent.title, ' |||| new =', newEvent.title)
      state.currentEvent = Object.freeze(newEvent)
    },
    UPDATE_PLAYING_EVENT (state, newEvent) {
      state.playingEvent = Object.freeze(newEvent)
    },
    UPDATE_NEXT_EVENT (state, newEvent) {
      state.nextEvent = Object.freeze(newEvent)
    },
    UPDATE_CURRENT_TV_TYPE (state, newType) {
      state.currentTvType = newType
    },
    UPDATE_CURRENT_TV_CATEGORY_ID (state, newCategoryId) {
      state.currentTvCategoryId = newCategoryId
    },
    UPDATE_CURRENT_TV_CATEGORY_TYPE (state, newCategoryType) {
      state.currentTvCategoryType = newCategoryType
    },
    UPDATE_CURRENT_RADIO_CATEGORY_ID (state, newCategoryId) {
      state.currentRadioCategoryId = newCategoryId
    },
    UPDATE_CURRENT_RADIO_CATEGORY_TYPE (state, newCategoryType) {
      state.currentRadioCategoryType = newCategoryType
    },
    UPDATE_INTERNAL_PLAYER_START_TIME (state, newTime) {
      state.internalPlayerStartTime = Object.freeze(newTime)
    },
    UPDATE_PLAY_STATE (state, newPlayState) {
      state.playState = newPlayState === 'play' ? 'play' : 'pause'
    },
    TOGGLE_PLAY_STATE (state) {
      state.playState = state.playState === 'play' ? 'pause' : 'play'
    },
    UPDATE_SELECTED_EVENT (state, newEvent) {
      state.selectedEvent = newEvent
    },
    UPDATE_ASSET (state, newAsset) {
      state.asset = Object.freeze(newAsset)
    },
    UPDATE_PLAYBACK_TIME_UPDATE_INTERVAL (state, newValue) {
      state.playbackTimeUpdateInterval = newValue
    },
    UPDATE_PLAYBACK_TIME (state, newTime) {
      state.playbackTime = Object.freeze(newTime)
    },
    UPDATE_LIVE_TIME (state, newTime) {
      state.liveTime = newTime
    },
    UPDATE_RADIO_BACKGROUND (state, newValue) {
      state.radioBackground = newValue
    },
    UPDATE_SELECTED_EVENT_INDEX (state, newValue) {
      state.selectedEventIndex = newValue
    },
    UPDATE_PLAYBACK_START_TIME (state, newValue) {
      state.playbackStartTime = newValue
    }
  }
}
