import { fetchServerInfo } from 'src/helpers/api'
import store from 'src/vuex/store'
import { formUrl } from 'src/helpers/player/urlFormater'
import { restart } from 'src/helpers/player'
import { changeServer, calcGUID } from 'src/helpers/player/streams'
import { adjustedMoment } from 'src/helpers/time'
import { streamVideo, streamAudio, streamVODVideo, stop } from 'hal'
import { DEFAULT_REFRESH_TIME, STREAM_ERROR } from './playerConst.js'

let restartStreamTimeout = -1
let fetchInfoTimeout = -1
// check server info

let replayStream = ({streamProps, media, corePlayer, startTime}) => {
  return () => {
    const currentCorePlayer = store.getters['corePlayer/getStream']
    if (currentCorePlayer.id === corePlayer.id && currentCorePlayer.status === STREAM_ERROR) {
      const newSession = calcGUID()
      store.dispatch('corePlayer/setStarted', {streamId: newSession})
      if (store.state.playbackMessage.active) {
        store.commit('playbackMessage/SET_ACTIVE_OFF')
      }
      streamProps.session = newSession
      let url = formUrl({streamProps})
      console.log('RESTART replayStream', url)
      // let streamType = streamProps.streamType === 'm3u8' || streamProps.streamType === 'm3u8v' ? 'hls' : 'dash'
      if (media === 2) {
        streamAudio({ url, streamType: streamProps.streamType, streamId: newSession, drmRequired: streamProps.drmRequired })
      } else if (media === 1) {
        streamVideo({ url, streamType: streamProps.streamType, streamId: newSession, drmRequired: streamProps.drmRequired })
      } else if (media === 3) {
        streamVODVideo({ url, streamId: newSession, startTime, drmRequired: streamProps.drmRequired })
      }
    } else {
      console.log(`RESTART replayStream expired ${corePlayer.id} vs current ${currentCorePlayer.id}`)
    }
  }
}

export const fetchInfo = (streamProps, media, startTime) => {
  const url = formUrl({
    streamProps,
    info: true
  })
  const corePlayer = store.getters['corePlayer/getStream']
  const request = fetchServerInfo(url)
  console.log('RESTART fetchInfo: ')
  request.then((response) => {
    console.log('RESTART response: ' + JSON.stringify(response))
    if (response.data.status !== 200) {
      let description = {
        title: response.data.title,
        text: response.data.message,
        textSub: ''
      }
      store.dispatch('playbackMessage/toggle', ({ active: true, description }))
      if (response.data.try_next_server) {
        changeServer({type: media, startTime})
      }
      if (response.data.retry_at && response.data.retry_at !== 0) {
        const timeoutTime = response.data.retry_at && response.data.retry_at !== 0 ? response.data.retry_at - adjustedMoment().valueOf() : DEFAULT_REFRESH_TIME
        window.clearTimeout(restartStreamTimeout)
        restartStreamTimeout = window.setTimeout(replayStream({streamProps, media, corePlayer, startTime}), timeoutTime)
      }
    } else {
      console.log('Restart else', response.data.status)
      if (store.state.playbackMessage.active) {
        store.commit('playbackMessage/SET_ACTIVE_OFF')
      }
      if (response.data.try_next_server) {
        changeServer({type: media, startTime})
      }
      if (corePlayer.status === STREAM_ERROR) {
        const timeoutTime = response.data.retry_at && response.data.retry_at !== 0 ? response.data.retry_at - adjustedMoment().valueOf() : DEFAULT_REFRESH_TIME
        window.clearTimeout(restartStreamTimeout)
        restartStreamTimeout = window.setTimeout(replayStream({streamProps, media, corePlayer, startTime}), timeoutTime)
      }
    }
  }).catch((response) => {
    console.log('RESTART FETCH CATCH respone ', response)
    window.clearTimeout(restartStreamTimeout)
    restartStreamTimeout = window.setTimeout(function () {
      (replayStream({streamProps, media, corePlayer, startTime}))()
      window.clearTimeout(fetchInfoTimeout)
      fetchInfoTimeout = window.setTimeout(function () {
        fetchInfo(streamProps, media)
      }, 500)
    }, DEFAULT_REFRESH_TIME)
  })
}
// watcher
export const streamWatcher = (stream) => {
  console.log('RESTART streamWatcher: ' + JSON.stringify(stream))
  console.log('RESTART stream status: ' + stream.status)
  if (stream.status === STREAM_ERROR && stream.id === store.getters['corePlayer/getStream'].id) {
    console.log('RESTART streamWatcher do restart: ', stream)
    const params = restart(stream.id)
    if (params !== null) {
      console.log('RESTART streamWatcher sending info: ', params)
      fetchInfo(params.streamProps, params.media, params.startTime)
    }
    stop()
  }
}

// TODO: check state of apllication - do not restart in backgorund - instead pause!!!
// TODO: check state of player - if paused do not trigger restart
