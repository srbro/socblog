import { measureWidth } from 'helpers/text'
import { formatTime, formatShortDateCard, formatTimeDate, YEAR } from 'helpers/time'
import CustomButton from 'components/Button'

const EVENT_NAME_MAX_WIDTH = 1140

export default {
  components: { CustomButton },
  data: () => ({
    uiMode: window.uiMode,
    translateMode: window.translateMode
  }),
  computed: {
    trimmedItemsEventNameStyle () {
      const width = measureWidth(this.title, 95, 'condensed')

      let maxWidth = EVENT_NAME_MAX_WIDTH

      if (width > maxWidth) {
        const offset = width - EVENT_NAME_MAX_WIDTH
        let transform = !this.translateMode.translate ? `translate3d(${-1 * offset}rem, 0, 0)` : `translate(${-1 * offset}rem, 0)`
        let marquee = `marquee ${offset / 100}s 1s linear backwards, marquee ${offset / 100}s ${offset / 100 + 1}s linear forwards reverse`
        let marqueeSecond = `marqueeSecond ${offset / 100}s 1s linear backwards, marqueeSecond ${offset / 100}s ${offset / 100 + 1}s linear forwards reverse`
        let animation = !this.translateMode.translate ? marquee : marqueeSecond
        return {
          'transform': transform,
          'animation': animation
        }
      }
      return { animation: 'none' }
    },
    progressStyle () {
      let duration = this.customDuration // duration in minutes
      let progress = (this.progress / 1000 / 60) * 100 / duration // progress in minutes
      return { width: `${progress}%` }
    },
    formattedStartTime () {
      if (!this.startTime) {
        return ''
      } else {
        if (formatShortDateCard(this.startTime) === formatShortDateCard(Date.now())) {
          return `${formatTime(this.startTime)} // ${this.loc('event_relativedate_today')}`
        } else if (formatShortDateCard(this.startTime) === formatShortDateCard(Date.now() - YEAR)) {
          return `${formatTime(this.startTime)} // ${this.loc('event_relativedate_yesterday')}`
        } else if (formatShortDateCard(this.startTime) === formatShortDateCard(Date.now() + YEAR)) {
          return `${formatTime(this.startTime)} // ${this.loc('event_relativedate_tomorrow')}`
        } else {
          return formatTimeDate(this.startTime)
        }
      }
    },
    duration () {
      if (this.customDuration) {
        return `${this.customDuration} min`
      } else if (this.startTime && this.endTime) {
        return `${Math.ceil((this.endTime - this.startTime) / 60000)} min`
      }
      return ''
    }
  }
}
