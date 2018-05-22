/* global localStorage */
/* global webOS */
/* global window */

import { handleKey } from '../KeyHandler.js'
// import webOS from 'src/lib/webOS'
// trebace za info za network ako nema native f-ja u LG-u
import { fetchNetworkInfo } from 'src/helpers/api'
import store from 'src/vuex/store'
// import { loc } from 'helpers/localization' // Localization function
import mkLock from 'src/helpers/stallLock'
// import router from 'src/router' // used for intro video
import { networkChange } from 'helpers/network'
import { PLATFORM, KEY_MAP } from './consts/constsLg.js'
import { PROVISIONING_TYPE_OTP } from 'helpers/consts.js'

import ver from 'version'

var localStreamId = 0

// Playing stream types on this platform
export const supportStreamTypes = {CBR: 'http', ABR: 'm3u8'}
export const supportOperationMode = {DVB: 'hibrid', OTT: 'ott'}

export const getDeviceId = function () {
  return load('deviceNumber')
}

let tvModel
let sdkVersion
let firmwareVersion
let webosReqAvailable
var mac = ''
var serial = ''
var audioPlayer = null
var videoPlayer = null
var activePlayer = null
var networkType = 'ETHERNET'
let setVersion = function () {
  return new Promise((resolve, reject) => {
  // try {
    webOS.service.request('luna://com.webos.service.tv.systemproperty', {
      method: 'getSystemInfo',
      parameters: {
        keys: ['modelName', 'firmwareVersion', 'UHD', 'sdkVersion']
      },
      onComplete: function (inResponse) {
        var isSucceeded = inResponse.returnValue
        if (isSucceeded) {
          tvModel = inResponse.modelName
          save('tvModel', tvModel)
          // store.commit('software/SET_TVMODEL', inResponse.modelName)
          firmwareVersion = inResponse.firmwareVersion
          save('firmwareVersion', firmwareVersion)
          sdkVersion = inResponse.sdkVersion
          save('sdkVersion', sdkVersion)
          webosReqAvailable = true
          console.log('tvModel = ', tvModel, 'firmwareVersion = ', firmwareVersion, 'sdkVersion = ', sdkVersion, ' webosReqAvailable = ', webosReqAvailable)
          resolve({tvModel, firmwareVersion, sdkVersion, webosReqAvailable})
          // To-Do something
        } else {
          console.log('Failed to get TV device information')
          document.body.innerHTML = ''
          reject(Error('Ponovi'))
          webosReqAvailable = false
          // To-Do something
          // return
        }
      },
      onFailure: function (inError) {
        reject(Error('Ponovi'))
      }
    })
  })
}
let setSerial = async function () {
  return new Promise((resolve, reject) => {
    webOS.service.request('luna://com.webos.service.sm', {
      method: 'deviceid/getIDs',
      parameters: {
        'idType': ['LGUDID']
      },
      onSuccess: function (inResponse) {
        if (inResponse.idList) {
          serial = inResponse.idList[0].idValue
          save('gen_serial', serial)
          resolve(serial)
        } else {
          serial = (function () {
            let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            let text = ''
            let i

            for (i = 0; i < 13; i++) {
              text += possible.charAt(Math.floor(Math.random() * possible.length))
            }

            return 'LG' + text
          })()
          save('gen_serial', serial)
          resolve(serial)
        }
      },
      onFailure: function (inError) {
        serial = (function () {
          let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
          let text = ''
          let i

          for (i = 0; i < 13; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
          }

          return 'LG' + text
        })()
        save('gen_serial', serial)
        resolve(serial)
      }
    })
  })
}
let networkReqAvailable
let getNetworkState = async function () {
  // if (window.webOS) {
  //   try {
  return new Promise((resolve, reject) => {
    try {
      // webOS.service.request('luna://com.palm.connectionmanager', {
      webOS.service.request('luna://com.webos.service.connectionmanager', {
        method: 'getStatus',
        parameters: { 'subscribe': true },
        onSuccess: function (inResponse) {
          var isSucceeded = inResponse.returnValue
          if (isSucceeded) {
            let podatci = inResponse
            if (podatci.wired.state !== 'disconnected') {
              userLocalIp = inResponse.wired.ipAddress
              IPAddressSettings = inResponse.wired.method
              SubnetMask = inResponse.wired.netmask
              PrimaryDNS = inResponse.wired.dns1
              SecondaryDNS = inResponse.wired.dns2
              GetawayDef = inResponse.wired.gateway
              isConnected = inResponse.wired.state
              networkReqAvailable = true
              networkType = 'ETHERNET'
              resolve({userLocalIp, IPAddressSettings, SubnetMask, PrimaryDNS, SecondaryDNS, GetawayDef, isConnected, networkReqAvailable})
            } else if (podatci.wifi.state !== 'disconnected') {
              userLocalIp = inResponse.wifi.ipAddress
              IPAddressSettings = inResponse.wifi.method
              SubnetMask = inResponse.wifi.netmask
              PrimaryDNS = inResponse.wifi.dns1
              SecondaryDNS = inResponse.wifi.dns2
              GetawayDef = inResponse.wifi.gateway
              isConnected = inResponse.wifi.state
              networkReqAvailable = true
              networkType = 'WI_FI'
              resolve({userLocalIp, IPAddressSettings, SubnetMask, PrimaryDNS, SecondaryDNS, GetawayDef, isConnected, networkReqAvailable})
            }
          } else {
            console.log('Failed to get Network device information')
            reject(Error('Ponovi Network'))
            networkReqAvailable = false
          }
        },
        onFailure: function (inError) {
          console.log('HAL getNetworkState -------onFailure-------')
          console.log('[' + inError.errorCode + ']: ' + inError.errorText)
          reject(Error('Ponovi Network'))
        }
      })
    } catch (err) {
      console.log('HAL getNetworkState -------catch-------', err)
    }
  })
}

// network
export const getNetworkType = function () {
  store.dispatch('networking/updateNetworkType', networkType)
  return networkType
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

let userLocalIp
export const getUserLocalIP = function () { // za dobijanje lokalne IP adrese
  return userLocalIp
}

let IPAddressSettings
export const setIpAddressSetting = function () { // ovo ce vracati samo  da li je wired ili wifi
  return IPAddressSettings
}

let SubnetMask
export const getSubnetMask = function () {
  return SubnetMask
}

let PrimaryDNS
export const getPrimaryDNS = function () {
  return PrimaryDNS
}

let SecondaryDNS
export const getSecondaryDns = function () {
  return SecondaryDNS
}

let GetawayDef
export const getGateway = function () { // // za dobijanje Gateway-a
  return GetawayDef
}

let isConnected
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
  if (userLocalIp !== '' || userLocalIp !== undefined) {
    internetAccessLocal = 'OK'
  } else {
    userLocalIp = 'NO ACCESS'
  }
  console.log('HAL : internetAccessLocal = ', internetAccessLocal)
  return internetAccessLocal
}
// network end

export const getDeviceModel = function () {
  if (load('tvModel')) {
    return load('tvModel')
  }
  return tvModel
}

export const sendChannelData = function (tvChannelList, radioChannelList) {

}

export const getSDKVersion = function () {
  if (load('sdkVersion')) {
    return load('sdkVersion')
  }
  return sdkVersion
}

export const getReleaseVersion = function () {
  if (load('firmwareVersion')) {
    return load('firmwareVersion')
  }
  return firmwareVersion
}

export const getWrapperVersion = function () { // get wrapper version from js interface
  return '003'
}

export const getDeviceManufacturer = function () {
  return 'LG'
}

export const onAuthenticated = () => {
  // placeholder this method is for androidtv
}

export const config = {
  resolution: ['1px', '0.66666px']
}

let mouseWheelLock = mkLock()

function handleWheel (event) {
  if (!mouseWheelLock.key) {
    mouseWheelLock.lock()
    mouseWheelLock.delayedUnlock(200)

    if (event.deltaY === 0) {
      // scrolling left/right
      handleKey(event.deltaX > 0 ? 'RIGHT' : 'LEFT')
    } else if (event.deltaX === 0) {
      // scrolling up/down
      handleKey(event.deltaY > 0 ? 'DOWN' : 'UP')
    }
  }
}

// function doHandleKey (event) {
//   var key = keyMap[event.keyCode]
//   console.log('HAL Key pressed: ' + key)
//   handleKey(key)
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

var clickQueue = 0
var holdInterval = null

function doHandleKeyUp (event) {
  event.preventDefault()
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

export const test = function () {
  console.log('HAL this is LG hal')
}

export const isWebOSAvailable = function () {
  if (webosReqAvailable !== true) {
    console.log('nema jos podatke/////////////')
    // window.setTimeout(() => {
    return setVersion().then(success => {
    // if (success) {
      console.log('HAL isWebOSAvailable opaljuje setVersion zato sto nema podatke')
    }).catch((err) => {
      console.log('HAL err isWebOSAvailable opaljuje setVersion zato sto nema podatke')
      console.log(err)
    })
    // }, 50)
  } else {
    console.log('Izvrsio sam webosReqAvailable = ', webosReqAvailable)
  }
}

export const isNetworkReqAvailable = function () {
  if (networkReqAvailable !== true) {
    console.log('nema jos podatke/////////////')
    // window.setTimeout(() => {
    return getNetworkState().then(success => {
    // if (success) {
      console.log('HAL isWebOSAvailable opaljuje getNetworkState zato sto nema podatke')
    }).catch((err) => {
      console.log('HAL err isWebOSAvailable opaljuje getNetworkState zato sto nema podatke')
      console.log(err)
    })
    // }, 50)
  } else {
    console.log('Izvrsio sam networkReqAvailable = ', networkReqAvailable)
  }
}
// used for intro video
// var playingIntro = false
// function introVideoEnded () {
//   console.warn('introVideoEnded')
//   if (router.currentRoute.name === 'Loading') {
//     videoPlayer.className = 'zIndex20'
//     setTimeout(function () {
//       introVideoEnded()
//     }, 500)
//     return false
//   }
//   videoPlayer.removeEventListener('ended', introVideoEnded, false)
//   playingIntro = false
//   videoPlayer.removeAttribute('poster')
//   videoPlayer.className = ''
// }
// function introVideoLoadedData () {
//   console.warn('introVideoLoadedData')
//   if (document.hidden) {
//     setTimeout(function () {
//       introVideoLoadedData()
//     }, 100)
//     return false
//   }
//   console.warn(videoPlayer)
//   videoPlayer.load()

//   videoPlayer.play()
//   videoPlayer.removeEventListener('canplay', introVideoLoadedData, false)
// }
export const initHal = async function () {
  function cursorVisibilityChange (event) {
    var visibility = event.detail.visibility
    store.commit('general/SET_MOUSE_ENABLED', visibility)
    if (visibility) {
      if (document.body.classList.contains('disable-hover')) {
        document.body.classList.remove('disable-hover')
      }
    } else {
      if (!document.body.classList.contains('disable-hover')) {
        document.body.classList.add('disable-hover')
      }
    }
  }

  function mouseOnOnMove () {
    if (store) {
      store.commit('general/SET_MOUSE_ENABLED', true)
      if (document.body.classList.contains('disable-hover')) {
        document.body.classList.remove('disable-hover')
      }
      document.removeEventListener('mousemove', mouseOnOnMove)
    }
  }

  document.addEventListener('cursorStateChange', cursorVisibilityChange, false)
  document.addEventListener('mousemove', mouseOnOnMove)
  videoPlayer = document.getElementById('videoPlayer')
  audioPlayer = document.getElementById('audioPlayer')
  // used for intro video
  // videoPlayer.addEventListener('canplay', introVideoLoadedData, false)
  // videoPlayer.addEventListener('ended', introVideoEnded, false)

  mac = load('gen_mac')
  if (!mac) {
    mac = (function () {
      return 'LG' +
            ':' + Math.floor(Math.random() * 256).toString(16) +
            ':' + Math.floor(Math.random() * 256).toString(16) +
            ':' + Math.floor(Math.random() * 256).toString(16) +
            ':' + Math.floor(Math.random() * 256).toString(16) +
            ':' + Math.floor(Math.random() * 256).toString(16)
    })()
    save('gen_mac', mac)
  }

  if (load('gen_serial')) {
    serial = load('gen_serial')
  } else {
    await setSerial()
  }

  // console.log('Pocetak init ', webOS)
  // console.log('Pocetak init webOSavailable = ', isWebOSAvailable())
  // console.log('Pocetak init webOSavailable1 = ', getDeviceModel())
  // window.setTimeout(() => {
  //   // console.log('Pocetak init webOSavailable = ', isWebOSAvailable())
  //   console.log('Pocetak init webOSavailable posle timeouta = ', isWebOSAvailable())
  //   console.log('Pocetak init webOSavailable posle timeouta2 = ', getDeviceModel())
  // }, 3000)

  // window.setTimeout(() => {
  //   setVersion().then(success => {
  //   // if (success) {
  //     console.log('HAL uspeo sam da dobijem Sys podatke')
  //   }).catch((err) => {
  //     console.log(err)
  //   })
  // }, 3000)
  // getSysData()
  window.addEventListener('keydown', doHandleKey)
  window.addEventListener('keyup', doHandleKeyUp)
  window.addEventListener('wheel', handleWheel)

  if (load('sdkVersion')) {
    setVersion()
  } else {
    await setVersion()
  }

  getNetworkState()

  // console.log('HAL LG init 412')
  // } else {
  //   await getNetworkState()
  //   console.log('HAL LG init 413)
  // }
  // window.setTimeout(() => {
  //   getNetworkState().then(success => {
  //   // if (success) {
  //     console.log('HAL uspeo sam da dobijem Network podatke')
  //   }).catch((err) => {
  //     console.log(err)
  //   })
  // }, 3000)
  videoPlayer.addEventListener('error', function () {
    store.dispatch('corePlayer/setError', {
      streamId: localStreamId
    })
  }, false)
  audioPlayer.addEventListener('error', function () {
    store.dispatch('corePlayer/setError', {
      streamId: localStreamId
    })
  }, false)
  videoPlayer.addEventListener('playing', function () {
    store.dispatch('corePlayer/setPlaying', {
      streamId: localStreamId
    })
  }, false)
  audioPlayer.addEventListener('playing', function () {
    store.dispatch('corePlayer/setPlaying', {
      streamId: localStreamId
    })
  }, false)
  videoPlayer.addEventListener('abort', function () {
    store.dispatch('corePlayer/setStopped', {
      streamId: localStreamId
    })
  }, false)
  audioPlayer.addEventListener('abort', function () {
    store.dispatch('corePlayer/setStopped', {
      streamId: localStreamId
    })
  }, false)

  function updateOnlineStatus (event) {
    // var condition = navigator.onLine ? 'online' : 'offline'
    if (navigator.onLine) {
      networkChange(true)
    } else {
      networkChange(false)
    }
  }

  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
}
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    console.log('webos visibilitychange hidden ')
    // window.location.reload()
    // window.location = ''
  } else {
    console.log('webos visibilitychange hidden false')
    // window.location.reload()
    // window.location.reload()
  }
}, true)
// document.addEventListener('webOSRelaunch', function (inData) {
//   // window.location.reload()
// }, true)
// document.addEventListener('webOSLaunch', function (inData) {
//   // window.location.reload()
// }, true)

// var videoo = document.getElementById('videoPlayer')
// videoo.addEventListener('abort', function () {
//   console.warn('abort')
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
//   console.warn('error')
//   store.dispatch('corePlayer/updateStatus', {
//     streamId: null,
//     status: 'error'
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
//   console.warn('playing')
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
export const getMac = function () {
  return mac
}

export const getMacNew = function () {
  return mac
}

export const getSerial = function () {
  return load('gen_serial')
}

export const getType = function () {
  return 'lgs'
}

export const getDeviceType = function () {
  // let userAgent = navigator.userAgent
  // let webos2017 = 'lg_web_os_3.5'
  // let webos2016 = 'AppleWebKit/537.36'
  // let webos2015 = 'AppleWebKit/538.2'
  // let webos2014 = 'AppleWebKit/537.41'
  // if (userAgent.indexOf(webos2017) > -1) {
  //   return 'lg_web_os_3.5'
  // } else if (userAgent.indexOf(webos2016) > -1) {
  //   return 'lg_web_os_3'
  // } else if (userAgent.indexOf(webos2015) > -1) {
  //   return 'lg_web_os_2'
  // } else if (userAgent.indexOf(webos2014) > -1) {
  //   return 'lg_web_os_1'
  // }
  return 'lg_web_os_' + getSDKVersion()
}
export const getDeviceName = function () {
  let userAgent = navigator.userAgent
  let webos2017 = 'LG Web OS 2017'
  let webos2016 = 'AppleWebKit/537.36'
  let webos2015 = 'AppleWebKit/538.2'
  let webos2014 = 'AppleWebKit/537.41'
  if (userAgent.indexOf(webos2017) > -1) {
    return 'LG Web OS 2017'
  } else if (userAgent.indexOf(webos2016) > -1) {
    return 'LG Web OS 2016'
  } else if (userAgent.indexOf(webos2015) > -1) {
    return 'LG Web OS 2015'
  } else if (userAgent.indexOf(webos2014) > -1) {
    return 'LG Web OS 2014'
  }
}
export const getPlatform = function () {
  return PLATFORM
}
export const getDeviceDetail = function () {
  return {
    'deviceName': getDeviceName(),
    'deviceType': getDeviceType(),
    // 'mac': getMac(),
    'modelName': getDeviceModel(),
    'platform': getPlatform(),
    'serial': getSerial(),
    'clientSwVersion': `${ver.major}.${ver.minor}.${ver.patch}`,
    'clientSwBuild': '1',
    'systemSwVersion': {
      'name': 'WebOS',
      'version': getReleaseVersion()
    }
  }
}
export const load = function (varName) {
  try {
    if (localStorage.getItem(varName)) {
      return localStorage.getItem(varName)
    } else {
      return null
    }
  } catch (e) {
    console.log(`HAL LG ERROR: ${e} msg: ${e.message}`)
  }
}

export const save = function (varName, value) {
  localStorage.setItem(varName, value)
}

export const remove = function (varName) {
  localStorage.removeItem(varName)
}

export const playStream = function (mediaObj) {
  console.log('play stream ', mediaObj)
  // var options = {}
  // const videoType = 'application/dash+xml'
  let source = document.createElement('source')
  source.setAttribute('src', mediaObj.url)
  // source.setAttribute('type', videoType)
  if (videoPlayer.hasChildNodes()) {
    videoPlayer.replaceChild(source, videoPlayer.firstChild)
  } else {
    videoPlayer.appendChild(source)
  }
  console.log('end play stream')
  videoPlayer.load()
  videoPlayer.play()
}

var playerInfoDataStatic = {
  id: 0,
  castId: null,
  friendlyName: 'lg_web_os',
  clear: {
    https: true,
    playerType: 'native',
    vodPlayerType: 'native',
    radioPlayerType: 'native',
    radioCbrStreamingProtocol: 'http',
    radioAbrStreamingProtocol: 'm3u8',
    liveCbrStreamingProtocol: 'http',
    liveAbrStreamingProtocol: 'm3u8',
    cutvCbrStreamingProtocol: 'http',
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

export const streamVideo = function ({ url, streamType, streamId }) {
  // used for intro video
  // if (playingIntro) {
  //   setTimeout(function () {
  //     streamVideo(mediaObj)
  //   }, 50)
  //   return false
  // }

  console.log('play video ' + url)
  // var options = {}
  let source = document.createElement('source')
  source.setAttribute('src', url)
  var options = {}
  // options.option = {}
  // options.option.mediaFormat = {}
  // options.option.mediaFormat.type = 'video'
  if (streamType === 'm3u8') {
    options = {
      'option': {
        'mediaTransportType': 'HLS',
        'mediaFormat': {
          'type': 'video'
        },
        'adaptiveStreaming': {
          'audioOnly': false,
          'apativeResolution': true,
          'seamlessPlay': false,
          'maxWidth': 1920,
          'maxHeight': 1080,
          'bps': { 'start': 8000000 }
        }
      }
    }
  }

  // getNetworkState()
  const mediaOption = escape(JSON.stringify(options))

  // source.setAttribute('type', 'application/dash+xml;mediaOption=' + mediaOption)
  if (streamType === 'm3u8') {
    source.setAttribute('type', 'application/vnd.apple.mpegurl;mediaOption=' + mediaOption)
  } else if (streamType === 'dash') {
    source.setAttribute('type', 'application/dash+xml')
  } else {
    source.setAttribute('type', 'video/mp2t')
  }

  switchAudioVideo('video')
  localStreamId = streamId

  if (videoPlayer.hasChildNodes()) {
    videoPlayer.replaceChild(source, videoPlayer.firstChild)
  } else {
    videoPlayer.appendChild(source)
  }
  videoPlayer.load()
  videoPlayer.play()
}

/**
* Function will play VOD video.
* @author Miroslav Nikolic <miroslav.nikolic@united.cloud>
*
* @param {string} - url - Vod stream url.
* @param {number/string} - streamId - Id which to detect stream by.
* @param {number} - startTime - Relative time-point(in seconds) from beginning of stream to start stream-play from.
*/
export const streamVODVideo = ({ url, streamType, streamId, startTime }) => {
  startTime = Math.round(startTime / 1000) || 0
  // used for intro video
  // if (playingIntro) {
  //   setTimeout(function () {
  //     streamVODVideo({ url, streamId, startTime })
  //   }, 50)
  //   return false
  // }

  // startTime = startTime || 0
  let options = {
    'option': {
      'mediaTransportType': 'HLS',
      'mediaFormat': {
        'type': 'video'
      },
      'adaptiveStreaming': {
        'audioOnly': false,
        'apativeResolution': true,
        'seamlessPlay': false,
        'maxWidth': 1920,
        'maxHeight': 1080,
        'bps': { 'start': 8000000 }
      }
    }
  }
  localStreamId = streamId
  let source = document.createElement('source')
  source.setAttribute('src', url)
  source.setAttribute('type', 'application/vnd.apple.mpegurl;mediaOption=' + escape(JSON.stringify(options)))

  switchAudioVideo('video')

  if (videoPlayer.hasChildNodes()) {
    videoPlayer.replaceChild(source, videoPlayer.firstChild)
    videoPlayer.addEventListener('loadeddata', function (e) { videoPlayer.currentTime = startTime }, false)
  } else {
    videoPlayer.appendChild(source)
    videoPlayer.addEventListener('loadeddata', function (e) { videoPlayer.currentTime = startTime }, false)
  }

  videoPlayer.load()
  videoPlayer.play()
}

export const timeTravelVOD = function ({ startTime }) {
  startTime = Math.round(startTime / 1000) || 0
  videoPlayer.currentTime = startTime
}

export const streamAudio = function ({url, streamType, streamId}) {
  console.log('play audio ', url)
  // var options = {}
  let source = document.createElement('source')
  source.setAttribute('src', url)
  var options = {}
  options.option = {}
  options.option.mediaFormat = {}
  options.option.mediaFormat.type = 'video'
  var mediaOption = escape(JSON.stringify(options))
  if (streamType === 'http') {
    source.setAttribute('type', 'audio/aac;mediaOption=' + mediaOption)
  }
  switchAudioVideo('audio')
  localStreamId = streamId
  if (audioPlayer.hasChildNodes()) {
    audioPlayer.replaceChild(source, audioPlayer.firstChild)
  } else {
    audioPlayer.appendChild(source)
  }
  audioPlayer.load()
  audioPlayer.play()
}
function switchAudioVideo (type) {
  if (type === 'audio' && activePlayer === 'video') {
    if (videoPlayer.hasChildNodes()) {
      while (videoPlayer.firstChild) {
        videoPlayer.removeChild(videoPlayer.firstChild)
      }
    }
  } else if (type === 'video' && activePlayer === 'audio') {
    if (audioPlayer.hasChildNodes()) {
      while (audioPlayer.firstChild) {
        audioPlayer.removeChild(audioPlayer.firstChild)
      }
    }
  }
  activePlayer = type
}
export const stop = () => {
  if (activePlayer === 'audio') {
    audioPlayer.pause()
  } else {
    videoPlayer.pause()
  }
}

export const pauseStream = () => {
  if (activePlayer === 'audio') {
    audioPlayer.pause()
  } else {
    videoPlayer.pause()
  }
}

export const resumeVideoVOD = () => {
  videoPlayer.play()
}

export const rw = () => {
  // treba implemetirati
  // player.stop()
}

export const ff = () => {
  // player.stop()
}

export const exitApp = () => {
  webOS.platformBack()
}

export const appLoaded = (value) => {
  console.log('HAL appLoaded')
}

export const getDisplayDisclaimer = () => {
  return false
}

export const onEnterExitZap = (value) => { // value: true/false (hide/show)
  console.log('onEnterExitZap', value)
  console.log('HAL onEnterExitZap')
}

export const getProvisioningMode = () => {
  return PROVISIONING_TYPE_OTP
}

export const setProvisoningDone = () => {
  console.log('HAL PROVISIONG DONE')
}
