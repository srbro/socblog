import store from 'src/vuex/store'
import replace from 'lodash/fp/replace'

export const loc = (key) => {
  return store.state.settings.localization[key] ? store.state.settings.localization[key] : localTrans[key] || key
}

export const locDay = (key) => {
  let dayname = `guide_calendar_date_dayname_${key}_short`
  return loc(dayname)
}

export const locDayLong = (key) => {
  let dayname = `guide_calendar_date_dayname_${key}`
  return loc(dayname)
}

export const locMonth = (key) => {
  let monthname = `guide_calendar_date_month_${key}_short`
  return loc(monthname)
}

export const locMonthLong = (key) => {
  let monthname = `guide_calendar_date_month_${key}`
  return loc(monthname)
}

export const locDesc = (description) => {
  return {
    title: loc(description.title),
    titleAbove: loc(description.titleAbove),
    titleBelow: loc(description.titleBelow),
    svgId: (description.svgId)
  }
}

export const locItems = (items) => {
  return items.map((item) => ({
    id: item.id,
    label: loc(item.label),
    type: item.type,
    values: item.values
  }))
}

export const locReplace = (pattern, replacement, modifier) => (
  replace(pattern, replacement, modifier)
)

let localTrans = {
  select_event_period: 'stb_guide_nowtv_eventperiod_description',
  sort_events: 'stb_guide_nowtv_sortevents_description',
  stb_login_activation_errormessage_action_retry: 'Retry',
  stb_login_activation_errormessage_title: 'Network error',
  stb_loading_error_networkerror: '403 - Network Error',
  stb_settings_systempreferences_network_checkconnection: 'Check Connection',
  message_server_error_title: 'Information',
  exiting_app_message_question: 'Are you sure you want to exit the application?',
  message_lockedchannel_locked_wrongpin_noattempts_ok: 'OK',
  message_server_error_cancel: 'Cancel',
  forced_update_title: 'Application version outdated',
  forced_update_description: 'Your application has been outdated. Please go to store and update your app.',
  forced_update_button_exit: 'Exit application'
}
