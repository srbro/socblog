import filter from 'lodash/fp/filter'
import flow from 'lodash/fp/flow'
import fromPairs from 'lodash/fp/fromPairs'
import map from 'lodash/fp/map'
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import clone from 'lodash/fp/clone'
import keyBy from 'lodash/fp/keyBy'

import { fetchCategories, fetchChannels, getPreferences, putPreferences } from 'helpers/api'
import { sleep } from 'helpers/oneliners'
import { exitApp, sendChannelData } from 'hal'
import { loc } from 'helpers/localization'
import { weapperVersionBlock } from 'helpers/versionChecker/versionChecker'
import { pause, resume } from 'helpers/player' // Localization function
import { APP_MODE_DEFAULT } from 'helpers/consts' // Is application is in default or provisioning mode
import { getQueryParams } from 'helpers/urlParams'

export default {
  namespaced: true,
  totalNumberOfElements: 1000,
  state: {
    tvChannelsMap: {},
    radioChannelsMap: {},
    tvChannels: {},
    tvCategories: [],
    defaultTVcategory: -1,
    defaultRadioCategory: 0,
    tvList: [],
    // channels: {},
    radioChannels: {},
    radioCategories: {},
    radioList: [],
    eventCategories: [],
    timeOffset: 0,
    gui: {
      showLanguageSelection: false,
      showTrainingScreens: false,
      showNavigationUser: false,
      showSearchButton: true,
      showRadioRowOnLandings: true
    },
    appState: true,
    deviceInfo: '',
    mouseEnabled: false,
    goToParentHandleKey: '',
    appMode: APP_MODE_DEFAULT
  },
  getters: {
    findChannel: state => (channelId, categoryId) => {
      return find({id: channelId})(state.tvChannels[categoryId])
    },
    getTimeOffset: state => state.timeOffset,
    getTvList: state => state.tvList,
    getRadioList: state => state.radioList,
    getAppState: state => state.appState,
    getDeviceGroup: state => state.deviceInfo,
    getDefaultTvCategory: state => state.defaultTVcategory,
    getTvChannels: state => state.tvChannels,
    getTVChannelsMap: state => state.tvChannelsMap,
    getNowTvTvCategories: (state, getters, rootState, rootGetters) => {
      let i = 0
      const favoriteCategories = rootGetters['favorites/getAllLists'] ? rootGetters['favorites/getAllLists']('tv') : []
      return state.tvList
        .filter(category => {
          if (category.type === 'CATEGORY') {
            return state.tvChannels[category.id] && state.tvChannels[category.id].length > 0
          } else if (category.type === 'CUSTOM_TV') {
            return favoriteCategories[category.id] && favoriteCategories[category.id].channels && favoriteCategories[category.id].channels.length > 0
          } else {
            return false
          }
        })
        .map(category => ({
          id: i++, // + '_' + category.type,
          typeCategory: category.type,
          idCategory: category.id,
          type: 'category',
          default: category.type === 'CATEGORY' && category.id === getters['getDefaultTvCategory'],
          label: category.type === 'CUSTOM_TV' ? favoriteCategories[category.id].name : find({id: category.id})(state.tvCategories).name
        }))
    }
  },

  actions: {
    fetchChannels: async ({ commit, dispatch, rootGetters, getters }) => {
      const responses = await Promise.all([
        fetchCategories('TV'),
        fetchChannels('TV'),
        fetchCategories('RADIO'),
        fetchChannels('RADIO'),
        getPreferences()
      ])

      const tvChannelsMap = keyBy('id')(responses[1].data)
      commit('UPDATE_TV_CHANNELS_MAP', tvChannelsMap)

      const radioChannelsMap = keyBy('id')(responses[3].data)
      commit('UPDATE_RADIO_CHANNELS_MAP', radioChannelsMap)

      const pairs = [
        [responses[0], responses[1]],
        [responses[2], responses[3]]
      ]
      sendChannelData(responses[1].data, responses[3].data)
      pairs.forEach(([categoriesResponse, channelsResponse], index) => {
        const channelCategories = categoriesResponse.data
        channelCategories.forEach(category => {
          if (category.includesAll) {
            commit(`UPDATE_DEFAULT_${index === 0 ? 'TV' : 'RADIO'}_CATEGORY`, category.id)
          }
        })
        const channels = flow(
          map(category => [
            category.id,
            // {channels: filter(channel => channel.categories.map(c => c.id).indexOf(category.id) > -1)(channelsResponse.data), type: `${index === 0 ? 'TV' : 'RADIO'}`}
            filter(channel => channel.categories.map(c => c.id).indexOf(category.id) > -1)(channelsResponse.data)
          ]),
          fromPairs
        )(channelCategories)

        commit(`UPDATE_${index === 0 ? 'TV' : 'RADIO'}_CHANNELS`, channels)
        commit(`UPDATE_${index === 0 ? 'TV' : 'RADIO'}_CATEGORIES`, channelCategories)
      })
      const CHF_TV_ORDER = find({preferenceKey: 'CHF_TV_ORDER'})(responses[4].data)
      if (CHF_TV_ORDER) {
        commit('UPDATE_TV_LISTS', CHF_TV_ORDER.preferenceValue)
      } else {
        commit('UPDATE_TV_LISTS', responses[0].data.map((category) => ({
          id: category.id,
          type: 'CATEGORY'
        })))
      }
      const CHF_RADIO_ORDER = find({preferenceKey: 'CHF_RADIO_ORDER'})(responses[4].data)
      if (CHF_RADIO_ORDER) {
        commit('UPDATE_RADIO_LISTS', CHF_RADIO_ORDER.preferenceValue)
      } else {
        commit('UPDATE_RADIO_LISTS', responses[2].data.map((category) => ({
          id: category.id,
          type: 'CATEGORY'
        })))
      }
    },
    changeList: ({commit, getters}, {type, list}) => {
      commit(`UPDATE_${type}_LISTS`, list)
      putPreferences({ preferenceKey: `CHF_${type}_ORDER`, preferenceValue: list })
    },
    addToCustomList: ({commit, getters}, {data, type}) => {
      let list = clone(type === 'TV' ? getters.getTvList : getters.getRadioList)
      list.push({ id: data.id, type: data.type })
      commit(`UPDATE_${type}_LISTS`, list)
      putPreferences({ preferenceKey: `CHF_${type}_ORDER`, preferenceValue: list })
    },
    removeToCustomList: ({commit, getters}, {index, type}) => {
      let list = clone(type === 'TV' ? getters.getTvList : getters.getRadioList)
      const inx = findIndex({id: index})(list)
      list.splice(inx, 1)
      commit('UPDATE_TV_LISTS', list)
      putPreferences({ preferenceKey: `CHF_${type}_ORDER`, preferenceValue: list })
    },
    fetchEventCategories: async ({ commit, dispatch, rootGetters, getters }) => {
      const eventCategories = await fetchCategories('ASSET')
      commit('UPDATE_EVENT_CATEGORIES', eventCategories.data)
    },
    loadApp: () => sleep(2000),
    setTimeOffset: ({ commit }, newTimeOffset) => {
      commit('UPDATE_TIME_OFFSET', newTimeOffset)
    },
    onResumePauseActivity: ({ commit, dispatch }, data) => {
      commit('UPDATE_APP_STATE', data)
      if (data) {
        resume()
        weapperVersionBlock()
        dispatch('software/checkVersion', null, { root: true })
      } else {
        pause()
      }
    },
    exitApp: ({ dispatch }) => {
      dispatch('popup/toggle', {
        active: true,
        data: {
          type: 'reminder',
          title: loc('message_server_error_title'),
          text: loc('exiting_app_message_question'),
          priority: 1,
          buttons: [
            {
              id: 'ok',
              label: loc('message_lockedchannel_locked_wrongpin_noattempts_ok'),
              callback: (newValue) => {
                exitApp()
              }
            },
            {
              id: 'cancel',
              label: loc('message_server_error_cancel'),
              callback: (newValue) => {}
            }
          ],
          selectedButtonIndex: 0,
          back: false,
          exitApp: true
        }
      },
      {root: true})
    },
    setDeviceGroup: ({commit}, { deviceInfo }) => {
      commit('SET_DEVICE_GROUP', deviceInfo)
    },
    setAppMode: ({commit}) => {
      let queryParam = getQueryParams()
      console.log('GENERAL setAppMode:', queryParam)
      if (queryParam && queryParam.mode) {
        commit('UPDATE_APP_MODE', queryParam.mode)
        console.log('GENERAL UPDATE setAppMode: ' + queryParam.mode)
      }
    }
  },
  mutations: {
    UPDATE_TV_CHANNELS_MAP (state, newChannels) {
      state.tvChannelsMap = Object.freeze(newChannels)
    },
    UPDATE_RADIO_CHANNELS_MAP (state, newChannels) {
      state.radioChannelsMap = Object.freeze(newChannels)
    },
    // UPDATE_CHANNELS (state, newChannels) {
    //   state.channels = newChannels
    // },
    UPDATE_TV_CHANNELS (state, newChannels) {
      state.tvChannels = Object.freeze(newChannels)
    },
    UPDATE_TV_CATEGORIES (state, newChannelCategories) {
      state.tvCategories = Object.freeze(newChannelCategories)
    },
    UPDATE_DEFAULT_TV_CATEGORY (state, newCategory) {
      state.defaultTVcategory = newCategory
    },
    UPDATE_TV_LISTS (state, newChanneLists) {
      state.tvList = Object.freeze(newChanneLists)
    },
    UPDATE_RADIO_LISTS (state, newChanneLists) {
      state.radioList = Object.freeze(newChanneLists)
    },
    UPDATE_EVENT_CATEGORIES (state, newEventCategories) {
      state.eventCategories = newEventCategories
    },
    UPDATE_RADIO_CHANNELS (state, newChannels) {
      state.radioChannels = Object.freeze(newChannels)
    },
    UPDATE_RADIO_CATEGORIES (state, newRadioCategories) {
      state.radioCategories = Object.freeze(newRadioCategories)
    },
    UPDATE_DEFAULT_RADIO_CATEGORY (state, newCategory) {
      state.defaultRadioCategory = newCategory
    },
    UPDATE_TIME_OFFSET (state, newTimeOffset) {
      state.timeOffset = newTimeOffset
    },
    UPDATE_LOCALIZATION (state, newLocalization) {
      state.localization = newLocalization
    },
    UPDATE_APP_STATE (state, data) {
      state.appState = data
    },
    UPDATE_SHOW_SEARCH_BUTTON (state, data) {
      state.gui.showSearchButton = data
    },
    SET_DEVICE_GROUP (state, deviceInfo) {
      state.deviceInfo = deviceInfo
    },
    SET_MOUSE_ENABLED (state, newMouseEnabled) {
      state.mouseEnabled = newMouseEnabled
    },
    UPDATE_GOTO_PARENT_HANDLEKEY (state, newValue) {
      state.goToParentHandleKey = newValue
    },
    UPDATE_APP_MODE (state, newValue) {
      state.appMode = newValue
    }
  }
}
