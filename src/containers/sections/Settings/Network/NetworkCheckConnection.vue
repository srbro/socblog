<template>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { initialise as initialiseInfoList } from 'containers/twoSidedDialog/infoList'
import common from '../_infoListCommon'
import settingsValues from '../data/settingsValues'
import { internetAccess, internetAccessLocal } from 'hal'
import store from 'src/vuex/store'

export default {
  name: 'SettingsNetworkCheckConnection',
  mixins: [ common ],
  computed: {
    ...mapState({
      settings: state => state.settings,
      lastKey: state => state.twoSidedDialog.lastKey,
      internetAccess: state => state.networking.internetAccess,
      internetAccessLocal: state => state.networking.internetAccessLocal
    })
  },
  methods: {
    dialogItemsloc () {
      let subLabels = []
      let internetAccess = this.internetAccess
      let internetAccessLocal = this.internetAccessLocal
      let num = -1

      subLabels.push(internetAccess)
      subLabels.push(internetAccessLocal)

      return settingsValues[this.selectedSetting.values.items[1].id].map((item) => {
        num++
        return {
          label: this.loc(item.label),
          subLabel: subLabels[num]
        }
      })
    },
    updateNetworkConnection () {
      store.commit('networking/SET_INTERNETACCESS', internetAccess())
      store.commit('networking/SET_INTERNETACCESSLOCAL', internetAccessLocal())
    },
    initFromRouteParams () {
      this.updateNetworkConnection()
      this.selectedSetting = this.$route.params.setting

      initialiseInfoList({
        values: {
          items: this.dialogItemsloc(),
          description: {
            title: this.loc('stb_settings_systempreferences_network_checkconnection_connectionresults'),
            titleAbove: `${this.loc('general_navigation_settings')} // ${this.loc(this.selectedSetting.values.description.title)} // ${this.loc('stb_settings_systempreferences_network_checkconnection')}`,
            titleBelow: this.loc('stb_settings_systempreferences_network_checkconnection_connecting_description'),
            svgId: (this.selectedSetting.values.description.svgId)
          }
        },
        callback: (newValue) => {
          if (newValue === 'EXIT') {
            this.$router.push({
              name: 'SettingsNetwork',
              params: {
                setting: this.selectedSetting
              }
            })
          }
        },
        theme: 'light',
        backActive: false,
        activeSection: 'list'
      })
    },
    ...mapMutations({
      updateItems: 'twoSidedDialog/SET_ITEMS'
    })
  },
  watch: {
    lastKey: function (newKey) {
      switch (newKey) {
        case 'LEFT':
          // this.moveSelectionLeft()
          break
        case 'RIGHT':
          // this.moveSelectionRight(newKey)
          break
        // case 'UP':
        //   this.changeLevel(newKey)
        //   break
        // case 'DOWN':
        //   this.changeLevel(newKey)
        //   break
        case 'OK':
          this.updateNetworkConnection()
          store.commit('twoSidedDialog/UPDATE_LAST_KEY', 'RIGHT')
          break
        case 'BACK':
          break
      }
    },
    internetAccess: function () {
      this.updateItems(this.dialogItemsloc())
    },
    internetAccessLocal: function () {
      this.updateItems(this.dialogItemsloc())
    }
  }
}
</script>
