import { postFavoriteChannelList, fetchFavoriteChannelLists, putFavoriteChannelList, deleteFavoriteChannelList } from 'helpers/api'
import keyBy from 'lodash/fp/keyBy'
// import assign from 'lodash/fp/assign'
export default {
  namespaced: true,
  state: {
    tvFavoriteLists: {}, // array of ids for favorite lists (currently in localStorage)
    radioFavoriteLists: {}
  },
  getters: {
    getAllLists: state => (type) => {
      return Object.values(state[`${type}FavoriteLists`]).length > 0 ? state[`${type}FavoriteLists`] : {}
    }, // state.tvFavoriteLists
    getAllListsNames: state => (type) => {
      return Object.values(state[`${type}FavoriteLists`]).map(list => list.name)
    },
    getAllTvlist: (state, getters, rootState, rootGetters) => {
      return rootState.general.tvList
    },
    getAllChannels: state => (type) => {
      return Object.values(state[`${type}FavoriteLists`]).map((list) => {
        return {channels: list.channels, id: list.id}
      })
    }
  },
  actions: {
    initFavoriteLists: async ({ commit, rootState }) => {
      const lists = await fetchFavoriteChannelLists()
      const tvFavoriteLists = keyBy(fav => fav.id, lists.data.map((element) => ({...element, label: element.name})).filter(value => value.type === 'CUSTOM_TV'))
      const radioFavoriteLists = keyBy(fav => fav.id, lists.data.map((element) => ({...element, label: element.name})).filter(value => value.type === 'CUSTOM_RADIO'))
      commit('INIT_FAVORITE_LISTS', {listType: 'tvFavoriteLists', lists: tvFavoriteLists})
      commit('INIT_FAVORITE_LISTS', {listType: 'radioFavoriteLists', lists: radioFavoriteLists})
    },
    create ({ commit, dispatch, rootGetters }, list) {
      postFavoriteChannelList(list).then((response) => {
        response.data.channels = list.channels
        if (!response.error) {
          dispatch('general/addToCustomList', { data: response.data, type: response.data.type === 'CUSTOM_TV' ? 'TV' : 'RADIO' }, {root: true})
          dispatch('initFavoriteLists')
          // commit('CREATE', response.data)
        }
      })
    },
    edit ({ commit, dispatch }, {index, list}) {
      putFavoriteChannelList(list.id, list).then((response) => {
        if (!response.error) {
          commit('EDIT', { index: index, newValue: list })
          dispatch('initFavoriteLists')
        }
      })
    },
    updateChannelOrder ({ commit }, {type, index, action, parameter}) {
      commit('UPDATE_CHANNEL_ORDER', { type, index, action, parameter })
    },
    delete ({ commit, dispatch }, {index, type}) {
      deleteFavoriteChannelList(index).then((response) => {
        if (!response.error) {
          commit('DELETE', { index, type })
          dispatch('general/removeToCustomList', { index: index, type: type.toUpperCase() }, {root: true})
        }
      })
      // commit('DELETE', {index, type})
    }
  },
  mutations: {
    CREATE (state, list) {
      if (list.type === 'CUSTOM_TV') {
        state.tvFavoriteLists[list.id] = list
      } else {
        state.radioFavoriteLists[list.id] = list
      }
    },
    EDIT (state, {index, newValue}) {
      if (newValue.type === 'CUSTOM_TV') {
        state.tvFavoriteLists[index] = newValue
      } else {
        state.radioFavoriteLists[index] = newValue
      }
    },
    DELETE (state, {index, type}) {
      delete state[`${type}FavoriteLists`][index]
    },
    UPDATE_CHANNEL_ORDER (state, {type, index, action, parameter}) {
      if (state[`${type}FavoriteLists`][index].type === 'CUSTOM_TV') {
        action === 'push' ? state.tvFavoriteLists[index].channels[action](parameter) : state.tvFavoriteLists[index].channels[action](parameter, 1)
      } else {
        action === 'push' ? state.radioFavoriteLists[index].channels[action](parameter) : state.radioFavoriteLists[index].channels[action](parameter, 1)
      }
    },
    INIT_FAVORITE_LISTS (state, {listType, lists}) {
      state[listType] = lists
    }
  }
}
