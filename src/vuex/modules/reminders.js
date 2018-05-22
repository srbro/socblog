import sortBy from 'lodash/fp/sortBy'
import uniqBy from 'lodash/fp/uniqBy'
import { fetchReminders, toggleRemainder } from 'helpers/api'
import { locDayLong, locMonthLong } from 'helpers/localization'
import { currentEventProgress, formatShortDate, formatShortDateCard, formatTime, getDayName, getMonthName } from 'helpers/time'
import { getImage } from 'helpers/image'
import tvLogoDefaultImage from 'assets/images/placeholders/lending_page_logo_300x168.png'
import tvEventDefaultImage from 'assets/images/placeholders/landing_page_event_300x168.png'

const IMG_SMALL = 'STB_FHD'
const TYPE_EVENT = 'EVENT_16_9'
const TYPE_LOGO = 'LOGO_16_9'
const NUMBER_OF_CHANNELS = 6

export default {
  namespaced: true,
  state: {
    data: []
  },
  actions: {
    fetchRemindersData: async ({ dispatch, commit, rootGetters }) => {
      return new Promise((resolve, reject) => {
        fetchReminders().then((response) => {
          commit('UPDATE_REMINDERS', response.data)
          resolve()
        })
      })
    },
    toggleHasReminder ({ dispatch, state, commit }, { eventId, hasReminder }) {
      toggleRemainder(eventId, hasReminder)
      dispatch('epg/toggleHasReminder', { eventId, hasReminder }, { root: true })
      dispatch('epg/eventDetailHasReminder', { eventId, hasReminder }, { root: true })
      dispatch('guide/toggleHasReminder', { eventId, hasReminder }, { root: true })
    }
  },
  getters: {
    remindersByDate: (state) => {
      let reminderDates = []
      let remindersGroupByDate = []
      let remindersData = state.data

      for (let i = 0; i < remindersData.length; i++) {
        let dateRaw = remindersData[i].startTime
        let date = formatShortDate(dateRaw)

        if (remindersData[i].status === 'ACTIVE') {
          reminderDates.push({ date, dateRaw })
        }
      }

      let reminderDatesFiltered = sortBy(['date'], uniqBy('date', reminderDates))

      for (let i = 0; i < reminderDatesFiltered.length; i++) {
        let sample = []
        for (let x = 0; x < remindersData.length; x++) {
          if (formatShortDate(remindersData[x].startTime) === reminderDatesFiltered[i].date) {
            if (remindersData[x].status === 'ACTIVE') {
              sample.push(remindersData[x])
            }
          }
        }
        let titleDate = new Date(reminderDatesFiltered[i].dateRaw)
        remindersGroupByDate.push({
          date: `${locDayLong(getDayName(titleDate))}, ${titleDate.getDate()} ${locMonthLong(getMonthName(titleDate))}`,
          items: sample,
          length: sample.length
        })
      }

      return remindersGroupByDate
    },
    rows: (state, getters) => {
      return getters.remindersByDate.map(reminders => ({
        title: reminders.date,
        cards: reminders.items
          .map(item => ({
            type: 'nowtv',
            channelId: item.channelId,
            eventId: item.event.id,
            firstRowText: item.eventTitle,
            secondRowText: `${formatShortDateCard(item.startTime)} // ${formatTime(item.startTime)} - ${formatTime(item.endTime)}`,
            startTime: item.startTime,
            endTime: item.endTime,
            progress: currentEventProgress(item.startTime, item.endTime),
            imageUrl: getImage(item.event.images, IMG_SMALL, TYPE_EVENT, tvEventDefaultImage),
            logoUrl: getImage(item.event.channelLogos, IMG_SMALL, TYPE_LOGO, tvLogoDefaultImage)
          })),
        height: {
          closed: 290,
          opened: 600
        }
      }))
    },
    slicedRows: (state, getters, commit) => {
      if (getters.rows.length !== 0) {
        return getters.rows.map(row => ({ ...row, cards: row.cards.length > 5 ? row.cards.slice(0, NUMBER_OF_CHANNELS).concat({ id: 'SHOW_ALL' }) : row.cards.slice(0, NUMBER_OF_CHANNELS) }))
      } else {
        return []
      }
    }
  },
  mutations: {
    UPDATE_REMINDERS (state, newData) {
      state.data = Object.freeze(newData)
    }
  }
}
