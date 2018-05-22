import { MEDIA_CHANNEL, MEDIA_RADIO, MEDIA_VOD, MEDIA_DVB } from 'src/helpers/player/playerConst'
import { LIVE, TIMESHIFT, VOD } from 'helpers/serversConst'
import { getQuality, getMaxVbr, getMinVbr, getAbrCbr } from './quality.js'
// import { getPlatform } from 'hal'
import store from 'src/vuex/store'
import { getStreamType } from './streamType.js'

export const calcGUID = () => {
  function s4 () {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1)
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4()
}

const calcStartTime = (startTime) => {
  if (startTime === null || startTime === undefined) {
    return null
  } else {
    return Math.min(startTime, Date.now() - 30 * 1000)
  }
}

const getServer = ({type, startTime}) => {
  let server
  switch (type) {
    case MEDIA_CHANNEL:
      server = startTime ? store.getters['servers/getServer'](TIMESHIFT)
        : store.getters['servers/getServer'](LIVE)
      break
    case MEDIA_VOD:
      server = store.getters['servers/getServer'](VOD)
      break
    case MEDIA_RADIO:
      server = store.getters['servers/getServer'](LIVE)
      break
    case MEDIA_DVB:
      server = store.getters['servers/getServer'](LIVE)
      break
    default:
      // return 'best-str.ug.cdn.united.cloud'
      return null
  }
  return server
}

export const changeServer = ({type, startTime}) => {
  switch (type) {
    case MEDIA_CHANNEL:
      startTime ? store.dispatch('servers/nextServer', {name: TIMESHIFT})
        : store.dispatch('servers/nextServer', {name: LIVE})
      break
    case MEDIA_VOD:
      store.dispatch('servers/nextServer', {name: VOD})
      break
    case MEDIA_RADIO:
      store.dispatch('servers/nextServer', {name: LIVE})
      break
    case MEDIA_DVB:
      startTime ? store.dispatch('servers/nextServer', {name: TIMESHIFT})
        : store.dispatch('servers/nextServer', {name: LIVE})
      break
  }
}

const getDvbInfoData = (dvbDataInfo) => {
  if (dvbDataInfo === null || dvbDataInfo === undefined) {
    return {originalNetworkId: null, serviceId: null, transportStreamId: null}
  } else {
    return {originalNetworkId: dvbDataInfo.originalNetworkId, serviceId: dvbDataInfo.serviceId, transportStreamId: dvbDataInfo.transportStreamId}
  }
}

export const calcStreamProps = ({videoDesc, streamId}) => {
  if (!videoDesc.publishingPoint || !videoDesc.publishingPoint[0]) {
    return null
  }
  console.log('VOD CALC', videoDesc.publishingPoint)
  let server = getServer({type: videoDesc.media})
  let quality = getQuality(videoDesc.publishingPoint[0].profileIds)
  // let overLimitVbr = findOverLimitQuality(videoDesc.publishingPoint[0].profileIds, quality.videoBitrate)
  // console.log('overLimitVbr: ' + JSON.stringify(overLimitVbr))
  let desc = {
    serverName: server.hostname,
    serverIp: server.ip,
    pp: videoDesc.publishingPoint[0].publishingPoint,
    quality: quality.coreStreamId,
    startTime: calcStartTime(videoDesc.startTime),
    maxvbr: getMaxVbr(quality, videoDesc.media),
    minvbr: getMinVbr(videoDesc.media),
    videoBitrate: quality.videoBitrate,
    cbr: getAbrCbr() === 'CBR',
    media: videoDesc.media,
    // cbr: false,
    streamType: getStreamType({type: videoDesc.media, drmRequired: videoDesc.drmRequired, live: videoDesc.startTime}),
    lang: store.state.settings.interfaceLanguage,
    session: streamId || calcGUID(),
    originalNetworkId: getDvbInfoData(videoDesc.dvbInfo).originalNetworkId,
    serviceId: getDvbInfoData(videoDesc.dvbInfo).serviceId,
    transportStreamId: getDvbInfoData(videoDesc.dvbInfo).transportStreamId
  }
  if (store.state.player.mode === 'VOD') {
    desc.asset = videoDesc.publishingPoint[0].publishingPoint
  }
  console.log(`videoDesc.drmRequired ${videoDesc.drmRequired}`)
  if (desc.getQuality) {
    return null
  }
  return desc
}
