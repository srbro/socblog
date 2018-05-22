import { map, range, find } from 'lodash'
import store from 'src/vuex/store'
import tvEventDefaultImage from 'assets/images/placeholders/landing_page_event_300x168.png'
import { formatTime, formatDayTime, HOUR } from 'helpers/time'

export const sleep = time => new Promise(resolve => setTimeout(resolve, time))

export const OFFSET_LEFT = { active: 106, inactive: 85 }

export const defaultEPG = (startTime, endTime, channelId, currentEvent) => {
  const now = Date.now()
  currentEvent = currentEvent || {}
  return map(range(startTime, endTime, HOUR), function (i) {
    return {
      endTime: i + HOUR,
      hasReminder: false,
      id: 'blank_' + uniqueID(i) + String(channelId),
      label: 'No information',
      live: false,
      channelId: channelId,
      startTime: i,
      thumbnail: tvEventDefaultImage,
      title: 'No information',
      selfCreated: 1,
      type: 'event',
      playIcon: currentEvent.startTime === i,
      nowPoint: now >= i && now <= i + HOUR,
      time: formatTime(i),
      ageRating: '0'
    }
  })
}

export const getCategory = (type, id) => {
  return find(store.state.general[`${type}Categories`], {id: id})
}

export const getRadioCategory = (categories) => {
  const primaryCatId = find(categories, {'primary': true})
  if (primaryCatId) {
    const primaryCat = getCategory('radio', primaryCatId.id)
    return primaryCat.name
  }
  return ''
}

export const uniqueID = (time) => (formatDayTime(time))

export const eventCutvBlocked = (time, startTime) => (startTime > Date.now() - time)
