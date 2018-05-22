export default {
  namespaced: true,
  state: {
    poppedRecord: null,
    history: []
  },
  getters: {
    getHistroyRecordTypes: (state) => state.recordTypes,
    getPoppedRecord: (state) => state.poppedRecord,
    getHistoryLength: (state) => state.history.length
  },
  actions: {
    pushHistoryRecord ({ dispatch, commit, state }, record) {
      if (state.history.length >= 10) {
        commit('DROP_FIRST_RECORD')
      }
      commit('PUSH_HISTORY_RECORD', record)
      return true
    },
    popHistoryRecord ({ dispatch, commit, state }) {
      commit('POP_HISTORY_RECORD')
    },
    clearHistroy ({ commit }) {
      commit('CLEAR_HISTORY')
    }
  },
  mutations: {
    PUSH_HISTORY_RECORD (state, record) {
      state.history.push(record)
    },
    POP_HISTORY_RECORD (state) {
      let record = state.history.length === 0 ? null : state.history.pop()
      state.poppedRecord = record
    },
    CLEAR_HISTORY (state) {
      state.history = []
      state.poppedRecord = null
    },
    DROP_FIRST_RECORD (state) {
      state.history = state.history.splice(1)
    }
  }
}
