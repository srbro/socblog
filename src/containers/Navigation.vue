<template>
  <div>
    <div :class="classNameNavigation">
      <lane
        :active="activeLane === 'main'"
        icons
        :items="this.restrictedItems()"
        :selected-index="selectedItemIndexes.main"
        :user="user"
        :time="currentTime"
        type="main"
        :mouse-enter="mouseEnter"
        :mouse-leave="mouseLeave"
        :toggle-navigation="toggleNavigation"
        :handle-key="handleKey"
      />
      <lane
        :active="activeLane === 'sub'"
        :items="subLaneItems"
        :selected-index="selectedItemIndexes.sub"
        :show-user="showNavigationUser"
        :mouse-enter="mouseEnter"
        :mouse-leave="mouseLeave"
        type="sub"
      />
    </div>
    <div v-if="mouseEnabled && !navigationActive" class="tooltips-container">
      <span
        class="tooltips"
        v-for="(item, index) in this.restrictedItems()"
        :key="index"
        v-if="index === hoveredItem && showTooltip"
        :style="`top: ${index * 100}rem`"
      >
        {{ loc(item.name) }}
      </span>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapGetters, mapState } from 'vuex'

import navigationItems from 'src/navigationItems.json'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import { registerUpdate, unregisterUpdate } from 'src/UpdateTicker'
import Lane from 'components/Lane'
import { emitKeyPress } from 'helpers/keyHold'
import { BACK_FLAG } from 'helpers/historyManager'
import { onEnterExitZap } from 'hal'

export default {
  name: 'Navigation',
  mixins: [ RegisterKeyHandler ],
  components: { Lane },
  data: () => ({
    user: {
      name: 'Mark Wahlberg Marky Mark',
      avatar: 'http://a5.files.biography.com/image/upload/c_fill,cs_srgb,dpr_1.0,g_face,h_300,q_80,w_300/MTE1ODA0OTcxODYwOTg1MzU3.jpg'
    },
    items: navigationItems,
    currentTime: Date.now(),
    currentTimeUpdateTimeoutId: -1,
    showTooltip: false,
    hoveredItem: 0,
    uiMode: window.uiMode,
    translateMode: window.translateMode
  }),
  computed: {
    ...mapGetters({
      selectedItemIndexes: 'navigation/getSelectedItemIndexes',
      playerRoute: 'player/getRouteName'
    }),
    ...mapState({
      activeLane: state => state.navigation.activeLane,
      navigationActive: state => state.navigation.active,
      navigationHidden: state => state.navigation.hidden,
      currentRoute: state => state.route.fullPath,
      showNavigationUser: state => state.general.gui.showNavigationUser,
      vodOption: state => state.vod.vodPolicy,
      clickedItem: state => state.clicker.lastClick,
      mouseEnabled: state => state.general.mouseEnabled,
      currentChannelId: state => state.player.currentChannelId,
      playerMode: state => state.parentalRating.playerMode
    }),
    classNameNavigation () {
      if (this.currentItems === undefined) {
        this.setActiveLane('main')
      }
      this.restrictedItems()
      return [
        'nav-background',
        {
          'is-hidden': this.navigationHidden,
          'is-active': this.navigationActive,
          'no-transition-animation': !this.uiMode.menuLaneTransitionAnimation,
          'no-shadow': !this.uiMode.menuLaneShadow,
          'translate': this.translateMode.translate
        }
      ]
    },
    subLaneItems () {
      if (this.restrictedItems()[this.selectedItemIndexes.main] && this.restrictedItems()[this.selectedItemIndexes.main].itemsSub) {
        return this.restrictedItems()[this.selectedItemIndexes.main].itemsSub.map((item, i) => {
          let clickFn = function (i) {
            this.click({
              id: `NAVIGATION_${item.id}`,
              className: 'NAVIGATION',
              params: {
                path: item.path,
                index: i,
                pathId: item.id,
                lane: 'sub'
              }
            })
          }
          item.id = (item.id).toLowerCase()
          item.click = clickFn.bind(this, i)
          return item
        })
      }
    },
    redirectPath () {
      if (this.currentItems[this.currentSelectedIndex].path) {
        return this.currentItems[this.currentSelectedIndex].path
      }
    },
    currentItems () {
      return this.activeLane === 'main' ? this.restrictedItems() : this.subLaneItems
    },
    currentSelectedIndex: {
      get () {
        return this.selectedItemIndexes[this.activeLane]
      },
      set (newValue) {
        this[this.activeLane === 'main' ? 'setMainSelectedIndex' : 'setSubSelectedIndex'](newValue)
      }
    }
  },
  methods: {
    mouseEnter (index) {
      this.showTooltip = true
      this.hoveredItem = index
      return index
    },
    mouseLeave (index) {
      this.showTooltip = false
      return index
    },
    toggleNavigation () {
      this.toggle(!this.navigationActive)
    },
    restrictedItems () {
      let newArray = []
      let acctualIndex = 0
      this.items.forEach((item, index) => {
        if (item.id !== 'vodlanding' || (this.vodOption === true || this.vodOption === null)) {
          let clickFn = function (i) {
            this.click({
              id: `NAVIGATION_${item.id}`,
              className: 'NAVIGATION',
              params: {
                path: item.path,
                index: i,
                pathId: item.id,
                lane: 'main'
              }
            })
          }
          item.id = (item.id).toLowerCase()
          item.click = clickFn.bind(this, acctualIndex)
          newArray.push(item)
          acctualIndex++
        }
      })
      return newArray
    },
    ...mapActions({
      toggle: 'navigation/toggle',
      syncWithRoute: 'navigation/syncWithRoute',
      exitApp: 'general/exitApp',
      click: 'clicker/click',
      playCurrentChannel: 'player/changeChannel'
    }),
    ...mapMutations({
      setActiveLane: 'navigation/SET_ACTIVE_LANE',
      setMainSelectedIndex: 'navigation/SET_MAIN_LANE_SELECTED_ITEM_INDEX',
      setSubSelectedIndex: 'navigation/SET_SUB_LANE_SELECTED_ITEM_INDEX',
      disableNavigation: 'navigation/SET_ACTIVE_OFF',
      updatePlayerMode: 'player/UPDATE_MODE'
    }),
    redirect () {
      if (this.currentRoute !== this.redirectPath) {
        this.$router.push(this.redirectPath)
      }
    },
    move (direction) {
      switch (direction) {
        case 'UP':
          this.currentSelectedIndex = Math.max(this.currentSelectedIndex - 1, 0)
          break
        case 'DOWN':
          this.currentSelectedIndex = Math.min(this.currentSelectedIndex + 1, this.currentItems.length - 1)
          break
        case 'HOLD_STOP': // l for web
          break
        case 'UP_HOLD':
        case 'DOWN_HOLD':
          if (emitKeyPress({ delay: 50 })) {
            this.handleHoldKey(direction)
          }
          break
        case 'LEFT':
          if (this.activeLane === 'sub') {
            this.setActiveLane('main')
            this.setSubSelectedIndex(0)
          }
          break
        case 'RIGHT':
          if (this.vodOption && this.activeLane === 'main' && this.selectedItemIndexes.main !== 2 && this.playerMode === 'VOD') {
            this.updatePlayerMode('TV')
            this.playCurrentChannel({ channelId: this.currentChannelId })
          }
          if (this.activeLane === 'main' && this.subLaneItems) {
            this.setSubSelectedIndex(0)
            this.setActiveLane('sub')
          } else {
            this.toggle(false)
          }
          break
      }
    },
    handleHoldKey (key) {
      this.currentSelectedIndex = key === 'UP_HOLD' ? Math.max(this.currentSelectedIndex - 1, 0) : Math.min(this.currentSelectedIndex + 1, this.currentItems.length - 1)
    },
    updateCurrentTime () {
      this.currentTime = Date.now()
    },
    handleKey (key) {
      const directions = {
        BACK: 'LEFT',
        OK: 'RIGHT'
      }
      const selectedIndex = this.currentSelectedIndex
      const numOfCurrentItems = this.currentItems !== undefined ? this.currentItems.length - 1 : 0
      const activeLane = this.activeLane

      // Navigation handleKey cases && watch button click case
      const commonCase = key !== 'LEFT' && key !== 'BACK' && !(key === 'OK' && (numOfCurrentItems === selectedIndex) && activeLane !== 'sub')
      const subMenuCase = (key === 'LEFT' && activeLane === 'sub') || (key === 'BACK' && activeLane === 'sub')
      const watchButtonCase = key === 'OK' && (numOfCurrentItems === selectedIndex) && activeLane !== 'sub'
      const homeButtonCase = key === 'LEFT' && activeLane === 'main' && this.selectedItemIndexes.main === 0
      const backButtonCase = key === 'BACK' && activeLane === 'main' && this.selectedItemIndexes.main === 0
      const goToHome = key === 'BACK' && activeLane === 'main' && this.selectedItemIndexes.main !== 0

      if (commonCase || subMenuCase) {
        this.move(directions[key] || key)
        // this.redirect()
        if (key === 'OK' || key === 'RIGHT' || key === 'LEFT') {
          this.redirect()
        }
      } else if (watchButtonCase || homeButtonCase) {
        if (this.playerMode === 'VOD') {
          this.updatePlayerMode('TV')
          this.playCurrentChannel({ channelId: this.currentChannelId })
        }
        this.$router.push({ name: this.playerRoute })
      } else if (goToHome) {
        this.setMainSelectedIndex(0)
        this.redirect()
      } else if (backButtonCase) {
        this.exitApp()
      }
    }
  },
  watch: {
    vodOption (newValue) {
      this.syncWithRoute()
    },
    clickedItem (newClickedData) {
      if (newClickedData.className === 'NAVIGATION') {
        this.setActiveLane(newClickedData.params.lane)
        this.currentSelectedIndex = newClickedData.params.index
        if (this.activeLane === 'main') {
          if (this.subLaneItems) {
            this.setActiveLane('sub')
            this.toggle(true)
            this.redirect()
          } else {
            this.setActiveLane('main')
            this.toggle(false)
            this.redirect()
          }
        } else {
          this.redirect()
          this.setActiveLane('main')
          this.toggle(false)
          this.setSubSelectedIndex(0)
        }
      }
    }
  },
  created () {
    if (!this.$route.params[BACK_FLAG]) {
      this.toggle(true)
    }
    this.syncWithRoute()
    registerUpdate({
      id: 'updateNavigationClock',
      type: 'FUNCTION',
      func: this.updateCurrentTime
    })
  },
  mounted () {
    setTimeout(() => {
      onEnterExitZap(true)
    }, 500)
  },
  destroyed () {
    this.toggle(false)
    unregisterUpdate('updateNavigationClock')
  }
}
</script>

<style lang="scss" scoped>
@import "variables";

.nav-background {
  background-color: $blue-dark-2;
  box-shadow: $box-shadow-default-right;
  border-left-width: 0;
  border-right-width: 4rem;
  border-right-style: solid;
  border-image: $rainbow-gradient-vertical 1 100%;
  height: 100%;
  left: 0;
  max-height: 100%;
  position: absolute;
  overflow: hidden;
  top: 0;
  width: $navigation-width;
  @include transform(translate3d(#{$navigation-width-closed - $navigation-width}, 0, 0));
  transition: transform $transition-fast;
  z-index: 2;
  will-change: transform;
  &.translate {
    @include transform(translate(#{$navigation-width-closed - $navigation-width}, 0));
  }

  &.is-active {
    @include transform(translate3d(0, 0, 0));
    &.translate {
      @include transform(translate(0, 0));
    }
  }
  &.is-hidden {
    @include transform(translate3d(#{-1 * ($navigation-width + 15rem)}, 0, 0));
    &.translate {
      @include transform(translate(#{-1 * ($navigation-width + 15rem)}, 0));
    }
  }
}
.tooltips-container {
  position: absolute;
  min-width: 400rem;
  top: 305rem;
  left: 180rem;
  position: absolute;
  font-size: 40rem;
  z-index: 10;
  font-family: 'Roboto Condensed';
  .tooltips {
    position: absolute;
    left: 0;
    display: block;
    background-color: #8e9598;
    color: $white;
    padding: 25rem 36rem;
    border-radius: 800rem;
    text-align: center;
    word-wrap: normal;
    font-weight: 300;
  }
}
</style>
