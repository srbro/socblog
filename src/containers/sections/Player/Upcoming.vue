<template>
  <two-events :events="upcomingEvents" />
</template>

<script>
import findIndex from 'lodash/fp/findIndex'
import pick from 'lodash/fp/pick'
import { mapState } from 'vuex'

import TwoEvents from 'components/Player/TwoEvents'

export default {
  name: 'PlayerUpcoming',
  components: { TwoEvents },
  computed: {
    upcomingEvents () {
      const currentIndex = findIndex(event => {
        const now = Date.now()
        return event.startTime < now && event.endTime > now
      }, this.epgEvents)

      const basicEventInfo = event => pick(['title', 'startTime', 'endTime'], event)

      return {
        now: basicEventInfo(this.epgEvents[currentIndex]),
        next: basicEventInfo(this.epgEvents[currentIndex + 1])
      }
    },
    ...mapState({ epgEvents: state => state.playerEvents.events })
  }
}
</script>
