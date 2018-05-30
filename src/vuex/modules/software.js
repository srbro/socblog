import { getWrapperGitVersion } from 'hal'
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
    },
    updateBuildVersion ({state, commit}) {
      if (state.buildVersion && getWrapperGitVersion()) {
        const txtVersion = state.buildVersion
        const indx = txtVersion.lastIndexOf('.')
        commit('SET_BUILD_VERSION', builderInfo.devVersion = txtVersion.slice(0, indx) + '.' + getWrapperGitVersion() + txtVersion.slice(indx))
      }
    }
  },
  mutations: {
    SET_APLICATION_VERSION (state, newappVersion) { state.appVersion = newappVersion },
    SET_WRAPPER_VERSION (state, newWrapperVersion) { state.wrapperVersion = newWrapperVersion },
    SET_SDK_VERSION (state, newSDKVersion) { state.SDKVersion = newSDKVersion },
    SET_RELEASE_VERSION (state, newReleaseVersion) { state.releaseVersion = newReleaseVersion },
    SET_PLATFORM_VERSION (state, newPlatformVersion) { state.PlatformVersion = newPlatformVersion },
    SET_MANUFACTURER (state, newManufacturer) { state.Manufacturer = newManufacturer },
    SET_TVMODEL (state, newTvModel) { state.TvModel = newTvModel },
    SET_BUILD_VERSION (state, newBuildVersion) { state.buildVersion = newBuildVersion }
  }
}
