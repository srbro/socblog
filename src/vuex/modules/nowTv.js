import { fetchEPGCurrentEvents } from 'helpers/api'
// import { getImage } from 'helpers/image'
// import { defaultEPG, uniqueID } from 'helpers/oneliners'
import { find } from 'lodash/fp'
// import tvEventDefaultImage from 'assets/images/placeholders/landing_page_event_300x168.png'
import clone from 'lodash/fp/clone'
import { getImage } from 'helpers/image'
import { currentEventProgress, formatShortDateCard, formatTime } from 'helpers/time'

import tvLogoDefaultImage from 'assets/images/placeholders/lending_page_logo_300x168.png'
import tvEventDefaultImage from 'assets/images/placeholders/landing_page_event_300x168.png'

const IMG_SMALL = 'STB_FHD'
const TYPE_EVENT = 'EVENT_16_9'
const TYPE_LOGO = 'LOGO_16_9'

export default {
  namespaced: true,
  state: {
    data: [],
    tvCategory: -1,
    tvCategoryType: 'CATEGORY',
    eventPosition: 0,
    channelSort: 'RECOMMENDED',
    sortDir: 'ASC',
    page: 0,
    size: 1000,
    totalPages: 0,
    pagination: false,
    selectionIds: {
      now: [0],
      categories: [null],
      sort: []
    }
  },
  getters: {
    getEvents: state => {
      return state.data
    }
  },
  actions: {
    reset ({ commit }) {
      commit('UPDATE_CHANNEL_SORT', 'RECOMMENDED')
      commit('UPDATE_SORT_DIR', 'ASC')
    },
    setSort ({ commit, dispatch }, { channelSort, sortDir }) {
      commit('UPDATE_CHANNEL_SORT', channelSort)
      commit('UPDATE_SORT_DIR', sortDir)
      commit('UPDATE_PAGE', 0)
      dispatch('fetchNowTvEvents')
    },
    setEventPosition ({ commit, dispatch }, { eventPosition }) {
      // dispatch('reset')
      commit('UPDATE_PAGE', 0)
      commit('UPDATE_EVENT_POSITION', eventPosition)
      dispatch('fetchNowTvEvents')
    },
    setTvCategory ({ commit, dispatch, state, rootGetters }, { tvCategory, tvCategoryType }) {
      commit('UPDATE_TV_CATEGORY', tvCategory)
      commit('UPDATE_TV_CATEGORY_TYPE', tvCategoryType)
      if (tvCategory === rootGetters['general/getDefaultTvCategory'] && tvCategoryType === 'CATEGORY') {
        commit('UPDATE_PAGE', 0)
        // commit('UPDATE_SIZE', 30)
        // commit('UPDATE_PAGINATION', true)
      } else {
        commit('UPDATE_PAGE', 0)
        commit('UPDATE_SIZE', 1000)
        commit('UPDATE_PAGINATION', false)
      }
      dispatch('fetchNowTvEvents')
    },
    fetchNowTvEvents ({ commit, state, rootGetters }) {
      if (state.tvCategory === -1) {
        commit('UPDATE_TV_CATEGORY', rootGetters['general/getDefaultTvCategory'])
        commit('UPDATE_TV_CATEGORY_TYPE', 'CATEGORY')
      }
      fetchEPGCurrentEvents(state.eventPosition, state.channelSort, state.sortDir, state.page, state.size, IMG_SMALL)
        .then((response) => {
          const tvChannelsMap = rootGetters['general/getTVChannelsMap'] || {}
          // if (tvChannelsMap) {
          let newData = (response.data.content || [])
            .map(event => {
              return {
                id: event.id,
                firstRowText: event.title,
                secondRowText: event.startTime !== null && event.endTime !== null ? `${formatShortDateCard(event.startTime)} // ${formatTime(event.startTime)} - ${formatTime(event.endTime)}` : '',
                logoUrl: getImage(event.channelLogos, IMG_SMALL, TYPE_LOGO, tvLogoDefaultImage),
                imageUrl: getImage(event.images, IMG_SMALL, TYPE_EVENT, tvEventDefaultImage),
                progress: currentEventProgress(event.startTime, event.endTime),
                // categories: event.categories,
                channelId: event.channelId,
                startTime: event.startTime,
                cutvEnabled: tvChannelsMap[event.channelId] ? tvChannelsMap[event.channelId].cutvEnabled : false,
                channelName: tvChannelsMap[event.channelId] ? tvChannelsMap[event.channelId].name : '',
                channelPosition: tvChannelsMap[event.channelId] ? tvChannelsMap[event.channelId].position : 0,
                cutvDelay: tvChannelsMap[event.channelId] ? tvChannelsMap[event.channelId].cutvDelay : 0
              }
            })
          if (!state.pagination && !(state.tvCategory === rootGetters['general/getDefaultTvCategory'] && state.tvCategoryType === 'CATEGORY')) {
            const tvCategores = state.tvCategoryType === 'CATEGORY' ? rootGetters['general/getTvChannels'][state.tvCategory] : rootGetters['favorites/getAllLists'] ? rootGetters['favorites/getAllLists']('tv')[state.tvCategory].channels : []
            newData = newData.filter(event => {
              if (state.tvCategoryType === 'CATEGORY') {
                return find({ id: event.channelId }, tvCategores)
              } else if (state.tvCategoryType === 'CUSTOM_TV') {
                return find({ id: event.channelId }, tvCategores)
              }
            })
          }
          commit('UPDATE_DATA', newData)
          commit('UPDATE_TOTAL_PAGES', response.data.totalPages)
        // }
        })
      // })
    },
    loadMore ({ commit, state, rootGetters }) {
      if (state.page < state.totalPages - 1 && state.pagination) {
        commit('UPDATE_PAGE', state.page + 1)
        fetchEPGCurrentEvents(state.eventPosition, state.channelSort, state.sortDir, state.page, state.size, IMG_SMALL)
          .then((response) => {
            const newData = response.data.content.map(event => ({
              id: event.id,
              firstRowText: event.title,
              secondRowText: event.startTime !== null && event.endTime !== null ? `${formatShortDateCard(event.startTime)} // ${formatTime(event.startTime)} - ${formatTime(event.endTime)}` : '',
              logoUrl: getImage(event.channelLogos, IMG_SMALL, TYPE_LOGO, tvLogoDefaultImage),
              imageUrl: getImage(event.images, IMG_SMALL, TYPE_EVENT, tvEventDefaultImage),
              progress: currentEventProgress(event.startTime, event.endTime),
              // categories: event.categories,
              channelId: event.channelId,
              startTime: event.startTime,
              cutvEnabled: (rootGetters['general/getTVChannelsMap'][event.channelId]).cutvEnabled,
              // channelName: (rootGetters['general/getTVChannelsMap'][event.channelId]).name,
              channelPosition: (rootGetters['general/getTVChannelsMap'][event.channelId]).position
            }))
            let oldData = clone(state.data)
            commit('UPDATE_DATA', oldData.concat(newData))
            commit('UPDATE_TOTAL_PAGES', response.data.totalPages)
          })
      }
    }
  },
  mutations: {
    UPDATE_SELECTION_IDS (state, { newData, newSelectionIds }) {
      state.selectionIds[newData] = newSelectionIds
    },
    UPDATE_DATA (state, newData) {
      state.data = Object.freeze(newData)
    },
    UPDATE_TV_CATEGORY (state, newTvCategory) {
      state.tvCategory = newTvCategory
    },
    UPDATE_TV_CATEGORY_TYPE (state, newTvCategoryType) {
      state.tvCategoryType = newTvCategoryType
    },
    UPDATE_EVENT_POSITION (state, newEventPosition) {
      state.eventPosition = newEventPosition
    },
    UPDATE_CHANNEL_SORT (state, newChannelSort) {
      state.channelSort = newChannelSort
    },
    UPDATE_SORT_DIR (state, newSortDir) {
      state.sortDir = newSortDir
    },
    UPDATE_PAGE (state, newPage) {
      state.page = newPage
    },
    UPDATE_SIZE (state, newSize) {
      state.size = newSize
    },
    UPDATE_TOTAL_PAGES (state, newTotalPages) {
      state.totalPages = newTotalPages
    },
    UPDATE_PAGINATION (state, newPagination) {
      state.pagination = newPagination
    }
  }
}
