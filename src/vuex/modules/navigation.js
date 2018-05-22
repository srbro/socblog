import clone from 'lodash/fp/clone'
import findIndex from 'lodash/fp/findIndex'
import navigationItems from 'src/navigationItems.json'

export default {
  namespaced: true,
  state: {
    active: false,
    hidden: false,
    activeLane: 'main',
    mainLaneSelectedItemIndex: 0,
    subLaneSelectedItemsIndices: [0, 0, 0, 0, 0]
  },
  getters: {
    getSelectedItemIndexes: state => ({
      main: state.mainLaneSelectedItemIndex,
      sub: state.subLaneSelectedItemsIndices[state.mainLaneSelectedItemIndex]
    }),
    getNavigationActive: state => state.active,
    getNavigationState: state => {
      return {
        ...state,
        subLaneSelectedItemsIndices: [...state.subLaneSelectedItemsIndices]
      }
    }
  },
  actions: {
    toggle ({ commit }, toggleOn) {
      commit(toggleOn ? 'SET_ACTIVE_ON' : 'SET_ACTIVE_OFF')
    },
    toggleHidden ({ commit }, newState) {
      commit(newState ? 'SET_HIDDEN_ON' : 'SET_HIDDEN_OFF')
    },
    syncWithRoute ({ commit, rootState }) {
      const findItemWithCurrentRoute = findIndex({ id: (rootState.route.name).toLowerCase() })
      let mainMatch = -1
      let subMatch = -1
      let newArray = []
      navigationItems.forEach((item, index) => {
        if (item.id !== 'vodlanding' || (rootState.vod.vodPolicy === true || rootState.vod.vodPolicy === null)) {
          newArray.push(item)
        }
      })
      mainMatch = findItemWithCurrentRoute(newArray)

      if (mainMatch === -1) {
        newArray.forEach((item, index) => {
          if (!item.itemsSub) return
          if (subMatch > -1) return
          subMatch = findItemWithCurrentRoute(item.itemsSub)
          if (subMatch > -1) mainMatch = index
        })
      } else if (mainMatch > -1) {
        commit('SET_MAIN_LANE_SELECTED_ITEM_INDEX', mainMatch)
      }
      if (subMatch > -1) {
        commit('SET_SUB_LANE_SELECTED_ITEM_INDEX', subMatch)
        commit('SET_ACTIVE_LANE', 'sub')
      }
    },
    setWholeNavigation ({ commit }, newState) {
      commit('SET_WHOLE_NAVIGATION', newState)
    }
  },
  mutations: {
    SET_ACTIVE_ON (state) {
      state.active = true
    },
    SET_ACTIVE_OFF (state) {
      state.active = false
    },
    SET_HIDDEN_ON (state) {
      state.hidden = true
    },
    SET_HIDDEN_OFF (state) {
      state.hidden = false
    },
    SET_ACTIVE_LANE (state, newActiveLane) {
      state.activeLane = newActiveLane
    },
    SET_MAIN_LANE_SELECTED_ITEM_INDEX (state, newIndex) {
      state.mainLaneSelectedItemIndex = newIndex
    },
    SET_SUB_LANE_SELECTED_ITEM_INDEX (state, newIndex) {
      // TODO: This is too smart for a mutation, should be moved out.
      let newSubLaneSelectedItemsIndices = clone(state.subLaneSelectedItemsIndices)
      newSubLaneSelectedItemsIndices[state.mainLaneSelectedItemIndex] = newIndex
      state.subLaneSelectedItemsIndices = newSubLaneSelectedItemsIndices
    },
    SET_WHOLE_NAVIGATION (state, newState) {
      state.active = newState.active
      state.hidden = newState.hidden
      state.activeLane = newState.activeLane
      state.mainLaneSelectedItemIndex = newState.mainLaneSelectedItemIndex
      state.subLaneSelectedItemsIndices = {...newState.subLaneSelectedItemsIndices}
    }
  }
}
