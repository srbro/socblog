import { fetchServers as fetch } from 'helpers/api'
import { LIVE, TIMESHIFT, VOD, PUSH } from 'helpers/serversConst'
import { cloneDeep } from 'lodash/fp'

const getRef = (state, name) => {
  switch (name) {
    case LIVE :
      return state.liveServers
    case TIMESHIFT :
      return state.timeshiftServers
    case VOD :
      return state.vodServers
    case PUSH :
      return state.pushServers
    default:
      return null
  }
}

export default {
  namespaced: true,
  state: {
    active: false,
    liveServers: {
    },
    pushServers: {
    },
    timeshiftServers: {},
    vodServers: {}
  },
  getters: {
    getLiveServer: state => {
      return state.liveServers.list && state.liveServers.list[state.liveServers.index]
    },
    getServer: state => (name) => {
      let srv = getRef(state, name)
      return srv && srv.list ? srv.list[srv.index] : null
    }
  },
  actions: {
    async fetchServers ({ state, commit }) {
      let response = await fetch()
      let data = response.data

      let newLive = {
        list: data.live_servers,
        id: data.live_servers_id,
        retry: data.live_servers_retry,
        index: 0
      }
      commit('UPDATE_LIVE_SERVERS', newLive)

      let newTimeshift = {
        list: data.timeshift_servers,
        id: data.timeshift_servers_id,
        retry: data.timeshift_servers_retry,
        index: 0
      }
      commit('UPDATE_TIMESHIFT_SERVERS', newTimeshift)

      let newVod = {
        list: data.vod_servers,
        id: data.vod_servers_id,
        retry: data.vod_servers_retry,
        index: 0
      }
      commit('UPDATE_VOD_SERVERS', newVod)
    },
    nextServer: ({ state, commit, dispatch }, { name }) => {
      let srv = cloneDeep(getRef(state, name) || { list: [], index: 0 })
      if (srv.index + 1 < srv.list.length) {
        srv.index += 1
        switch (name) {
          case LIVE :
            commit('UPDATE_LIVE_SERVERS', srv)
            break
          case TIMESHIFT :
            commit('UPDATE_TIMESHIFT_SERVERS', srv)
            break
          case VOD :
            commit('UPDATE_VOD_SERVERS', srv)
            break
          case PUSH :
            commit('UPDATE_PUSH_SERVERS', srv)
            break
        }
      } else {
        dispatch('fetchServers')
      }
    },
    resetIndex: ({ state }, { name }) => {
      let srv = getRef(state, name) || {}
      srv.index = 0
    }
  },
  mutations: {
    UPDATE_LIVE_SERVERS (state, newServers) {
      state.liveServers = Object.freeze(newServers)
    },
    UPDATE_TIMESHIFT_SERVERS (state, timeshiftServers) {
      state.timeshiftServers = Object.freeze(timeshiftServers)
    },
    UPDATE_VOD_SERVERS (state, newServers) {
      state.vodServers = Object.freeze(newServers)
    },
    UPDATE_PUSH_SERVERS (state, newServers) {
      state.pushServers = Object.freeze(newServers)
    }
  }
}
