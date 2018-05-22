/* global  localStorage */
import os from 'os'
import store from 'src/vuex/store'
import privateConfig from '../../config/private.json'
import { handleKey } from '../KeyHandler.js'
import { fetchNetworkInfo } from 'src/helpers/api'
import mkLock from 'src/helpers/stallLock'
import { PLATFORM, KEY_MAP } from './consts/constsWeb.js'
import { PROVISIONING_TYPE_OTP } from 'helpers/consts.js'
// import { STREAM_PLAYING, STREAM_ERROR } from 'helpers/player/playerConst'

let localStreamId = 0

// Playing stream types on this platform
export const supportStreamTypes = {CBR: 'm3u8', ABR: 'm3u8'}
export const supportOperationMode = {DVB: 'hybrid', OTT: 'ott'}

export const getDeviceId = function () {
  return load('deviceNumber')
}

export const getDeviceModel = function () {
  return 'Test'
  // return navigator.appCodeName
}

export const config = {
  resolution: ['1px', '0.66666px']
}

var player = null

// var holdKeyInterval = null
// var stopHoldInterval = null
// var keyController = 0
// var time = 0
// var nextTime = 0

// new

// function prettyAnimation (key, event) {
//   var d = new Date()
//   console.log('pretty animation ', key, keyController)
//   if (keyController === 0) time = d.getTime()
//   if (keyController > 0) nextTime = d.getTime()
//   keyController++
//   console.log('TIMES', time, nextTime, nextTime - time, keyController)
//   // console.log('keyController', keyController)
//   if (keyController === 1) {
//     handleKey(keyMap[key])
//     console.log('else press', keyMap[key])
//     setTimeout(() => {
//       console.log('before press', keyController, nextTime - time)
//       if (keyController > 1) {
//         handleKey(keyMap[key] + '_HOLD')
//         console.log('press ', keyMap[key] + '_HOLD')
//       }
//     }, 250)
//   }
//   if (keyController === 2) handleKey(keyMap[key])
//   if (nextTime > 0 && nextTime - time < 700) {
//     clearTimeout(stopHoldInterval)
//     stopHoldInterval = setTimeout(() => {
//       console.log('press HOLD_STOP')
//       keyController = 0
//       handleKey('HOLD_STOP')
//     }, 300)
//   }
//   if (nextTime > 0 && nextTime - time > 700) keyController = 0
//   if (event.repeat) handleKey(keyMap[key] + '_HOLD')
//   time = nextTime
// }
var clickQueue = 0
var holdInterval = null

function doHandleKey (event) {
  // console.log('Do Handle Key', event)
  // console.log('HAL Key pressed: ' + keyMap[event.keyCode])
  var key = KEY_MAP[event.keyCode]
  clickHandler(event.keyCode, key)

  if (key === '0') {
    store.dispatch('corePlayer/setError', {
      streamId: localStreamId
    })
  }
  // switch (event.keyCode) {
  //   case 38: // 'UP',
  //   case 40: // 'DOWN',
  //   case 39: // 'RIGHT',
  //   case 37: // 'LEFT',
  //     // prettyAnimation(event.keyCode, event)
  //     clickHandler(event.keyCode, key)
  //     break
  //   default:
  //     handleKey(key)
  //     break
  // }
}

let mouseWheelLock = mkLock()

function handleWheel (event) {
  if (!mouseWheelLock.key) {
    mouseWheelLock.lock()
    mouseWheelLock.delayedUnlock(200)

    if (event.deltaY === 0) {
      handleKey(event.deltaX > 0 ? 'RIGHT' : 'LEFT')
    } else if (event.deltaX === 0) {
      handleKey(event.deltaY > 0 ? 'DOWN' : 'UP')
    }
  }
}

function doHandleKeyUp (event) {
  if (clickQueue !== 1) {
    window.clearInterval(holdInterval)
    handleKey('HOLD_STOP') // 1000 is STOP_LONG (for web 76)
  }
  clickQueue = 0
}

function clickHandler (keyCode, event) {
  try {
    clickQueue++
    if (clickQueue === 1) {
      handleKey(event)
    }
    if (clickQueue === 2 && ((keyCode >= 37 && keyCode <= 40) || (keyCode === 65 || keyCode === 68) || (keyCode === 33 || keyCode === 34))) { // || keyCode === 176 || keyCode === 177
      window.clearInterval(holdInterval)
      holdInterval = window.setInterval(() => handleKey(event + '_HOLD'), 25) // plus 1000 for custom LONG events
    }
  } catch (err) {
    console.error('ERROR key ' + keyCode + ' gatGeteway: ' + err)
  }
}

export const test = function () {
  console.log('HAL this is web hal')
}
export const getNetworkType = function () {
  store.dispatch('networking/updateNetworkType', 'ETHERNET')
  return 'ETHERNET'
}
// function createBitmovinPlayer () {
//   var conf = {
//     key: '6f03bdfa-ace1-4809-82b6-360c9b103d4c',
//     // source: {
//     //   dash: '//bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
//     //   hls: '//bitmovin-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8',
//     //   progressive: '//bitmovin-a.akamaihd.net/content/MI201109210084_1/MI201109210084_mpeg-4_hd_high_1080p25_10mbits.mp4',
//     //   poster: '//bitmovin-a.akamaihd.net/content/MI201109210084_1/poster.jpg'
//     // },
//     playback: {
//       autoplay: false
//     },
//     style: {
//       keyboard: false,
//       controls: false,
//       playOverlay: false,
//       mouse: false
//     },
//     skin: {
//       screenLogoImage: ''
//     },
//     events: {
//       // Temporary disable all stream events
//       // onReady: function (data) {
//       //   console.log('version: ' + this.getVersion() + ', onReady Event data: ', data)
//       // },
//       onPlay: function (data) {
//         store.dispatch('corePlayer/setPlaying', {localStreamId})
//       },
//       onPlaybackFinished: function (data) {
//         store.dispatch('corePlayer/setStopped', {localStreamId})
//       }
//       // onError: function (data) {
//       //   store.dispatch('corePlayer/setError', {localStreamId})
//       // }
//       // onSourceLoaded: function (data) {
//       //   console.error('on source loaded:', data)
//       // },
//       // onStartBuffering: function (data) {
//       //   console.error('An start buffer:', data)
//       // },
//       // onStopBuffering: function (data) {
//       //   console.error('An stop buffer:', data)
//       // },
//       // onWarning: function (data) {
//       //   console.error('An warning:', data)
//       // }
//     }
//   }

//   /* global bitmovin */
//   player = bitmovin.player('player')

//   player.setup(conf).then(function (value) {
//     // Success
//     console.log('Successfully created bitmovin player instance')
//   }, function (reason) {
//     // Error!
//     console.log('Error while creating bitmovin player instance')
//   })
//   // console.log(store)
//   // console.log(store.getters['general/getTimeOffset'])
//   store.dispatch('general/setTimeOffset', 222)
//   // console.log(store.getters['general/getTimeOffset'])
//   store.commit('general/UPDATE_TIME_OFFSET', 123)
//   // setTimeOffset(111)
//   // console.log(store.getters['general/getTimeOffset'])
// }

function createViblastPlayer () {
  // const config = {
  //   key: '43b60d98-82ea-4657-a0a6-bc4532c14b22',
  //   log: 'verbose',
  //   autoplay: true
  // }
  player = window.viblast('#player')
  window.player = player
  // window.viblast('#player').setup(config)
}

export const initHal = function () {
  console.log('HAL PC init')
  window.addEventListener('keydown', doHandleKey)
  window.addEventListener('keyup', doHandleKeyUp)
  window.addEventListener('wheel', handleWheel)
  addVisibilitychange()
  // createBitmovinPlayer()
  createViblastPlayer()
}

export const onAuthenticated = () => {
  console.log('HAL WEB: OnAuthenticated')
  // placeholder this method is for androidtv
}

function onRefreshToken () {
  if (!store.state.auth.refreshingToken) {
    store.dispatch('auth/refreshToken')
  }
}

window.onRefreshToken = onRefreshToken

export const getMac = function () {
  return privateConfig.mac
}

export const getMacNew = function () {
  return privateConfig.mac
}

export const getSerial = function () {
  return privateConfig.serial
}

export const getType = function () {
  return 'mot'
}
export const getDeviceType = function () {
  return 'stb_kaon_7250'
}
export const getDeviceName = function () {
  return 'Kaon 7250'
}
export const getPlatform = function () {
  return PLATFORM
}
export const getDeviceDetail = function () {
  return {
    'deviceName': getDeviceName(),
    'deviceType': getDeviceType(),
    'mac': getMac(),
    'modelName': getDeviceModel(),
    'platform': getPlatform(),
    'serial': getSerial(),
    'clientSwVersion': '1.0',
    'clientSwBuild': '1',
    'systemSwVersion': {
      'name': 'Android',
      'version': '6.0.123'
    }
  }
}
// this work for firefox and chrome
function UserLocalIP (onNewIP) { //  onNewIp - your listener function for new IPs
  // compatibility for firefox and chrome
  let MyPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection
  let pc = new MyPeerConnection({
    iceServers: []
  })
  let noop = function () {}
  let localIPs = {}
  let ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g
  // let key

  function iterateIP (ip) {
    if (!localIPs[ip]) onNewIP(ip)
    localIPs[ip] = true
  }

  // create a bogus data channel
  pc.createDataChannel('')

  // create offer and set local description
  pc.createOffer().then(function (sdp) {
    sdp.sdp.split('\n').forEach(function (line) {
      if (line.indexOf('candidate') < 0) return
      line.match(ipRegex).forEach(iterateIP)
    })

    pc.setLocalDescription(sdp, noop, noop)
  }).catch(function (reason) {
  // An error occurred, so handle the failure to connect
  })

  // listen for candidate events
  pc.onicecandidate = function (ice) {
    if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return
    ice.candidate.candidate.match(ipRegex).forEach(iterateIP)
  }
}

// Usage
// UserLocalIP(function(ip){
//     alert('Got IP! :' + ip)
// })
// export const BlaTruc

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

// var localIp = this.UserLocalIP()

export const getUserLocalIP = function () {
  // let localIPA
  UserLocalIP(function (ip) {
    console.log('Local IP', ip)
    // localIPA = ip
    save('localIPA', ip)
    // return ip
  })
  let iplocale = load('localIPA')
  return iplocale
}

export const setIpAddressSetting = function () {
  return 'UNKNOWN'
}

export const getSubnetMask = function () {
  return 'UNKNOWN'
}

export const getPrimaryDNS = function () {
  return 'UNKNOWN'
}

export const getSecondaryDns = function () {
  return 'UNKNOWN'
}

export const getGateway = function () { // // za dobijanje Gateway-a
  return 'UNKNOWN'
}

let isConnected = 'connected' // zakucano za sada
export const internetAccess = function () {
  let internetAccess
  if (isConnected === 'connected') {
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

export const getNetworkConf = function () { // istrazi ovo
  // var os = require ('os')
  var networkInterfaces = os.networkInterfaces()
  console.log('networkInterfaces', networkInterfaces)
}

export const getSDKVersion = function () {
  return '001'
}

export const getReleaseVersion = function () {
  return '002'
}

export const getWrapperVersion = function () { // get wrapper version from js interface
  return '4'
}

export const getDeviceManufacturer = function () {
  return 'WEB'
}

var playerInfoDataStatic = {
  id: 0,
  castId: null,
  friendlyName: 'stb_kaon_7250',
  clear: {
    https: true,
    playerType: 'viblast',
    vodPlayerType: 'viblast',
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
  return playerInfoDataStatic
}

export const streamVideo = function ({url, streamType, streamId}) {
  console.log('HAL playStream ' + JSON.stringify({url, streamType, streamId}))
  // let bitmovinMediaObj = {}

  // switch (mediaObj.streamType) {
  //   case 'hls':
  //     // bitmovinMediaObj.hls = 'hls_url'
  //     bitmovinMediaObj.hls = mediaObj.url
  //     break
  //   default:
  //     bitmovinMediaObj.dash = mediaObj.url
  // }

  // localStreamId = mediaObj.streamId

  // player.load(bitmovinMediaObj).then(function (res) {
  //   res.play()
  // })
  // console.log(player.load(bitmovinMediaObj))

  const config = {
    key: '502fb70ce612520a9c52c943f8e878e42d53c9a3ca77413f2eb2bd3c0b947827df882f2913d340fb42195b89764dd8db49ffb3ba29d41708',
    abr: !0,
    clearkey: {},
    initialAbrIndex: 999,
    abrConsiderDimensions: !1,
    skipFirstNonIdr: !0,
    remuxerSetSampleFlag: !0,
    remuxerLog: 'error',
    log: 'error',
    autoplay: true,
    stream: url
  }
  player.stop()
  localStreamId = streamId
  player.setup(config)
  let vid = document.getElementById('player')
  // let blockTimeJump = !mediaObj.startTime
  if (vid.viblast) {
    // vid.addEventListener('canplay', function () {
    //   // if (!blockTimeJump) {
    //   //   vid.currentTime = mediaObj.startTime
    //   //   blockTimeJump = true
    //   // }
    // })

    vid.viblast.addEventListener('transferfailure', function (ev) {
      console.warn('transfer of', ev.url, 'failed with', ev.status)
      if (ev.status >= 0) {
        store.dispatch('corePlayer/setError', {
          streamId: localStreamId
        })
      }
    })
    document.getElementById('player').addEventListener('playing', videoPlaying, false)
  }
}

const videoPlaying = function () {
  console.log('WEB hal playing')
  store.dispatch('corePlayer/setPlaying', {
    streamId: localStreamId
  })
  document.getElementById('player').removeEventListener('playing', videoPlaying, false)
}

/**
* Function will play VOD video
* @param {string} - url - Vod stream url.
* @param {number/string} - streamId - Id which to detect stream by.
* @param {number} - startTime - Relative time-point(in seconds) from beginning of stream to start stream-play from.
*/
export const streamVODVideo = function ({ url, streamId, startTime }) {
  startTime = Math.round(startTime / 1000) || 0
  const config = {
    key: '502fb70ce612520a9c52c943f8e878e42d53c9a3ca77413f2eb2bd3c0b947827df882f2913d340fb42195b89764dd8db49ffb3ba29d41708',
    abr: !0,
    clearkey: {},
    initialAbrIndex: 999,
    abrConsiderDimensions: !1,
    skipFirstNonIdr: !0,
    remuxerSetSampleFlag: !0,
    remuxerLog: 'error',
    log: 'error',
    autoplay: true,
    stream: url
  }
  player.stop()
  localStreamId = streamId
  player.setup(config)
  let vid = document.getElementById('player')
  let blockTimeJump = !startTime
  if (vid.viblast) {
    vid.addEventListener('canplay', function () {
      if (!blockTimeJump) {
        vid.currentTime = startTime
        blockTimeJump = true
      }
    })
    vid.viblast.addEventListener('transferfailure', function (ev) {
      console.warn('transfer of', ev.url, 'failed with', ev.status)
      if (ev.status >= 0) {
        store.dispatch('corePlayer/setError', {
          streamId: localStreamId
        })
      }
    })
  }
}

export const timeTravelVOD = function ({ startTime }) {
  let vid = document.getElementById('player')
  startTime = Math.round(startTime / 1000) || 0
  vid.currentTime = startTime
}

export const streamAudio = function (mediaObj) {
  console.log('HAL play audio')
  streamVideo(mediaObj)
}

export const stop = () => {
  player.stop()
}

export const pauseStream = () => {
  let vid = document.getElementById('player')
  vid.pause()
}

export const resumeVideoVOD = () => {
  let vid = document.getElementById('player')
  vid.play()
}

export const rw = () => {
  // treba implemetirati
  // player.stop()
}

export const ff = () => {
  // player.stop()
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
export const exitApp = () => {
  console.log('++++++ +++ APP EXIT +++ ++++++++++')
  // player.stop()
}

// var playerw = document.getElementById('player')
// playerw.addEventListener('play', function () {
//   console.warn('play')
// }, false)
// playerw.addEventListener('playing', function () {
//   console.warn('playing')
//   store.dispatch('corePlayer/updateStatus', {
//     streamId: null,
//     status: 'playing'
//   })
// }, false)
// playerw.addEventListener('error', function () {
//   console.warn('error')
//   store.dispatch('corePlayer/updateStatus', {
//     streamId: null,
//     status: 'error'
//   })
// }, false)

// var videoo = document.getElementById('player')
// videoo.addEventListener('abort', function () {
//   store.dispatch('corePlayer/setStopped', {
//     streamId: localStreamId
//   })
// }, false)
// videoo.addEventListener('canplay', function () {
//   console.warn('canplay')
// }, false)
// videoo.addEventListener('canplaythrough', function () {
//   console.warn('canplaythrough')
// }, false)
// videoo.addEventListener('emptied', function () {
//   console.warn('emptied')
// }, false)
// videoo.addEventListener('ended', function () {
//   console.warn('ended')
// }, false)
// videoo.addEventListener('error', function () {
//   store.dispatch('corePlayer/setError', {
//     streamId: localStreamId
//   })
// }, false)
// videoo.addEventListener('loadeddata', function () {
//   console.warn('loadeddata')
// }, false)
// videoo.addEventListener('loadedmetadata', function () {
//   console.warn('loadedmetadata')
// }, false)
// videoo.addEventListener('loadstart', function () {
//   console.warn('loadstart')
// }, false)
// videoo.addEventListener('pause', function () {
//   console.warn('pause')
// }, false)
// videoo.addEventListener('play', function () {
//   console.warn('play')
// }, false)
// videoo.addEventListener('playing', function () {
//   store.dispatch('corePlayer/setPlaying', {
//     streamId: localStreamId
//   })
// }, false)
// videoo.addEventListener('progress', function () {
//   console.warn('progress')
// }, false)
// videoo.addEventListener('ratechange', function () {
//   console.warn('ratechange')
// }, false)
// videoo.addEventListener('seeked', function () {
//   console.warn('seeked')
// }, false)
// videoo.addEventListener('seeking', function () {
//   console.warn('seeking')
// }, false)
// videoo.addEventListener('stalled', function () {
//   console.warn('stalled')
// }, false)
// videoo.addEventListener('suspend', function () {
//   console.warn('suspend')
// }, false)
// videoo.addEventListener('timeupdate', function () {
//   console.warn('timeupdate')
// }, false)
// videoo.addEventListener('volumechange', function () {
//   console.warn('volumechange')
// }, false)
// videoo.addEventListener('waiting', function () {
//   console.warn('waiting')
// }, false)

export const onEnterExitZap = (value) => { // value: true/false (hide/show)
  console.log('onEnterExitZap', value)
  console.log('HAL onEnterExitZap')
}

export const appLoaded = (value) => {
  console.log('HAL appLoaded')
}

export const getDisplayDisclaimer = () => {
  return false
}

function addVisibilitychange () {
  document.addEventListener('visibilitychange', function () {
    console.log('addVisibilitychange: ' + document.hidden)
    if (document.hidden) {
      store.dispatch('general/onResumePauseActivity', false)
    } else {
      store.dispatch('general/onResumePauseActivity', true)
    }
  })
}

export const sendChannelData = function (tvChannelList, radioChannelList) {
  console.log('HAL sendChannelData')
}

export const getProvisioningMode = () => {
  return PROVISIONING_TYPE_OTP
}

export const setProvisoningDone = () => {
  console.log('HAL PROVISIONG DONE')
}
