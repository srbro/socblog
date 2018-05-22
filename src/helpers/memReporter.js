import { sendLogToSentry } from 'helpers/logger'

const OVERLOAD_LIMIT = 0.7
const SEND_TIME = 15 * 60 * 1000
const CHECK_LOOP_TIME = 30 * 60 * 1000

let intervalId = -1

function precisionRound (number, precision) {
  var factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}

function getHeapLimit () {
  return (window.performance && window.performance.memory && window.performance.memory.jsHeapSizeLimit) || 'NOT PRESENT'
}

function getTotalHeap () {
  return (window.performance && window.performance.memory && window.performance.memory.totalJSHeapSize) || 'NOT PRESENT'
}

function getUsedHeap () {
  return (window.performance && window.performance.memory && window.performance.memory.usedJSHeapSize) || 'NOT PRESENT'
}

function performMemActions (fns) {
  let limit = getHeapLimit()
  let total = getTotalHeap()
  let used = getUsedHeap()

  Array.isArray(fns) && fns.forEach(fn => typeof fn === 'function' && fn(limit, total, used))
}

function sendReport (limit, total, used) {
  sendLogToSentry(`Mem total/limit ${precisionRound(total / limit, 4) * 100}%, used/total ${precisionRound(used / total, 4) * 100}%, used: ${used}`)
}

function sendRepotOnOverload (limit, total, used) {
  if (total / limit >= OVERLOAD_LIMIT) {
    sendReport(limit, total, used)
  }
}

function mkSendRepotRegular () {
  let timeOfLastDispatch = 0

  return function (limit, total, used) {
    if (Date.now() - timeOfLastDispatch >= SEND_TIME) {
      sendReport(limit, total, used)
      timeOfLastDispatch = Date.now()
    }
  }
}
const sendRepotRegular = mkSendRepotRegular()

export const stop = function () {
  window.clearInterval(intervalId)
}

export const start = function () {
  stop()
  intervalId = window.setInterval(function () {
    performMemActions([sendRepotOnOverload, sendRepotRegular])
  }, CHECK_LOOP_TIME)
}
