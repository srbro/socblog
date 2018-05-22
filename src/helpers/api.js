import axios from 'axios'
// import config from 'config'
import moment from 'moment'
import store from 'src/vuex/store'
import general from 'src/vuex/modules/_general'
import { HTTP_DATE } from 'helpers/time'
import servers from 'servers'
import { getNetworkType } from 'hal'
import Raven from 'raven-js'
// import { loc } from 'helpers/localization'

// Mock data
//
// var MockAdapter = require('axios-mock-adapter')
// var mock = new MockAdapter(axios)

// import categoriesTV from '../../test/mockdata/categoriesTV'
// import channelsTV from '../../test/mockdata/channelsTV'
// import epgNoInfo from '../../test/mockdata/epgNoInfo'
// import lp from '../../test/mockdata/lp'

// mock.onGet(`${config.infoServerBaseUrl}/${config.apiVersion}/categories?type=TV`).reply(200, categoriesTV)
// mock.onGet(`${config.infoServerBaseUrl}/${config.apiVersion}/channels?channelType=TV`).reply(200, channelsTV)
// mock.onGet(`${config.infoServerBaseUrl}/${config.apiVersion}/events?epg`).reply(200, epgNoInfo)
// mock.onGet(`${config.infoServerBaseUrl}/${config.apiVersion}/lp`).reply(200, lp)
// mock.onAny().passThrough()

// End of mocking
const debugApi = false

console.log(`%cAPI server: `, 'background: #222; color: #bada55', servers.infoServerBaseUrl)
console.log(`%cAPI imageServer: `, 'background: #222; color: #bada55', servers.imageServerUrl)
console.log(`%cAPI staticServer: `, 'background: #222; color: #bada55', servers.staticServer)
console.log(`%cAPI server type: `, 'background: #222; color: #bada55', servers.name)
console.log(`%cAPI version:`, 'background: #222; color: #bada55', servers.apiVersion)

let authRequests = [
  '/oauth/token?grant_type=client_credentials',
  '/devices',
  '/otp?deviceNumber',
  '/oauth/token?grant_type=otp',
  '/oauth/token?grant_type=refresh_token',
  '/i18n/',
  '/stream?',
  'forcedUpdate'
]

axios.interceptors.request.use(function (config) {
  // Do something before request is sent
  if (debugApi) {
    console.log('API request: ' + window.JSON.stringify(config))
  }
  // console.warn('reqest ', config)
  // console.warn('reqest ', store.getters['auth/getAuthBearerToken'])
  if (config.url.indexOf('/write') !== -1) {
    return config
  }
  if ((config.url.indexOf(servers.staticServer) === -1 && config.url.indexOf('/stream') === -1)) {
    config.headers['X-UCP-CONNECTION-TYPE'] = getNetworkType()
  }
  if (config.url) {
    for (let i = 0; i < authRequests.length; i++) {
      if (config.url.includes(authRequests[i])) {
        return config
      }
    }
  }
  config.headers.Authorization = store.getters['auth/getAuthBearerToken']
  return config
}, function (error) {
  if (debugApi) {
    console.log('API request ERROR: ' + window.JSON.stringify(error))
  }
  // Do something with request error
  return Promise.reject(error)
})

axios.interceptors.response.use(function (response) {
  // calc time offfset
  if (debugApi) {
    console.log('API response: ' + window.JSON.stringify(response))
  }

  if (response && response.headers && response.headers.date) {
    let timeOffset = moment.utc(response.headers.date, HTTP_DATE) - moment()
    store.dispatch('general/setTimeOffset', timeOffset)
  }
  return response
}, function (error) {
  // TODO:
  if (debugApi) {
    console.log('API response ERROR: ' + window.JSON.stringify(error))
  }

  const originalRequest = error.config
  // proveriti zasto retry ne radi u neki slucajevima
  // promeniti config da znam da je auth
  if (originalRequest.url) {
    for (let i = 0; i < authRequests.length; i++) {
      if (originalRequest.url.includes(authRequests[i])) {
        if (error.response.status === 401) {
          return error.response
        } else {
          return Promise.reject(error)
        }
      }
    }
  }
  // if ((error.response.status === 401 || error.response.status === 403 || error.response.status === 405) && !originalRequest._retry) {
  if ((error.response.status === 401) && !originalRequest._retry) {
    console.error('AJAX response eroor ', error.response.status)
    originalRequest._retry = true
    return store.dispatch('auth/refreshToken').then(response => {
      originalRequest.headers.Authorization = response
      return axios(originalRequest)
    })

    // TODO request should be sent only after succesfull token refresh
  }
  Raven.captureMessage(error.response.status, { extra: { ...error } })
  return Promise.reject(error)
})

export const fetchCategories = (type) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/categories?type=${type}`)
export const fetchLanguages = () =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/languages`)
export const fetchLanguagesNew = () =>
  axios.get(`${servers.infoServerBaseUrl}/languages`)
export const fetchLocalizationFile = (filePath) =>
  axios.get(`${servers.staticServer}/${filePath}`)
export const fetchChannels = (type = 'TV') =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/channels?channelType=${type}`)
export const fetchEPG = (channelId, startTime, endTime) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/events/epg`, {
    params: {
      cid: channelId,
      fromTime: startTime,
      toTime: endTime
    },
    headers: {
      'X-UCP-TIME-FORMAT': 'timestamp'
    }
  })
export const fetchEPGn = (channelId, nBefore, nAfter) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/events/epg`, {
    params: {
      cid: channelId,
      fromNBefore: nBefore,
      toNAfter: nAfter
    },
    headers: {
      'X-UCP-TIME-FORMAT': 'timestamp'
    }
  })
export const fetchEvents = (eventId, nBefore, nAfter) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/events/epg/${eventId}`, {
    params: {
      fromNBefore: nBefore,
      toNAfter: nAfter
    },
    headers: {
      'X-UCP-TIME-FORMAT': 'timestamp'
    }
  })
// /////api.js/
export const fetchEPGEventDetail = (eventId) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/events/${eventId}`, {
    headers: {
      'X-UCP-TIME-FORMAT': 'timestamp'
    }
  })
export const fetchEPGCurrentEvents = (eventPosition, channelSort, sortDir, page, size, imageSize, categoryId) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/events`, {
    params: {
      eventPosition,
      channelSort,
      sortDir,
      categoryId,
      page,
      size,
      imageSize
    },
    headers: {
      'X-UCP-TIME-FORMAT': 'timestamp'
    }
  })
export const fetchLandingPages = () =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/lp`, {
    headers: {
      'X-UCP-TIME-FORMAT': 'timestamp'
    }
  })

export const search = (q) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/search`, {
    params: {
      q
    }
  })

// REMINDERS

export const fetchReminders = (imageSize = 'S') =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/reminders?imageSize=${imageSize}`, {
    headers: {
      'X-UCP-TIME-FORMAT': 'timestamp'
    }
  })

export const toggleRemainder = (eventId, toggle) =>
  axios.put(`${servers.infoServerBaseUrl}/${servers.apiVersion}/events/${eventId}/hasReminder`, toggle, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

export const setReminder = (eventId, hasReminder) =>
  axios.put(`${servers.infoServerBaseUrl}/${servers.apiVersion}/events/${eventId}/hasReminder`, hasReminder, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

// FAVORITES

export const fetchFavorites = (inFavorites = true) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/events?size=${general.totalNumberOfElements}`, {
    params: {
      inFavorites
    },
    headers: {
      'X-UCP-TIME-FORMAT': 'timestamp'
    }
  })

export const toggleFavorites = (eventId, toggle) =>
  axios.put(`${servers.infoServerBaseUrl}/${servers.apiVersion}/events/${eventId}/inFavorites`, toggle, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

export const fetchFavoriteChannelLists = (showDetails = true) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/chf?channelDetails=${showDetails}`)

export const postFavoriteChannelList = (list) =>
  axios.post(`${servers.infoServerBaseUrl}/${servers.apiVersion}/chf`, list, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

export const getFavoriteChannelList = (listId, list, showDetails = true) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/chf/${listId}?channelDetails=${showDetails}`)

export const putFavoriteChannelList = (listId, list) =>
  axios.put(`${servers.infoServerBaseUrl}/${servers.apiVersion}/chf/${listId}`, list, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
export const deleteFavoriteChannelList = (listId) =>
  axios.delete(`${servers.infoServerBaseUrl}/${servers.apiVersion}/chf/${listId}`, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
// END OF FAVORITES
// Network data
export const fetchNetworkInfo = (serverUrl) => {
  return axios.get(`${serverUrl}`)
}
// Network data end
export const getProviderSupportData = () => {
  return axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/sp`)
}

export const fetchServerInfo = (serverUrl) =>
  axios.get(`${serverUrl}`)

export const getCurrentEventForChannel = (channelId, startTime, endTime) => {
  return axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/events/epg`, {
    params: {
      cid: channelId,
      fromTime: startTime.toISOString(),
      toTime: startTime.toISOString()
    }
  })
}

export const setNewPin = (data) =>
  axios.post(`${servers.infoServerBaseUrl}/${servers.apiVersion}/households/pin`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
export const checkPin = (data) =>
  axios.post(`${servers.infoServerBaseUrl}/${servers.apiVersion}/households/checkPin`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

export const getHouseholds = () =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/households`)

export const getRndProfiles = () =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/rndprofiles`)

export const getPreferences = () =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/preferences`)

export const getVideoQuality = () =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/videoquality?type=WIFI`)

export const prepareVideoQualityForSending = function (value) {
  switch (value) {
    case 0:
      return 'AUTO'
    case 1:
      return 'HIGH'
    case 2:
      return 'MID'
    case 3:
      return 'LOW'
  }
}

export const putPreferences = (data) =>
  axios.put(`${servers.infoServerBaseUrl}/${servers.apiVersion}/preferences`, data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

// VOD
export const fetchVodLandingPage = (imageSize = 'L') =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/lp/vod`)

export const fetchVodAssets = (catalogueId, categoryId, genreId, vodSort, sortDir, filter, imageSize, inFavorites, page, size) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/vodassets`, {
    params: {
      catalogueId,
      categoryId,
      genreId,
      vodSort,
      sortDir,
      filter,
      imageSize,
      inFavorites,
      page,
      size
    },
    headers: {
      'X-UCP-TIME-FORMAT': 'timestamp'
    }
  })

export const getSeasons = (serieId) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/vodassets/${serieId}/seasons`)

export const fetchVodDetail = (assetId) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/vodassets/${assetId}`)

export const fetchCatalogues = () =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/catalogues`)

export const fetchGenres = () =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/genres`)

export const fetchPlayerInfo = () =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/playerInfo`)

export const fetchFilters = (optionalArg) => {
  let url = `${servers.infoServerBaseUrl}/${servers.apiVersion}/vodassets/filters`
  if (typeof optionalArg !== 'undefined') {
    url = url + '?'
    if (optionalArg.catalogueId) url = url + `&catalogueId=${optionalArg.catalogueId}`
    if (optionalArg.categoryId) url = url + `&categoryId=${optionalArg.categoryId}`
    if (optionalArg.genreId) url = url + `&genreId=${optionalArg.genreId}`
  }
  return axios.get(url)
}

export const putVodFavorite = (assetId, favoriteStatus) =>
  axios.put(`${servers.infoServerBaseUrl}/${servers.apiVersion}/vodassets/${assetId}/inFavorites`, favoriteStatus, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

export const putVodProgress = ({ assetId, watchedStatus = false, progress = 0 }) => {
  return axios.post(
    `${servers.infoServerBaseUrl}/${servers.apiVersion}/vodassets/${assetId}/progress`,
    {
      'progress': progress,
      'watched': watchedStatus
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}

// Authorization

export const getWeakToken = (clientCredentials64) =>
  axios.post(`${servers.infoServerBaseUrl}/oauth/token?grant_type=client_credentials`, null, {
    headers: {
      'Authorization': 'Basic ' + clientCredentials64,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

export const registerDeviceOTP = (deviceDetails, weakAccessToken) =>
  axios.post(`${servers.infoServerBaseUrl}/${servers.apiVersion}/devices`, null, {
    headers: {
      'Authorization': 'Bearer ' + weakAccessToken,
      'Content-Type': 'application/json',
      'Accept': '*/*'
    },
    data: deviceDetails
  })

export const registerDeviceSTB = (deviceDetails, weakAccessToken) =>
  axios.post(`${servers.infoServerBaseUrl}/${servers.apiVersion}/devices/stb`, null, {
    headers: {
      'Authorization': 'Bearer ' + weakAccessToken,
      'Content-Type': 'application/json',
      'Accept': '*/*'
    },
    data: deviceDetails
  })

export const getOtp = (deviceNumber, weakAccessToken) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/otp?deviceNumber=${deviceNumber}`, {
    headers: {
      'Authorization': 'Bearer  ' + weakAccessToken
    }
  })

export const checkOtpGrant = (otpCode, deviceNumber, clientCredentials64) =>
  axios.post(`${servers.infoServerBaseUrl}/oauth/token?grant_type=otp&otp=${otpCode}&device_number=${deviceNumber}`, null, {
    headers: {'Authorization': 'Basic   ' + clientCredentials64
    }
  })

export const refreshAccessToken = (refreshToken, clientCredentials64) =>
  axios.post(`${servers.infoServerBaseUrl}/oauth/token?grant_type=refresh_token&refresh_token=${refreshToken}`, null, {
    headers: {
      'Authorization': 'Basic   ' + clientCredentials64,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })

// Servers
export const fetchServers = () =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/servers`)

// App version

/* global versionUri */
export const fetchVersion = () =>
  axios.get(`${versionUri}`)

/* fetch age rating events */
export const fetchAgeRating = (rating, period) =>
  axios.get(`${servers.infoServerBaseUrl}/${servers.apiVersion}/ageRating/?rating=${rating}&toHoursAfter=${period}`)

export const fetchForcedUpdateFile = () => {
  return axios.get(`${servers.staticServer}/update/forcedUpdate.js?dummy=${Date.now()}`)
}
