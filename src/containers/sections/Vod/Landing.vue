<template>
  <landing-page v-if="comingSoonData != null"
    ref="landing"
    theme="dark"
    :landing-page-data="landingPageData"
    :header-title= "loc('home_ondemand')"
    :display-count="true"
    :prev-selectedrow="previoulsySelectedRow"
    :update-selectedrow="updatePreviouslySelectedRow"
    :prev-selectedcard="previouslyActiveCard"
    :update-selectedcard="updatePreviouslyActiveCard"
  />
  <coming-soon v-else
    ref="comingSoon"
    :header-title="loc('vod_comingsoon')"
    :first-paragraph="loc('loadingpage_ondemand_title')"
    :second-paragraph="loc('loadingpage_ondemand_subtitle')"/>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import LandingPage from 'containers/general/LandingPage'
import ComingSoon from 'containers/general/ComingSoon'
import HistoryManager from 'mixins/HistoryManager'
// import { EventBus } from 'helpers/eventBus'

export default {
  name: 'VodLanding',
  mixins: [ RegisterKeyHandler, HistoryManager ],
  components: { LandingPage, ComingSoon },
  computed: mapState({
    landingPageData: state => state.vod.landingPage,
    comingSoonData: state => state.vod.vodPolicy,
    previoulsySelectedRow: state => state.vod.selectedItems.vodLandingSelectedRow,
    previouslyActiveCard: state => state.vod.selectedItems.vodLandingActiveCard
  }),
  methods: {
    handleKey (key) {
      // EventBus.$emit('landing', {action: 'handleKey', value: key})
      this.$refs.landing ? this.$refs.landing.handleKey(key) : this.$refs.comingSoon.handleKey(key)
    },
    ...mapActions({
      fetchLandingPage: 'vod/fetchLandingPage'
    }),
    ...mapMutations({
      updatePreviouslySelectedRow: 'vod/UPDATE_VOD_LANDING_SELECTED_ROW',
      updatePreviouslyActiveCard: 'vod/UPDATE_VOD_LANDING_ACTIVE_CARD'
    })
  },
  mounted () {
    // TODO check if timeout is necessary
    // setTimeout(() => {
    this.fetchLandingPage()
    // }, 100)
  }
}
</script>
