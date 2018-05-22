import store from 'src/vuex/store'

const UPDATE_PERIOD = 4 * 60 * 60 * 1000

let intervalId = -1

const doJobs = () => {
  store.dispatch('general/fetchChannels')
  store.dispatch('epg/fetchAgeRatingCache')
  store.dispatch('vod/fetchForSelectionCCGSF')
}

export const scheduleJobs = () => {
  if (intervalId !== -1) {
    clearInterval(intervalId)
  }
  intervalId = setInterval(doJobs, UPDATE_PERIOD)
}

export const stopJobs = () => {
  clearInterval(intervalId)
}
