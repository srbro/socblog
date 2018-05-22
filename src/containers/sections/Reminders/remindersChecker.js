import { formatTime, SECOND } from 'helpers/time'
import { fetchReminders, setReminder } from 'helpers/api'
// import { registerUpdate } from 'src/UpdateTicker'

import store from 'src/vuex/store'
import router from 'src/router'

const UPDATE_PERIOD = 60 * SECOND
let checkRemindersTimeoutId

export const initCheckReminders = function () {
  // registerUpdate({
  //   id: 'remindersChecker',
  //   type: 'FUNCTION',
  //   func: function () {
  //     checkReminders()
  //   }
  // })
  checkRemindersTimeoutId = window.setTimeout(checkReminders, UPDATE_PERIOD)
}

const checkReminders = async function () {
  const compareTime = Date.now() + (store.state.settings.reminders * 60 * SECOND) + UPDATE_PERIOD + SECOND
  const reminders = await fetchReminders()
  let filteredReminders = reminders.data.filter((reminder) => {
    const eventStart = reminder.startTime
    return eventStart < compareTime
  })

  if (filteredReminders.length > 0) {
    filteredReminders.forEach((reminder) => {
      store.dispatch('popup/toggle', ({
        active: true,
        data: {
          type: 'reminder',
          title: 'message_guide_title_reminders',
          text: formatText(reminder),
          textSub: reminder.eventTitle,
          priority: 1,
          remainderStartTime: reminder.startTime,
          buttons: [
            {
              id: 'view',
              label: 'message_guide_action_view',
              callback (newValue) {
                router.push({
                  name: 'PlayerTv',
                  params: {
                    channelId: reminder.channelId,
                    eventId: reminder.event.id,
                    startHidden: true
                  }
                })
              }
            }
          ],
          selectedButtonIndex: 0
        }
      }))
      setReminder(reminder.event.id, false)
    })
    if (store.state.route.name === 'Reminders') {
      store.dispatch('reminders/fetchRemindersData')
    }
  }

  let popupItems = store.state.popup.data
  if (popupItems.length > 0) {
    const currentTime = Date.now()
    popupItems.forEach((popup) => {
      if (popup.remainderStartTime && popup.remainderStartTime < currentTime) {
        store.dispatch('popup/removeSinglePopup', {obj: popup})
      }
    })
  }
  window.clearTimeout(checkRemindersTimeoutId)
  checkRemindersTimeoutId = window.setTimeout(checkReminders, UPDATE_PERIOD)
}

const formatText = item => (
  `${formatTime(item.startTime)} - ${formatTime(item.endTime)}  ${channelName(item.channelId)}`
)

const channelName = id => {
  const channel = store.state.general.tvChannelsMap[id]
  return channel ? `// ${channel.name}` : ''
}
