/* global ANDROMAN localStorage */

import { handleKey } from '../KeyHandler.js'
import { fetchNetworkInfo } from 'src/helpers/api' // trebace za info za network ako nema native f-ja u LG-u
import store from 'src/vuex/store'
// import { loc } from 'helpers/localization' // Locaƒlization functionƒ
import { networkChange } from 'helpers/network'
// import { STREAM_PLAYING, STREAM_ERROR } from 'helpers/player/playerConst'
import { redirectToRoute } from 'helpers/redirect'
import { PLATFORM as PLATFORM_ANDROIDTV, KEY_MAP } from './consts/constsAndroidTv'
import { PLATFORM as PLATFORM_STB } from './consts/constsSTB'
import { PROVISIONING_TYPE_OTP, PROVISIONING_TYPE_SERIAL } from 'helpers/consts.js'

import ver from 'version'
// import { getHeader } from 'helpers/drm'
import servers from 'servers'

const DEVICE_TYPE_STB = 'stb'
const DEVICE_TYPE_STB_ID = 'kstb6020'
let localStreamId

var callbackFunctions = ['onNativeKeyUp', 'onNativeKeyDown', 'onResumePauseActivity', 'onPlayerStateChanged', 'onNetworkCheck', 'onBitrateChanged', 'onRefreshToken']
var constModelsToHideVideo = ['SONYANDROIDTV', 'PHTV']
var constModelsWithoutDisclaimer = ['SONYANDROIDTV2017', 'SHIELDANDROIDTV']

let stbMode = false
let deviceType
let deviceName
let deviceModel
let deviceManufacturer
let wrapperVersion
let sdkVersion
let releaseVersion

// Playing stream types on this platform
export const supportStreamTypes = {CBR: 'm3u8', ABR: 'm3u8'}
export const supportStreamVodTypes = {CBR: 'm3u8v', ABR: 'm3u8v'}
export const supportOperationMode = {DVB: 'hybrid', OTT: 'ott'}

export const getDeviceId = function () {
  try {
    return load('deviceNumber')
  } catch (err) {
    console.error('ERROR gatGeteway: ' + err)
  }
}

export const getDeviceType = function () {
  if (!deviceType) {
    deviceType = stbMode ? DEVICE_TYPE_STB_ID : 'android_tv_' + getSDKVersion()
  }
  return deviceType
}

export const getDeviceName = function () {
  if (!deviceName) {
    deviceName = 'Android TV ' + getSDKVersion()
  }
  return deviceName
}

export const getPlatform = function () {
  return stbMode ? PLATFORM_STB : PLATFORM_ANDROIDTV
}

export const getDeviceModel = function () {
  if (!deviceModel) {
    try {
      deviceModel = ANDROMAN.getDeviceModel()
    } catch (err) {
      console.error('ERROR getDeviceModel: ' + err)
    }
  }
  return deviceModel
}

export const sendChannelData = function (tvChannelList, radioChannelList) {
  // getDVBParams()
  try {
    ANDROMAN.setChannelData(JSON.stringify(tvChannelList), JSON.stringify(radioChannelList))
  } catch (err) {
    console.log('Error getChannels: ', err)
  }
}

function updateChannelsData () {
  store.dispatch('general/fetchChannels')
}

export const getWrapperVersion = function () { // get wrapper version from js interface
  if (!wrapperVersion) {
    try {
      return ANDROMAN.getWrapperVersion()
    } catch (e) {
      console.log('Error on wrapper version: ' + e)
    }
  }
  return wrapperVersion
}

export const getDeviceManufacturer = function () {
  if (!deviceManufacturer) {
    try {
      deviceManufacturer = ANDROMAN.getDeviceManufacturer()
    } catch (err) {
      console.error('ERROR getDeviceManufacturer: ' + err)
    }
  }
  return deviceManufacturer
}

export const checkWIFI = function () {
  try {
    let wifi = {}
    wifi = ANDROMAN.isItOnWiFi()
    return wifi
  } catch (err) {
    console.error('ERROR gatGeteway: ' + err)
  }
}

export const checkLAN = function () {
  try {
    let lan = {}
    lan = ANDROMAN.isItOnLAN()
    return lan
  } catch (err) {
    console.error('ERROR gatGeteway: ' + err)
  }
}

export const isItWifi = function () { // da li je na wifi
  let useWiFi = false
  try {
    let wifiOn = 'UNKNOWN'
    let lanOn = 'UNKNOWN'
    wifiOn = checkWIFI()
    lanOn = checkLAN()
    if (wifiOn.indexOf('ok') > -1 && lanOn.indexOf('ok') < 0) {
      useWiFi = true
    } else {
      useWiFi = false
    }
  } catch (err) {
    console.error('ERROR localIP: ' + err)
  }
  return useWiFi
}

export const getNetworkType = function () {
  if (isItWifi() === true) {
    store.dispatch('networking/updateNetworkType', 'WI_FI')
    return 'WI_FI'
  } else {
    store.dispatch('networking/updateNetworkType', 'ETHERNET')
    return 'ETHERNET'
  }
}

export const setIpAddressSetting = function () {
  let IPAddressAettings = 'UNKNOWN'
  try {
    if (isItWifi() === true) {
      IPAddressAettings = 'WIFI'
    } else {
      IPAddressAettings = 'LAN'
    }
  } catch (err) {
    console.error('ERROR localIP: ' + err)
  }
  return IPAddressAettings
}

const getApplicationVersions = function () {
  return [
    {
      'appId': 'com.ug.eon.android.tv',
      'version': getWrapperVersion()
    }
  ]
}

export const getDeviceDetailSTB = function () {
  try {
    return {
      'applicationVersions': getApplicationVersions(),
      'clientSwBuild': getWrapperVersion(),
      'clientSwVersion': `${ver.major}.${ver.minor}.${ver.patch}`,
      'deviceName': getDeviceName(),
      'deviceType': getDeviceType(),
      'fcmToken': 'unkonwn',
      'mac': getMac(),
      'modelName': getDeviceModel(),
      'platform': getPlatform(),
      'serial': getSerial(),
      'systemSwVersion': {
        'name': 'Android',
        'version': getReleaseVersion(),
        'bootImageVersion': '1.0',
        'bootLogoVersion': '1.0',
        'portalVersion': '1.0',
        'rcuFwVersion': '1.0',
        'rcuUdbVersion': '1.0',
        'splashScreensVersion': '1.0',
        'systemName': 'system',
        'tvSystem': 'PAL'
      }
    }
  } catch (err) {
    console.error('HAL ERROR getDeviceDetailSTB: ' + err)
  }
}

export const getDeviceDetailAndroidTV = function () {
  try {
    return {
      'deviceName': getDeviceName(),
      'deviceType': getDeviceType(),
      'mac': getMac(),
      'modelName': getDeviceModel(),
      'platform': getPlatform(),
      'serial': getSerial(),
      'clientSwVersion': `${ver.major}.${ver.minor}.${ver.patch}`,
      'clientSwBuild': getWrapperVersion(),
      'systemSwVersion': {
        'name': 'Android',
        'version': getReleaseVersion()
      }
    }
  } catch (err) {
    console.error('ERROR gatGeteway: ' + err)
  }
}

export const getDeviceDetail = function () {
  return stbMode ? getDeviceDetailSTB() : getDeviceDetailAndroidTV()
}

export const getUserPublicIp = async function () {
  let userPublicIP = 'UNKNOWN'
  try {
    // var probam
    let serverURL = 'https://api.ug.cdn.united.cloud/v1/servers' // ovo mozda moze da se optimizuje, kada bude poznata logika za servere
    let request = await fetchNetworkInfo(serverURL)
    // let userPublicIP = request
    // return request.data.ip
    return request.data
  } catch (err) {
    console.error('ERROR Network: ' + err)
  }
  return userPublicIP
}

export const getUserLocalIP = function () { // za dobijanje lokalne IP adrese
  let localIP = 'UNKNOWN'
  try {
    if (isItWifi() === true) {
      localIP = ANDROMAN.getLocalIpAddressWiFi()
    } else {
      localIP = ANDROMAN.getLocalIpAddress()
    }
  } catch (err) {
    console.error('ERROR localIP: ' + err)
  }
  return localIP
}

export const getSubnetMask = function () {
  let subnetMas = 'UNKNOWN'
  try {
    if (isItWifi() === true) {
      subnetMas = ANDROMAN.getSubnetMaskWiFi()
    } else {
      subnetMas = ANDROMAN.getSubnetMask()
    }
  } catch (err) {
    console.error('ERROR subnetMask: ' + err)
  }
  return subnetMas
}

export const getPrimaryDNS = function () {
  let PrimaryDNS
  try {
    if (isItWifi() === true) {
      PrimaryDNS = ANDROMAN.getPrimaryDNSWiFi()
    } else {
      PrimaryDNS = ANDROMAN.getPrimaryDNS()
    }
    // PrimaryDNS = ANDROMAN.getPrimaryDNS()
  } catch (err) {
    console.error('ERROR primaryDNS: ' + err)
  }
  return PrimaryDNS
}

export const getSecondaryDns = function () {
  let secondaryDNS
  try {
    if (isItWifi() === true) {
      secondaryDNS = ANDROMAN.getSecondaryDnsWiFi()
    } else {
      secondaryDNS = ANDROMAN.getSecondaryDns()
    }
    // secondaryDNS = ANDROMAN.getSecondaryDns()
  } catch (err) {
    console.error('ERROR secondaryDNS: ' + err)
  }
  return secondaryDNS
}

export const getGateway = function () { // za dobijanje Gateway-a
  let Getaway
  try {
    if (isItWifi() === true) {
      Getaway = ANDROMAN.getGatewayWiFi()
    } else {
      Getaway = ANDROMAN.getGateway()
    }
    // Getaway = ANDROMAN.getGateway()
  } catch (err) {
    console.error('ERROR gatGeteway: ' + err)
  }
  return Getaway
}

// let isConnected = 'connected' // zakucano za sada
export const internetAccess = function () {
  let internetAccess
  try {
    if (getUserPublicIp() !== '' || getUserPublicIp() !== undefined) {
      internetAccess = 'OK'
    } else {
      internetAccess = 'NO ACCESS'
    }
    console.log('HAL : internetAccess = ', internetAccess)
  } catch (err) {
    console.error('ERROR gatGeteway: ' + err)
  }
  return internetAccess
}

// let isConnectedLocaly
export const internetAccessLocal = function () {
  let internetAccessLocal
  try {
    if (getUserLocalIP() !== '' || getUserLocalIP() !== undefined) {
      internetAccessLocal = 'OK'
    } else {
      internetAccessLocal = 'NO ACCESS'
    }
  } catch (err) {
    console.error('ERROR gatGeteway: ' + err)
  }
  console.log('HAL : internetAccessLocal = ', internetAccessLocal)
  return internetAccessLocal
}

export const getMACNew = function () {
  let mac
  try {
    mac = ANDROMAN.getMACNew()
    console.log('HAL -=--= ', mac)
  } catch (err) {
    console.error('ERROR MACNew: ' + err)
  }
  return mac
}

export const getMACNewWIFI = function () {
  let mac
  try {
    mac = ANDROMAN.getMACNewWIFI()
    console.log('HAL -=--= ', mac)
  } catch (err) {
    console.error('ERROR MACNewWiFi: ' + err)
  }
  return mac
}
// network end

export const getSDKVersion = function () {
  if (!sdkVersion) {
    try {
      sdkVersion = ANDROMAN.getSDKVersion()
    } catch (err) {
      console.error('ERROR getSDKVersion: ' + err)
    }
  }
  return sdkVersion
}

export const getReleaseVersion = function () {
  if (!releaseVersion) {
    try {
      releaseVersion = ANDROMAN.getReleaseVersion()
    } catch (err) {
      console.error('ERROR getSDKVersion: ' + err)
    }
  }
  return releaseVersion
}

export const config = {
  resolution: ['1px', '1px']
}

// var stopHoldInterval = null
// var keyController = 0
// var time = 0
// var nextTime = 0
//
// function prettyAnimation (key, event) {
//   var d = new Date()
//   if (keyController === 0) time = d.getTime()
//   if (keyController > 0) nextTime = d.getTime()
//   keyController++
//   if (keyController === 1) {
//     handleKey(keyMap[key])
//     setTimeout(() => {
//       if (keyController > 1) {
//         handleKey(keyMap[key] + '_HOLD')
//       }
//     }, 250)
//   }
//   if (keyController === 2) handleKey(keyMap[key])
//   if (nextTime > 0 && nextTime - time < 700) {
//     clearTimeout(stopHoldInterval)
//     stopHoldInterval = setTimeout(() => {
//       keyController = 0
//       handleKey('HOLD_STOP')
//     }, 300)
//   }
//   if (nextTime > 0 && nextTime - time > 700) keyController = 0
//   if (event.repeat) handleKey(keyMap[key] + '_HOLD')
//   time = nextTime
// }

function doHandleKey (event) {
  event.preventDefault()
  try {
    var key = KEY_MAP[event.keyCode]
    if (key) {
      clickHandler(event.keyCode, key)
    }
  } catch (err) {
    console.error('ERROR gatGeteway: ' + err)
  }
}

// new
var clickQueue = 0
var holdInterval = null

function doHandleKeyUp (event) {
  event.preventDefault()
  console.log('doHandleKey' + JSON.stringify(event))
  console.log('doHandleKeyUp' + event.keyCode)
  console.log('doHandleKeyUp: ' + event.key)

  var key = KEY_MAP[event.keyCode]
  if (!key) {
    console.log('doHandleKeyUp in if: ' + event.key)
    handleKey(event.key)
  }
  try {
    if (clickQueue !== 1) {
      window.clearInterval(holdInterval)
      handleKey('HOLD_STOP') // 1000 is STOP_LONG (for web 76)
    }
    clickQueue = 0
  } catch (err) {
    window.clearInterval(holdInterval)
    console.error('ERROR gatGeteway: ' + err)
  }
}

function clickHandler (keyCode, event) {
  try {
    clickQueue++
    if (clickQueue === 1) {
      console.log('clickHandler ' + event)
      handleKey(event)
    }
    if (clickQueue === 2 && ((keyCode >= 19 && keyCode <= 22) || (keyCode === 89 || keyCode === 90) || (keyCode === 166 || keyCode === 167))) { // || keyCode === 176 || keyCode === 177
      window.clearInterval(holdInterval)
      holdInterval = window.setInterval(() => handleKey(event + '_HOLD'), 25) // plus 1000 for custom LONG events
    }
  } catch (err) {
    console.error('ERROR gatGeteway: ' + err)
  }
}

export const test = function () {
  console.log('HAL this is androidtv hal')
}

const windowLoad = () => {
  try {
    ANDROMAN.setAppStatus('loaded')
  } catch (e) {
    console.error('ANDROMAN fail to set setAppStatus("loaded")' + e)
  }
  window.removeEventListener('load', windowLoad, false)
}
export const initHal = function () {
  console.log('HAL Androman init')
  try {
    stbMode = ANDROMAN.getDeviceType() === DEVICE_TYPE_STB
    console.log('HAL stbMode: ' + stbMode)
    ANDROMAN.setAppStatus('init')
  } catch (e) {
    console.error('ANDROMAN fail to set setAppStatus("init")' + e)
  }
  window.addEventListener('load', windowLoad, false)
  ANDROMAN.initHal(JSON.stringify(callbackFunctions))
  // for (var i = 0; i < callbacks.length; i++) {
  //   if (this[callbacks[i]]) {
  //     window[callbacks[i]] = this[callbacks[i]]
  //   } else {
  //     window[callbacks[i]] = function () {}
  //   }
  // }
  save('servers', JSON.stringify(servers))
  window.onResumePauseActivity = onResumePauseActivity
  window.onNativeKeyDown = onNativeKeyDown
  window.onNativeKeyUp = onNativeKeyUp
  window.onPlayerStateChanged = onPlayerStateChanged
  window.onNetworkCheck = onNetworkCheck
  window.onBitrateChanged = onBitrateChanged
  window.updateChannelsData = updateChannelsData
  window.changeRoute = changeRoute
  window.linkToContent = linkToContent
  window.onRefreshToken = onRefreshToken
  window.addEventListener('keydown', doHandleKey)
  window.addEventListener('keyup', doHandleKeyUp)
  try {
    let modelGroup = ANDROMAN.getDeviceModelGroup()
    store.dispatch('general/setDeviceGroup', { 'deviceInfo': modelGroup })
    // Getaway = ANDROMAN.getGateway()
  } catch (err) {
    console.error('ERROR Get Device Group: ' + err)
  }
}

export const getMac = function () {
  return ANDROMAN.getMac()
}

export const getMacNew = function () {
  let mac
  try {
    if (isItWifi() === true) {
      mac = ANDROMAN.getMACNewWIFI()
    } else {
      mac = ANDROMAN.getMACNew()
    }
    // Getaway = ANDROMAN.getGateway()
  } catch (err) {
    console.error('ERROR gatGeteway: ' + err)
  }
  return mac
}

export const getSerial = function () {
  return ANDROMAN.getSerial()
}

export const getType = function () {
  return 'atv'
}

// Android TV ExoPlayer
/* eslint-disable no-unused-vars */
function onResumePauseActivity (data) {
  try {
    const result = JSON.parse(data)
    console.log('on Resume Pause Result ' + result)
    store.dispatch('general/onResumePauseActivity', result)
  } catch (err) {
    console.error('ERROR onResumePauseActivity: ' + err)
  }
  // streamVideo()
}

/* eslint-disable no-unused-vars */
function onNativeKeyUp (jsKey) {
  var key = KEY_MAP[jsKey]
  if (!key) {
    console.log('doHandleKeyUp in if: ' + jsKey)
    handleKey(jsKey, key)
  }
  try {
    if (clickQueue !== 1) {
      window.clearInterval(holdInterval)
      handleKey('HOLD_STOP') // 1000 is STOP_LONG (for web 76)
    }
    clickQueue = 0
  } catch (err) {
    window.clearInterval(holdInterval)
    console.error('ERROR gatGeteway: ' + err)
  }
}

/* eslint-disable no-unused-vars */
function onNativeKeyDown (jsKey) {
  try {
    var key = KEY_MAP[jsKey]
    if (key) {
      clickHandler(jsKey, key)
    }
  } catch (err) {
    console.error('ERROR gatGeteway: ' + err)
  }
}

/* eslint-disable no-unused-vars */
function onNetworkCheck (value) {
  try {
    const result = JSON.parse(value)
    if (!result) {
      networkChange(false)
    } else {
      networkChange(true)
    }
  } catch (err) {
    console.error('ERROR onNetworkCheck: ' + err)
  }
}

/* eslint-disable no-unused-vars */
function onPlayerStateChanged (event) {
  try {
    switch (event) {
      case 1:
        console.log('HAL player error event: ' + event)
        // store.dispatch('corePlayer/updateStatus', {
        //   streamId: null,
        //   status: STREAM_ERROR
        // })
        store.dispatch('corePlayer/setError', {
          streamId: localStreamId
        })
        break
      case 2:
        console.log('HAL player error event: ' + event)
        store.dispatch('corePlayer/setStopped', {
          streamId: localStreamId
        })
        break
      case 3:
        console.log('HAL player played event: ' + event)
        // store.dispatch('corePlayer/updateStatus', {
        //   streamId: null,
        //   status: STREAM_PLAYING
        // })
        store.dispatch('corePlayer/setPlaying', {
          streamId: localStreamId
        })
        break
      case 4:
        console.log('HAL player DVB event: ' + event)
        store.dispatch('corePlayer/setStopped', { // dodato za DVB stream kada ne moze da pusti - dodati i poruku "No signal"
          streamId: localStreamId
        })
        break
      default:
        console.log('player unknown event')
        break
    }
  } catch (err) {
    console.error('ERROR onPlayerStateChanged: ' + err)
  }
}

function onBitrateChanged (bitrate) {
  console.log('HAL ANDROID onBitrateChanged: ' + bitrate)
  // try {
  //   store.dispatch('corePlayer/updateBitrate', {
  //     streamId: null,
  //     bitrate: bitrate
  //   })
  // } catch (err) {
  //   console.error('ERROR onBitrateChanged: ' + err)
  // }
}

function changeRoute (routeName) {
  redirectToRoute({ routeName })
}

function onRefreshToken () {
  if (!store.state.auth.refreshingToken) {
    store.dispatch('auth/refreshToken')
  }
}

function linkToContent (type, params) {
  if (!params) return
  if (type === 'VOD' && params.id) {
    redirectToRoute({ routeName: 'VodDetail', eventId: params.id })
  } else if ((type === 'EVENT' || type === 'CHANNEL') && params.id && params.channelId) {
    redirectToRoute({ routeName: 'EventDetail', eventId: params.id, channelId: params.channelId })
  }
}

export const play = function () { // TODO: Method may be unneeded ???
  try {
    return ANDROMAN.play()
  } catch (err) {
    console.error('ERROR play: ' + err)
  }
}

export const pauseStream = function () {
  try {
    return ANDROMAN.pause()
  } catch (err) {
    console.error('ERROR pauseStream: ' + err)
  }
}
export const resumeVideoVOD = () => {
  try {
    return ANDROMAN.resume()
  } catch (err) {
    console.error('ERROR resumeVideoVOD: ' + err)
  }
}
export const stop = function () {
  try {
    return ANDROMAN.stop()
  } catch (err) {
    console.error('ERROR stop: ' + err)
  }
  // player.stop()
}

export const skip = function (data) {
  console.log('skip', data)
  try {
    return ANDROMAN.skipFiveSeconds(data)
  } catch (err) {
    console.error('ERROR skip: ' + err)
  }
}

export const returnVideoData = function () {
  try {
    let videoData = ANDROMAN.returnVideoData()
    console.log('Return Video Data', videoData)
    return videoData
  } catch (err) {
    console.error('ERROR returnVideoData: ' + err)
  }
}

export const timeTravelVOD = function ({ startTime }) {
  try {
    ANDROMAN.seekTo(startTime)
  } catch (e) {
    console.log('timeTravelVOD error detected', e)
  }
}

export const streamVODVideo = function ({url, streamId, startTime, originalNetworkId, streamIdDvb, serviceId}) {
  if (url) {
    startTime = startTime || 0

    try {
      localStreamId = streamId
      ANDROMAN.playStream(url, 'stream_vod', startTime, originalNetworkId, streamIdDvb, serviceId)
    } catch (e) {
      console.log('streamVODVideo error detected', e)
    }
  }
}

const playerInfoDataStaticSTB = {
  id: 0,
  castId: null,
  friendlyName: 'android_tv',
  clear: {
    https: true,
    playerType: 'viblast',
    vodPlayerType: 'viblast',
    radioPlayerType: 'viblast',
    radioCbrStreamingProtocol: 'm3u8',
    radioAbrStreamingProtocol: 'm3u8',
    liveCbrStreamingProtocol: 'dash',
    liveAbrStreamingProtocol: 'dash',
    cutvCbrStreamingProtocol: 'dash',
    cutvAbrStreamingProtocol: 'dash',
    vodCbrStreamingProtocol: 'dashv',
    vodAbrStreamingProtocol: 'dashv'
  },
  drm: {
    https: true,
    playerType: 'viblast',
    vopPlayerType: 'viblast',
    radioPlayerType: 'viblast',
    radioCbrStreamingProtocol: 'dashcenc',
    radioAbrStreamingProtocol: 'dashcenc',
    liveCbrStreamingProtocol: 'dashcenc',
    liveAbrStreamingProtocol: 'dashcenc',
    cutvCbrStreamingProtocol: 'dashcenc',
    cutvAbrStreamingProtocol: 'dashcenc',
    vodCbrStreamingProtocol: 'dashvcenc',
    vodAbrStreamingProtocol: 'dashvcenc'
  },
  viblastLicenseKey: null
}

const playerInfoDataStaticAndroidTV = {
  id: 0,
  castId: null,
  friendlyName: 'android_tv',
  clear: {
    https: true,
    playerType: 'viblast',
    vopPlayerType: 'viblast',
    radioPlayerType: 'viblast',
    radioCbrStreamingProtocol: 'm3u8',
    radioAbrStreamingProtocol: 'm3u8',
    liveCbrStreamingProtocol: 'm3u8',
    liveAbrStreamingProtocol: 'm3u8',
    cutvCbrStreamingProtocol: 'm3u8',
    cutvAbrStreamingProtocol: 'm3u8',
    vodCbrStreamingProtocol: 'm3u8v',
    vodAbrStreamingProtocol: 'm3u8v'
  },
  drm: {
    https: true,
    playerType: 'viblast',
    vodPlayerType: 'viblast',
    radioPlayerType: 'viblast',
    radioCbrStreamingProtocol: 'dashcenc',
    radioAbrStreamingProtocol: 'dashcenc',
    liveCbrStreamingProtocol: 'dashcenc',
    liveAbrStreamingProtocol: 'dashcenc',
    cutvCbrStreamingProtocol: 'dashcenc',
    cutvAbrStreamingProtocol: 'dashcenc',
    vodCbrStreamingProtocol: 'dashvcenc',
    vodAbrStreamingProtocol: 'dashvcenc'
  },
  viblastLicenseKey: null
}

export const getPlayerInfoStatic = function () {
  return stbMode ? playerInfoDataStaticSTB : playerInfoDataStaticAndroidTV
}

export const streamVideo = function ({url, streamId, streamType, startTime, originalNetworkId, streamIdDvb, serviceId}) {
  try {
    var mediaUrl = null
    var engineStarter = ''

    if (streamType) {
      console.log('HAL ----- ', streamType)
      switch (streamType) {
        case 'm3u8':
          engineStarter = 'stream_hls'
          break
        case 'radio':
          engineStarter = 'stream_radio'
          break
        case 'm3u8v':
          engineStarter = 'stream_vod'
          break
        case 'dvb':
          engineStarter = 'stream_dvb'
          break
        default:
          engineStarter = 'stream_dash'
      }
    }
    if (url) {
      console.log('This is video url: ', url)
      mediaUrl = url
      if (mediaUrl.includes('stream=av96')) engineStarter = 'stream_radio'
    }
    if (mediaUrl) {
      try {
        localStreamId = streamId
        ANDROMAN.playStream(mediaUrl, engineStarter, 0, originalNetworkId, streamIdDvb, serviceId)
      } catch (err) {
        console.log('HAL PlayVideo error detected')
      }
    }
  } catch (err) {
    console.error('ERROR returnVideoData: ' + err)
  }
}
export const streamAudio = ({url, streamId, streamType, startTime, originalNetworkId, streamIdDvb, serviceId}) => {
  var mediaUrl
  console.log('this is play radio player state = ')
  try {
    localStreamId = streamId
    ANDROMAN.playStream(url, 'stream_radio', 0, originalNetworkId, streamIdDvb, serviceId)
  } catch (err) {
    console.log('HAL Play Audio error detected')
  }
}

export const save = function (varName, value) {
  try {
    ANDROMAN.store(varName, value)
    if (varName === 'accessObj') {
      onAuthenticated()
    }
  } catch (err) {
    console.log('ERROR store value' + varName)
    localStorage.setItem(varName, value)
  }
}

export const load = function (varName) {
  var finalVal = null

  try {
    finalVal = ANDROMAN.load(varName)
  } catch (err) {
    console.log('ERORR load: ' + varName)
    finalVal = localStorage.getItem(varName)
  }

  return finalVal
}

export const onAuthenticated = () => {
  try {
    ANDROMAN.onAuthenticated()
  } catch (error) {
    console.log('Error ANDROMAN.onAuthenticated not found')
  }
}

export const remove = function (varName) {
  try {
    ANDROMAN.remove(varName)
  } catch (err) {
    console.log('ERORR load: ' + varName)
  }

  try {
    localStorage.removeItem(varName)
  } catch (err) {
    console.log('ERORR remove: ' + err)
  }
}

export const hasInternet = function () {
  let hasInternet
  try {
    hasInternet = ANDROMAN.hasInternet()
  } catch (err) {
    console.error('ERROR has Internet: ' + err)
  }
  return JSON.parse(hasInternet)
}

export const exitApp = () => {
  try {
    ANDROMAN.exitApp()
  } catch (err) {
    console.log('HAL Exit App error detected')
  }
}

export const checkDevice = () => {
  let shouldRemoveVideo = false
  // SONYANDROIDTV2015, PHTV15AMT0
  const deviceGroup = store.getters['general/getDeviceGroup']
  console.log('Device Group' + deviceGroup)
  for (var i = 0, len = constModelsToHideVideo.length; i < len; i++) {
    if (deviceGroup.indexOf(constModelsToHideVideo[i]) > -1) shouldRemoveVideo = true
  }
  console.log('should Remove Video ' + shouldRemoveVideo)
  return shouldRemoveVideo
}

let displayDisclaimer

export const getDisplayDisclaimer = () => {
  if (displayDisclaimer !== undefined) {
    return displayDisclaimer
  }
  try {
    if (ANDROMAN.getDeviceType() === DEVICE_TYPE_STB) {
      displayDisclaimer = false
      return displayDisclaimer
    }
  } catch (e) {
    console.error('ANDROMAN fail to get getDeviceType() ' + e)
  }
  let localdisplayDisclaimer = true
  // SONYANDROIDTV2015, PHTV15AMT0
  const deviceGroup = store.getters['general/getDeviceGroup']
  console.log('Device Group' + deviceGroup)
  for (var i = 0, len = constModelsWithoutDisclaimer.length; i < len; i++) {
    if (deviceGroup.indexOf(constModelsWithoutDisclaimer[i]) > -1) localdisplayDisclaimer = false
  }
  console.log('displayDisclaimer' + localdisplayDisclaimer)
  displayDisclaimer = localdisplayDisclaimer
  return displayDisclaimer
}

export const onEnterExitZap = (value) => { // value: true/false (hide/show)
  try {
    if (checkDevice()) ANDROMAN.onEnterExitZap(value)
  } catch (err) {
    console.log('HAL onEnterExitZap')
  }
}
// @TODO: brisi molim te
// popravi @TODO
export const appLoaded = () => { // value: true/false (hide/show)
  try {
    if (!checkDevice()) ANDROMAN.appLoaded(false)
  } catch (err) {
    console.log('HAL appLoaded')
  }
}

const oldLog = console.log

console.log = (param1, param2) => {
  oldLog(param1 + (param2 ? ' : ' + param2 : ''))
}

export const getProvisioningMode = () => {
  return stbMode ? PROVISIONING_TYPE_SERIAL : PROVISIONING_TYPE_OTP
}

export const setProvisoningDone = (mode) => {
  try {
    console.log('HAL PROVISIONG DONE')
    ANDROMAN.provisioningDone(mode)
  } catch (err) {
    console.log('HAL Exit App error detected')
  }
}
