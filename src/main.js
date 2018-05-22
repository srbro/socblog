import 'babel-polyfill'

import Vue from 'vue'
import App from './App'
import { sync } from 'vuex-router-sync'

import store from 'src/vuex/store'
import router from 'src/router'
import { loc, locItems, locDesc, locDay, locDayLong, locReplace, locMonth, locMonthLong } from 'helpers/localization' // Localization function

import Raven from 'raven-js'
import RavenVue from 'raven-js/plugins/vue'
import { debugConfig, i as consoleInfo, getLog } from 'helpers/logger'
// import { start as memMonitorStart } from 'helpers/memReporter'
import servers from 'servers'
// import ver from 'version'
import { getWrapperVersion } from 'hal'

import { setUiMode, exposeUiMode } from 'helpers/uiMode'
import { setTranslateMode, exposeTranslateMode } from 'helpers/translate'
import { getRegisteredHandlers } from './KeyHandler'

exposeUiMode('uiMode')
exposeTranslateMode('translateMode')

window.setM = (mode) => {
  setUiMode(mode)
  exposeUiMode('uiMode')
}

window.setTranslate = (mode) => {
  setTranslateMode(mode)
  exposeTranslateMode('translateMode')
}

const ravenSetExtra = (data) => {
  data.tags = { appType: process.env.NODE_ENV, IS: servers.name, appVersion: `${store.state.software.buildVersion}`, localIP: `${store.state.networking.userLocalIP}`, wrapperVersion: getWrapperVersion() }
  data.extra.log = getLog()
  return data
}

if (process.env.NODE_ENV === 'production') { // (Add for mem logging in develop) || process.env.NODE_ENV === 'development') {
  Raven
    .config('https://88693c97151c4181a94160b32a6be583@sentry.io/209866')
    .addPlugin(RavenVue, Vue)
    .setDataCallback(ravenSetExtra)
    .install()
} else {
  Vue.config.warnHandler = function (msg, vm, trace) {
    console.error('VUE WARN ', msg, vm, trace)
  }
}

Vue.config.devtools = process.env.NODE_ENV !== 'production'
Vue.config.performance = process.env.NODE_ENV !== 'production'

sync(store, router)

Vue.mixin({ methods: { loc, locItems, locDesc, locDay, locDayLong, locReplace, locMonth, locMonthLong } })

router.beforeEach((to, from, next) => {
  if (debugConfig.debuggingMode) {
    consoleInfo(`FROM ${from.name} TO ${to.name} ` + JSON.stringify(to.params))
  }
  next()
})

router.afterEach((to, from) => {
  store.dispatch('navigation/syncWithRoute')
  // send error if keyhandler is undefined
  let registeredHandlers = getRegisteredHandlers()
  if (!registeredHandlers.has(to)) {
    // send to sentry
    Raven.captureMessage('KeyHandler not registerd', {
      level: 'error',
      extra: { route: `Route from: ${from}, to: ${to} - registeredHandlers: ${Object.keys(registeredHandlers)}` },
      tags: { appType: process.env.NODE_ENV, IS: servers.name, appVersion: `${store.state.software.buildVersion}`, localIP: `${store.state.networking.userLocalIP}`, wrapperVersion: getWrapperVersion() }
    })
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  store,
  router,
  components: { App }
})

window.toggleDialog = (() => {
  let active = false
  return () => {
    store.commit((!active ? 'twoSidedDialog/SET_ACTIVE_ON' : 'twoSidedDialog/SET_ACTIVE_OFF'))
    active = !active
  }
})()

// window.store = window.vue.$store
// window.store = store
// Starts memory monitorinh (if you need it for develop, you need to change enviorment for loggin messages) memMonitorStart()
