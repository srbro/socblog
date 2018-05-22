let getChannelsTimeout = null
const GET_CHANNELS_TIMEOUT = 400

let getChannelsTimeout1 = null
const GET_CHANNELS_TIMEOUT1 = 500
let getChannelsPromiseReject = () => null

export default {
  namespaced: true,
  actions: {
    changeChannel (
      { commit, dispatch },
      { channelId, updateFocused, eventId, startTime, delayedPlay, checkAgeRating, forcePlay }
    ) {
      window.clearTimeout(getChannelsTimeout1)
      getChannelsPromiseReject()

      let getChannelsPromise = new Promise((resolve, reject) => {
        getChannelsPromiseReject = reject
        getChannelsTimeout1 = window.setTimeout(
          () => resolve(dispatch('playerEvents/getInitalNEvents', { channelId }, { root: true })),
          GET_CHANNELS_TIMEOUT1
        )
      })

      dispatch('player/changeChannel', { channelId, updateFocused, eventId, startTime, delayedPlay, checkAgeRating, forcePlay }, { root: true })
        .then(() => {
          getChannelsPromise
            .then(() => {
              if (eventId) {
                dispatch('player/showNewEvent', { id: eventId, live: !startTime }, { root: true })
              } else {
                dispatch('player/findCurrentEventAndShowEvent', { startTime }, { root: true })
              }
            })
            .catch(() => null)
        })
    },
    focusChannel (
      { commit, dispatch },
      { channelId, newFocusedChannelIndex, forcedType }
    ) {
      dispatch('player/focusChannel', { newFocusedChannelIndex, forcedType }, { root: true })
      window.clearTimeout(getChannelsTimeout)
      getChannelsTimeout = window.setTimeout(
        () => dispatch('playerEvents/getInitalNEvents', { channelId }, { root: true }),
        GET_CHANNELS_TIMEOUT
      )
    },
    playFirstChannel ({ dispatch, rootGetters }) {
      dispatch('player/playFirstChannel', {}, { root: true })
      let channelId = rootGetters['player/getCurrentChannelId']
      dispatch('playerEvents/getInitalNEvents', { channelId }, { root: true })
      // dispatch('playerEvents/changeChannel', { channelId }, { root: true })
    }
  }
}
