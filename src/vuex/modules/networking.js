import { getUserPublicIp, getUserLocalIP } from 'hal'

export default {
  namespaced: true,
  state: {
    speedTSpeed: '',
    speedTSrv: '',
    speedTPing: '0',
    speedTMin: '0',
    speedTMax: '0',
    IpAddressSetting: 'UNKNOWN',
    PubliIP: 'UNKNOWN',
    userLocalIP: 'UNKNOWN',
    SubnetMask: 'UNKNOWN',
    DefGetaway: 'UNKNOWN',
    PrimaryDNS: 'UNKNOWN',
    SecondaryDns: 'UNKNOWN',
    // IPv6: '',
    internetAccess: '',
    internetAccessLocal: '',
    networkType: 'UNKNOWN'
  },
  actions: {
    updatePublicIP ({state, commit}) {
      getUserPublicIp().then((response) => {
        commit('SET_PUBLICIP', response.ip)
      })
    },
    updateNetworkType ({state, commit}, value) {
      commit('SET_NETWORKTYPE', value)
    },
    updateLocalIp ({state, commit}) {
      commit('SET_USERLOCALIP', getUserLocalIP())
    }
  },
  mutations: {
    SET_SPEEDTSPEED (state, newSpeed) { state.speedTSpeed = newSpeed },
    SET_SPEEDTSRV (state, newSrv) { state.speedTSrv = newSrv },
    SET_SPEEDTPING (state, newPing) { state.speedTPing = newPing },
    SET_SPEEDTMIN (state, newMin) { state.speedTMin = newMin },
    SET_SPEEDTMAX (state, newMax) { state.speedTMax = newMax },
    SET_IPADDRESSSETTINGS (state, newIpAddressSetting) { state.IpAddressSetting = newIpAddressSetting },
    SET_PUBLICIP (state, newPubliIP) { state.PubliIP = newPubliIP },
    SET_USERLOCALIP (state, newuserLocalIP) { state.userLocalIP = newuserLocalIP },
    SET_SUBNETMASK (state, newSubnetMask) { state.SubnetMask = newSubnetMask },
    SET_DEFGETAWAY (state, newDefGetaway) { state.DefGetaway = newDefGetaway },
    SET_PRIMARYDNS (state, newPrimaryDNS) { state.PrimaryDNS = newPrimaryDNS },
    SET_SECONDARYDNS (state, newSecondaryDns) { state.SecondaryDns = newSecondaryDns },
    // SET_IPV6 (state, newIPv6) { state.IPv6 = newIPv6 },
    SET_INTERNETACCESS (state, newInternetAccess) { state.internetAccess = newInternetAccess },
    SET_INTERNETACCESSLOCAL (state, newInternetAccessLocal) { state.internetAccessLocal = newInternetAccessLocal },
    SET_NETWORKTYPE (state, newNetworkType) { state.networkType = newNetworkType }
  }
}
