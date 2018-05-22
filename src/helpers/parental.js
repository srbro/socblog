import find from 'lodash/fp/find'
import store from 'src/vuex/store'
import { adjustedMoment } from 'src/helpers/time'

export const checkParentalRating = function ({ channelId, startTime, event }) {
  const st = store.state
  let playerMode = 'TV'
  let newChannelId = channelId

  console.log('--------------- CHECK PARENTAL RATING MODE -----------------------', st.parentalRating.playerMode)
  console.log('--------------- CHECK PARENTAL RATING CHANNELID -----------------------', channelId)
  console.log('--------------- CHECK PARENTAL RATING ST_PLAYER_CHANNELID -----------------------', st.player.currentChannelId)
  console.log('--------------- CHECK PARENTAL RATING EVENT -----------------------', event)
  console.log('--------------- CHECK PARENTAL RATING ROUTE NAME -----------------------', st.route.name)

  if (st.route.name === 'PlayerTv' || st.route.name === 'PlayerRadio') {
    playerMode = st.player.mode
  } else {
    if (!channelId && event && event.channelId !== -1) {
      newChannelId = event.channelId
    }
    playerMode = st.parentalRating.playerMode
  }

  const channel = playerMode === 'TV' || playerMode === 'VOD'
    ? st.general.tvChannelsMap[newChannelId || st.player.currentChannelId]
    : st.general.radioChannelsMap[newChannelId || st.player.currentChannelId]

  if (channel.ageRating != null) {
    return true
  }

  if (event && Number(event.ageRating) >= 18) {
    return true
  }

  const ageRatingCache = st.epg.ageRatingCache

  const finalChannelId = newChannelId || channel.id
  const finalStartTime = startTime || adjustedMoment()

  let eventBlocked = null

  if (finalChannelId) {
    let channelInCache = ageRatingCache[finalChannelId]

    if (channelInCache) {
      eventBlocked = find(event => {
        return event.startTime <= finalStartTime && event.endTime > finalStartTime
      }, channelInCache) || null
    }
  }

  return eventBlocked !== null
}
