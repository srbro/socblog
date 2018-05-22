<template>
  <div :class="channelsClass">
    <h1 v-show="showDetails" class="row-title">{{ title }}<span class="channel-num">{{channelNum}}</span></h1>
    <mouse-arrows
    :selected-card="selected"
    :active-row="activeRow"
    :items-number="items.length"
    :focused-rows="focused"
    :handle-click="handleClick"
    />
    <ul class="card-row" :style="[transformX]">
      <template v-for="(item, index) in items">
        <card-now-tv
          v-if="item.id !== 'SHOW_ALL'"
          :key="item.channelId"
          :event="item"
          :selected="focused ? index === selected : false"
          :show-details="showDetails"
          :item-width="242"
          style="position: relative"
          @click.native.prevent="clickOnCard(index, rowNumber, activeRow)"
        />
        <card-see-all
          v-else
          :key="item.channelId"
          :section-title="title"
          :selected="focused ? index === selected : false"
          :show-details="showDetails"
          :type="'nowtv'"
          @click.native.prevent="clickOnCard(index, rowNumber, activeRow)"
        />
      </template>
    </ul>
  </div>
</template>

<script>
import CardNowTv from 'components/Cards/CardNowTv'
import CardSeeAll from 'components/CardSeeAll'
import MouseArrows from 'components/MouseArrows'

const CARD_WIDTH = 300
const CARD_SPACING = 12
const SELECTED_FLOATING = 2

export default {
  name: 'ReminderRow',
  components: { CardNowTv, CardSeeAll, MouseArrows },
  props: {
    items: Array,
    selected: Number,
    title: String,
    showDetails: {
      type: Boolean,
      required: true
    },
    focused: {
      type: Boolean,
      required: true
    },
    cardStyles: {
      type: Array,
      required: true
    },
    channelNum: {
      type: Number,
      required: true
    },
    activeRow: {
      type: Boolean,
      required: true
    },
    handleClick: {
      type: Function
    },
    clickOnCard: {
      type: Function
    },
    rowNumber: {
      type: Number
    }
  },
  data () {
    return {
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  },
  computed: {
    channelsClass () {
      return [
        'channels-section',
        {
          'transition': this.uiMode.reminderRowTransitionAnimation
        }
      ]
    },
    transformX () {
      let x

      if (this.selected <= SELECTED_FLOATING) {
        x = 0
      } else if (this.selected > SELECTED_FLOATING && this.selected < this.items.length - SELECTED_FLOATING) {
        x = (CARD_WIDTH + CARD_SPACING) * (this.selected - 2)
      } else if (this.selected === this.items.length - SELECTED_FLOATING) {
        x = (CARD_WIDTH + CARD_SPACING) * (this.selected - 3)
      }

      return {
        transform: !this.translateMode.translate ? `translate3d(${-x}rem, 0, 0)` : `translate(${-x}rem, 0)`
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

$font-size: 40rem;
$margin: 27rem;

.channels-section {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  flex-basis: fit-content;
  align-content: flex-start;
  // width: 100%;
  position: absolute;
  transform-origin: left center;

  &.transition {
    transition: transform $transition;
  }

  .arrows-container {
    left: 20px;
    margin-top: -50rem;
  }

  .row-title {
    margin-top: 23rem;
    font-family: "Roboto Condensed";
    font-size: $font-size;
    margin-bottom: $margin;
    display: flex;

    .channel-num {
      display: inline-block;
      height: 44rem;
      width: 44rem;
      background-color: $blue-medium;
      font-size: 24rem;
      color: #fff;
      text-align: center;
      line-height: 45rem;
      border-radius: 4rem;
      margin-left: 20rem;
    }
  }
}

.card-row {
  width: 100%;
  position: relative;
  display: flex;
  transform-origin: left top;
  transition: transform $transition;
  .card-container {
    margin-left: 12rem;
    transition: transform $transition;
    .card {
      width: 300rem;
      height: auto;
      transition: transform $transition;
      .logo {
        width: 100%;
        transition: transform $transition;
        transform: scale3d(0.8,0.8,0.8);
      }
      .detail-container {
        top: 326rem;
        @include transform(translate3d(0, -111rem, 0));

        &.translate {
          @include transform(translate(0, -111rem));
        }
      }
    }
    &.is-selected {
      .card {
        background-color: $white;
        .logo {
          transform: scale3d(0.9,0.9,0.9);
        }
        .description {
          background-color: $blue;
        }
      }
    }
  }
}
</style>
