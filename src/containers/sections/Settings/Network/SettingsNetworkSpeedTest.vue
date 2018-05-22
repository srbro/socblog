<template>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import store from 'src/vuex/store'
import { initialise as initialiseInfoList } from 'containers/twoSidedDialog/infoList'
import common from '../_infoListCommon'
import settingsValues from '../data/settingsValues'
import { startPingTest, Speed, ServerF } from 'helpers/speedTest.js'

export default {
  name: 'SettingsNetworkSpeedTest',
  mixins: [ common ],
  computed: {
    ...mapState({
      settings: state => state.settings,
      lastKey: state => state.twoSidedDialog.lastKey,
      speedTSpeed: state => state.networking.speedTSpeed,
      speedTSrv: state => state.networking.speedTSrv,
      speedTPing: state => state.networking.speedTPing,
      speedTMin: state => state.networking.speedTMin,
      speedTMax: state => state.networking.speedTMax
    })
  },
  methods: {
    makeStartButton () {
      let startButtonSelection = [
        { id: 0, label: 'stb_settings_systempreferences_network_speedtest_start', subLabel: '' }
      ]

      return startButtonSelection.map((item) => {
        return {
          label: this.loc(item.label)
        }
      })
    },
    prepareForSpeedTest () {
      store.commit('networking/SET_SPEEDTMIN', '0')
      store.commit('networking/SET_SPEEDTMAX', '0')
      store.commit('networking/SET_SPEEDTPING', '0')
      store.commit('networking/SET_SPEEDTSPEED', '')
      store.commit('networking/SET_SPEEDTSRV', '')
    },
    dialogItemsloc () {
      let subLabels = []
      let Ping = this.speedTPing + ' ms'
      let Min = this.speedTMin + ' ms'
      let Max = this.speedTMax + ' ms'
      let CurrentSpeed = this.speedTSpeed + ' Kbps'
      let CurrentServer = this.speedTSrv
      let num = -1

      subLabels.push(Ping)
      subLabels.push(Min)
      subLabels.push(Max)
      subLabels.push(CurrentSpeed)
      subLabels.push(CurrentServer)

      return settingsValues[this.selectedSetting.values.items[2].id].map((item) => {
        num++
        return {
          label: this.loc(item.label),
          subLabel: subLabels[num]
        }
      })
    },
    getSpeedServer () {
      console.log('Speed = ', Speed(), this.speedTSpeed, 'ServerF ', ServerF())
    },
    startSpeedTest () {
      startPingTest()
      this.getSpeedServer()
      store.commit('twoSidedDialog/UPDATE_LAST_KEY', 'RIGHT') // ponistavam da bih mogao opet OK da opalim
      store.commit('twoSidedDialog/SET_DESCRIPTION_MAIN', this.loc('stb_settings_systempreferences_network_speedtest_speedtesting')) // ovo fali u lokalizaciji -Speed Testing...
    },
    initFromRouteParams () {
      this.prepareForSpeedTest()
      this.selectedSetting = this.$route.params.setting

      initialiseInfoList({
        values: {
          items: this.makeStartButton(),
          description: {
            title: this.loc('stb_settings_systempreferences_network_speedtest'),
            titleAbove: `${this.loc('general_navigation_settings')} // ${this.loc(this.selectedSetting.values.description.title)}`,
            titleBelow: this.loc('stb_settings_systempreferences_network_speedtest_description'),
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
            this.prepareForSpeedTest()
          }
        },
        theme: 'light',
        backActive: false,
        activeSection: 'list',
        handleClickListItemCustom: this.startSpeedTest
      })
    },
    ...mapMutations({
      updateItems: 'twoSidedDialog/SET_ITEMS'
    })
  },
  watch: {
    lastKey: function (newKey) {
      store.commit('twoSidedDialog/SET_ITEM_ACTIVE_VISIBLE', true)
      switch (newKey) {
        case 'LEFT':
          this.makeStartButton()
          break
        case 'RIGHT':
          break
        case 'OK':
          this.startSpeedTest()
          break
        case 'BACK':
          break
      }
    },
    speedTSpeed: function () {
      this.updateItems(this.dialogItemsloc())
    }
  },
  mounted () {
    store.commit('twoSidedDialog/SET_ITEM_ACTIVE_VISIBLE', true)
  }
}
</script>
