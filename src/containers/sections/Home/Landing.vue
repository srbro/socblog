<template>
    <landing-page
      ref="landing"
      theme="light"
      :landing-page-data="landingPageData"
      :header-title="loc('general_navigation_home')"
      :display-count="false"
      :set-active-row="activeRow"
    />
</template>

<script>
// This component is not used anywhere, it's just prepared so that the
// general landing page component can be used for Home landing page.

import { mapState, mapActions } from 'vuex'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import LandingPage from 'containers/general/LandingPage'
import HistoryManager from 'mixins/HistoryManager'
import { EventBus } from 'helpers/eventBus'

export default {
  name: 'Home',
  mixins: [ RegisterKeyHandler, HistoryManager ],
  components: { LandingPage },
  computed: {
    ...mapState({
      landingPageData: state => state.landingPage.data
    }),
    activeRow () {
      if (this.$refs.landing && this.$refs.landing.activeRow) {
        return this.$refs.landing.activeRow
      } else if (this.$route.params && this.$route.params.activeStripe) {
        return this.$route.params.activeStripe
      } else {
        return 0
      }
    }
  },
  methods: {
    handleKey (key) {
      switch (key) {
        case 'BACK':
          this.doHistoryBack()
          return
      }
      EventBus.$emit('landing', {action: 'handleKey', value: key})
    },
    ...mapActions({
      updateLandingPageData: 'landingPage/fetchLandingPageData'
    })
  },
  mounted () {
    this.updateLandingPageData()
  }
}
</script>
