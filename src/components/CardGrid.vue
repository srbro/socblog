<template lang="html">
  <div :class="cardsContent">
    <transition-group :css="false" :key="animationTrigger">
      <card-now-tv
        v-if="cardType ==='nowtv' || cardType ==='reminders' || cardType === 'favorites'"
        v-for="event, index in trimmedItems"
        :key="cardType ==='nowtv' || cardType ==='favorites' || event.id ? 'now-tv-' + event.id : event.eventId"
        :event="event"
        :selected="focused && trimmedIndex === index"
        :show-details="showDetails"
        :item-width="itemWidth"
        :faster-animation="fasterAnimation"
        :blocked="!currentEventCutv(event)/* || currentCutvDelay(event)*/"
        :class="[{ 'item': showDetails }, { 'item-without': !showDetails }, { 'hide': event.hide }, { 'no-transition-animation': !uiMode.cardRowTransitionAnimation }]"
        @click.native.prevent="handleClickCard(cardType ==='nowtv' || cardType ==='favorites' || event.id ? event.id : event.eventId)"
      />
      <card-vod
        v-if="cardType === 'vod'"
        v-for="item, index in trimmedItems"
        :key="'vod-' + item.id"
        :event="item"
        :selected="focused && trimmedIndex === index"
        :show-details="showDetails"
        :faster-animation="fasterAnimation"
        :class="[{ 'item-vod': showDetails }, { 'item-vod-without': !showDetails }, { 'hide': item.hide }, { 'no-transition-animation': !uiMode.cardRowTransitionAnimation }]"
        @click.native.prevent="handleClickCard(item.id)"
      />
      <card-vod-continue
        v-if="cardType === 'catchup'"
        v-for="item, index in trimmedItems"
        :key="'vod-continue-' + item.id"
        :event="item"
        :selected="focused && trimmedIndex === index"
        :show-details="showDetails"
        :faster-animation="fasterAnimation"
        :class="[{ 'item-catchup': showDetails }, { 'item-catchup-without': !showDetails }, { 'hide': item.hide }, { 'no-transition-animation': !uiMode.cardRowTransitionAnimation }]"
        @click.native.prevent="handleClickCard(item.id)"
      />
      <card-radio
        v-if="cardType === 'radio'"
        v-for="item, index in trimmedItems"
        :key="item.id ? 'radio-' + item.id : item.channelId"
        :currentPlaying="item.channelId === currentChannelId ? true : false"
        :selected="focused && trimmedIndex === index"
        :upper-image-url="item.upperImageUrl"
        :first-row-text="item.firstRowText"
        :second-row-text="item.secondRowText"
        :show-details="showDetails"
        :faster-animation="fasterAnimation"
        :class="[{ 'item-radio': showDetails }, { 'item-radio-without': !showDetails }, { 'hide': item.hide }, { 'no-transition-animation': !uiMode.cardRowTransitionAnimation }]"
        @click.native.prevent="handleClickCard(item.id)"
      />
    </transition-group>
  </div>
</template>

<script>
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import CardNowTv from 'components/Cards/CardNowTv'
import CardRadio from 'components/Cards/CardRadio'
import CardVod from 'components/Cards/CardVod'
import CardVodContinue from 'components/Cards/CardVodContinue'
import { mapState, mapActions, mapMutations } from 'vuex'
import { emitKeyPress } from 'helpers/keyHold'
import { trans } from 'animations'
import { EventBus } from 'helpers/eventBus'
import { adjustedMoment } from 'helpers/time'

// const ITEM_SPACE = 12
// const CONTINUE_DESIRED_CARD_POSITION = 270
// const RADIO_DESIRED_CARD_POSITION = -270 // 524
// const ITEMS_ROWS_UP_DOWN = 5
export default {
  name: 'CardGrid',
  components: {
    CardNowTv,
    CardRadio,
    CardVod,
    CardVodContinue
  },
  data () {
    return {
      ITEMS_ROWS_UP_DOWN: this.cardType === 'radio' || this.cardType === 'continue' ? 7 : 5,
      ITEMS_ROW_LEFT_RIGHT: 5,
      fasterAnimation: false,
      animationTrigger: false,
      selectedItem: 0,
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    showDetails: {
      type: Boolean,
      required: true
    },
    cardType: {
      type: String,
      required: true
    },
    focused: {
      type: Boolean,
      required: true
    },
    cardHeight: {
      type: Array,
      required: true
    },
    cardWidth: {
      type: Array,
      required: true
    },
    hasFilters: {
      type: Boolean,
      default: false
    },
    currentChannelId: Number,
    // setSelectedItem: {
    //   type: Number,
    //   default: 0,
    //   required: false
    // },
    channelFocused: Number,
    prevSelectedcard: Number,
    updatePrevselectedcardid: {
      type: Function,
      requred: false,
      default: () => null
    }
  },
  computed: {
    ...mapState({
      playerState: state => state.player.playState,
      asset: state => state.vod.detail,
      navigationActive: state => state.navigation.active,
      playingEventId: state => state.player.playingEvent.id,
      ageRating: state => state.parentalRating.ageRating,
      tvCategory: state => state.nowtv.tvCategory,
      tvCategoryType: state => state.nowtv.tvCategoryType,
      selectionIds: state => state.nowtv.selectionIds
    }),
    trimmedItems () {
      let fakeItemsBefore = []
      let fakeItemsAfter = []
      let topCase = 1
      if (this.selectedItem < 5) topCase = this.cardType === 'radio' || this.cardType === 'continue' ? -5 : -10
      if (this.selectedItem < 10 && this.selectedItem >= 5) topCase = -5
      if (this.selectedItem < 6 && this.cardType === 'vod') topCase = -12
      if (this.selectedItem < 12 && this.selectedItem >= 6 && this.cardType === 'vod') topCase = -6
      // topCase = this.selectedItem - 10
      const itemsLength = this.items.length
      this.selectedItem = this.selectedItem
      const startPosition = Math.max(0, Math.floor(this.selectedItem - (this.selectedItem % this.ITEMS_ROW_LEFT_RIGHT)) - (2 * this.ITEMS_ROW_LEFT_RIGHT))
      const endPosition = Math.min(this.items.length, startPosition + (this.ITEMS_ROW_LEFT_RIGHT * this.ITEMS_ROWS_UP_DOWN))
      let slice = this.items.slice(startPosition, endPosition)

      if (topCase <= 0) { // top case
        for (let i = 0; i < Math.abs(topCase); i++) {
          fakeItemsBefore.push({ id: 'fake-top-' + i, hide: true })
        }
        slice = fakeItemsBefore.concat(slice)
      }
      if (itemsLength - this.selectedItem < 10) { // bottom case
        const n = 10 - (itemsLength - this.selectedItem)
        for (let i = 0; i < n; i++) {
          fakeItemsAfter.push({ id: 'fake-bottom-' + i, hide: true })
        }
        slice = slice.concat(fakeItemsAfter)
      }
      return slice
    },
    trimmedIndex () {
      if (this.showDetails) {
        let topCase = 0
        if (this.selectedItem < 5 && this.cardType) topCase = this.cardType === 'radio' || this.cardType === 'continue' ? -5 : -10
        if (this.selectedItem < 10 && this.selectedItem >= 5) topCase = -5
        if (this.selectedItem < 6 && this.cardType === 'vod') topCase = -12
        if (this.selectedItem < 12 && this.selectedItem >= 6 && this.cardType === 'vod') topCase = -6
        // const topCase = this.selectedItem - 10
        return topCase < 0 ? this.selectedItem + Math.abs(topCase) : this.selectedItem - Math.max(0, this.selectedItem - (this.selectedItem % this.ITEMS_ROW_LEFT_RIGHT) - (2 * this.ITEMS_ROW_LEFT_RIGHT))
      } else {
        return -1
      }
      // return this.showDetails ? this.selectedItem - Math.max(0, this.selectedItem - (this.selectedItem % this.ITEMS_ROW_LEFT_RIGHT) - (2 * this.ITEMS_ROW_LEFT_RIGHT)) : -1
    },
    itemHeight () { return this.showDetails ? this.cardHeight[0] : this.cardHeight[1] },
    itemWidth () { return this.showDetails ? this.cardWidth[0] : this.cardWidth[1] },
    percent () { return this.showDetails ? 1 : 0.807 },
    cardsContent () {
      return [
        'cards-content',
        {
          'has-filters': this.hasFilters,
          'no-filters': !this.hasFilters,
          'translate': this.translateMode.translate
        }
      ]
    }
  },
  methods: {
    selectedRow () {
      return Math.floor(this.selectedItem / this.ITEMS_ROW_LEFT_RIGHT)
    },
    cardsStyle () {
      const items = this.trimmedItems
      return items.map((item, index) => {
        return {
          ...(this.animationDuration),
          width: item.width ? `width: ${item.width}rem;` : ''
        }
      })
    },
    currentEventCutv (item) {
      if (this.items.length === 0) return false
      return this.selectionIds.now[0] === -1 ? item.cutvEnabled : true
    },
    currentCutvDelay (item) {
      return item.startTime < (adjustedMoment() - item.cutvDelay)
    },
    handleKey (key) {
      switch (key) {
        case 'OK':
          if (this.cardType === 'nowtv') {
            if (!this.currentEventCutv(this.items[this.selectedItem])/* || this.currentCutvDelay(this.items[this.selectedItem]) */) return
            const selectedItem = this.items[this.selectedItem]
            if (selectedItem.progress !== 0) {
              let params = {
                eventId: selectedItem.id,
                channelId: selectedItem.channelId,
                startHidden: true,
                categoryId: this.tvCategory,
                categoryType: this.tvCategoryType
              }
              if (selectedItem.progress === 1) {
                params.startTime = selectedItem.startTime
              }
              if (selectedItem.id === this.playingEventId) {
                params.checkAgeRating = false
              }

              this.updateParentalPlayerMode('TV')

              this.checkChannelEventAgeRating({
                channelId: params.channelId,
                event: selectedItem
              })

              if (this.ageRating) {
                this.updatePlayerRedirectParams(params)
                this.parentalRating({ event: selectedItem, forcePINEnter: true })
              } else {
                this.$router.push({
                  name: 'PlayerTv',
                  params
                })
              }
            } else {
              this.fetchEventDetail({
                eventId: selectedItem.id,
                noInformationData: null
              }).then(() => {
                this.$router.push({
                  name: 'EventDetail'
                })
              })
            }
          } else if (this.cardType === 'reminders') {
            const event = this.items[this.selectedItem]
            this.fetchEventDetail({
              eventId: event.eventId,
              noInformationData: null
            }).then(() => {
              this.$router.push({
                name: 'EventDetail'
              })
            })
          } else if (this.cardType === 'favorites') {
            const event = this.items[this.selectedItem]
            this.fetchEventDetail({
              eventId: event.id,
              noInformationData: null
            }).then(() => {
              this.$router.push({
                name: 'EventDetail'
              })
            })
          } else if (this.cardType === 'vod') {
            if (this.items[this.selectedItem].categories.indexOf(208) !== -1) {
              this.$router.push({
                name: 'EpisodeDetail',
                params: {
                  seasonId: null,
                  episodeId: this.items[this.selectedItem].id,
                  asset: { imageUrl: this.items[this.selectedItem].imageUrl }
                }
              })
            } else {
              this.$router.push({
                name: 'VodDetail',
                params: {
                  asset: {
                    id: this.items[this.selectedItem].id,
                    imageUrl: this.items[this.selectedItem].imageUrl
                  }
                }
              })
            }
          } else if (this.cardType === 'radio') {
            this.updateParentalPlayerMode('RADIO')

            this.$router.push({
              name: 'PlayerRadio',
              params: {
                channelId: this.items[this.selectedItem].channelId,
                // categoryType: 'CATEGORY',
                categoryId: this.items[this.selectedItem].categories && this.items[this.selectedItem].categories.lenght > 0 ? find({primary: true})(this.items[this.selectedItem].categories) : undefined
              }
            })
          }
          break
        case 'UP':
          if (this.selectedRow() === 0) {
            // return 'focusFilters'
            this.updateGoToParentHandleKey('focusFilters')
          }
          this.moveChannelSelection('up')
          break
        case 'DOWN':
          this.moveChannelSelection('down')
          break
        case 'HOLD_STOP': // l for web
          this.fasterAnimation = false
          break
        case 'UP_HOLD':
        case 'DOWN_HOLD':
          if (emitKeyPress({ delay: 350 })) {
            this.animationDuration = { transition: `transform .350s ease` }
            this.moveChannelSelection(key === 'UP_HOLD' ? 'up' : 'down')
            this.fasterAnimation = true
          }
          break
        case 'LEFT':
          if (this.selectedItem === 0) {
            // return 'openNavigation'
            this.updateGoToParentHandleKey('openNavigation')
          } else {
            this.moveChannelSelection('left')
          }
          break
        case 'RIGHT':
          this.moveChannelSelection('right')
          break
        case 'LEFT_HOLD': // j for web
        case 'RIGHT_HOLD': // k for web
          if (emitKeyPress({ delay: 200 })) {
            this.animationDuration = { transition: `transform .2s ease` }
            this.moveChannelSelection(key === 'LEFT_HOLD' ? 'left' : 'right')
            this.fasterAnimation = true
          }
          break
      }
    },
    handleClickCard (id) {
      if (!this.navigationActive) {
        const clickedIndex = this.findItemIndex(id)
        this.selectedItem = clickedIndex > -1 ? clickedIndex : 0
        this.handleKey('OK')
      }
    },
    findItemIndex (itemId) {
      let newIndex

      switch (this.cardType) {
        case 'nowtv':
        case 'reminders':
        case 'favorites':
        case 'vod':
        case 'radio':
        case 'continue':
          newIndex = findIndex({ id: itemId }, this.items)
          break
        default:
          newIndex = findIndex({ eventId: itemId }, this.items)
          break
      }

      return newIndex
    },
    moveChannelSelection (direction) {
      const offset = {
        up: -this.ITEMS_ROW_LEFT_RIGHT,
        down: this.ITEMS_ROW_LEFT_RIGHT,
        left: -1,
        right: 1
      }[direction]
      this.selectedItem = Math.min(this.items.length - 1, Math.max(0, this.selectedItem + offset))
      if (this.$route.name === 'Radio') this.checkScrollTop()
    },
    checkScrollTop () {
      if (this.selectedRow() >= 1) {
        this.$emit('moveTop', true)
      }
      if (this.selectedRow() < 1) {
        this.$emit('moveTop', false)
      }
    },
    ...mapActions({
      fetchEventDetail: 'epg/fetchEventDetail',
      checkChannelEventAgeRating: 'parentalRating/checkChannelEventAgeRating',
      parentalRating: 'parentalRating/parentalRating'
    }),
    ...mapMutations({
      updatePlayerRedirectParams: 'parentalRating/UPDATE_PLAYER_REDIRECT_PARAMS',
      updateParentalPlayerMode: 'parentalRating/UPDATE_PLAYER_MODE',
      updateGoToParentHandleKey: 'general/UPDATE_GOTO_PARENT_HANDLEKEY'
    })
  },
  watch: {
    items (data) {
      this.animationTrigger = !this.animationTrigger
    },
    selectedItem (newIndex) {
      this.items[newIndex] && this.updatePrevselectedcardid(this.items[newIndex].id)
    },
    prevSelectedcard (newIndex) {
      this.selectedItem = newIndex
    }
  },
  created () {
    trans()
    this.selectedItem = (this.channelFocused !== undefined) ? this.channelFocused : 0
    // this.selectedItem = this.setSelectedItem
    if (this.cardType === 'vod') {
      this.ITEMS_ROW_LEFT_RIGHT = 6
    }
    if (this.prevSelectedcard) {
      this.selectedItem = this.prevSelectedcard
    }
  },
  mounted () {
    EventBus.$on('cardGrid', (obj) => {
      if (obj.action === 'handleKey') {
        this.handleKey(obj.value)
      }
    })
  },
  beforeDestroy () {
    EventBus.$off('cardGrid')
  }
}
</script>

<style scoped lang="scss">
@import "variables";
$font-size: 40rem;
$margin: 27rem;

.cards-content {
  width: 100%;
  position: relative;
  @include transform(translate3d(0, 0, 0));
  &.translate {
    @include transform(translate(0, 0));
  }
  .card-container { position: absolute; }
  &.has-filters { margin-top: 105rem; }
  &.no-filters { margin-top: 160rem; }
}

.hide { visibility: hidden; }
.item {
  transition: transform .180s;
  transform-origin: center center;
  width: 300rem;
}
.item-without {
  transition: transform .250s;
  transform-origin: top left;
  width: 300rem;
}
.item-vod {
  transition: transform .180s;
  transform-origin: center center;
  width: 248rem;
}
.item-vod-without {
  transition: transform .250s;
  transform-origin: center center;
  width: 248rem;
}
.item-radio {
  transition: transform .180s;
  transform-origin: center center;
  width: 300rem;
}
.item-radio-without {
  transition: transform .250s;
  transform-origin: top left;
  width: 300rem;
}
.item-catchup {
  transition: transform .180s;
  transform-origin: top left;
  width: 300rem;
}
.item-catchup-without {
  transition: transform .250s;
  transform-origin: top left;
  width: 300rem;
}

$elements: 26;
$row: 0;
@for $i from 0 to $elements {
  .item:nth-child(n + #{$i}) {
    top: ($row / 5)*450 - 900rem;
    left: ($i - $row)*312 - 312rem;
  }
  @if ($i != 0 and $i % 5 == 0) {
    $row: $row + 5
  }
}

$rowWithout: 0;
@for $j from 0 to $elements {
  .item-without:nth-child(n + #{$j}) {
    top: ($rowWithout / 5)*283 - 566rem;
    left: ($j - $rowWithout)*254 - 254rem;
    transform: scaleX(0.807) scaleY(0.807) scaleZ(1);
  }
  @if $j != 0 and $j % 5 == 0 {
    $rowWithout: $rowWithout + 5
  }
}

$elements: 31;
$rowVod: 0;
@for $i from 0 to $elements {
  .item-vod:nth-child(n + #{$i}) {
    top: ($rowVod / 6)*476 - 964rem; // 696rem
    left: ($i - $rowVod)*260 - 260rem;
  }
  @if ($i != 0 and $i % 6 == 0) {
    $rowVod: $rowVod + 6
  }
}

$rowVodWithout: 0;
@for $j from 0 to $elements {
  .item-vod-without:nth-child(n + #{$j}) {
    // top: ($rowVodWithout / 6)*464 - 566rem;
    top: ($rowVodWithout / 6)*310 - 650rem;
    left: ($j - $rowVodWithout)*212 - 212rem;
    transform: scaleX(0.807) scaleY(0.807) scaleZ(1);
  }
  @if $j != 0 and $j % 6 == 0 {
    $rowVodWithout: $rowVodWithout + 6
  }
}

$elementsRadio: 46;
$rowRadio: 0;
@for $i from 0 to $elementsRadio {
  .item-radio:nth-child(n + #{$i}) {
    top: ($rowRadio / 5)*278 - 278rem; // -556rem
    left: ($i - $rowRadio)*312 - 312rem;
  }
  @if ($i != 0 and $i % 5 == 0) {
    $rowRadio: $rowRadio + 5
  }
}

$rowRadioWithout: 0;
@for $j from 0 to $elementsRadio {
  .item-radio-without:nth-child(n + #{$j}) {
    top: ($rowRadioWithout / 5)*150 - 252rem;
    left: ($j - $rowRadioWithout)*254 - 254rem;
    transform: scaleX(0.807) scaleY(0.807) scaleZ(1);
  }
  @if $j != 0 and $j % 5 == 0 {
    $rowRadioWithout: $rowRadioWithout + 5
  }
}

$elementsCatchup: 46;
$catchup: 0;
@for $i from 0 to $elementsCatchup {
  .item-catchup:nth-child(n + #{$i}) {
    top: ($catchup / 5)*278 - 278rem; // -556rem
    left: ($i - $catchup)*312 - 312rem;
  }
  @if ($i != 0 and $i % 5 == 0) {
    $catchup: $catchup + 5
  }
}

$rowCatchupWithout: 0;
@for $j from 0 to $elementsCatchup {
  .item-catchup-without:nth-child(n + #{$j}) {
    top: ($rowCatchupWithout / 5)*150 - 252rem;
    left: ($j - $rowCatchupWithout)*254 - 254rem;
    transform: scaleX(0.807) scaleY(0.807) scaleZ(1);
  }
  @if $j != 0 and $j % 5 == 0 {
    $rowCatchupWithout: $rowCatchupWithout + 5
  }
}
</style>
