import store from 'src/vuex/store'
import { loc } from 'helpers/localization'

let testInProgress = false
let pingCounterMax = 3
let pingCounter = 0
let pingsPerformedCounter = 0
let pinger = new Pinger()
let pingRes = []
let server = null
let interval = -1
let intervalDelay = 300
// let imgUrl = '/static/resources/nettvplus/mw/img/ping.bmp'
let imgUrl = '/static/ping.bmp' // nova putanja
let updateStatusClbk
let speedScript = null
let speedScriptId = 'speed_test_id'
let speedScriptName = 'speed_test_script'
let srvTestInProgress = false
let startTime = 0
let startServer = ''
let speedTestResultsString = 'stb_settings_systempreferences_network_speedtest_results' // ovo fali u lokalizaciji

let Results = []
// let ServSpeed
// let servId
function Pinger () {
  this.ip = ''
  this.inUse = false
  this.callback = null

  // time holders
  this.start = null
  this.end = null

  // image object
  this.img = null
  this.timer = null
}

function PingerPing (ip, imgPath, callback) {
  var that = this

  if (!this.inUse) {
    this.inUse = true
    this.callback = callback
    this.ip = ip

    // this.img = new Image()
    this.img = document.createElement('img')

    this.img.onload = function () {
      that.good(true)
    }

    this.img.onerror = function () {
      that.good(false)
    }

    this.start = new Date().getTime()
    // this.img.src = "http://" + ip;
    this.img.src = 'http://' + ip + imgPath + '?t=' + this.start // Added "random" parameter
    this.timer = setTimeout(function () {
      that.bad(false)
    }, 1500)
  }
}

function PingerGood (imgFound) {
  if (this.inUse) {
    this.inUse = false
    this.end = new Date().getTime()
    // clear the timer & img
    clearTimeout(this.timer)
    this.img = null

    // this.callback(this.end - this.start, this.ip, true, imgFound)
    pingCallBack(this.end - this.start, this.ip, true, imgFound)
  }
}

function PingerBad (imgFound) {
  if (this.inUse) {
    this.inUse = false
    this.end = new Date().getTime()
    // clear the timer & img
    clearTimeout(this.timer)
    this.img = null
    // this.callback(this.end - this.start, this.ip, false, imgFound)
    pingCallBack(this.end - this.start, this.ip, false, imgFound)
  }
}

Pinger.prototype.ping = PingerPing
Pinger.prototype.good = PingerGood
Pinger.prototype.bad = PingerBad

let pingResultsArr = []

function pingCallBack (ms, ipoff, saveValue, imgF) {
  if (pingResultsArr.length > 2) {
    pingResultsArr.splice(0)
  }

  if (saveValue === true) {
    pingResultsArr.push(ms)
  }
  if (pingsPerformedCounter === pingCounterMax) {
    pingsPerformedCounter = 0
  }
  pingsPerformedCounter += 1
  pingRes[pingsPerformedCounter] = ms
  if (updateStatusClbk) {
    updateStatusClbk(pingsPerformedCounter, ms)
  }
}

function calcPingRes (clbk) {
  clbk = getSpeedTestPingResult()

  let min = 0
  let max = 0
  let avg

  min = Math.min(...pingResultsArr)
  max = Math.max(...pingResultsArr)
  avg = Math.round((min + max) / pingResultsArr.length)
  setSpeedTestMinMAxAvg(min, max, avg)
}

export const startPingTest = function (newUpdateStatusClbk, pingFinishedClbk, srvTestFinishedClbk, specSrv) {
  let serverLiveIP = store.getters['servers/getServer']('LIVE').ip
  if (testInProgress === false) {
    updateStatusClbk = newUpdateStatusClbk
    testInProgress = true
    pingCounter = 0
    // server = specSrv ili da ga nekako dobijes iz https://api.ug.cdn.united.cloud/v1/servers
    server = specSrv || serverLiveIP
    interval = setInterval(function () {
      if (pingCounter++ === pingCounterMax) {
        clearInterval(interval)
        pingCounter = 0
        calcPingRes(pingFinishedClbk)
        startSrvTest(srvTestFinishedClbk, specSrv)

        return
      }

      pinger.ping(server, imgUrl, pingCallBack())
    }, intervalDelay)

    return true
  }

  return false
}

function getSpeedTestPingResult (min, max, avg) {
  console.log('getSpeedTestPingResult: min = ', min, 'max = ', max, 'avg = ', avg)
}

function setSpeedTestMinMAxAvg (min, max, avg) {
  Results.min = min
  Results.max = max
  Results.avg = avg
  store.commit('networking/SET_SPEEDTMIN', Results.min)
  store.commit('networking/SET_SPEEDTMAX', Results.max)
  store.commit('networking/SET_SPEEDTPING', Results.avg)
}

function setSpeedAndServer (speed, serv) {
  // let speed_string = this.loc('stb_settings_systempreferences_network_speedtest')
  Results.speed = speed
  Results.serv = serv
  store.commit('networking/SET_SPEEDTSPEED', Results.speed)
  store.commit('networking/SET_SPEEDTSRV', Results.serv)
  store.commit('twoSidedDialog/SET_DESCRIPTION_MAIN', loc(speedTestResultsString)) // ovako ce se lokalizovati
  // store.commit('twoSidedDialog/SET_DESCRIPTION_MAIN', speedTestResultsString) // jos ne postoji prevod
}

export const Speed = function () {
  return Results.speed
}

export const ServerF = function () {
  return Results.serv
}

function startSrvTest (srvTestFinishedClbk, specSrv) {
  let head
  let url
  let speedScriptFileSize

  if (srvTestInProgress === false) {
    head = document.getElementsByTagName('head')[0]
    if (speedScript) {
      head.removeChild(speedScript)
    }

    srvTestInProgress = true
    startTime = new Date().getTime()

    try {
      // startServer = server sa koga se dobijaju podaci - ovo se moze dobiti iz https://api.ug.cdn.united.cloud/v1/servers
      // let serverLiveIP = store.getters['servers/getServer']('LIVE').ip
      let serverLiveID = store.getters['servers/getServer']('LIVE').id
      let serverLiveHostname = store.getters['servers/getServer']('LIVE').hostname
      startServer = specSrv || serverLiveID
      // url = putanja do servera odnosno do fajla na serveru
      // url = 'http://' + '185.20.36.232' + '/static/test_speed_dump_s3000000.js' + '?dummy=' + startTime // ovaj je pravi za test
      // https://sbb-bg-ku-r1-1.ug.cdn.united.cloud/static/speedtest.js
      url = 'http://' + serverLiveHostname + '/static/speedtest.js' + '?dummy=' + startTime // ovo je test za unitedcloud server -vidi sa Vladom kako da dovuces ovde server
      // : "http://" + NTV.data.srv_live.getActiveServerUrl() + NTV.props.path.speed_test_path + "?dummy=" + startTime;
      speedScript = document.createElement('script')
      speedScript.id = speedScriptId
      speedScript.type = 'text/javascript'
      speedScript.src = url
      speedScript.name = speedScriptName
      speedScriptFileSize = 3000000

      speedScript.onload = function () {
        // successfully loaded - display results
        let delta = new Date().getTime() - startTime
        let connectSpeed = Math.floor((((speedScriptFileSize * 8) / ((delta) / 1000)) / 1024) * 10) / 10

        srvTestInProgress = false
        testInProgress = false
        interval = null

        setSpeedAndServer(connectSpeed, startServer)

        if (srvTestFinishedClbk) {
          srvTestFinishedClbk(true, connectSpeed, startServer)
        }
      }

      speedScript.onerror = function (e) {
        srvTestInProgress = false
        testInProgress = false

        interval = null
        setSpeedTestMinMAxAvg(0, 0, 0)
        setSpeedAndServer(0, 'NO SERVER')

        if (srvTestFinishedClbk) {
          srvTestFinishedClbk(false, 0, startServer)
        }
      }

      head = document.getElementsByTagName('head')[0]
      head.appendChild(speedScript)
    } catch (error) {
      return error
    }
  }
}
