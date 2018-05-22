<template>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { initialise as initialiseInfoList } from 'containers/twoSidedDialog/infoList'
import common from '../_infoListCommon'
import settingsValues from '../data/settingsValues'
// import { fetchNetworkInfo } from 'src/helpers/api' // trebace za info za network
import { getUserLocalIP, setIpAddressSetting, getSubnetMask, getPrimaryDNS, getSecondaryDns, getGateway, getMacNew } from 'hal'
import store from 'src/vuex/store'

export default {
  name: 'SettingsNetworkStatus',
  mixins: [ common ],
  computed: {
    ...mapState({
      settings: state => state.settings,
      lastKey: state => state.twoSidedDialog.lastKey,
      IpAddressSetting: state => state.networking.IpAddressSetting,
      PubliIP: state => state.networking.PubliIP,
      userLocalIP: state => state.networking.userLocalIP,
      SubnetMask: state => state.networking.SubnetMask,
      DefGetaway: state => state.networking.DefGetaway,
      PrimaryDNS: state => state.networking.PrimaryDNS,
      SecondaryDns: state => state.networking.SecondaryDns
      // IPv6: state => state.networking.IPv6
    })
  },
  methods: {
    dialogItemsloc () {
      // this.getNetworkStatusInfo()
      // this.remapNetworkData()
      this.updatePublicIP()
      let subLabels = []
      let IpAddressSetting = this.IpAddressSetting
      // let PubliIP = this.PubliIP

      let LocalIP = this.userLocalIP
      let IPAddressFinal = this.PubliIP + ' // ' + LocalIP // za sada ce se prikazivati samo lokalna IP adresa
      // let IPAddressFinal = LocalIP
      let SubnetMask = this.SubnetMask
      let DefGetaway = this.DefGetaway // ovo treba razraditi
      let PrimaryDNS = this.PrimaryDNS
      let SecondaryDns = this.SecondaryDns
      // let IPv6 = this.IPv6 // ovo treba razraditi
      // let MacAddress = getMac()
      let MacAddress = getMacNew()
      let num = -1

      subLabels.push(IpAddressSetting)
      subLabels.push(IPAddressFinal)
      subLabels.push(SubnetMask)
      subLabels.push(DefGetaway)
      subLabels.push(PrimaryDNS)
      subLabels.push(SecondaryDns)
      // subLabels.push(IPv6)
      subLabels.push(MacAddress)
      return settingsValues[this.selectedSetting.values.items[0].id].map((item) => {
        num++
        return {
          label: this.loc(item.label),
          subLabel: subLabels[num]
        }
      })
    },
    updateNetworkSettings () {
      store.commit('networking/SET_IPADDRESSSETTINGS', setIpAddressSetting())
      // store.commit('networking/SET_PUBLICIP', PubliIP)
      store.commit('networking/SET_USERLOCALIP', getUserLocalIP())
      store.commit('networking/SET_SUBNETMASK', getSubnetMask())
      store.commit('networking/SET_DEFGETAWAY', getGateway())
      store.commit('networking/SET_PRIMARYDNS', getPrimaryDNS())
      store.commit('networking/SET_SECONDARYDNS', getSecondaryDns())
      // store.commit('networking/SET_IPV6', 'on') // ovo je zakucano  PAZI!!!
    },
    initFromRouteParams () {
      // this.getNetworkStatusInfo()
      this.updateNetworkSettings()
      this.selectedSetting = this.$route.params.setting

      initialiseInfoList({
        values: {
          items: this.dialogItemsloc(),
          description: {
            title: this.loc('stb_settings_personal_summary_networkstatus'),
            titleAbove: `${this.loc('general_navigation_settings')} // ${this.loc(this.selectedSetting.values.description.title)}`,
            titleBelow: this.loc('stb_settings_systempreferences_network_networkstatus_description'),
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
    }),
    ...mapActions({
      updatePublicIP: 'networking/updatePublicIP'
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
          this.updateNetworkSettings()
          store.commit('twoSidedDialog/UPDATE_LAST_KEY', 'RIGHT') // ponistavam da bih mogao opet OK da opalim
          break
        case 'BACK':
          break
      }
    },
    IpAddressSetting: function () {
      this.updateItems(this.dialogItemsloc())
    },
    PubliIP: function () {
      this.updateItems(this.dialogItemsloc())
    }
  }
}
</script>
