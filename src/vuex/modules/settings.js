import { fetchLanguages, getHouseholds, setNewPin, checkPin, getRndProfiles, fetchLocalizationFile, getPreferences, putPreferences, getVideoQuality, getProviderSupportData, fetchServers } from 'helpers/api'
import { localizeVideoQualityData } from 'helpers/player/quality.js'
// import mockLocalizationFile from '../../../test/mockdata/localization/en.js'
import find from 'lodash/fp/find'
import findKey from 'lodash/fp/findKey'
import { load, save, remove, supportStreamTypes, supportOperationMode } from 'hal'
import { convertStoredData, reloadData } from 'helpers/data'

const preferenceMap = {
  LANGUAGE: 'interfaceLanguage',
  REMINDER: 'reminders',
  VIDEO_QUALITY_WIFI: 'videoQuality',
  VIDEO_ENCODING: 'videoEncoding',
  UI_MODE: 'uiMode',
  TRANSLATE_MODE: 'translateMode'
}

const localMap = {
  videoType: 'string',
  operationMode: 'string',
  zapBannerTimeout: 'number',
  zapBannerOnNewEvent: 'string',
  firstAudioLanguage: 'string',
  secondAudioLanguage: 'string',
  audioType: 'string',
  videoEncoding: 'string',
  keyboardLanguage: 'string',
  uiMode: 'string',
  translateMode: 'string'
}

export default {
  namespaced: true,
  state: {
    localization: {},
    rndProfiles: [],
    values: {
      languages: [],
      household: {},
      videoQualities: []
    },
    zapBannerTimeout: 5000,
    zapBannerOnNewEvent: 'no',
    rememberThePincode: 'noTimeout',
    interfaceLanguage: 'eng',
    keyboardLanguage: 'eng',
    firstAudioLanguage: 'eng',
    secondAudioLanguage: 'eng',
    audioType: 'stereo',
    pin: '0000',
    validPin: false,
    reminders: 5,
    videoQuality: 'AUTO',
    videoEncoding: 'ABR',
    videoType: 'm3u8',
    drmVideoType: 'dashcenc',
    operationMode: 'ott',
    providerSupportData: {},
    providerSupportDataWeb: '',
    providerSupportDataPhone: '',
    uiMode: 'ADVANCED',
    translateMode: 'TRANSLATE3D',
    debuging: 0
  },
  getters: {
    getVideoQuality: state => {
      if (state.values.videoQualities.length !== 0) {
        return find({ type: state.videoQuality }, state.values.videoQualities).id
      }
    },
    getVideoParams: state => {
      if (state.values.videoQualities.length !== 0) {
        return {
          videoQuality: find({ type: state.videoQuality }, state.values.videoQualities).id,
          videoEncoding: state.videoEncoding,
          videoType: state.videoType
        }
      }
    }
  },
  actions: {
    fetchInitialSettings: async ({ state, commit, dispatch }) => {
      const userSettings = await getPreferences()
      const getServers = await fetchServers()
      userSettings.data.forEach(setting => {
        const preferenceKey = preferenceMap[setting.preferenceKey]
        if (preferenceKey) {
          let serverValue = convertStoredData(setting.preferenceValue, typeof state[preferenceKey])
          commit('UPDATE_SETTING', { name: preferenceKey, value: serverValue })
        }
      })
      if (!find({preferenceKey: 'VIDEO_ENCODING'}, userSettings.data)) {
        const managedNetwork = getServers.data.managed_network
        if (managedNetwork) {
          commit('UPDATE_SETTING', { name: 'videoEncoding', value: 'CBR' })
          dispatch('updateStreamType', { value: 'CBR' })
        } else {
          commit('UPDATE_SETTING', { name: 'videoEncoding', value: 'ABR' })
          dispatch('updateStreamType', { value: 'ABR' })
        }
      }
    },
    fetchLocalSettings: ({ state, commit }) => {
      Object.keys(localMap).forEach((key) => {
        let localValue = load(key)
        if (localValue) {
          localValue = convertStoredData(localValue, typeof state[key])
          commit('UPDATE_SETTING', { name: key, value: localValue })
        }
      })
    },
    removeLocalSettings: () => {
      Object.keys(localMap).forEach((key) => {
        remove(key)
      })
    },
    fetchLanguage: async ({ state, commit, dispatch }) => {
      const languages = await fetchLanguages()
      let currentLanguages = languages.data.map((language) => ({
        id: language.code6392B,
        label: language.name,
        filePath: language.i18nFilePath
      }))
      commit('UPDATE_SETTING_VALUES', { name: 'languages', values: currentLanguages })
    },
    fetchLocalization: async ({ state, commit, dispatch }) => {
      if (state.values.languages.length === 0) {
        await dispatch('fetchLanguage')
      }
      const filePath = find({ id: state.interfaceLanguage }, state.values.languages).filePath
      let localizationFile = await fetchLocalizationFile(filePath)
      commit('UPDATE_LOCALIZATION', localizationFile.data)
    },
    fetchHouseholds: async ({ state, commit }) => {
      const household = await getHouseholds()
      commit('UPDATE_SETTING_VALUES', { name: 'household', values: household.data })
    },
    fetchRndProfiles: async ({ state, commit }) => {
      const rndProfiles = await getRndProfiles()
      commit('UPDATE_RND_PROFILES', rndProfiles.data)
    },
    fetchVideoQuality: async ({ state, commit }) => {
      const videoQualities = await getVideoQuality()
      let currentVideoQualities = videoQualities.data.wifi.map(videoQuality => ({
        id: videoQuality.maxvbr,
        type: videoQuality.option,
        label: localizeVideoQualityData(videoQuality.option)
      })).filter(value => value.id !== 0)
      commit('UPDATE_SETTING_VALUES', { name: 'videoQualities', values: currentVideoQualities })
    },
    fetchProviderSupportData: async ({ state, commit }) => {
      return new Promise(function (resolve, reject) {
        let providerSupportData
        getProviderSupportData().then(response => {
          save('serviceProviders', JSON.stringify(response.data))
          if (response.data) {
            providerSupportData = response.data
            let providerSupportPhone = response.data.supportPhoneNumber
            let providerSupportWeb = response.data.supportWebAddress
            resolve(providerSupportPhone, providerSupportWeb)
            commit('UPDATE_PROVIDER_SUPPORT_DATA', { name: 'providerSupportData', values: providerSupportData }) // ovo je za slucaj da zatreba ako bude vise telefona ili podataka
            commit('UPDATE_PROVIDER_SUPPORT_DATA_PHONE', providerSupportPhone)
            commit('UPDATE_PROVIDER_SUPPORT_DATA_WEB', providerSupportWeb)
          } else {
            reject(Error('No data'))
          }
        }).catch(response => {
          reject(Error('No response'))
        })
      })
    },
    updatePreferences: async ({ state, commit, dispatch }, { key, value }) => {
      const serverKey = findKey(o => o === key, preferenceMap)
      await putPreferences({ preferenceKey: serverKey, preferenceValue: value })
    },
    fetchSettings: async ({ state, commit, dispatch, rootGetters }) => {
      await dispatch('fetchInitialSettings')
      await dispatch('fetchLocalSettings')
      await dispatch('fetchLanguage')
      await dispatch('fetchLocalization')
      await dispatch('fetchVideoQuality')
      await dispatch('fetchHouseholds')
      await dispatch('fetchRndProfiles')
      await dispatch('fetchProviderSupportData')
    },
    updateInterfaceLanguage: async ({ commit, dispatch, state }, { name, value, update, putLang }) => {
      if (update) {
        commit('UPDATE_SETTING', { name, value })
      }
      if (putLang) {
        putPreferences({ preferenceKey: 'LANGUAGE', preferenceValue: value })
      }
      return new Promise(function (resolve, reject) {
        fetchLanguages().then(response => {
          let currentLanguages = response.data.map((language) => ({
            id: language.code6392B,
            label: language.name,
            filePath: language.i18nFilePath
          }))
          commit('UPDATE_SETTING_VALUES', { name: 'languages', values: currentLanguages })
          const filePath = find({ id: state.interfaceLanguage }, currentLanguages).filePath
          fetchLocalizationFile(filePath).then(response => {
            commit('UPDATE_LOCALIZATION', response.data)
            resolve(response)
          }).catch(response => {
            reject(Error('No language file found'))
          })
        }).catch((response) => {
          reject(Error('No language file found'))
        })
      })
    },
    updateSetting: async ({ state, commit, dispatch }, { name, value }) => {
      commit('UPDATE_SETTING', { name, value })
      if (name === 'interfaceLanguage') {
        await putPreferences({ preferenceKey: 'LANGUAGE', preferenceValue: value })
        save('lang', value)
        await dispatch('fetchLocalization')
        reloadData()
      } else if (name === 'videoEncoding') {
        await dispatch('updatePreferences', { key: name, value })
        await dispatch('updateStreamType', { value })
        save(name, value)
      } else if (name === 'videoQuality') {
        await dispatch('updatePreferences', { key: name, value })
      } else if (name === 'reminders') {
        await dispatch('updatePreferences', { key: name, value })
      } else if (name === 'rememberThePincode') {
        await dispatch('rememberPinTime')
      } else if (localMap.hasOwnProperty(name)) {
        save(name, value)
      } else if (name === 'operationMode') {
        await dispatch('updateOperationMode', { key: name, value })
        save(name, value)
      }
    },
    updateStreamType: ({commit}, { value }) => {
      commit('UPDATE_VIDEO_TYPE', supportStreamTypes[value])
    },
    updateOperationMode: ({commit}, { value }) => {
      commit('UPDATE_OPERATION_MODE', supportOperationMode[value])
    },
    updatePin: ({ state, commit }, value) => {
      setNewPin({
        'newPin': value,
        'oldPin': state.pin
      }).then((data) => {
        if (!data.error) commit('UPDATE_SETTING', {name: 'pin', value: value})
      })
    },
    rememberPinTime: ({ state, dispatch }) => {
      if (state.validPin) {
        switch (state.rememberThePincode) {
          case '5min':
            dispatch('parentalRating/setTimeOfEnteredPin', null, { root: true })
            dispatch('parentalRating/setTimeOfPinValidFromNow', {
              amount: 300000
            },
            { root: true })
            dispatch('parentalRating/setPinRemembered', {
              active: true
            },
            { root: true })
            break
          case '1h':
            dispatch('parentalRating/setTimeOfEnteredPin', null, { root: true })
            dispatch('parentalRating/setTimeOfPinValidFromNow', {
              amount: 3600000
            },
            { root: true })
            dispatch('parentalRating/setPinRemembered', {
              active: true
            },
            { root: true })
            break
          case '2h':
            dispatch('parentalRating/setTimeOfEnteredPin', null, { root: true })
            dispatch('parentalRating/setTimeOfPinValidFromNow', {
              amount: 7200000
            },
            { root: true })
            dispatch('parentalRating/setPinRemembered', {
              active: true
            },
            { root: true })
            break
          case 'until6am':
            dispatch('parentalRating/setTimeOfEnteredPin', null, { root: true })
            dispatch('parentalRating/setTimeOfPinValidUntil', {
              amount: 6
            },
            { root: true })
            dispatch('parentalRating/setPinRemembered', {
              active: true
            },
            { root: true })
            break
          default:
            dispatch('parentalRating/setPinRemembered', {
              active: false
            },
            { root: true })
        }
      }
    },
    checkPin: async ({ state, commit, dispatch }, value) => {
      const newValue = value
      await checkPin(value)
        .then(response => {
          let valid = response.data.valid !== undefined ? response.data.valid : true
          if (valid) {
            commit('UPDATE_SETTING', { name: 'pin', value: newValue })
          }
          commit('UPDATE_SETTING', { name: 'validPin', value: valid })
          dispatch('rememberPinTime')
        })
        .catch(e => {
          // commit('UPDATE_SETTING', { name: 'validPin', value: false })
        })
    }
  },
  mutations: {
    UPDATE_SETTING (state, { name, value }) {
      state[name] = value
      // This logic should be changed, test mode
      if (name === 'uiMode') {
        window.setM(value)
      } else if (name === 'translateMode') {
        window.setTranslate(value)
      }
    },
    UPDATE_SETTING_VALUES (state, { name, values }) {
      state.values[name] = Object.freeze(values)
    },
    UPDATE_LOCALIZATION (state, newLocalization) {
      state.localization = Object.freeze(newLocalization)
    },
    UPDATE_RND_PROFILES (state, newRndProfiles) {
      state.rndProfiles = Object.freeze(newRndProfiles)
    },
    UPDATE_PROVIDER_SUPPORT_DATA (state, newProviderSupportData) {
      state.providerSupportData = Object.freeze(newProviderSupportData)
    },
    UPDATE_PROVIDER_SUPPORT_DATA_PHONE (state, newProviderSupportDataPhone) {
      state.providerSupportDataPhone = newProviderSupportDataPhone
    },
    UPDATE_PROVIDER_SUPPORT_DATA_WEB (state, newProviderSupportDataWeb) {
      state.providerSupportDataWeb = newProviderSupportDataWeb
    },
    UPDATE_VIDEO_TYPE (state, newVideoType) {
      state.videoType = newVideoType
    },
    UPDATE_OPERATION_MODE (state, newOperationMode) {
      state.operationMode = newOperationMode
    }
  }
}
