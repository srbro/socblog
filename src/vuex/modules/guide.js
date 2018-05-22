import { generatePath as generateImagePath } from 'helpers/image'
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import clone from 'lodash/fp/clone'
import logoFavoriteList from 'assets/icons/categories/newfavorite_gr2_40.png'
import logoFavoriteListSelected from 'assets/icons/categories/newfavorite_bl_48.png'

import { fetchEPG } from 'helpers/api'
import { formatTime, startOfHour, YEAR, SECOND } from 'helpers/time'
import { defaultEPG, uniqueID } from 'helpers/oneliners'

export default {
  namespaced: true,
  state: {
    events: []
  },
  getters: {
    getCategories: (state, getters, rootState) => {
      if (!rootState.general.tvList.length) return []
      return rootState.general.tvList
        .filter(category => {
          if (category.type === 'CUSTOM_TV') {
            return rootState.favorites.tvFavoriteLists[category.id] && rootState.favorites.tvFavoriteLists[category.id].channels && rootState.favorites.tvFavoriteLists[category.id].channels.length > 0
          } else {
            return rootState.general.tvChannels[category.id] && rootState.general.tvChannels[category.id].length > 0
          }
        })
        .map(category => ({
          id: category.id,
          channels: category.type === 'CUSTOM_TV' ? rootState.favorites.tvFavoriteLists[category.id].channels : rootState.general.tvChannels[category.id],
          typeCategory: category.type,
          type: 'category',
          label: category.type === 'CUSTOM_TV' ? rootState.favorites.tvFavoriteLists[category.id].name : find({id: category.id})(rootState.general.tvCategories).name,
          iconActive: category.type === 'CUSTOM_TV' ? logoFavoriteListSelected : generateImagePath({imageProperty: find({id: category.id})(rootState.general.tvCategories).images, index: findIndex({mode: 'BLUE_STB', height: 48})(find({id: category.id})(rootState.general.tvCategories).images)}),
          icon: category.type === 'CUSTOM_TV' ? logoFavoriteList : generateImagePath({imageProperty: find({id: category.id})(rootState.general.tvCategories).images, index: findIndex({mode: 'GREY_STB', height: 40})(find({id: category.id})(rootState.general.tvCategories).images)})
        }))
    }
  },
  actions: {
    fetchEvents ({ rootState, commit }, { channelId, startTime, numberOfDays }) {
      let currentPlayerEventTime = formatTime(rootState.player.currentEvent.startTime)
      const endTime = startTime + numberOfDays * YEAR - SECOND

      const request = fetchEPG(channelId, startTime, endTime)
      request.then((response) => {
        let relevantData = response.data[channelId].map(event => {
          let now = Date.now()

          return {
            type: 'event',
            time: formatTime(event.startTime),
            label: event.title,
            playIcon: currentPlayerEventTime === formatTime(event.startTime) && event.id === rootState.player.currentEvent.id,
            nowPoint: now >= event.startTime && now <= event.endTime,
            id: event.id === 0 ? 'blank_' + uniqueID(event.startTime) + String(event.channelId) : event.id,
            startTime: event.startTime,
            endTime: event.endTime,
            hasReminder: event.hasReminder,
            live: event.live,
            ageRating: event.ageRating
          }
        })
        commit('UPDATE_EVENTS', relevantData)
      }).catch(() => {
        const data = defaultEPG(startOfHour(startTime), startOfHour(endTime), channelId, rootState.player.currentEvent)
        commit('UPDATE_EVENTS', data)
      })
    },
    // called from reminders/toggleHasReminder
    toggleHasReminder ({ dispatch, state, commit }, { eventId, hasReminder }) {
      if (state.events) {
        let eventIndex = findIndex({ 'id': eventId })(state.events)
        if (eventIndex >= 0) {
          const newEvents = clone(state.events)
          newEvents[eventIndex].hasReminder = hasReminder
          commit('UPDATE_EVENTS', newEvents)
        }
      }
    }
  },
  mutations: {
    UPDATE_EVENTS (state, newEvents) {
      state.events = Object.freeze(newEvents)
    }
  }
}
