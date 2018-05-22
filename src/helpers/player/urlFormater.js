import { getRandomBytesBase64, encryptAES } from 'helpers/crypto'
import { adjustedMoment } from 'src/helpers/time'
import store from 'src/vuex/store'

let crypt = true

export const joinParams = ({streamProps, info, delimiter}) => {
  let connectionType = store.state.networking.networkType
  let params = `channel=${streamProps.pp}`
  params += `${delimiter}stream=${streamProps.quality}`
  params += `${delimiter}sp=${streamProps.sp}`
  params += `${delimiter}u=${streamProps.user}`
  params += streamProps.p ? `${delimiter}p=${streamProps.p}` : ''
  params += streamProps.ss ? `${delimiter}ss=${streamProps.ss}` : ''
  params += streamProps.minvbr ? `${delimiter}minvbr=${streamProps.minvbr}` : ''
  params += streamProps.maxvbr !== -1 ? `${delimiter}maxvbr=${streamProps.maxvbr}` : ''
  params += streamProps.cbr ? `${delimiter}adaptive=false` : ''
  params += streamProps.startTime ? `${delimiter}t=${streamProps.startTime}` : '' // za VOD - ne slati startTime
  params += streamProps.streamType ? `${delimiter}player=${streamProps.streamType}` : `${delimiter}player=m3u8` // za VOD - m3u8v
  params += streamProps.session ? `${delimiter}session=${streamProps.session}` : ''
  // params += streamProps.xDeviceType ? `${delimiter}x-device-type=${streamProps.xDeviceType}` : '' //TODO Device type should be loaded from hal in stream.js and very fast function to execute
  params += `${delimiter}m=${streamProps.serverIp}`
  params += `${delimiter}device=${streamProps.device}`
  params += `${delimiter}ctime=${adjustedMoment()}`
  params += `${delimiter}lang=${streamProps.lang}`
  params += streamProps.fw ? `${delimiter}fw=true` : ''
  params += info ? `${delimiter}info=true` : ''
  params += connectionType ? `${delimiter}conn=${connectionType}` : `&conn=UNKNOWN`

  return params
}

export const joinParamsVoD = ({streamProps, info, delimiter}) => {
  let connectionType = store.state.networking.networkType
  let params = `${delimiter}stream=${streamProps.quality}`
  params += `${delimiter}asset=${streamProps.asset}`
  params += `${delimiter}sp=${streamProps.sp}`
  params += `${delimiter}u=${streamProps.user}`
  params += streamProps.p ? `${delimiter}p=${streamProps.p}` : ''
  params += streamProps.ss ? `${delimiter}ss=${streamProps.ss}` : ''
  params += streamProps.minvbr ? `${delimiter}minvbr=${streamProps.minvbr}` : ''
  params += streamProps.maxvbr !== -1 ? `${delimiter}maxvbr=${streamProps.maxvbr}` : ''
  params += streamProps.cbr ? `${delimiter}adaptive=false` : ''
  params += `${delimiter}t=0`
  params += streamProps.streamType ? `${delimiter}player=${streamProps.streamType}` : `${delimiter}player=m3u8`
  params += streamProps.session ? `${delimiter}session=${streamProps.session}` : ''
  // params += streamProps.xDeviceType ? `${delimiter}x-device-type=${streamProps.xDeviceType}` : '' //TODO Device type should be loaded from hal in stream.js and very fast function to execute
  params += `${delimiter}m=${streamProps.serverIp}`
  params += `${delimiter}device=${streamProps.device}`
  params += `${delimiter}ctime=${adjustedMoment()}`
  params += `${delimiter}lang=${streamProps.lang}`
  params += streamProps.fw ? `${delimiter}fw=true` : ''
  params += info ? `${delimiter}info=true` : ''
  params += connectionType ? `${delimiter}conn=${connectionType}` : `&conn=UNKNOWN`

  return params
}

export const formUrl = ({streamProps, info}) => {
  return crypt ? formEncUrl({streamProps, info}) : formClearUrl({streamProps, info})
}

export const formClearUrl = ({streamProps, info}) => {
  let state = store.state
  // let unencryptedUrl = streamDesc.streamType === 'dash' ? 'http://' : 'https://'
  streamProps.user = state.auth.keys.stream_un
  streamProps.p = state.auth.keys.stream_key
  streamProps.sp = store.state.settings.providerSupportData.values.identifier
  streamProps.device = store.state.auth.deviceNumber
  // streamProps.serverName = 'best-str.ug.cdn.united.cloud'

  let unencryptedUrl = streamProps.https ? 'https://' : 'http://'

  unencryptedUrl += streamProps.https ? `${streamProps.serverName}` : `${streamProps.serverIp}`
  unencryptedUrl += !streamProps.https ? ':8080' : ''
  unencryptedUrl += `/stream?`
  if (store.state.player.mode !== 'VOD') {
    unencryptedUrl += joinParams({
      streamProps,
      info,
      delimiter: '&'
    })
  } else {
    unencryptedUrl += joinParamsVoD({
      streamProps,
      info,
      delimiter: '&'
    })
  }

  return unencryptedUrl
}

export const formEncUrl = ({streamProps, info}) => {
  let state = store.state
  streamProps.user = state.auth.keys.stream_un
  streamProps.ss = state.auth.keys.stream_key
  // streamProps.sp = state.settings.providerSupportData.values.name
  streamProps.sp = store.state.settings.providerSupportData.values.identifier
  streamProps.device = state.auth.deviceNumber

  let initVector = getRandomBytesBase64(16)

  let preEnc

  if (store.state.player.mode !== 'VOD') {
    preEnc = joinParams({
      streamProps,
      info,
      delimiter: ';'
    })
  } else {
    preEnc = joinParamsVoD({
      streamProps,
      info,
      delimiter: ';'
    })
  }

  let encryptedText = encryptAES(initVector, streamProps.ss, preEnc)

  let encryptedUrl = streamProps.https ? 'https://' : 'http://'
  encryptedUrl += streamProps.https ? `${streamProps.serverName}` : `${streamProps.serverIp}`
  encryptedUrl += !streamProps.https ? ':8080' : ''
  encryptedUrl += `/stream?`
  encryptedUrl += 'i=' + initVector
  encryptedUrl += '&a=' + encryptedText
  encryptedUrl += '&lang=' + streamProps.lang
  encryptedUrl += '&sp=' + streamProps.sp
  encryptedUrl += '&u=' + streamProps.user
  encryptedUrl += '&session=' + streamProps.session
  encryptedUrl += streamProps.streamType ? `&player=${streamProps.streamType}` : `&player=m3u8`
  encryptedUrl += info ? '&info=true' : ''

  return encryptedUrl
}
