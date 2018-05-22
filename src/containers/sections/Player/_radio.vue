<template>
  <div class="container" @click.prevent="handleClickContainer()">
    <radio-full-screen />
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
        <channels
          :active="visible"
          type="radio"
          ref="channels"
        />
      </div>
      <upcoming class="upcoming" />
    </div>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import common from './_common'
import HistoryManager from 'mixins/HistoryManager'
import ButtonIcon from 'components/Button'
import backToGuideImage from 'assets/images/back_to_guide_icon.png'

import RadioFullScreen from './RadioFullScreen'
import Upcoming from './Upcoming'
import { onEnterExitZap } from 'hal'
import { EventBus } from 'helpers/eventBus'

let oldPressedScroll = 0

export default {
  name: 'PlayerRadio',
  data: () => ({
    icon: 'guide'
  }),
  mixins: [ common, HistoryManager ],
  components: {
    RadioFullScreen,
    Upcoming,
    ButtonIcon
  },
  computed: {
    imgPath () {
      return backToGuideImage
    }
  },
  methods: {
    handleKey (key) {
      // TODO: Remove 'BACK' handler, it's just for dev testing.
      switch (key) {
        case 'SCROLLUP':
        case 'SCROLLDOWN':
          let newPressedScroll = new Date().getTime()
          let delayedPlay = newPressedScroll - oldPressedScroll < 500
          this.nextPrevChannel({direction: key === 'SCROLLUP' ? 'next' : 'prev', delayedPlay})
          this.show()
          oldPressedScroll = newPressedScroll
          break
        case 'BACK':
        case 'LEFT':
          this.doHistoryBack()
          break
        case 'RIGHT':
          this.hide()
          break
        case 'UP':
        case 'DOWN':
          this.show()
          break
      }

      this.resetAutohiding()

      if (this.visible) {
        EventBus.$emit('channels', {action: 'handleKey', value: key})
      } else {
        if (!isNaN(Number(key))) {
          this.$router.push({
            name: 'ChannelChange',
            params: { pressedKey: key }
          })
        } else if (key === 'OK') {
          this.show()
        }
      }
    },
    hide () {
      this.commonHide()
    },
    ...mapMutations({ updatePlayerMode: 'player/UPDATE_MODE' }),
    ...mapActions({
      changeChannel: 'player/changeChannel',
      nextPrevChannel: 'player/nextPrevChannel'
    })
  },
  created () {
    this.type = 'RADIO'
    this.initialize()
    onEnterExitZap(false)
  }
}
</script>

<style lang="scss" scoped src="./_common.scss" />
