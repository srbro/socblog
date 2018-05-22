import findIndex from 'lodash/fp/findIndex'

let messageId = 0

export default {
  namespaced: true,
  state: {
    active: false,
    data: []
  },
  getters: {
    getActiveState: state => state.active,
    getNetworkPopup: state => state.data.find((obj) => obj.networkCheck === true)
  },
  actions: {
    toggle ({ state, commit, dispatch }, { active, data, deleteAll = false }) {
      if (active) {
        dispatch('updateData', { newData: data })
        commit('TOGGLE_ON')
      } else {
        commit(deleteAll ? 'REMOVE_ALL_DATA' : 'REMOVE_DATA')
        if (state.data.length === 0) {
          commit('TOGGLE_OFF')
          messageId = 0
        }
      }
    },
    updateData ({ state, commit }, { newData }) {
      let index = -1

      newData.id = messageId++
      if (newData.priority === undefined) { newData.priority = 2 }
      // if (newData.priority !== 1) {
      //   index = findIndex({ priority: newData.priority }, state.data)
      //   index = index > -1 ? index : state.data.length
      // }
      let findings = state.data.filter((e, i) => {
        if (newData.priority <= e.priority) {
          index = index === -1 ? i : index
          return true
        }
      })
      if (findings.length === 0) {
        index = state.data.length
      }

      commit('UPDATE_DATA', { newData, index })
      // }
    },
    removeSinglePopup ({ state, commit }, obj) {
      commit('REMOVE_DATA_ITEM', findIndex({ id: obj.id }, state.data))
      if (state.data.length === 0) {
        commit('TOGGLE_OFF')
        messageId = 0
      }
    }
  },
  mutations: {
    TOGGLE_ON (state) {
      state.active = true
    },
    TOGGLE_OFF (state) {
      state.active = false
    },
    UPDATE_DATA (state, { newData, index }) {
      state.data.splice(index, 0, newData)
    },
    REMOVE_DATA_ITEM (state, index) {
      state.data.splice(index, 1)
    },
    REMOVE_DATA (state) {
      state.data.shift()
    },
    REMOVE_ALL_DATA (state) {
      state.data = []
    }
  }
}
