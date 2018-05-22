import find from 'lodash/fp/find'
import store from 'src/vuex/store'
import { loc } from 'helpers/localization'
import { MEDIA_RADIO } from 'src/helpers/player/playerConst'

export const getQuality = (availableQualityList) => {
  let desiredVbr = getDesiredVbr()

  let bestRenderProfile = findBestQuality(availableQualityList, desiredVbr)

  if (!bestRenderProfile) {
    bestRenderProfile = findOverLimitQuality(availableQualityList, desiredVbr)
    console.log(`quality over limit: ` + JSON.stringify(bestRenderProfile))
  }

  if (!bestRenderProfile) {
    bestRenderProfile = getDefaultQuality(availableQualityList)
    console.log(`quality default   : ` + JSON.stringify(bestRenderProfile))
  }

  console.log(`final quality: ` + JSON.stringify(bestRenderProfile))
  return bestRenderProfile || null
}

export const getDesiredVbr = () => {
  let vbr = store.getters['settings/getVideoQuality']
  return vbr
}

export const getMaxVbr = (quality, type) => {
  let desiredVbr = getDesiredVbr()
  let qual = desiredVbr
  if (type !== MEDIA_RADIO) {
    qual = quality.videoBitrate <= desiredVbr ? desiredVbr : quality.videoBitrate
  }
  return qual
}

export const getMinVbr = (type) => {
  return type === MEDIA_RADIO ? 0 : 100 // removes ao96 quality from playlist
}

export const getAbrCbr = () => {
  return store.state.settings.videoEncoding
}

export const getDefaultQuality = (availableQualityList) => {
  let renderProfiles = store.state.settings.rndProfiles
  let defaultRender = find({id: availableQualityList[0]}, renderProfiles)
  return defaultRender
}

export const findBestQuality = (availableQualityList, limit) => {
//  let best = availableQualityList[0]
  let renderProfiles = store.state.settings.rndProfiles
  let max = 0
  let maxRenderProfile
  if (limit <= 0) {
    limit = 100000
  }

  availableQualityList.forEach((qualityId) => {
    let renderProfile = find({id: qualityId}, renderProfiles)
    if (!renderProfile) return
    if (renderProfile.videoBitrate > max && renderProfile.videoBitrate < limit) {
      maxRenderProfile = renderProfile
      max = renderProfile.videoBitrate
    }
  })

  if (maxRenderProfile) {
    return maxRenderProfile
  }

  return null
}

export const findOverLimitQuality = (qualityIdList, limit) => {
  let renderProfiles = store.state.settings.rndProfiles
  let clsProfile = null
  let matchingBitrate = renderProfiles[qualityIdList[0]].videoBitrate
  let minDiff = 100000

  for (let i = 0; i < qualityIdList.length; i += 1) {
    let cur = find({id: qualityIdList[i]}, renderProfiles)
    if (cur.videoBitrate > limit &&
      Math.abs(cur.videoBitrate - matchingBitrate) < minDiff) {
      clsProfile = cur
      minDiff = Math.abs(cur.videoBitrate - matchingBitrate)
      matchingBitrate = minDiff
    }
  }
  console.log('Closest qual : ' + clsProfile)

  return clsProfile
}

export const getAnyVideoBitrate = (availableQualityList) => {
  let renderProfiles = store.state.settings.rndProfiles

  for (let i = 0; i < availableQualityList.length; i += 1) {
    let qualityId = availableQualityList[i]
    let renderProfile = find({id: qualityId}, renderProfiles) || renderProfiles[0]
    if (renderProfile.videoBitrate) {
      return renderProfile.videoBitrate
    }
  }

  return 0
}

export const localizeVideoQualityData = function (videoQualityObj) {
  let videoEncodingType = store.state.settings.videoEncoding
  switch (videoQualityObj) {
    case 'AUTO':
      videoQualityObj = videoEncodingType === 'ABR' ? 'AUTO' : loc('stb_settings_videoquality_wifi_high')
      break
    case 'HIGH':
      videoQualityObj = loc('settings_videoquality_wifi_high')
      break
    case 'MID':
      videoQualityObj = loc('settings_videoquality_wifi_medium')
      break
    case 'LOW':
      videoQualityObj = loc('settings_videoquality_wifi_low')
      break
  }
  return videoQualityObj
}
