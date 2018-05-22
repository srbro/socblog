import store from 'src/vuex/modules/popup'
import Vue from 'vue'
import Vuex from 'vuex'
import { expect } from 'chai'
import cloneDeep from 'lodash/fp/cloneDeep'

Vue.use(Vuex)

describe('Popup vuex', () => {
  let PopupStore
  let payloadUpdateData = {
    type: 'disclaimer',
    title: 'loading_disclaimer_title',
    text: 'loading_disclaimer',
    priority: 2,
    back: false,
    buttons: [
      {
        id: 'view',
        label: 'loading_disclaimer_button',
        callback: (newValue) => {
          // this.fetchData(newState)
        }
      }
    ],
    selectedButtonIndex: 0
  }
  let payloadUpdateDataHP = {
    type: 'disclaimer',
    title: 'loading_disclaimer_title',
    text: 'loading_disclaimer',
    priority: 1,
    back: false,
    buttons: [
      {
        id: 'view',
        label: 'loading_disclaimer_button',
        callback: (newValue) => {
          // this.fetchData(newState)
        }
      }
    ],
    selectedButtonIndex: 0
  }
  let payloadUpdateDataNetwork = {
    type: 'reminder',
    title: 'stb_loading_error_networkerror',
    text: 'stb_settings_systempreferences_network_checkconnection',
    priority: 1,
    back: false,
    networkCheck: true,
    selectedButtonIndex: 0
  }
  let payloadUpdateDataNoP = {
    type: 'disclaimer',
    title: 'loading_disclaimer_title',
    text: 'loading_disclaimer',
    back: false,
    buttons: [
      {
        id: 'view',
        label: 'loading_disclaimer_button',
        callback: (newValue) => {
          // this.fetchData(newState)
        }
      }
    ],
    selectedButtonIndex: 0
  }
  beforeEach(() => {
    // Clone the default store options so we can ensure clean state
    const cloneStore = new Vuex.Store(cloneDeep(store))
    PopupStore = new Vue({ store: cloneStore })
  })

  describe('Add popup', () => {
    it('add popup test object', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData, deleteAll: false })
      const obj = PopupStore.$store.state.data[0]

      expect(PopupStore.$store.state.data).to.deep.equal([obj])
    })
    it('add popup test active state', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData, deleteAll: false })
      // const obj = PopupStore.$store.state.data[0]

      expect(PopupStore.$store.state.active).to.equal(true)
    })
    it('add popup without priority test active state', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateDataNoP, deleteAll: false })
      // const obj = PopupStore.$store.state.data[0]

      expect(PopupStore.$store.state.active).to.equal(true)
    })
    it('add 2 popup priority 1 set on first and second in array', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateDataHP, deleteAll: false })
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData, deleteAll: false })
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData, deleteAll: false })
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateDataHP, deleteAll: false })
      expect(PopupStore.$store.state.data[1]).to.deep.equal(payloadUpdateDataHP)
    })
    it('add popup priority 1 set on first in array', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateDataHP, deleteAll: false })
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData, deleteAll: false })
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData, deleteAll: false })
      expect(PopupStore.$store.state.data[0]).to.deep.equal(payloadUpdateDataHP)
    })
  })
  describe('Remove popup', () => {
    it('remove popup test object', (done) => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
        .then(() => {
          PopupStore.$store.dispatch('toggle', { active: false })
            .then(() => {
              expect(PopupStore.$store.state.data).to.deep.equal([])
              done()
            })
        })
    })
    it('remove popup test active state', (done) => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
        .then(() => {
          PopupStore.$store.dispatch('toggle', { active: false })
            .then(() => {
              expect(PopupStore.$store.state.active).to.equal(false)
              done()
            })
        })
    })
    it('remove all popup test ', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
      PopupStore.$store.dispatch('toggle', { active: false })
      PopupStore.$store.dispatch('toggle', { active: false })
      expect(PopupStore.$store.state.active).to.equal(false)
    })
    it('remove all popup test object', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
      PopupStore.$store.dispatch('toggle', { active: false, deleteAll: true })
      expect(PopupStore.$store.state.data).to.deep.equal([])
    })
    it('remove all popup test active state', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
      PopupStore.$store.dispatch('toggle', { active: false, deleteAll: true })
      expect(PopupStore.$store.state.active).to.equal(false)
    })
    it('removeSinglePopup 2 popups test active state', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
      const obj = PopupStore.$store.state.data[0]
      PopupStore.$store.dispatch('removeSinglePopup', obj)
      // const obj = PopupStore.$store.state.data[0]
      expect(PopupStore.$store.state.active).to.equal(true)
    })
    it('removeSinglePopup 2 popups test data array', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
      const obj = PopupStore.$store.state.data[0]
      PopupStore.$store.dispatch('removeSinglePopup', obj)
      // const obj = PopupStore.$store.state.data[0]
      expect(PopupStore.$store.state.data).to.deep.equal([payloadUpdateData])
    })
    it('removeSinglePopup test object', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
      const obj = PopupStore.$store.state.data[0]
      PopupStore.$store.dispatch('removeSinglePopup', obj)
      expect(PopupStore.$store.state.data).to.deep.equal([])
    })
    it('removeSinglePopup test active state', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
      const obj = PopupStore.$store.state.data[0]
      PopupStore.$store.dispatch('removeSinglePopup', obj)
      expect(PopupStore.$store.state.active).to.equal(false)
    })
  })
  describe('Getters', () => {
    it('getActiveState true', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateData })
      expect(PopupStore.$store.getters.getActiveState).to.deep.equal(true)
    })
    it('getActiveState false', () => {
      expect(PopupStore.$store.getters.getActiveState).to.deep.equal(false)
    })
    it('getNetworkPopup', () => {
      PopupStore.$store.dispatch('toggle', { active: true, data: payloadUpdateDataNetwork })
      payloadUpdateDataNetwork.id = 1
      expect(PopupStore.$store.getters.getNetworkPopup).to.deep.equal(payloadUpdateDataNetwork)
    })
  })
})
