// import { getPlayerInfoStatic } from 'hal'
import { getAbrCbr } from './quality.js'
import { MEDIA_CHANNEL, MEDIA_RADIO, MEDIA_VOD, MEDIA_DVB } from 'src/helpers/player/playerConst'
import store from 'src/vuex/store'

const getClearStream = ({type, live, clear, cbrAbrType}) => {
  let videoType = null

  if (type === MEDIA_VOD) {
    if (cbrAbrType === 'CBR') {
      videoType = clear.vodCbrStreamingProtocol
    } else if (cbrAbrType === 'ABR') {
      videoType = clear.vodAbrStreamingProtocol
    } else {
      videoType = 'm3u8v'
    }
  } else if (type === MEDIA_DVB) {
    videoType = 'dvb'
  } else if (type === MEDIA_RADIO) {
    if (cbrAbrType === 'CBR') {
      videoType = clear.radioCbrStreamingProtocol
    } else if (cbrAbrType === 'ABR') {
      videoType = clear.radioAbrStreamingProtocol
    }
  } else if (type === MEDIA_CHANNEL) {
    if (cbrAbrType === 'CBR' && live) {
      videoType = clear.liveCbrStreamingProtocol
    } else if (cbrAbrType === 'ABR' && live) {
      videoType = clear.liveAbrStreamingProtocol
    } else if (cbrAbrType === 'CBR' && !live) {
      videoType = clear.cutvCbrStreamingProtocol
    } else if (cbrAbrType === 'ABR' && !live) {
      videoType = clear.cutvAbrStreamingProtocol
    }
  }
  return videoType
}

const getDrmRequired = ({type, live, drm, cbrAbrType}) => {
  let videoType = null

  if (type === MEDIA_VOD) {
    if (cbrAbrType === 'CBR') {
      videoType = drm.vodCbrStreamingProtocol
    } else if (cbrAbrType === 'ABR') {
      videoType = drm.vodAbrStreamingProtocol
    } else {
      videoType = 'm3u8v'
    }
  } else if (type === MEDIA_DVB) {
    videoType = 'dvb'
  } else if (type === MEDIA_RADIO) {
    if (cbrAbrType === 'CBR') {
      videoType = drm.radioCbrStreamingProtocol
    } else if (cbrAbrType === 'ABR') {
      videoType = drm.radioAbrStreamingProtocol
    }
  } else if (type === MEDIA_CHANNEL) {
    if (cbrAbrType === 'CBR' && live) {
      videoType = drm.liveCbrStreamingProtocol
    } else if (cbrAbrType === 'ABR' && live) {
      videoType = drm.liveAbrStreamingProtocol
    } else if (cbrAbrType === 'CBR' && !live) {
      videoType = drm.cutvCbrStreamingProtocol
    } else if (cbrAbrType === 'ABR' && !live) {
      videoType = drm.cutvAbrStreamingProtocol
    }
  }
  return videoType
}

export const getStreamType = ({type, drmRequired, live}) => {
  let videoType = null
  let cbrAbrType = getAbrCbr()
  let clear = store.state.corePlayer.playerInfoData.clear
  let drm = store.state.corePlayer.playerInfoData.drm
  if (drmRequired) {
    videoType = getDrmRequired({type, live, drm, cbrAbrType})
  } else {
    videoType = getClearStream({type, live, clear, cbrAbrType})
  }

  if (videoType === null) {
    videoType = store.state.settings.videoType
  }

  console.log(`STREAMS getStreamType drmRequired ${drmRequired}`)
  console.log(`STREAMS getStreamType final video type: ${videoType}`)

  return videoType
}
