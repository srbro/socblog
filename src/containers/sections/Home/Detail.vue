<template>
  <detail-vod v-if="banner.type === 'VOD'"
    :active="true"
    :active-cta-button="activeButtonLevel === 'cta' ? activeCtaButton : -1"
    :back-active="activeButtonLevel === 'back'"
    :background-image-url="banner.image"
    :buttons="buttons"
    :full-active="activeButtonLevel === 'full'"
    :more-active="activeButtonLevel === 'more'"
    :bannerDescription="banner.description"
    :title="banner.title"
    :channelLogoImageUrl="banner.logo"
    :handle-click-back="handleClickBack"
    :mkHandleButtonClick="mkHandleButtonClick"
    :open-full-text="openFullText"
  >
  </detail-vod>
  <detail-event v-else
    :active="true"
    :active-cta-button="activeButtonLevel === 'cta' ? activeCtaButton : -1"
    :back-active="activeButtonLevel === 'back'"
    :background-image-url="banner.image"
    :buttons="buttons"
    :full-active="activeButtonLevel === 'full'"
    :more-active="activeButtonLevel === 'more'"
    :bannerDescription="banner.description"
    :title="banner.title"
    :channelLogoImageUrl="banner.logo"
    :handle-click-back="handleClickBack"
    :mkHandleButtonClick="mkHandleButtonClick"
    :open-full-text="openFullText"
  >
  </detail-event>
</template>

<script>

import { mapState, mapActions } from 'vuex'

import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import DetailScreenMixin from 'mixins/DetailScreen'
import HistoryManager from 'mixins/HistoryManager'
import DetailEvent from 'components/Detail/Event'
import DetailVod from 'components/Detail/Vod'

export default {
  name: 'HomeDetail',
  mixins: [ DetailScreenMixin, RegisterKeyHandler, HistoryManager ],
  components: { DetailEvent, DetailVod },
  data () {
    return {
      buttonLevels: ['back', 'cta', 'full'],
      loaded: false,
      selectedMoreCard: 0,
      selectedSeasonsCard: 0,
      banner: {}
    }
  },
  computed: {
    buttons () {
      let buttons = []
      if (this.banner.type !== 'EXTERNAL_LINK') {
        buttons.push({ id: 'more', icon: 'more', text: this.loc('ondemand_detailedscreen_synopsys_more') })
      } else {
        this.activeButtonLevel = 'back'
        this.buttonLevels.splice(1, 1)
      }
      return buttons
    },
    ...mapState({
      eventDetail: state => state.epg.eventDetail
    })
  },
  methods: {
    openFullText () {
      this.togglePopup({
        active: true,
        data: {
          type: 'title-text',
          title: this.banner.title,
          text: this.banner.description,
          priority: 2
        }
      })
    },
    handleKey (key) {
      if (key === 'BACK') {
        this.doHistoryBack()
        return
      }
      this.handleKeyCommon(key)
    },
    handleClickBack () {
      this.doHistoryBack()
    },
    mkHandleButtonClick (id, index) {
      let handleButtonClick = function () {
        this.activeCtaButton = index
        this.pressActiveButton()
      }

      return handleButtonClick.bind(this)
    },
    pressActiveButton () {
      if (this.activeButtonLevel === 'back') {
        this.doHistoryBack()
        // return this.exit()
      } else if (this.activeButtonLevel === 'full') {
        this.togglePopup({
          active: true,
          data: {
            type: 'title-text',
            title: this.banner.title,
            text: this.banner.description,
            priority: 2
          }
        })
      } else {
        if (this.banner.type) {
          if (this.banner.type === 'VOD') {
            this.$router.push({
              name: 'VodDetail',
              params: {
                asset: {
                  id: this.banner.id
                }
              }
            })
          } else if (this.banner.type === 'EVENT') {
            this.fetchEventDetail({
              eventId: this.banner.id,
              noInformationData: null
            }).then((e) => {
              this.$router.push({
                name: 'EventDetail'
              })
            })
          } else if (this.banner.type === 'CHANNEL') {
            this.$router.push({
              name: 'Guide',
              params: {
                columnToFocus: 'channels',
                channelId: this.banner.id
              }
            })
          }
        }
      }
    },
    exit () {
      this.$router.push({ name: this.banner.return })
    },
    ...mapActions({
      fetchEventDetail: 'epg/fetchEventDetail',
      togglePopup: 'popup/toggle'
    })
  },
  created () {
    if (this.$route.params.banner) {
      this.banner = this.$route.params.banner
    } else {
      this.exit()
    }
  }
}
</script>
