import { getPlayerInfoStatic } from 'hal'
import clone from 'lodash/fp/clone'
import { STREAM_STARTED, STREAM_PLAYING, STREAM_ERROR, STREAM_STOPED } from 'helpers/player/playerConst'
import { fetchPlayerInfo } from 'helpers/api'

export default {
  namespaced: true,
  state: {
    stream: {
      id: '',
      status: STREAM_STOPED
    },
    bitrate: 0,
    playerInfoData: {}
  },
  getters: {
    getStream: state => state.stream,
    getBitrate: state => {
      return state.bitrate ? `bitrate: ${state.bitrate / 1000}` : ''
    }
  },
  actions: {
    setStream: async ({ state, commit }, {newStreamData}) => {
      let incId = state.id += 1
      newStreamData.id = incId
      commit('UPDATE_STREAM', newStreamData)
    },
    updateStatus: async ({ state, commit }, {streamId, status}) => {
      if (streamId === null && status) streamId = state.stream.id
      if (streamId === state.stream.id) {
        let newStreamData = clone(state.stream)
        newStreamData.status = status
        commit('UPDATE_STREAM', newStreamData)
      } else {
        console.warn(`corePlayer Stream ${streamId} expired, id: ${state.stream.id} expected`)
      }
    },
    updateBitrate: async ({ state, commit }, {streamId, bitrate}) => {
      if (streamId === null) streamId = state.stream.id
      if (streamId === state.stream.id) {
        commit('UPDATE_BITREATE', bitrate)
      } else {
        console.warn(`corePlayer Stream ${streamId} expired, id: ${state.stream.id} expected`)
      }
    },
    setStarted: async ({commit}, {streamId}) => {
      commit('UPDATE_STREAM', {
        id: streamId,
        status: STREAM_STARTED
      })
    },
    setPlaying: async ({dispatch}, {streamId}) => {
      dispatch('updateStatus', {
        streamId,
        status: STREAM_PLAYING
      })
    },
    setStopped: async ({dispatch}, {streamId}) => {
      dispatch('updateStatus', {
        streamId,
        status: STREAM_STOPED
      })
    },
    setError: async ({state, dispatch}, {streamId}) => {
      if (state.stream.status !== STREAM_ERROR) {
        dispatch('updateStatus', {
          streamId,
          status: STREAM_ERROR
        })
      }
    },
    fetchPlayerInfo: ({ commit }) => {
      return fetchPlayerInfo()
        .then(response => {
          // commit('UPDATE_PLAYER_INFO_DATA', response.data[0]) // ovo treba za objekat ceo
          let clear
          let drm
          if (response.data[0] && response.data[0].clear && response.data[0].drm) {
            clear = response.data[0].clear
            drm = response.data[0].drm
          } else {
            clear = getPlayerInfoStatic().clear
            drm = getPlayerInfoStatic().drm
          }
          commit(`UPDATE_PLAYER_INFO_DATA`, {
            id: response.data[0].id ? response.data[0].id : 0,
            castId: response.data[0].castId ? response.data[0].castId : null,
            friendlyName: response.data[0].friendlyName ? response.data[0].friendlyName : '',
            clear: clear,
            drm: drm,
            viblastLicenseKey: response.data[0].viblastLicenseKey ? response.data[0].viblastLicenseKey : null
          })
        })
        .catch((e) => {
          console.log('No data for Player', e)
        })
    },
    copyPlayerInfoData: ({commit}) => {
      let data = getPlayerInfoStatic()
      commit('UPDATE_PLAYER_INFO_DATA', {
        id: data.id,
        castId: data.castId,
        friendlyName: data.friendlyName,
        clear: data.clear,
        drm: data.drm,
        viblastLicenseKey: data.viblastLicenseKey
      })
    }
  },
  mutations: {
    UPDATE_STREAM (state, stream) {
      state.stream = stream
    },
    UPDATE_BITREATE (state, bitrate) {
      state.bitrate = bitrate
    },
    UPDATE_PLAYER_INFO_DATA (state, newValue) {
      state.playerInfoData = Object.freeze(newValue)
    }
  }
}
