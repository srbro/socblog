/* global btoa */

import { getWeakToken as getWeakTokenAPI, registerDeviceOTP, registerDeviceSTB, getOtp as getOtpAPI, checkOtpGrant as checkOtpGrantAPI, refreshAccessToken as refreshAccessTokenAPI } from 'helpers/api'
import { getQueryParams } from 'helpers/urlParams'
import { load, save, remove, getDeviceDetail, stop, onAuthenticated, getProvisioningMode, setProvisoningDone } from 'hal'
import { setDebuggingMode } from 'helpers/logger'
import { PROVISIONING_TYPE_OTP, PROVISIONING_TYPE_SERIAL, AUTH_DEVICE_SUCCESS,
  AUTH_DEVICE_FAILED, AUTH_DEVICE_FORBIDDEN, APP_MODE_STB_PROVISIONING } from 'helpers/consts.js'

import router from 'src/router'

const getKeys = (accessObj) => {
  return {
    stream_un: accessObj.stream_un,
    stream_key: accessObj.stream_key,
    push_key: accessObj.push_key,
    key_valid_from: accessObj.key_valid_from,
    key_valid_to: accessObj.key_valid_to
  }
}

export default {
  namespaced: true,
  state: {
    accessToken: '',
    refreshToken: '',
    refreshingToken: false,
    otp: `......`,
    clientParams: {},
    deviceNumber: '',
    signed: false,
    toggleLoadingMessage: false,
    displayError: '',
    loadingRedirectRoute: '',
    forceFirstPage: '',
    forceFirstPageParams: {},
    firstLoad: true,
    stbMode: 'OTT',
    provisioningMode: PROVISIONING_TYPE_OTP,
    keys: {
      stream_un: '',
      stream_key: '',
      push_key: '',
      key_valid_from: '',
      key_valid_to: ''
    }
  },
  getters: {
    getClientCredentialsB64: state => {
      return btoa((state.clientParams.clientId || '') + ':' + (state.clientParams.clientSecret || ''))
    },
    getAuthBearerToken: state => {
      return 'Bearer ' + state.accessToken
    },
    getStbMode: state => {
      return state.stbMode
    }
  },
  actions: {
    setNewLanguage: ({commit}) => {
      commit('UPDATE_LANGUAGE_TOGGLE')
    },
    setClientParams: async ({ commit }) => {
      const wrapperParams = getQueryParams()
      commit('UPDATE_CLIENT_PARAMS', wrapperParams)
    },
    getWeakToken: async ({ dispatch, getters, commit }) => {
      const getClientCredentialsB64 = getters.getClientCredentialsB64
      return new Promise(function (resolve, reject) {
        getWeakTokenAPI(getClientCredentialsB64).then(response => {
          if (response.data.status && response.data.status === 'error') {
            reject(Error('auth failed'))
          }
          resolve(response.data)
        })
      })
    },
    setDevice: async ({commit, state, dispatch}) => {
      return new Promise(function (resolve, reject) {
        let registerDeviceAPI = state.provisioningMode === PROVISIONING_TYPE_SERIAL ? registerDeviceSTB : registerDeviceOTP
        registerDeviceAPI(getDeviceDetail(), state.accessToken).then(response => {
          resolve(response)
        }).catch(error => {
          if (error.response.data.message) {
            resolve(error.response.data.message)
          } else if (error.response.data.error_description) {
            resolve(error.response.data.error_description)
          } else if (error.response.data.errorMessage) {
            resolve(error.response.data.errorMessage)
          } else if (error.response.data.devMessage) {
            resolve(error.response.data.devMessage)
          } else {
            resolve(error.response.status)
          }
        })
      })
    },
    initAuth: async ({dispatch, commit, state}, {currentRoute}) => {
      commit('UPDATE_PROVISIONING_MODE', getProvisioningMode())
      if (state.firstLoad && (currentRoute !== '' && currentRoute !== 'Loading')) {
        commit('UPDATE_FIRST_LOAD', false)
      }
      goToLoading('Loading')
      return new Promise(function (resolve, reject) {
        dispatch('setClientParams')
        if (load('deviceNumber')) {
          let deviceNumber = load('deviceNumber')
          commit('UPDATE_DEVICE_NUMBER', deviceNumber)
        }
        const lang = load('lang')
        const accessO = load('accessObj')
        if (accessO) {
          let accessObj = JSON.parse(accessO)
          if (accessObj.access_token && accessObj.key_valid_to) {
            commit('UPDATE_ACCESS_TOKEN', accessObj.access_token)
            commit('UPDATE_REFRESH_TOKEN', accessObj.refresh_token)
            commit('UPDATE_STB_MODE', accessObj.stb_mode)
            commit('UPDATE_KEYS', getKeys(accessObj))
            dispatch('settings/updateInterfaceLanguage', { name: 'interfaceLanguage', value: lang, update: true }, { root: true }).then(langResp => {
              commit('UPDATE_TOGGLE_LOADING_MESSAGE', true)
              commit('UPDATE_SIGNED', true)
              if (currentRoute === 'Loading') {
                if (state.forceFirstPage !== '') {
                  commit('UPDATE_ROUTE_REDIRECT', state.forceFirstPage)
                  commit('UPDATE_FORCE_FIRST_PAGE', '')
                } else {
                  commit('UPDATE_ROUTE_REDIRECT', 'Home')
                }
              } else {
                if (state.forceFirstPage !== '') {
                  commit('UPDATE_ROUTE_REDIRECT', state.forceFirstPage)
                  commit('UPDATE_FORCE_FIRST_PAGE', '')
                } else {
                  commit('UPDATE_ROUTE_REDIRECT', currentRoute)
                }
              }
              resolve()
            }).catch((rsp) => {
              commit('UPDATE_DISPLAY_ERROR', rsp.message)
              reject(rsp)
            })
          }
          onAuthenticated()
        } else {
          dispatch('getWeakToken').then(resp => {
            commit('UPDATE_ACCESS_TOKEN', resp.access_token)
            dispatch('setDevice').then(response => {
              if (response.data && response.data.deviceNumber) {
                commit('UPDATE_DEVICE_NUMBER', response.data.deviceNumber)
                save('deviceNumber', response.data.deviceNumber)
                const lanParams = lang ? {name: 'interfaceLanguage', value: lang, update: true} : {update: false}
                dispatch('settings/updateInterfaceLanguage', lanParams, { root: true }).then(langResp => {
                  commit('UPDATE_TOGGLE_LOADING_MESSAGE', true)
                  if (lang) {
                    dispatch('otpPassThrough').then(resp => {
                      if (resp) {
                        commit('UPDATE_SIGNED', true)
                        if (currentRoute === 'Loading') {
                          if (state.forceFirstPage !== '') {
                            commit('UPDATE_ROUTE_REDIRECT', state.forceFirstPage)
                            commit('UPDATE_FORCE_FIRST_PAGE', '')
                          } else {
                            commit('UPDATE_ROUTE_REDIRECT', 'Home')
                          }
                        } else {
                          // goToLoading(currentRoute)
                        }
                        resolve()
                      } else {
                        lang ? commit('UPDATE_ROUTE_REDIRECT', 'OTPActivation') : commit('UPDATE_ROUTE_REDIRECT', 'LanguageSelection')
                        resolve()
                      }
                    }).catch(response => {
                      commit('UPDATE_ROUTE_REDIRECT', 'OTPActivation')
                      resolve()
                    })
                  } else {
                    commit('UPDATE_ROUTE_REDIRECT', 'LanguageSelection')
                    // goToLoading('LanguageSelection')
                  }
                }).catch(response => {
                  commit('UPDATE_DISPLAY_ERROR', response.message)
                  reject(Error('code: 3'))
                })
                // resolve({true: 'true'})
              } else {
                if (response.data && response.data.error_description) {
                  commit('UPDATE_DISPLAY_ERROR', response.data.error_description)
                } else {
                  commit('UPDATE_DISPLAY_ERROR', response)
                }

                reject(Error('code: 3'))
              }
            }).catch((response) => {
              commit('UPDATE_DISPLAY_ERROR', response.error + ' ' + response.message)
              reject(Error('code: 2'))
            })
          }).catch(() => {
            commit('UPDATE_DISPLAY_ERROR', {text: 'response'})
            reject(Error('code: 1'))
          })
        }
      })
    },
    otpPassThrough: async ({state, getters, commit, dispatch, rootState}) => {
      return new Promise(function (resolve, reject) {
        dispatch('getOtp').then(resp => {
          dispatch('checkOtpGrant').then(resp => {
            if (resp === AUTH_DEVICE_SUCCESS) {
              if (rootState.general.appMode === APP_MODE_STB_PROVISIONING) {
                setProvisoningDone(state.stbMode)
              }
              resolve({true: 'true'})
            } else {
              reject(Error('code: 6'))
            }
          }).catch(() => {
            reject(Error('code: 5'))
          })
        }).catch(() => {
          reject(Error('code: 4'))
        })
      })
    },
    getOtp: async ({commit, state, getters}) => {
      return new Promise(function (resolve, reject) {
        getOtpAPI(state.deviceNumber, state.accessToken).then(response => {
          if (response.data && response.data.otp) {
            commit('UPDATE_OTP', response.data.otp)
            resolve(response.data.expiresInSeconds)
          } else {
            reject(Error(response.data.error))
          }
        }).catch(response => {
          // console.warn('+++++++++++++++ nema tokene  1 1 ++++++++++++', response.response)
          reject(Error(response.response.data.message))
        })
      })
    },
    checkOtpGrant: async ({state, getters, commit, dispatch}) => {
      return checkOtpGrantAPI(state.otp, state.deviceNumber, getters.getClientCredentialsB64).then(response => {
        if (response.status === 200) {
          commit('UPDATE_ACCESS_TOKEN', response.data.access_token)
          commit('UPDATE_REFRESH_TOKEN', response.data.refresh_token)
          commit('UPDATE_KEYS', getKeys(response.data))
          save('accessObj', JSON.stringify(response.data))
          commit('UPDATE_SIGNED', true)
          commit('UPDATE_STB_MODE', response.data.stb_mode)
          return dispatch('settings/updatePreferences', { key: 'interfaceLanguage', value: load('lang') }, { root: true }).then(() => {
            return AUTH_DEVICE_SUCCESS
          })
        } else {
          return AUTH_DEVICE_FAILED
        }
      }).catch(error => {
        if (error.response && error.response.data && error.response.data.error && error.response.data.error.toUpperCase() === AUTH_DEVICE_FORBIDDEN) {
          return AUTH_DEVICE_FORBIDDEN
        } else {
          return AUTH_DEVICE_FAILED
        }
      })
    },
    async refreshToken ({commit, state, getters, dispatch, rootState}) {
      commit('UPDATE_REFRESHING_TOKEN', true)
      return refreshAccessTokenAPI(state.refreshToken, getters.getClientCredentialsB64).then(axiosObject => {
        const response = axiosObject.response ? axiosObject.response : axiosObject
        if (response.status === 200) {
          save('accessObj', JSON.stringify(response.data))
          commit('UPDATE_REFRESHING_TOKEN', false)
          // accessToken & refreshToken
          commit('UPDATE_ACCESS_TOKEN', response.data.access_token)
          commit('UPDATE_REFRESH_TOKEN', response.data.refresh_token)
          commit('UPDATE_KEYS', getKeys(response.data))
          // dispatch('settings/fetchLocalization', null, { root: true })
          // rootState.dispatch('settings/fetchLocalization')
          return 'Bearer  ' + response.data.access_token
        //  store.commit('auth/UPDATE_ATOKEN_REFESH_STATUS', true)
        } else if (response.status === 401 || response.status === 400) {
          // console.warn('puko refrash ', response.status)
          dispatch('resetAuth')
        }
        commit('UPDATE_REFRESHING_TOKEN', false)
        return ''
      }).catch(axiosObject => {
        const statusCode = axiosObject.response.status
        // console.warn('puko refrash ', statusCode)
        if (statusCode === 401 || statusCode === 400) {
          dispatch('resetAuth')
        }
        commit('UPDATE_REFRESHING_TOKEN', false)
        return ''
      })
    },
    checkAccessToken: ({ commit, dispatch, getters }) => {
      if (load('deviceNumber')) {
        let deviceNumber = load('deviceNumber')
        commit('UPDATE_DEVICE_NUMBER', deviceNumber)
      }
      const accessO = load('accessObj')
      if (accessO) {
        let accessObj = JSON.parse(accessO)
        if (accessObj.access_token && accessObj.key_valid_to) {
          commit('UPDATE_ACCESS_TOKEN', accessObj.access_token)
          commit('UPDATE_REFRESH_TOKEN', accessObj.refresh_token)
          commit('UPDATE_KEYS', getKeys(accessObj))
          // dispatch('settings/fetchLocalization', null, { root: true })
          return { success: true }
        } else {
          return { success: false }
        }
      } else {
        return { success: false }
      }
    },
    resetAuth: async ({state, commit, dispatch}) => {
      // if (state.refreshToken && state.accessToken) {
      commit('UPDATE_ACCESS_TOKEN', '')
      commit('UPDATE_REFRESH_TOKEN', '')
      commit('UPDATE_DEVICE_NUMBER', '')
      commit('UPDATE_SIGNED', false)
      remove('accessObj')
      remove('deviceNumber')
      remove('lang')
      remove('serviceProviders')
      dispatch('settings/removeLocalSettings', {}, { root: true })
      setDebuggingMode()
      // remove('gen_serial')
      // remove('gen_mac')
      // remove('sdkVersion')
      // remove('firmwareVersion')
      // remove('tvModel')
      // goToLoading('Loading')
      reloadApp()
      // dispatch('initAuth', {currentRoute: 'Loading'})
      // }
    },
    resetApp: () => {
      // goToLoading('Loading')
      reloadApp()
    },
    resetForceFirstPage: ({commit}) => {
      commit('UPDATE_FORCE_FIRST_PAGE_PARAMS', {})
      commit('UPDATE_FORCE_FIRST_PAGE', '')
    }
  },
  mutations: {
    UPDATE_LANGUAGE_TOGGLE (state) {
      state.changeLanguage = !state.changeLanguage
    },
    UPDATE_DEVICE_NUMBER (state, newDeviceNumber) {
      state.deviceNumber = newDeviceNumber
    },
    UPDATE_CLIENT_PARAMS (state, newClientParams) {
      state.clientParams = Object.freeze(newClientParams)
    },
    UPDATE_REFRESH_TOKEN (state, newRefreshToken) {
      state.refreshToken = newRefreshToken
    },
    UPDATE_ACCESS_TOKEN (state, newAccessToken) {
      state.accessToken = newAccessToken
    },
    UPDATE_OTP (state, newOtp) {
      state.otp = newOtp
    },
    UPDATE_ROUTE_REDIRECT (state, newRoute) {
      state.loadingRedirectRoute = newRoute
    },
    UPDATE_FORCE_FIRST_PAGE (state, newRoute) {
      state.forceFirstPage = newRoute
    },
    UPDATE_FORCE_FIRST_PAGE_PARAMS (state, newParams) {
      state.forceFirstPageParams = Object.freeze(newParams)
    },
    UPDATE_SIGNED (state, newState) {
      state.signed = newState
    },
    UPDATE_DISPLAY_ERROR (state, newState) {
      state.displayError = newState
    },
    UPDATE_TOGGLE_LOADING_MESSAGE (state, newState) {
      state.toggleLoadingMessage = newState
    },
    UPDATE_FIRST_LOAD (state, newState) {
      state.firstLoad = newState
    },
    UPDATE_KEYS (state, newKeys) {
      state.keys = Object.freeze(newKeys)
    },
    UPDATE_STB_MODE (state, newStbMode) {
      state.stbMode = newStbMode
    },
    UPDATE_REFRESHING_TOKEN (state, newValue) {
      state.refreshingToken = newValue
    },
    UPDATE_PROVISIONING_MODE (state, newValue) {
      state.provisioningMode = newValue
    }
  }
}
function goToLoading (currentRoute) {
  router.push({
    name: currentRoute
  })
}
function reloadApp () {
  stop()
  router.push({
    name: 'Loading'
  })
  window.location.reload(true)
}
