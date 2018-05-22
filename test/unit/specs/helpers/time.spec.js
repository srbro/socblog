import {
  formatTime,
  formatTimeDot,
  formatShortDate,
  formatShortDateCard,
  formatTimeDate,
  formatDayTime,
  formatDateTime,
  currentEventProgress,
  startOfDay,
  startOfHour,
  getMonthName,
  isSameDay,
  calcDayOffset,
  TIMEZONE_OFFSET } from 'src/helpers/time'

describe('time.js', () => {
  const now = 1511864095117 // Tue Nov 28 2017 11:14:55 GMT+0100 (CET)
  const newDate = 1514786766000 // Mon, 01 Jan 2018 06:06:06

  describe('Format method', () => {
    it('formatTime should return correctly formatted string', () => {
      expect(formatTime(now)).to.equal('11:14')
    })
    it('formatTimeDot should return correctly formatted string', () => {
      expect(formatTimeDot(now)).to.equal('11.14')
    })
    it('formatShortDate should return correctly formatted string', () => {
      expect(formatShortDate(now)).to.equal('28.11.')
    })
    it('formatShortDate should return correctly formatted string', () => {
      expect(formatShortDate(newDate)).to.equal('01.01.')
    })
    it('formatShortDateCard should return correctly formatted string', () => {
      expect(formatShortDateCard(now)).to.equal('28.11')
    })
    it('formatTimeDate should return correctly formatted string', () => {
      expect(formatTimeDate(now)).to.equal('11:14 // 28. 11. 2017')
    })
    it('formatDayTime should return correctly formatted string', () => {
      expect(formatDayTime(now)).to.equal('281114')
    })
    it('formatDateTime should return correctly formatted string', () => {
      expect(formatDateTime(now)).to.equal('2017-11-28 11:14')
    })
    it('getMonthName should return correctly month name', () => {
      expect(getMonthName(now)).to.equal('November')
    })
  })

  describe('Method', () => {
    it('currentEventProgress should return correct value', () => {
      let curDate = Date.now()
      expect(currentEventProgress(curDate - 60000, curDate + 60000)).to.equal(0.5)
    })
    it('startOfDay should return correct value', () => {
      expect(startOfDay(now)).to.equal(1511823600000)
    })
    it('startOfHour should return correct value', () => {
      expect(startOfHour(now)).to.equal(1511863200000)
    })
    it('isSameDay should return correct value', () => {
      expect(isSameDay(now, now - 3600000)).to.equal(true)
    })
    it('calcDayOffset should return proper time offset', () => {
      let targetTimestampAddon = 59442567 // Math.floor((Math.random() + 0.01) * 100 * 364.25) * DAY
      let targetTimestampBase = 3048710400000 // Math.floor(Math.random() * DAY)
      let targetTimestamp = targetTimestampBase + targetTimestampAddon
      let offset = 224 // Math.floor((Math.random() + 0.0003) * 365) * (Math.random() < .5 ? -1 : 1)
      let result = 3068064000000 + TIMEZONE_OFFSET// targetTimestampBase + offset * DAY + TIMEZONE_OFFSET// 3068060400000
      expect(calcDayOffset(offset, targetTimestamp)).to.equal(result)
    })
  })
})
