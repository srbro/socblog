<template>
  <div :class="containerClass" style="height: 100%">
    <landing-page
      ref="landing"
      theme="light"
      :landing-page-data="getPreparedFavoritesData"
      :header-title="loc('mylibrary_favorites')"
      :display-count="true"
      :set-active-row="activeRow"
    />
  </div>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import LandingPage from 'containers/general/LandingPage'
import HistoryManager from 'mixins/HistoryManager'
import { EventBus } from 'helpers/eventBus'

export default {
  name: 'Favorites',
  mixins: [ RegisterKeyHandler, HistoryManager ],
  components: { LandingPage },
  computed: {
    containerClass () {
      return [
        {
          // 'container': this.getNavigationActive,
          'no-padding': !this.getNavigationActive
        }
      ]
    },
    activeRow () {
      if (this.getTvFavorites.items.length === 0 && this.getVodFavorites.items.length === 0) {
        this.toggleNavigation(true)
      }
      if (this.$refs.landing && this.$refs.landing.activeRow) {
        return this.$refs.landing.activeRow
      } else if (this.$route.params && this.$route.params.activeStripe) {
        return this.$route.params.activeStripe
      } else {
        return 0
      }
    },
    ...mapGetters({
      getTvFavorites: 'eventFavorites/getTvFavorites',
      getVodFavorites: 'eventFavorites/getVodFavorites',
      getPreparedFavoritesData: 'eventFavorites/getPreparedFavoritesData',
      getNavigationActive: 'navigation/getNavigationActive'
    })
  },
  methods: {
    handleKey (key) {
      if (key === 'BACK') {
        this.doHistoryBack()
        return
      }
      EventBus.$emit('landing', {action: 'handleKey', value: key})
    },
    ...mapActions({
      getCurrentFavoritesData: 'eventFavorites/fetchFavoritesData',
      getVodAssets: 'vod/fetchAssets',
      toggleNavigation: 'navigation/toggle'
    }),
    ...mapMutations({
      resetAssets: 'vod/RESET_ASSETS'
    })
  },
  mounted () {
    this.getCurrentFavoritesData()
    this.resetAssets()
    this.getVodAssets({inFavorites: true, size: 6})
  }
}
</script>

<style scoped lang="scss">
@import 'variables';

.container {
  height: 100%;
  width: 100%;
  padding: 0rem;
  .header-container {
    margin-bottom: 20rem;
  }
}

.container.container-light {
  z-index: 1;
}

</style>
