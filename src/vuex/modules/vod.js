import { fetchVodLandingPage,
  fetchVodAssets,
  fetchVodDetail,
  fetchCatalogues,
  fetchCategories,
  fetchGenres,
  fetchFilters,
  putVodFavorite,
  getSeasons,
  putVodProgress } from 'helpers/api'
import isEmpty from 'lodash/fp/isEmpty'
import keys from 'lodash/fp/keys'
import findIndex from 'lodash/fp/findIndex'
import clone from 'lodash/fp/clone'
import { getImage } from 'helpers/image'
import { parseLandingPageData } from 'helpers/data'
import { currentEventProgress } from 'helpers/time'
import tvLogoDefaultImage from 'assets/images/placeholders/lending_page_logo_300x168.png'
import tvEventDefaultImage from 'assets/images/placeholders/landing_page_event_300x168.png'
import { loc } from 'helpers/localization'

const IMG_SMALL = 'STB_FHD'
const TYPE_EVENT = 'VOD_POSTER_21_31'
const TYPE_LOGO = 'LOGO_16_9'

let fetchVodAssetsLock = false

export default {
  namespaced: true,
  state: {
    assets: [],
    catalogues: [],
    categories: [],
    detail: {},
    filters: [],
    genres: [],
    landingPage: [],
    seasons: [],
    episodeDetail: {},
    vodPolicy: false,
    sortDir: 'DESC',
    vodSort: 'AZ',
    totalElements: null,
    selectedItems: {
      seasonDetailActiveCardId: null,
      vodDetailActiveSeason: null,
      vodLandingSelectedRow: null,
      vodLandingActiveCard: null,
      vodSeeAllGridSelectedCard: null
    },
    selectionIds: {
      catalogues: [],
      categories: [],
      genres: [],
      sort: [] // RECOMMENDED or AZ
    }
  },
  getters: {
    vodPolicy: state => state.vodPolicy,
    vodFavorites: (state) => {
      return (state.assets || []).map(event => ({
        id: event.id,
        firstRowText: event.title,
        secondRowText: `${event.year}`, // event.startTime && event.endTime ? `${formatShortDateCard(event.startTime)} // ${formatTime(event.startTime)} - ${formatTime(event.endTime)}` : '', Kada budemo imali provajdovan info o endTime-u
        logoUrl: getImage(event.channelLogos, IMG_SMALL, TYPE_LOGO, tvLogoDefaultImage),
        imageUrl: getImage(event.images, IMG_SMALL, TYPE_EVENT, tvEventDefaultImage),
        progress: currentEventProgress(event.startTime, event.endTime),
        categories: event.categoryIds,
        channelId: event.channelId,
        startTime: new Date().getTime()
      }))
    },
    getCatalogues: state => {
      return state.catalogues
        .map(catalog => ({
          id: catalog.id,
          label: catalog.title,
          includesAll: catalog.includesAll
        })) || []
    },
    getCategories: state => {
      return state.categories
        .map(category => ({
          id: category.id,
          label: category.name,
          includesAll: category.includesAll
        })) || []
    },
    getGenres: state => {
      return state.genres
        .map(genre => ({
          id: genre.id,
          label: genre.name,
          includesAll: genre.includesAll
        })) || []
    },
    getFilters: state => {
      if (isEmpty(state.filters)) { return [] }
      return keys(state.filters)
        .map(key => ({
          id: key,
          label: key,
          values: state.filters[key] && state.filters[key].length > 0 ? state.filters[key].map(value => ({id: value, label: value})) : state.filters[key]
        }))
    }
  },
  actions: {
    fetchLandingPage: async ({ dispatch, commit, rootGetters }) => {
      return fetchVodLandingPage().then(response => {
        let parsedData = parseLandingPageData({ data: response.data.stripes, vodOption: response.data.vodOption })
        commit('UPDATE_LANDING_PAGE', parsedData)
        commit('UPDATE_VOD_POLICY', response.data.vodOption)
      })
    },
    fetchAssets: async ({ state, dispatch, commit, rootGetters }, { catalogueId, categoryId, genreId, vodSort = 'AZ', filter, imageSize, inFavorites, page, size }) => {
      if (fetchVodAssetsLock) {
        return
      } else {
        fetchVodAssetsLock = true
      }
      return fetchVodAssets(catalogueId, categoryId, genreId, vodSort, state.sortDir, filter, imageSize, inFavorites, page, size)
        .then(response => {
          fetchVodAssetsLock = false
          commit('UPDATE_ASSETS', response.data.content)
          commit('UPDATE_TOTAL_ELEMENTS', response.data.totalElements)
        })
        .catch(() => { fetchVodAssetsLock = false })
    },
    fetchForSelectionCCGSF: async ({ dispatch, commit, rootGetters }) => {
      await Promise.all([
        // dispatch('fetchLandingPage'),
        dispatch('fetchCatalogues'),
        dispatch('fetchCategories'),
        dispatch('fetchGenres'),
        dispatch('fetchFilters')
      ])
    },
    setSortDir ({ commit, dispatch }, sortDir) {
      commit('UPDATE_SORT_DIR', sortDir)
    },
    fetchCatalogues: ({ commit }) => {
      return fetchCatalogues().then(response =>
        commit('UPDATE_CATALOGUES', response.data)
      )
    },
    fetchCategories: ({ commit }) => {
      return fetchCategories('ASSET').then(response =>
        commit('UPDATE_CATEGORIES', response.data)
      )
    },
    fetchGenres: ({ commit }) => {
      return fetchGenres().then(response => {
        const inx = findIndex({includesAll: true}, response.data)
        if (inx > 0) {
          response.data.splice(0, 0, response.data.splice(inx, 1)[0])
          response.data[0].name = loc('ondemand_genre_allgenres')
        }
        commit('UPDATE_GENRES', response.data)
      }
      )
    },
    fetchFilters: ({ commit }, query) => {
      return fetchFilters(query).then(response =>
        commit('UPDATE_FILTERS', response.data)
      )
    },
    fetchDetail: ({ commit }, assetId) => {
      return fetchVodDetail(assetId).then(response => {
        // let now = new Date()
        let now = Date.now()
        const detail = {
          currentTime: now + response.data.watchProgress,
          startTime: response.data.watchProgress,
          endTime: response.data.duration,
          publishingPoint: response.data.publishingPoint[0] ? response.data.publishingPoint[0].publishingPoint : '',
          type: 'video',
          ...response.data
        }
        commit('UPDATE_DETAIL', detail)
      })
    },
    fetchEpisodeDetail: ({ commit }, assetId) => {
      return fetchVodDetail(assetId).then(response => {
        let now = Date.now()
        const detail = {
          currentTime: now + response.data.watchProgress,
          startTime: response.data.watchProgress,
          endTime: response.data.duration,
          publishingPoint: response.data.publishingPoint[0] ? response.data.publishingPoint[0].publishingPoint : '',
          type: 'video',
          ...response.data
        }
        commit('UPDATE_EPISODE_DETAIL', detail)
      })
    },
    toggleFavorite: ({ state, commit }, { assetId, favoriteStatus }) => {
      commit('UPDATE_DETAIL', { ...state.detail, inFavorites: favoriteStatus })
      return putVodFavorite(assetId, favoriteStatus).catch(response => {
        // Reset to starting value if save fails.
        commit('UPDATE_DETAIL', { ...state.detail, inFavorites: !favoriteStatus })
      })
    },
    toggleEpisodeFavorite: ({ state, commit }, { assetId, favoriteStatus }) => {
      return putVodFavorite(assetId, favoriteStatus)
        .then(response => commit('UPDATE_EPISODE_DETAIL', { ...state.episodeDetail, inFavorites: favoriteStatus }))
        .catch(response => {
          // Reset to starting value if save fails.
          commit('UPDATE_EPISODE_DETAIL', { ...state.episodeDetail, inFavorites: !favoriteStatus })
        })
    },
    toggleWatched: ({ state, commit }, { assetId, watchedStatus }) => {
      return putVodProgress({ assetId, watchedStatus })
        .then(response => {
          if (state.episodeDetail.id === assetId) {
            commit('UPDATE_EPISODE_DETAIL', { ...state.episodeDetail, watched: watchedStatus })
          } else {
            commit('UPDATE_DETAIL', { ...state.detail, watched: watchedStatus })
          }
        })
        .catch(response => {
          if (state.episodeDetail.id === assetId) {
            commit('UPDATE_EPISODE_DETAIL', { ...state.episodeDetail, watched: !watchedStatus })
          } else {
            commit('UPDATE_DETAIL', { ...state.detail, watched: !watchedStatus })
          }
        })
    },
    getSeasons: ({ state, commit }, { serieId }) => {
      return getSeasons(serieId).then(response => commit('UPDATE_SEASONS', response.data))
    },
    setSelectionIds: ({ state, commit }, { newData, newSelectionIds }) => {
      let cloneSelectionIds = clone(state.selectionIds)
      cloneSelectionIds[newData] = [newSelectionIds]
      commit('UPDATE_SELECTION_IDS', cloneSelectionIds)
    }
  },
  mutations: {
    RESET_ASSETS (state) {
      state.assets = []
    },
    UPDATE_ASSETS (state, newAssets) {
      state.assets = Object.freeze(state.assets.concat(newAssets))
    },
    UPDATE_TOTAL_ELEMENTS (state, newTotalElements) {
      state.totalElements = newTotalElements
    },
    UPDATE_CATALOGUES (state, newCatalogues) {
      state.catalogues = Object.freeze(newCatalogues)
    },
    UPDATE_CATEGORIES (state, newCategories) {
      state.categories = Object.freeze(newCategories)
    },
    UPDATE_SELECTION_IDS (state, newSelectionIds) {
      state.selectionIds = Object.freeze(newSelectionIds)
    },
    UPDATE_DETAIL (state, newDetail) {
      state.detail = Object.freeze(newDetail)
    },
    UPDATE_FILTERS (state, newFilters) {
      state.filters = Object.freeze(newFilters)
    },
    UPDATE_GENRES (state, newGenres) {
      state.genres = Object.freeze(newGenres)
    },
    UPDATE_LANDING_PAGE (state, newLandingPage) {
      state.landingPage = Object.freeze(newLandingPage)
    },
    UPDATE_EPISODE_DETAIL (state, newDetail) {
      state.episodeDetail = Object.freeze(newDetail)
    },
    UPDATE_SEASONS (state, newValue) {
      state.seasons = Object.freeze(newValue)
    },
    UPDATE_VOD_POLICY (state, newValue) {
      state.vodPolicy = newValue
    },
    UPDATE_VOD_SORT (state, newSort) {
      state.vodSort = newSort
    },
    UPDATE_SORT_DIR (state, newSortDir) {
      state.sortDir = newSortDir
    },
    UPDATE_SEASON_DETAIL_SELECTED_ITEM (state, newVal) {
      state.selectedItems.seasonDetailActiveCardId = newVal
    },
    UPDATE_VOD_DETAIL_SELECTED_SEASON (state, newVal) {
      state.selectedItems.vodDetailActiveSeason = newVal
    },
    UPDATE_VOD_LANDING_SELECTED_ROW (state, newVal) {
      state.selectedItems.vodLandingSelectedRow = newVal
    },
    UPDATE_VOD_LANDING_ACTIVE_CARD (state, newVal) {
      state.selectedItems.vodLandingActiveCard = newVal
    },
    UPDATE_VOD_SEE_ALL_GRID_SELECTED_CARD (state, newVal) {
      state.selectedItems.vodSeeAllGridSelectedCard = newVal
    }
  }
}
