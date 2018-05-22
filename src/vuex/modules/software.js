import ver from 'version'
// import { fetchVersion } from 'helpers/api'
/* global builder */

const builderInfo = builder || {}

export default {
  namespaced: true,
  state: {
    appVersion: `${ver.major}.${ver.minor}.${ver.patch}`,
    wrapperVersion: '',
    SDKVersion: '',
    releaseVersion: '',
    PlatformVersion: '',
    Manufacturer: '',
    TvModel: '',
    buildVersion: builderInfo.devVersion
  },
  actions: {
    async checkVersion () {
      // TODO disabled to support local andrdoitv builds
      /*
      let responseVersion = await fetchVersion()
      let serverVersion = responseVersion.data
      console.log('serverVersion: ' + JSON.stringify(serverVersion))
      if (serverVersion.major <= ver.major && serverVersion.minor <= ver.minor && serverVersion.patch <= ver.patch) {
        console.log('Local version match server version')
      } else {
        console.log('RESTART')
        window.location.reload(true)
      }
      */
    }
  },
  mutations: {
    SET_APLICATION_VERSION (state, newappVersion) { state.appVersion = newappVersion },
    SET_WRAPPER_VERSION (state, newWrapperVersion) { state.wrapperVersion = newWrapperVersion },
    SET_SDK_VERSION (state, newSDKVersion) { state.SDKVersion = newSDKVersion },
    SET_RELEASE_VERSION (state, newReleaseVersion) { state.releaseVersion = newReleaseVersion },
    SET_PLATFORM_VERSION (state, newPlatformVersion) { state.PlatformVersion = newPlatformVersion },
    SET_MANUFACTURER (state, newManufacturer) { state.Manufacturer = newManufacturer },
    SET_TVMODEL (state, newTvModel) { state.TvModel = newTvModel }
  }
}
