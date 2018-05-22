import { fetchFavorites } from 'helpers/api'
import { eventCutvBlocked } from 'helpers/oneliners'
import pick from 'lodash/fp/pick'
import { getExtractor } from 'helpers/data'
import { loc } from 'helpers/localization'
import { formatShortDateCard, formatTime, currentEventProgress } from 'helpers/time'
import { getImage } from 'helpers/image'
import tvLogoDefaultImage from 'assets/images/placeholders/lending_page_logo_300x168.png'
import tvEventDefaultImage from 'assets/images/placeholders/landing_page_event_300x168.png'

const IMG_SMALL = 'STB_FHD'
const TYPE_EVENT = 'EVENT_16_9'
const TYPE_LOGO = 'LOGO_16_9'

export default {
  namespaced: true,
  state: {
    data: []
  },
  actions: {
    fetchFavoritesData: async ({ dispatch, commit, rootState }) => {
      return new Promise((resolve, reject) => {
        fetchFavorites().then((response) => {
          response.data.content = response.data.content.map((event) => ({...event, cutvEnabled: eventCutvBlocked(rootState.general.tvChannelsMap[event.channelId].cutvDelay, event.startTime)}))
          commit('UPDATE_FAVORITES', response.data.content)
          resolve()
        })
      })
    }
  },
  mutations: {
    UPDATE_FAVORITES (state, newData) {
      state.data = Object.freeze(newData)
    }
  },
  getters: {
    getCurrentFavoritesData: state => state.data,
    getTvFavorites: state => {
      return {
        items: state.data || [], // can be freezed
        type: 'FAVORITES_LIVE',
        title: loc('mylibrary_favorites_tvevents')
      }
    },
    getVodFavorites: (state, getters, rootState) => {
      return {
        items: rootState.vod.vodPolicy === true ? rootState.vod.assets : [],
        type: 'FAVORITES_VOD',
        title: loc('mylibrary_favorites_ondemand'),
        blockSlide: true
      }
    },
    getPreparedFavoritesData: (state, getters, rootState) => {
      return [getters.getTvFavorites, getters.getVodFavorites]
        .filter(row => (rootState.vod.vodPolicy || (row.type !== 'VOD' && row.type !== 'FAVORITES_VOD')) && row.items.length !== 0)
        .map((row, index) => {
          // const config = getConfig(row.type, 'light', index)
          const config = getExtractor(row.type)({ theme: 'light', rowIndex: index })
          let cards = row.items.map(config.mapCallback)

          if (cards.length > 4 && row.type !== 'BANNER' && row.type !== 'CATALOGUE' && row.type !== 'VIRTUAL_CATALOGUE') {
            cards = cards.slice(0, 6).concat([{
              id: 'SEE_ALL',
              type: config.cardType,
              click: cards[0].click,
              theme: 'light'
            }])
          }

          return {
            ...pick(['height', 'cardType', 'cardWidth', 'background', 'theme'], config),
            cards,
            count: row.type !== 'BANNER' ? row.items.length : null,
            title: row.type !== 'BANNER' ? row.title : '',
            blockSlide: row.blockSlide
          }
        })
    },
    eventFavorites: (state) => {
      return (state.data || []).map(event => ({
        id: event.id,
        firstRowText: event.title,
        secondRowText: event.startTime !== null && event.endTime !== null ? `${formatShortDateCard(event.startTime)} // ${formatTime(event.startTime)} - ${formatTime(event.endTime)}` : '',
        logoUrl: getImage(event.channelLogos, IMG_SMALL, TYPE_LOGO, tvLogoDefaultImage),
        imageUrl: getImage(event.images, IMG_SMALL, TYPE_EVENT, tvEventDefaultImage),
        progress: currentEventProgress(event.startTime, event.endTime),
        categories: event.categories,
        channelId: event.channelId,
        startTime: event.startTime
      }))
    }
  }
}
