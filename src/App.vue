<template>
  <main class="gui-wrapper">
    <div v-html="svgSprite"></div>
    <playback-message />
    <router-view />
    <parental-rating v-if="parentalRatingActive" />
    <transition name="show" appear>
      <popup v-if="popupActive" />
    </transition>
    <two-sided-dialog v-if="twoSidedDialogActive" />
    <input-screen v-if="inputScreenActive" />
    <router-view name="overlay"/>
  </main>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { getMacNew, initHal, appLoaded, getDeviceType, load } from 'hal'
import { setResolution } from 'helpers/resolution'
import { initUpdateTicker } from 'src/UpdateTicker'
import { scheduleJobs } from 'src/UpdateJobs'

import InputScreen from 'containers/InputScreen'
import Popup from 'containers/Popup'
import TwoSidedDialog from 'containers/twoSidedDialog/TwoSidedDialog'
import PlaybackMessage from 'containers/PlaybackMessage'
import ParentalRating from 'sections/Pin/ParentalRating'
import { weapperVersionBlock } from 'helpers/versionChecker/versionChecker'

import svgSprite from '../static/uc/icons/sprite.svg'
import log from 'helpers/logger'

import Raven from 'raven-js'

// import ver from 'version'

/* global measurePerf */

export default {
  name: 'app',
  components: {
    Popup,
    InputScreen,
    PlaybackMessage,
    TwoSidedDialog,
    ParentalRating
  },
  data: () => ({ svgSprite }),
  computed: mapState({
    inputScreenActive: state => state.inputScreen.active,
    popupActive: state => state.popup.active,
    twoSidedDialogActive: state => state.twoSidedDialog.active,
    parentalRatingActive: state => state.parentalRating.active,
    buildVersion: state => state.software.buildVersion,
    userLocalIP: state => state.networking.userLocalIP
  }),
  methods: {
    ...mapActions({
      initAuth: 'auth/initAuth',
      setAppMode: 'general/setAppMode',
      copyPlayerInfoData: 'corePlayer/copyPlayerInfoData'
    })
  },
  async created () {
    setResolution()
    await initHal()
    Raven.setTagsContext(
      { mac: getMacNew(),
        deviceType: getDeviceType(),
        version: `${this.buildVersion}`,
        localIP: `${this.userLocalIP}`
      })
    log.setHeader({measurePerf: measurePerf || false})
    this.setAppMode()
    this.initAuth({currentRoute: this.$route.name})
    this.copyPlayerInfoData()
    initUpdateTicker()
    scheduleJobs()
    appLoaded() // brisi ovo, takodje i u svim Hal-ovima
    weapperVersionBlock()
    if (load('debugger')) {
      log.setDebuggingMode(true)
    }

    // Memory check
    // const MEMORY_TIMER_PER_HOUR = 60 * 60000
    // let counter = 0
    // save(`MemoryUsage_${counter}`, `jsHeapSizeLimit: ${window.performance.memory.jsHeapSizeLimit} / totalHeapSize: ${window.performance.memory.totalJSHeapSize} / used: ${window.performance.memory.usedJSHeapSize}`)
    // setInterval(() => {
    //   counter++
    //   save(`MemoryUsage_${counter}`, `jsHeapSizeLimit: ${window.performance.memory.jsHeapSizeLimit} / totalHeapSize: ${window.performance.memory.totalJSHeapSize} / used: ${window.performance.memory.usedJSHeapSize}`)
    //   if (window.performance.memory.totalJSHeapSize > (window.performance.memory.jsHeapSizeLimit / 100) * 85) {
    //     Raven.captureMessage('HeapSize > 85% limit', {
    //       level: 'error',
    //       extra: { log: `Limit = ${window.performance.memory.jsHeapSizeLimit} / HeapSize = ${window.performance.memory.totalJSHeapSize}` }
    //     })
    //   }
    // }, MEMORY_TIMER_PER_HOUR)
  }
}
</script>

<style lang="scss" src="./scss/style.scss"></style>
