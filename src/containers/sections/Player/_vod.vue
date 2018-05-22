<template>
  <div class="container" @click.prevent="handleClickContainer()">
    <clock :visible="visible" />
    <div :class="playerClass" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
      <button-icon
        v-if="visible && mouseEnabled"
        class="button"
        :has-image="true"
        :imgPath="imgPath"
        @click.native.prevent="handleClickBack"
      />
      <div class="channels">
        <poster
          :image-url="posterImage"
        />
      </div>
      <div class="progress-controls vod">
        <controls
          :active="activeSection === 'controls'"
          :type="'vod'"
          :is-serie="isSerie"
          ref="controls"
        />
      </div>
      <!-- <div class="timeline">
        <events
          :active="activeSection === 'events'"
          :channels-active="activeSection === 'channels'"
          ref="events"
        />
      </div> -->
    </div>
  </div>
</template>

<script>
import indexOf from 'lodash/fp/indexOf'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
import ButtonIcon from 'components/Button'
import HistoryManager from 'mixins/HistoryManager'
import backToGuideImage from 'assets/images/back_to_guide_icon.png'

import Controls from './Controls'
import Poster from './Poster'
import common from './_common'
import { stop } from 'helpers/player'
import { getImage } from 'helpers/image'

export default {
  name: 'PlayerVod',
  mixins: [ common, HistoryManager ],
  nrData: {
    assetDuration: null
  },
  data: () => ({
    activeSection: 'controls',
    loaded: false,
    icon: 'guide'
  }),
  components: {
    Controls,
    Poster,
    ButtonIcon
  },
  computed: {
    imgPath () {
      return backToGuideImage
    },
    posterImage () {
      return getImage(this.asset.images, 'S', 'VOD_POSTER_21_31')
    },
    isSerie () {
      return this.asset.categoryIds && indexOf(202)(this.asset.categoryIds) !== -1 // 202 is for series
    },
    ...mapState({
      asset: state => state.vod.detail,
      episodeDetail: state => state.vod.episodeDetail,
      playerState: state => state.player.playState,
      liveTime: state => state.player.liveTime,
      playbackStartTime: state => state.player.playbackStartTime
    }),
    ...mapGetters({
      currentChannel: 'player/getCurrentChannel'
    })
  },
  methods: {
    handleKey (key) {
      this.resetAutohiding()

      // Global keys
      switch (key) {
        case 'SCROLLUP':
        case 'SCROLLDOWN':
          this.show()
          break
        case 'PAUSE':
          this.show()
          this.$refs.controls.pause()
          return
        case 'STOP':
          this.show()
          this.$refs.controls.pause()
          return
        case 'PLAY':
          this.$refs.controls.resume()
          this.hide()
          return
        case 'RW':
        case 'FF':
          this.activeSection = 'controls'
          this.$refs.controls.activeSubSection = 'progress'
          this.show()
      }

      // Keys that depend on hidden/visible state
      if (!this.visible) {
        switch (key) {
          case 'LEFT':
          case 'RIGHT':
            break
          case 'BACK':
            this.doHistoryBack()
            break
          default:
            this.show()
            break
        }
      } else {
        // Send key to corresponding child component handler
        switch (key) {
          case 'BACK':
            this.hide()
            break
        }

        this.$refs[this.activeSection].handleKey(key)
      }
    },
    hide () {
      this.commonHide()
      this.activeSection = 'controls'
      this.$refs.controls.activeButtonIndex = 0
      this.$refs.controls.activeSubSection = 'buttons'
    },
    ...mapMutations({ updatePlayerMode: 'player/UPDATE_MODE' }),
    ...mapActions({
      playAsset: 'player/playAsset'
      // fetchDetail: 'vod/fetchDetail'
    })
  },
  created () {
    this.type = 'VOD'
    this.$options.nrData.assetDuration = this.isSerie ? this.episodeDetail.duration : this.asset.duration
    this.show()
    this.initialize()
    // Promise.all([
    //   this.fetchDetail(this.$route.params.eventId)
    // ]).then(() => {
    //   this.loaded = true
    // })
  },
  beforeDestroy () {
    stop()
  },
  watch: {
    liveTime () {
      if (this.$options.nrData.assetDuration <= this.liveTime - this.playbackStartTime) {
        this.doHistoryBack()
      }
    }
  }
}
</script>

<style lang="scss" scoped src="./_common.scss" />
