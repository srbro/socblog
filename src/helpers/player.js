import { streamVideo, streamAudio, streamVODVideo, pauseStream, stop as stopStream, timeTravelVOD, resumeVideoVOD } from 'hal'
import store from 'src/vuex/store'
import { adjustedMoment } from 'src/helpers/time'
// import { fetchInfo } from 'src/helpers/player/restart'
import { streamWatcher, fetchInfo } from 'src/helpers/player/restart'
import { calcStreamProps } from 'src/helpers/player/streams'
import { formUrl } from 'src/helpers/player/urlFormater'
import { MEDIA_CHANNEL, MEDIA_RADIO, MEDIA_VOD, MEDIA_DVB } from 'src/helpers/player/playerConst'
import { getAnyVideoBitrate } from 'src/helpers/player/quality'
import { loc } from 'helpers/localization'

// var timeout stream info
let fetchInfoTimeout = -1

const HTTPS = true

let absoluteStartTime = 0
let relativeStartTime = 0
let pausedTime = 0
let currentState = 'STOP'
let isWatched = false
let currentVideoChannelObj = {}

export const getCurrentTime = () => {
  let t = currentState === 'PLAY' ? adjustedMoment() - absoluteStartTime + relativeStartTime : pausedTime
  return t
}

export const getRadioChannel = (channelObj) => {
  // channelObj.categoryId = channelObj.categoryId || 101
  channelObj.media = MEDIA_RADIO

  // let channels = store.state.general.radioChannels[channelObj.categoryId]
  // let channel = find({id: channelObj.channelId}, channels)
  let channel = store.state.general.radioChannelsMap[channelObj.channelId]
  return channel
}

export const playRadio = (channelObj) => {
  let channel = getRadioChannel(channelObj)
  if (channel && !channel.liveEnabled && channelObj && !channelObj.startTime) {
    store.dispatch('playbackMessage/toggle', ({
      active: true,
      description: {
        title: loc('message_guide_title_info'),
        textSub: loc('message_live_not_available')
      } }))
    stopStream()
  } else {
    currentVideoChannelObj = channelObj
    playChannel(channelObj, channel)
  }
}

/*
* @function isDVB
*
* Checks if channel is dvb and contains all neccessery DVB data for playing.
* Data check is added to enable playing OTT channels in hybrid mode.
* This should be done on server side to enable client to properly decide
* how to play channel - as a DVB or OTT
* Until then, this function will have side-effect that all misconfigured
* DVB channels are fallbacked to OTT, which is not desirable.
*
*/

const isDVB = (channel) =>
  channel.dvbInfo && channel.dvbInfo.transportStreamId !== null && channel.dvbInfo.serviceId !== null

export const getVideoChannel = (channelObj) => {
  let channel = store.state.general.tvChannelsMap[channelObj.channelId]
  if (store.getters['auth/getStbMode'] === 'HYBRID' && isDVB(channel) &&
      (channelObj.startTime === 0 || channelObj.startTime === undefined)) {
    channelObj.media = MEDIA_DVB
  } else {
    channelObj.media = MEDIA_CHANNEL
  }
  return channel
}

export const getVODAsset = () => {
  let newAsset = Object.assign(
    {},
    store.state.player.asset,
    {
      startTime: store.state.player.liveTime - store.state.player.playbackStartTime
    }
  )
  store.commit(
    'player/UPDATE_ASSET',
    newAsset
  )
  return newAsset
}

export const playVideo = (channelObj) => {
  let channel = getVideoChannel(channelObj)
  if (channel && !channel.liveEnabled && channelObj && !channelObj.startTime) {
    store.dispatch('playbackMessage/toggle', ({
      active: true,
      description: {
        title: loc('message_guide_title_info'),
        textSub: loc('message_live_not_available')
      }}))
    stopStream()
  } else {
    currentVideoChannelObj = channelObj
    playChannel(channelObj, channel)
  }
}

export const playVod = (asset) => {
  asset.media = MEDIA_VOD
  currentVideoChannelObj = asset
  internalPlayVideo(asset)
}

const playChannel = (channelObj, channel) => {
  store.dispatch('corePlayer/setStarted', {streamId: -1})
  if (channel && channel.publishingPoint) {
    if (channel.subscribed) {
      let videoDesc = {
        publishingPoint: channel.publishingPoint,
        startTime: channelObj.startTime,
        media: channelObj.media,
        drmRequired: channel.drmRequired,
        dvbInfo: channel.dvbInfo
      }
      internalPlayVideo(videoDesc)
    } else {
      store.dispatch('playbackMessage/toggle', ({
        active: true,
        description: {
          title: loc('message_guide_title_info'),
          textSub: loc('message_guide_description_problem_notsubsribed_channel')
        }
      }))
      stopStream()
    }
  } else {
    store.dispatch('playbackMessage/toggle', ({
      active: true,
      description: {
        title: loc('message_guide_title_info'),
        textSub: loc('message_channel_notavailable')
      }
    }))
    stopStream()
  }
}

export const internalPlayVideo = (videoDesc) => {
  // calculate stream properties - should return all stream details needed for playing video, this needs to be available for stream restarting
  let streamProps = calcStreamProps({videoDesc, useDomain: true})

  console.log('PLAYER streamProps: ' + JSON.stringify(streamProps))

  if (streamProps === null) {
    store.dispatch('playbackMessage/toggle', ({
      active: true,
      description: {
        title: loc('message_guide_title_info'),
        textSub: loc('message_channel_notavailable')
      }
    }))
    stopStream()
    return
  }
  if (store.state.playbackMessage.active) {
    store.dispatch('playbackMessage/toggle', { active: false }, { root: true })
  }

  streamProps.https = HTTPS

  // Start tracking stream progress
  absoluteStartTime = adjustedMoment()
  relativeStartTime = videoDesc.startTime || absoluteStartTime
  currentState = 'PLAY'

  // check parental rating:
  if (store.state.parentalRating.streamBlocked) return

  // Form url
  let url = formUrl({streamProps})
  store.dispatch('corePlayer/setStarted', {streamId: streamProps.session})
  const stbMode = store.getters['auth/getStbMode']
  if (streamProps.media === MEDIA_CHANNEL || streamProps.media === MEDIA_DVB) {
    streamVideo({ url, streamType: streamProps.streamType, streamId: streamProps.session, startTime: streamProps.startTime, originalNetworkId: streamProps.originalNetworkId, streamIdDvb: streamProps.transportStreamId, serviceId: streamProps.serviceId })
  } else if (streamProps.media === MEDIA_VOD) {
    streamVODVideo({
      url,
      streamType: streamProps.streamType,
      streamId: streamProps.session,
      startTime: streamProps.startTime
    })
  } else {
    if (streamProps.videoBitrate === 0) {
      streamAudio({ url, streamType: streamProps.streamType, streamId: streamProps.session, originalNetworkId: streamProps.originalNetworkId, streamIdDvb: streamProps.transportStreamId, serviceId: streamProps.serviceId })
    } else {
      streamVideo({ url, streamType: streamProps.streamType, streamId: streamProps.session, originalNetworkId: streamProps.originalNetworkId, streamIdDvb: streamProps.transportStreamId, serviceId: streamProps.serviceId })
    }
  }

  if (streamProps.startTime || stbMode !== 'HYBRID') {
    // set watcher
    if (!isWatched) {
      store.watch(() => store.getters['corePlayer/getStream'], streamWatcher)
      isWatched = true
    }

    // get intial server info
    window.clearTimeout(fetchInfoTimeout)
    fetchInfoTimeout = window.setTimeout(() => {
      fetchInfo(streamProps, videoDesc.media)
    }, 1000)
  }
}

export const scrubVOD = ({ startTime }) => {
  timeTravelVOD({ startTime })
}

export const hasVideoQuality = (channelObj) => {
  let channel = getRadioChannel(channelObj)
  let anyBitrate = getAnyVideoBitrate(channel.publishingPoint[0].profileIds)
  return anyBitrate !== 0
}

export const pause = () => {
  pausedTime = getCurrentTime()
  currentState = 'PAUSE'
  pauseStream()
}

export const resume = () => {
  if (currentState === 'PAUSE') {
    if (currentVideoChannelObj.media === MEDIA_RADIO) {
      playRadio(currentVideoChannelObj)
    } else if (currentVideoChannelObj.media === MEDIA_CHANNEL) {
      currentVideoChannelObj.startTime = getCurrentTime()
      playVideo(currentVideoChannelObj)
    } else if (currentVideoChannelObj.media === MEDIA_DVB) {
      // currentVideoChannelObj.startTime = getCurrentTime()
      // playVideo(currentVideoChannelObj)
      let streamPausedTime = pausedTime
      let nowTime = adjustedMoment()
      if ((nowTime - streamPausedTime) > 5000) {
        currentVideoChannelObj.startTime = streamPausedTime
      } else {
        currentVideoChannelObj.startTime = 0
      }
      playVideo(currentVideoChannelObj)
    }
  }
}

export const resumeVOD = () => {
  currentState = 'PLAY'
  resumeVideoVOD()
}

export const pauseVOD = () => {
  pausedTime = getCurrentTime()
  currentState = 'PAUSE'
  pauseStream()
}

export const stop = () => {
  currentState = 'STOP'
  stopStream()
}

export const restart = (streamId) => {
  if (currentState !== 'PLAY') {
    console.log(`PLAYER RESTART - player state === PLAY`)
    store.dispatch('corePlayer/setPlaying', {
      streamId: streamId
    })
    return null
  }
  if (currentVideoChannelObj.media === MEDIA_DVB) {
    console.log(`PLAYER RESTART - Skip for DVB channel`)
    return null
  }
  let channel
  if (currentVideoChannelObj.startTime) {
    currentVideoChannelObj.startTime = getCurrentTime()
  }
  if (currentVideoChannelObj.media === MEDIA_RADIO) {
    channel = getRadioChannel(currentVideoChannelObj)
  } else if (currentVideoChannelObj.media === MEDIA_CHANNEL) {
    channel = getVideoChannel(currentVideoChannelObj)
  } else if (currentVideoChannelObj.media === MEDIA_VOD) {
    channel = getVODAsset()
    currentVideoChannelObj.startTime = channel.startTime
  }
  const videoDesc = {
    publishingPoint: channel.publishingPoint,
    startTime: currentVideoChannelObj.startTime,
    media: currentVideoChannelObj.media,
    drmRequired: channel.drmRequired,
    dvbInfo: channel.dvbInfo
  }
  const streamProps = calcStreamProps({videoDesc, useDomain: true, streamId})
  streamProps.https = HTTPS
  return { streamProps, media: currentVideoChannelObj.media, startTime: currentVideoChannelObj.startTime }
}
