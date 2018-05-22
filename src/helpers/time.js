import store from 'src/vuex/store'

export const YEAR = 86400000
export const HOUR = 3600000
export const MINUTE = 60000
export const DAY = MINUTE * 60 * 24
export const SECOND = 1000
export const HTTP_DATE = 'ddd, DD MMM YYYY HH:mm:ss [GMT]ZZ'
export const TIME = 'HH:mm'
export const SHORT_DATE = 'DD.MM.'
export const CARD_SHORT_DATE = 'DD.MM'

export const TIMEZONE_OFFSET = (new Date()).getTimezoneOffset() * MINUTE

/**
* Function calculates number of days from current or given time.
* Number of days is calculated from 00:00 of current day in base timestamp.
*
* @param dayOffset {integer} Day offset that will be applied on base, negative for past.
* @param base {integer} Timestamp in miliseconds from which offset is calculated. Defaults to current time.
* @return {integer} Timestamp, time of the day is allways 00:00
*/
export const calcDayOffset = (dayOffset, base) => {
  base = base || adjustedMoment()
  return Math.floor(base / DAY) * DAY + TIMEZONE_OFFSET + dayOffset * DAY
}

export const currentEventProgress = (startTime, endTime) => {
  if (!startTime || !endTime) return 0

  const now = adjustedMoment()
  let progress

  if (endTime < now) {
    progress = 1
  } else if (startTime > now) {
    progress = 0
  } else {
    progress = (now - startTime) / (endTime - startTime)
  }

  return Math.round(progress * 10) / 10
}

export const adjustedMoment = (m = Date.now()) => (m + store.state.general.timeOffset)

export const isSameDay = (time1, time2 = Date.now()) => (new Date(time1).toDateString() === new Date(time2).toDateString())

// HH:mm
export const formatTime = time => {
  let date = new Date(time)
  return `0${date.getHours()}`.slice(-2) + `:` + `0${date.getMinutes()}`.slice(-2)
}

export const addLeadingZeroToTime = (time) => {
  return time > 9 ? time : '0' + time
}

export const timestampVODTimeToHuman = (timestamp) => {
  let hours = addLeadingZeroToTime(Math.floor(timestamp / (1000 * 60 * 60)))
  let minutes = addLeadingZeroToTime(Math.floor(timestamp % (1000 * 60 * 60) / (1000 * 60)))
  let seconds = addLeadingZeroToTime(Math.floor(timestamp % (1000 * 60) / 1000))
  return `${hours}:${minutes}:${seconds}`
}

export const getDayName = time => {
  let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  let day = new Date(time).getDay()
  return days[day]
}

export const getMonthName = time => {
  let months = ['January', 'February', 'March', 'April', 'May', 'Jun', 'July', 'August', 'September', 'October', 'November', 'December']
  let month = new Date(time).getMonth()
  return months[month]
}

// HH.mm
export const formatTimeDot = time => {
  let date = new Date(time)
  return `0${date.getHours()}`.slice(-2) + `.` + `0${date.getMinutes()}`.slice(-2)
}

// DD.MM.YYYY.
export const formatDateCard = time => {
  let date = new Date(time)
  return `0${date.getDate()}`.slice(-2) + `.` + `0${date.getMonth() + 1}`.slice(-2) + `.` + `${date.getFullYear()}.`
}

// DD.MM.
export const formatShortDate = time => {
  let date = new Date(time)
  return `0${date.getDate()}`.slice(-2) + `.` + `0${date.getMonth() + 1}`.slice(-2) + `.`
}

// DD.MM
export const formatShortDateCard = time => {
  let date = new Date(time)
  return `${date.getDate()}.${date.getMonth() + 1}`
}

// HH:mm // DD. MM. YYYY
export const formatTimeDate = time => {
  let date = new Date(time)
  return `0${date.getHours()}`.slice(-2) + `:` + `0${date.getMinutes()}`.slice(-2) + ` // ` + `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`
}

export const formatDayTime = time => {
  let date = new Date(time)
  return `${date.getDate()}` + `0${date.getHours()}`.slice(-2) + `0${date.getMinutes()}`.slice(-2)
}

// YYYY-MM-DD HH:mm
export const formatDateTime = time => {
  let date = new Date(time)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ` + `0${date.getHours()}`.slice(-2) + ':' + `0${date.getMinutes()}`.slice(-2)
}

export const startOfDay = time => {
  let date = new Date(time)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).valueOf()
}

export const startOfHour = time => {
  let date = new Date(time)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).valueOf()
}
