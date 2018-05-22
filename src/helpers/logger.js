import axios from 'axios'
import { getMac, getDeviceModel, getPlatform, save, remove, getWrapperVersion } from 'hal'
import config from 'config'
import ver from 'version'
import Raven from 'raven-js'
import servers from 'servers'
import store from 'src/vuex/store'

let toConsole = true
let measure = false
let logArray = []
let logCounter = 0
const MAX_LOG_LINES = 100
let perfMap = {}
let header = {
  deviceType: 'default',
  macAddress: '00',
  tvModel: 'unknown',
  buildVersion: '0.0'
}

// let getTime
export let debugConfig = {
  debuggingMode: false
}
let tryActivate = 1

export const tryActivateDebug = () => {
  if (debugConfig.debuggingMode || servers.name === 'prod') {
    return false
  } else if (tryActivate !== 5) {
    tryActivate++
    return false
  } else {
    setDebuggingMode(true)
    return true
  }
}

export const setDebuggingMode = (mode) => {
  if (mode) {
    save('debugger', mode)
  } else {
    remove('debugger', mode)
    tryActivate = 1
  }
  debugConfig.debuggingMode = mode
}

export const i = (comment) => {
  logArray[(logCounter += 1) % MAX_LOG_LINES] = (Date.now() + ' ' + comment)
  if (toConsole) {
    console.info(Date.now() + comment)
  }
}

export const e = (comment) => {
  logArray[(logCounter += 1) % MAX_LOG_LINES] = (Date.now() + ' ' + comment)
  if (toConsole) {
    console.error(Date.now() + comment)
  }
}

const d = (comment) => {
  logArray[(logCounter += 1) % MAX_LOG_LINES] = (Date.now() + ' ' + comment)
  if (toConsole) {
    console.log(Date.now() + comment)
  }
}

const setHeader = ({buildVersion, measurePerf}) => {
  header.deviceType = getPlatform()
  header.macAddress = getMac()
  header.tvModel = getDeviceModel()
  header.buildVersion = buildVersion || header.buildVersion
  header.version = `${ver.major}.${ver.minor}.${ver.patch}`
  if (measurePerf) {
    measure = measurePerf
  }
  // getTime = (window && window.performance) ? window.performance.now : Date.now
}

const pstart = (tag, comment) => {
  let start = Date.now()
  // let start = getTime()
  perfMap[tag] = {
    start
  }
  let msg = tag + ' ' + (comment || '') + ' START    ' + start
  logArray[(logCounter += 1) % MAX_LOG_LINES] = msg

  if (toConsole) {
    console.log(msg)
  }
}

const pend = (tag, comment) => {
  if (perfMap[tag] && perfMap[tag].start) {
    let start = perfMap[tag].start
    // let end = getTime()
    let end = Date.now()
    let duration = end - start
    let endMsg = Date.now() + ' ' + tag + ' ' + (comment || '') + ' END      ' + end
    let durMsg = Date.now() + ' ' + tag + ' ' + (comment || '') + ' DURATION ' + duration
    logArray[(logCounter += 1) % MAX_LOG_LINES] = durMsg
    if (measure) {
      sendPerf(tag, duration)
    }

    if (toConsole) {
      console.log(endMsg)
      console.log(durMsg)
    }
  }
  perfMap[tag] = null
}

const setConsole = (val) => {
  toConsole = val
}

const printPerf = () => {
  for (let tag in perfMap) {
    let t = perfMap[tag]
    for (let i = 0; i < t.length; i += 1) {
      console.log(t[i])
    }
  }
}

const print = () => {
  let i = 0
  for (; i < logArray.length; i += 1) {
    console.log(logArray[i])
  }
}

export const getLog = () => {
  return logArray
}

export const sendLogToSentry = (title = 'Custom log') => {
  Raven.captureMessage(title, {
    level: 'debug',
    extra: { log: getLog() },
    tags: { appType: process.env.NODE_ENV, IS: servers.name, appVersion: `${store.state.software.buildVersion}`, localIP: `${store.state.networking.userLocalIP}`, wrapperVersion: getWrapperVersion() }
  })
}

const srv = config.measurement
console.log('logServer: ' + srv)

export const apiPostPerf = (srv, data) => {
  axios.post(`${srv.server}/write?db=${srv.db}`, data, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + getClientCredentialsB64(srv.user, srv.pass)
    }
  })
}

/* global btoa */

const getClientCredentialsB64 = (u, p) => {
  return btoa((u || '') + ':' + (p || ''))
}

const sendPerf = (func, value) => {
  let data = `exec_speed,devicetype=${header.deviceType},mac=${header.macAddress},build=${header.buildVersion},version=${header.version},function=${func} value=${value}`
  console.log('Send Perf: ' + data)
  apiPostPerf(srv, data)
}

export default {
  i,
  e,
  d,
  pstart,
  pend,
  setConsole,
  printPerf,
  print,
  setHeader,
  getLog,
  setDebuggingMode
}
