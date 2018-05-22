<template>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { initialise as initialiseInfoList } from 'containers/twoSidedDialog/infoList'
import common from './_infoListCommon'
import { getDeviceModel, internetAccess, internetAccessLocal, getSerial, getMac } from 'hal'
import store from 'src/vuex/store'

export default {
  name: 'SettingsSummary',
  mixins: [ common ],
  computed: {
    ...mapState({
      settings: state => state.settings
      // lastKey: state => state.twoSidedDialog.lastKey // dodaj ako treba selekcija da bude
      // internetAccess: state => state.networking.internetAccess,
      // internetAccessLocal: state => state.networking.internetAccessLocal
    })
  },
  methods: {
    dialogItems (setting) {
      let subLabels = []
      let interfaceLanguage = 'English'
      for (let i = 0; i < this.settings.values.languages.length; i++) {
        if (this.settings.values.languages[i].id === this.settings.interfaceLanguage) {
          interfaceLanguage = this.settings.values.languages[i].label
        }
      }
      let videoQuality = store.state.settings.videoQuality
      // let deviceId = store.state.auth.deviceNumber
      // let deviceId = getDeviceId()
      let deviceModel = getDeviceModel()
      let internetAccess = store.state.networking.internetAccess
      let internetAccessLocal = store.state.networking.internetAccessLocal
      let networkStatus = 'UNKNOWN'

      if (internetAccess === 'OK' && internetAccessLocal === 'OK') {
        networkStatus = 'OK'
      } else {
        networkStatus = 'NO NETWORK'
      }
      let serialNumber = getSerial()
      let macAddress = getMac()

      let num = -1
      // for (let i = 0; i < 3; i++) {
      //   subLabels.push(this.settings.values.household[Object.keys(this.settings.values.household)[i]])
      // }
      // subLabels.push(deviceId)
      subLabels.push(deviceModel)
      subLabels.push(networkStatus)
      subLabels.push(videoQuality)
      subLabels.push(interfaceLanguage)
      subLabels.push(serialNumber)
      subLabels.push(macAddress)
      return setting.values.items.map((item) => {
        // let itemSubLabel = this.settings.values.household[item.id]
        num++
        return {
          id: item.id,
          label: `${this.loc(item.label)}:`,
          subLabel: subLabels[num]
        }
      })
    },
    updateNetworkStatus () {
      store.commit('networking/SET_INTERNETACCESS', internetAccess())
      store.commit('networking/SET_INTERNETACCESSLOCAL', internetAccessLocal())
    },
    initFromRouteParams () {
      this.updateNetworkStatus()
      this.selectedSetting = this.$route.params.setting
      let items = this.dialogItems(this.selectedSetting)

      initialiseInfoList({
        values: {
          items,
          description: this.locDesc(this.selectedSetting.values.description)
        },
        callback: (newValue) => {
          if (newValue === 'EXIT') {
            this.$router.push({
              name: 'Settings',
              params: {
                setting: this.selectedSetting.id
              }
            })
          }
        },
        theme: 'light'
      })
    },
    ...mapMutations({
      updateItems: 'twoSidedDialog/SET_ITEMS'
    })
  },
  watch: {
    internetAccess: function () {
      this.updateItems(this.dialogItems())
    },
    internetAccessLocal: function () {
      this.updateItems(this.dialogItems())
    }
    // lastKey: function (lk) { // ovo dodaj ako bude trebala selekcija da bude
    //   store.commit('twoSidedDialog/SET_ITEM_ACTIVE_VISIBLE', true)
    //   switch (lk) {
    //     case 'RIGHT':
    //       store.commit('twoSidedDialog/SET_ITEM_ACTIVE', 0)
    //       break
    //   }
    // let index = this.itemActive
    // if (lk === 'DOWN') {
    //   index--
    //   index = index < 0 ? 0 : index
    // } else if (lk === 'UP') {
    //   index++
    //   index = index >= this.items.length ? this.items.length - 1 : index
    // }
    // store.commit('twoSidedDialog/SET_ITEM_ACTIVE', index)
    // store.commit('twoSidedDialog/SET_ITEM_ACTIVE_VISIBLE', true)
    // }
  }
}
</script>
