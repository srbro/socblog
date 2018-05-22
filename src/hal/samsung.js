/* global webapis tizen localStorage */
import store from 'src/vuex/store'
import { handleKey } from '../KeyHandler.js'
import { fetchNetworkInfo } from 'src/helpers/api' // trebace za info za network
// import { loc } from 'helpers/localization' // Localization function
import { pause as pauseHelper, resume as resumeHelper } from 'helpers/player' // Localization function
// import router from 'src/router'
import { networkChange } from 'helpers/network'
import { PLATFORM, KEY_MAP } from './consts/constsSamsung.js'
import { PROVISIONING_TYPE_OTP } from 'helpers/consts.js'

import ver from 'version'

let localStreamId = 0

var usedKeys = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'ChannelDown',
  'ChannelUp',
  'ColorF0Red',
  'ColorF1Green',
  'ColorF2Yellow',
  'ColorF3Blue',
  'MediaFastForward',
  'MediaPause',
  'MediaPlay',
  'MediaPlayPause',
  'MediaRewind',
  'MediaStop',
  'MediaTrackNext',
  'MediaTrackPrevious',
  'Exit',
  'Guide'
]
var webapisNetwork = null
var webapisProductInfo = null
var player = null
var networkType = 'ETHERNET'

// Playing stream types on this platform
export const supportStreamTypes = {CBR: 'm3u8', ABR: 'm3u8'}
export const supportOperationMode = {DVB: 'hybrid', OTT: 'ott'}

export const config = {
  resolution: ['1px', '0.66666px']
}

function doHandleKey (event) {
  event.preventDefault()
  // console.log('Do Handle Key' + JSON.stringify(event))
  // console.log('HAL Key pressed: ' + event.keyCode)
  // console.log('HAL Key pressed: ' + keyMap[event.keyCode])
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
  // console.log('Do Handle Key Up', keyMap[event.keyCode], event)
  try {
    if (clickQueue !== 1) {
      // console.log('press HOLD_STOP')
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
      handleKey(event)
    }
    if (clickQueue === 2 && ((keyCode >= 37 && keyCode <= 40) || (keyCode === 33 || keyCode === 34) || (keyCode === 412 || keyCode === 417))) { // || keyCode === 176 || keyCode === 177
      window.clearInterval(holdInterval)
      holdInterval = window.setInterval(() => handleKey(event + '_HOLD'), 25) // plus 1000 for custom LONG events
    }
  } catch (err) {
    console.error('ERROR gatGeteway: ' + err)
  }
}

function registerKeys () {
  usedKeys.forEach(
    function (keyName) {
      tizen.tvinputdevice.registerKey(keyName)
    }
  )
}

export const test = function () {
  console.log('HAL this is samsung hal')
}
export const load = function (varName) {
  try {
    if (localStorage.getItem(varName)) {
      return localStorage.getItem(varName)
    } else {
      return null
    }
  } catch (e) {
    console.log(`HAL ERROR: ${e} msg: ${e.message}`)
  }
}

export const save = function (varName, value) {
  localStorage.setItem(varName, value)
}

export const remove = function (varName) {
  localStorage.removeItem(varName)
}

export const onAuthenticated = () => {
  // placeholder this method is for androidtv
}

// let initPlayer

// function introVideoEnded () {
//   if (router.currentRoute.name === 'Loading') {
//     initPlayer.style.zIndex = '20'
//     setTimeout(function () {
//       introVideoEnded()
//     }, 500)
//     return false
//   }
//   initPlayer.removeEventListener('ended', introVideoEnded, false)
//   initPlayer.parentNode.removeChild(initPlayer)
//   initPlayer = false
// }
// function introVideoLoadedData () {
//   // initPlayer.load()
//   // initPlayer.play()
//   initPlayer.removeEventListener('loadeddata', introVideoLoadedData, false)
// }

export const initHal = function () {
  // console.log('HAL Samsung init')
  // initPlayer = document.getElementById('intro-video')
  // initPlayer.addEventListener('loadeddata', introVideoLoadedData, false)
  // initPlayer.addEventListener('ended', introVideoEnded, false)
  try {
    webapisNetwork = webapis.network
    player = webapis.avplay
  } catch (err) {
    console.log('ERROR: ' + err)
  }

  try {
    webapisProductInfo = webapis.productinfo
  } catch (err) {
    console.log('ERROR: ' + err)
  }
  registerKeys()
  addVisibilitychange()
  getActiveConnectionType()
  window.addEventListener('keydown', doHandleKey)
  window.addEventListener('keyup', doHandleKeyUp)
}

export const getMac = function () {
  var macAddr = load('macAddress')
  if (!macAddr && webapisNetwork) {
    macAddr = webapisNetwork.getMac()
    save('macAddress', macAddr)
    console.log('mac address: ' + macAddr)
  }
  return macAddr
}

export const getMacNew = function () {
  var macAddr = load('macAddress')
  if (!macAddr && webapisNetwork) {
    macAddr = webapisNetwork.getMac()
    save('macAddress', macAddr)
    console.log('mac address: ' + macAddr)
  }
  return macAddr
}

export const getSerial = function () {
  var serial
  if (webapisProductInfo) {
    serial = webapisProductInfo.getDuid()
    console.log('serial:' + serial)
  }
  return serial
}
export const getDeviceType = function () {
  const userAgent = navigator.userAgent
  const tizen2018 = 'Tizen 4.0'
  const tizen2017 = 'Tizen 3.0'
  const tizen2016 = 'Tizen 2.4'
  const tizen2015 = 'Tizen 2.3'
  if (userAgent.indexOf(tizen2018) > -1) {
    return 'samsung_tizen_4'
  } else if (userAgent.indexOf(tizen2017) > -1) {
    return 'samsung_tizen_3'
  } else if (userAgent.indexOf(tizen2016) > -1) {
    return 'samsung_tizen_2'
  } else if (userAgent.indexOf(tizen2015) > -1) {
    return 'samsung_tizen_1'
  } else {
    return 'samsung_tizen_xx'
  }
}
export const getDeviceName = function () {
  const userAgent = navigator.userAgent
  const tizen2018 = 'Tizen 4.0'
  const tizen2017 = 'Tizen 3.0'
  const tizen2016 = 'Tizen 2.4'
  const tizen2015 = 'Tizen 2.3'
  if (userAgent.indexOf(tizen2018) > -1) {
    return 'Samsung Tizen 2018'
  } else if (userAgent.indexOf(tizen2017) > -1) {
    return 'Samsung Tizen 2017'
  } else if (userAgent.indexOf(tizen2016) > -1) {
    return 'Samsung Tizen 2016'
  } else if (userAgent.indexOf(tizen2015) > -1) {
    return 'Samsung Tizen 2015'
  } else {
    return 'Samsung Tizen XX'
  }
}
export const getPlatform = function () {
  return PLATFORM
}

export const getType = function () {
  return 'sam'
}

export const getDeviceId = function () {
  return load('deviceNumber')
}

export const getDeviceModel = function () {
  var tvModel
  try {
    tvModel = webapis.productinfo.getRealModel()
    console.log(' ModelName value = ' + tvModel)
  } catch (error) {
    console.log(' error code = ' + error.code)
  }
  return tvModel
}

export const sendChannelData = function (tvChannelList, radioChannelList) {

}

export const getSDKVersion = function () {
  return '001'
}

export const getReleaseVersion = function () {
  return '002'
}

export const getWrapperVersion = function () { // get wrapper version from js interface
  return '003'
}

export const getDeviceManufacturer = function () {
  return 'SAMSUNG'
}

export const getDeviceDetail = function () {
  return {
    'deviceName': getDeviceName(),
    'deviceType': getDeviceType(),
    'mac': getMac(),
    'modelName': getDeviceModel(),
    'platform': getPlatform(),
    'serial': getSerial(),
    'clientSwVersion': `${ver.major}.${ver.minor}.${ver.patch}`,
    'clientSwBuild': '1',
    'systemSwVersion': {
      'name': 'Samsung',
      'version': '6.0.123'
    }
  }
}

export const getUserPublicIp = async function () {
  let userPublicIP = 'UNKNOWN'
  try {
    // var probam
    let serverURL = 'https://api.ug.cdn.united.cloud/v1/servers' // ovo mozda moze da se optimizuje, kada bude poznata logika za servere
    let request = await fetchNetworkInfo(serverURL)
    let userPublicIP = request
    // return request.data.ip
    console.log('Network: ', userPublicIP)
    console.log('req ', request)
    return request.data
  } catch (err) {
    console.error('ERROR Network: ' + err)
  }
  return userPublicIP
}

export const getUserLocalIP = function () { // za dobijanje lokalne IP adrese
  var localIP
  try {
    localIP = webapisNetwork.getIp()
    console.log(' localIP = ' + localIP)
  } catch (error) {
    console.log(' error code = ' + error.code)
  }
  return localIP
}

function getIpAddressSetting () {
  var IpAddressSetting
  try {
    IpAddressSetting = webapisNetwork.getIpMode()
    console.log(' localIP = ' + IpAddressSetting)
  } catch (error) {
    console.log(' error code = ' + error.code)
  }
  return IpAddressSetting
}

export const setIpAddressSetting = function () {
  let IpAddressSettingLoc = getIpAddressSetting()
  switch (IpAddressSettingLoc) {
    case 0:
      IpAddressSettingLoc = 'NONE'
      break
    case 1:
      IpAddressSettingLoc = 'STATIC'
      break
    case 2:
      IpAddressSettingLoc = 'DYNAMIC'
      break
    case 3:
      IpAddressSettingLoc = 'AUTO'
      break
    case 4:
      IpAddressSettingLoc = 'FIXED'
      break
    case 5:
      IpAddressSettingLoc = 'UNKNOWN'
      break
  }
  return IpAddressSettingLoc
}

export const getNetworkType = function () {
  store.dispatch('networking/updateNetworkType', networkType)
  return networkType
}
function getActiveConnectionType () {
  var retVal = null
  try {
    retVal = webapis.network.getActiveConnectionType()
  } catch (e) {
    // console.error('getActiveConnectionType exception [' + e.code + '] message: ' + e.message + ' / the returned data: ' + webapis.network.getdata())
  }

  switch (retVal) {
    case webapis.network.NetworkActiveConnectionType.DISCONNECTED:
      networkType = 'DISCONNECTED'
      break
    case webapis.network.NetworkActiveConnectionType.WIFI:
      networkType = 'WI_FI'
      break
    case webapis.network.NetworkActiveConnectionType.CELLULAR:
      networkType = 'MOBILE'
      break
    case webapis.network.NetworkActiveConnectionType.ETHERNET:
      networkType = 'ETHERNET'
      break
    default:
      networkType = 'ETHERNET'
  }
  // console.log('[getActiveConnectionType] Active Connection Type: ' + networkType)
}
export const getSubnetMask = function () { // za dobijanje SubnetMask
  let SubnetMask
  try {
    SubnetMask = webapisNetwork.getSubnetMask()
    console.log(' getSubnetMask = ' + SubnetMask)
  } catch (error) {
    console.log(' error code = ' + error.code)
  }
  return SubnetMask
}

export const getPrimaryDNS = function () {
  let PrimaryDNS
  try {
    PrimaryDNS = webapisNetwork.getDns() // za dobijanje primarnog DNS-a
    console.log(' getSubnetMask = ' + PrimaryDNS)
  } catch (error) {
    console.log(' error code = ' + error.code)
  }
  return PrimaryDNS
}

export const getSecondaryDns = function () { // // za dobijanje sekundarnog DNS-a
  let SecondaryDns
  try {
    SecondaryDns = webapisNetwork.getSecondaryDns()
    console.log(' getSubnetMask = ' + SecondaryDns)
  } catch (error) {
    console.log(' error code = ' + error.code)
  }
  return SecondaryDns
}

export const getGateway = function () { // // za dobijanje Gateway-a
  let Gateway
  try {
    Gateway = webapisNetwork.getGateway()
    console.log(' getSubnetMask = ' + Gateway)
  } catch (error) {
    console.log(' error code = ' + error.code)
  }
  return Gateway
}

export const isConnected = function () {
  let isConnected
  try {
    isConnected = webapisNetwork.isConnectedToGateway()
    console.log(' getSubnetMask = ' + isConnected)
  } catch (error) {
    console.log(' error code = ' + error.code)
  }
  return isConnected
}

export const internetAccess = function () {
  let internetAccess
  console.log('HAL internetAccess: isConnected() = ', isConnected())
  if (isConnected() === true) {
    internetAccess = 'OK'
  } else {
    internetAccess = 'NO ACCESS'
  }
  console.log('HAL : internetAccess = ', internetAccess)
  return internetAccess
}

// let isConnectedLocaly
export const internetAccessLocal = function () {
  let internetAccessLocal
  if (getUserLocalIP() !== '' || getUserLocalIP() !== undefined) {
    internetAccessLocal = 'OK'
  } else {
    internetAccessLocal = 'NO ACCESS'
  }
  console.log('HAL : internetAccessLocal = ', internetAccessLocal)
  return internetAccessLocal
}
function addVisibilitychange () {
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      // Something you want to do when an application is hidden.
      webapis.avplay.suspend()
      // pauseHelper()
      store.dispatch('general/onResumePauseActivity', false)
    } else {
      // Something you want to do when an application is resumed.
      // webapis.avplay.restore()
      // resumeHelper()
      store.dispatch('general/onResumePauseActivity', true)
    }
  })
}
webapis.network.addNetworkStateChangeListener(function (data) {
  if (data === 4) {
    // Something you want to do when network is connected again.
    // const previousNetworkState = store.getters['popup/getActiveState'
    networkChange(true)
    resumeHelper()
  } else if (data === 5) {
    // Something you want to do when network is disconnected.
    networkChange(false)
    pauseHelper()
    // webapis.avplay.suspend()
  }
})

let streamType = ''
let streamCheckerId = -1
const streamChecker = function () {
  store.dispatch('corePlayer/setError', {
    streamId: localStreamId
  })
}

const listener = {
  onbufferingstart: function () {
    console.log('Buffering start.')
    clearTimeout(streamCheckerId)
  },
  onbufferingprogress: function (percent) {
    console.log('Buffering progress data : ' + percent)
  },
  onbufferingcomplete: function () {
    console.log('Buffering complete.')
    clearTimeout(streamCheckerId)
    store.dispatch('corePlayer/setPlaying', {
      streamId: localStreamId
    })
  },
  oncurrentplaytime: function (currentTime) {
    console.log('Current playtime: ' + currentTime)
  },
  onevent: function (eventType, eventData) {
    console.log('event type: ' + eventType + ', data: ' + eventData)
  },
  ondrmevent: function (drmEvent, drmData) {
    console.log('LISTENER: DRM callback: ' + drmEvent)
  },
  onstreamcompleted: function () {
    console.log('Stream Completed')
    // store.dispatch('corePlayer/setStopped', {
    //   streamId: localStreamId
    // })
    console.warn(streamType)
    if (streamType === 'dash') {
      store.dispatch('corePlayer/setError', {
        streamId: localStreamId
      })
    } else {
      store.dispatch('corePlayer/setStopped', {
        streamId: localStreamId
      })
    }
    player.stop()
  },
  onerror: function (eventType) {
    console.log('event type error : ' + eventType)
    store.dispatch('corePlayer/setError', {
      streamId: localStreamId
    })
  }
}

var playerInfoDataStatic = {
  id: 0,
  castId: null,
  friendlyName: 'samsung_tizen',
  clear: {
    https: true,
    playerType: 'native',
    vodPlayerType: 'native',
    radioPlayerType: 'native',
    radioCbrStreamingProtocol: 'm3u8',
    radioAbrStreamingProtocol: 'm3u8',
    liveCbrStreamingProtocol: 'm3u8',
    liveAbrStreamingProtocol: 'm3u8',
    cutvCbrStreamingProtocol: 'm3u8',
    cutvAbrStreamingProtocol: 'm3u8',
    vodCbrStreamingProtocol: 'm3u8v', // trebalo bi hssv
    vodAbrStreamingProtocol: 'm3u8v' // trebalo bi hssv
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
    vodCbrStreamingProtocol: 'dashvcenc', // trebalo bi hssvcenc
    vodAbrStreamingProtocol: 'dashvcenc' // trebalo bi hssvcenc
  },
  viblastLicenseKey: null
}

export const getPlayerInfoStatic = function () {
  return playerInfoDataStatic
}
export const streamVideo = function ({url, streamType, streamId}) {
  // streamVODVideo ({
  //   url: getRandomVODStreamUrl(),
  //   streamId: Date.now(),
  //   startTime: getRandomVODStartTime()
  // })

  // if (streamVODVideo) { return }
  // if (initPlayer) {
  //   setTimeout(function () {
  //     streamVideo(confObj)
  //   }, 50)
  //   return false
  // }
  var mediaUrl = null
  var engineStarter = ''

  // // webapis.appcommon.setScreenSaver(0)
  // function onsuccess (data) {
  //   console.log('setScreensavervalue = ' + data)
  // }

  // function onerror (error) {
  //   console.log('error code : ', error, error.code)
  // }

  try {
    // var value = webapis.appcommon.setScreenSaver(0, onsuccess, onerror)
    webapis.appcommon.setScreenSaver(0)
    // console.log(' screen saveer value = ' + value)
  } catch (error) {
    console.log(' error code = ', error, error.code)
  }
  if (player.getState() !== 'NONE') {
    player.stop()
  }

  if (streamType) {
    switch (streamType) {
      case 'm3u8':
        engineStarter = '&adaptive=false&fake=.m3u8' // TODO Vidi sta je sa ovim adaptive FALSE
        break
      case 'dash':
        engineStarter = '&fake=.mpd'
        break
      default:
        engineStarter = ''
    }
  }

  if (url) {
    mediaUrl = url + engineStarter
  }

  if (mediaUrl) {
    player.open(mediaUrl)
    var bitrate = 7000000
    var buffTime = 1.2
    var bufferSize = (bitrate / 8.0) * buffTime
    if (streamType === 'm3u8') {
      try {
        webapis.avplay.setStreamingProperty('ADAPTIVE_INFO', '|STARTBITRATE=HIGHEST')
        // webapis.avplay.setBufferingParam('PLAYER_BUFFER_FOR_PLAY', 'PLAYER_BUFFER_SIZE_IN_SECOND', 6);
        // webapis.avplay.setBufferingParam('PLAYER_BUFFER_FOR_RESUME', 'PLAYER_BUFFER_SIZE_IN_SECOND', 6);
        webapis.avplay.setBufferingParam('PLAYER_BUFFER_FOR_PLAY', 'PLAYER_BUFFER_SIZE_IN_BYTE', bufferSize)
        webapis.avplay.setBufferingParam('PLAYER_BUFFER_FOR_RESUME', 'PLAYER_BUFFER_SIZE_IN_BYTE', bufferSize)
        // log('Buffer size configured to ' + bufferSize + ' bytes.');
      } catch (exception) {
        console.log('Exception raised during params configuration: %o', exception)
      }

      try {
        webapis.avplay.setTimeoutForBuffering(1)
      } catch (exception) {
        console.log('Exception raised during timeout configuration: %o', exception)
      }
    } else if (streamType === 'http' || streamType === 'dash') {
      if (webapis.avplay.setTimeoutForBuffering) {
        webapis.avplay.setTimeoutForBuffering(1)
      }
      webapis.avplay.setBufferingParam('PLAYER_BUFFER_FOR_PLAY', 'PLAYER_BUFFER_SIZE_IN_SECOND', 1)
      webapis.avplay.setBufferingParam('PLAYER_BUFFER_FOR_RESUME', 'PLAYER_BUFFER_SIZE_IN_SECOND', 1)
    }
    player.setListener(listener)
    player.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN')
    localStreamId = streamId
    clearTimeout(streamCheckerId)
    streamCheckerId = setTimeout(streamChecker, 5000)
    player.prepareAsync(function () {
      player.setDisplayRect(0, 0, 1920, 1080)
      try {
        player.play()
      } catch (err) {
        console.log('HAL PlayVideo error detected')
      }
    }, function (e) {
      console.log('player error')
    })
  }
}
/**
* Function will play VOD video.
*
* @param {string} - url - Vod stream url.
* @param {number/string} - streamId - Id which to detect stream by.
* @param {number} - startTime - Relative time-point(in seconds) from beginning of stream to start stream-play from.
*/
export const streamVODVideo = function ({url, streamType, streamId, startTime}) {
  startTime = startTime || 0

  try {
    webapis.appcommon.setScreenSaver(0)
  } catch (error) {
    console.log(' error code = ', error, error.code)
  }
  if (player.getState() !== 'NONE') {
    player.stop()
  }
  localStreamId = streamId
  player.open(url)

  // var bitrate = 7000000
  // var buffTime = 1.2
  // var bufferSize = (bitrate / 8.0) * buffTime

  if (webapis.avplay.setTimeoutForBuffering) {
    webapis.avplay.setTimeoutForBuffering(1)
  }

  webapis.avplay.setBufferingParam('PLAYER_BUFFER_FOR_PLAY', 'PLAYER_BUFFER_SIZE_IN_SECOND', 1)
  webapis.avplay.setBufferingParam('PLAYER_BUFFER_FOR_RESUME', 'PLAYER_BUFFER_SIZE_IN_SECOND', 1)
  webapis.avplay.setStreamingProperty('ADAPTIVE_INFO', '|STARTBITRATE=HIGHEST')

  player.setListener(listener)

  player.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN')
  clearTimeout(streamCheckerId)
  streamCheckerId = setTimeout(streamChecker, 5000)
  player.prepareAsync(function () {
    player.setDisplayRect(0, 0, 1920, 1080)
    player.seekTo(startTime,
      function () {
        console.log('Media seek successful')
      },
      function () {
        console.log('Media seek failed')
      })
    try {
      player.play()
    } catch (err) {
      console.log('HAL PlayVideo error detected')
    }
  }, function (e) {
    console.log('player error')
  })
}

export const timeTravelVOD = function ({ startTime }) {
  startTime = startTime || 0
  player.seekTo(startTime,
    function () {
      console.log('Media time-travel successful')
    },
    function () {
      console.log('Media time-travel failed')
    })
}

export const streamAudio = ({url, streamType, streamId}) => {
  var mediaUrl
  try {
    // var value = webapis.appcommon.setScreenSaver(0, onsuccess, onerror)
    webapis.appcommon.setScreenSaver(0)
    // console.log(' screen saveer value = ' + value)
  } catch (error) {
    console.log(' error code = ', error, error.code)
  }
  console.log('this is play radio player state = ' + player.getState())
  var engineStarter = ''
  if (streamType) {
    switch (streamType) {
      case 'm3u8':
        engineStarter = 'fake=.m3u8' // TODO Vidi sta je sa ovim adaptive FALSE
        break
      case 'dash':
        engineStarter = '&fake=.mpd'
        break
      default:
        engineStarter = ''
    }
  }
  if (url) {
    mediaUrl = url + engineStarter
  }
  if (player.getState() === 'IDLE' || player.getState() === 'PLAYING' || player.getState() === 'PAUSED') {
    player.close()
  }
  localStreamId = streamId
  player.open(mediaUrl)
  player.setListener(listener)
  player.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN')
  if (webapis.avplay.setTimeoutForBuffering) {
    webapis.avplay.setTimeoutForBuffering(1)
  }
  player.prepareAsync(function () {
    player.setDisplayRect(0, 0, 1920, 1080)
    player.play()
  }, function (e) {
    console.log('Hal playAudio error ' + e)
  })
}

export const stop = function () {
  player.stop()
}
export const pauseStream = function () {
  player.pause()
}

export const resumeVideoVOD = () => {
  player.play()
}

export const exitApp = () => {
  var app
  app = tizen.application.getCurrentApplication()
  // app.hide()
  app.exit()
}

export const onEnterExitZap = (value) => { // value: true/false (hide/show)
  console.log('onEnterExitZap: ' + value)
}

export const getDisplayDisclaimer = () => {
  return false
}

export const appLoaded = (value) => {
  console.log('HAL appLoaded')
}

export const getProvisioningMode = () => {
  return PROVISIONING_TYPE_OTP
}

export const setProvisoningDone = () => {
  console.log('HAL PROVISIONG DONE')
}
