<template>
  <li :class="[ 'item label-event', deviceClass(), { 'hide': item.hide,
    'is-selected': isSelected, 'no-transition-animation': !uiMode.guideColumnTransitionAnimation }]"
    @click="click(clickId)">
    
    <div v-if="item.nowPoint && !item.playIcon && !item.hasReminder" class="now-point"></div>
    <svg v-if="item.playIcon || item.hasReminder" class="icon-play">
        <use v-if="item.playIcon" xlink:href="#play"/>
        <use v-if="item.hasReminder" xlink:href="#settings-reminders"/>
    </svg>
    <span class="hour">{{ item.time }}</span>
    <div class="name" :style="item.live ? { maxWidth: '407rem' } : null">
      <p class="name-text" :style="trimmedStyle">
        {{ item.label }}
      </p>
    </div>
    <span class="live-flag" v-if="item.live">LIVE</span>
  </li>
</template>

<script>
import { deviceEPGClass } from 'animations'

export default {
  name: 'EventGuide',
  data: () => ({
    uiMode: window.uiMode
  }),
  props: {
    item: Object,
    isSelected: Boolean,
    trimmedStyle: Object,
    click: Function,
    clickId: Number
  },
  methods: {
    deviceClass () {
      return deviceEPGClass()
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";
@import "./_common.scss";

.label-event {
    display: flex;
    align-items: center;
    width: 717rem;
    text-overflow: ellipsis;
    white-space: nowrap;
    transform-origin: left center;
    .hour {
      text-rendering: optimizeSpeed;
      margin-right: 20rem;
    }
    .name {
      overflow: hidden;
      height: 47rem;
      max-width: 608rem;
      transform-origin: left center;
      transform: scale(1, 1);
      .name-text{
        text-rendering: optimizeSpeed;
      }
    }
    .live{
      margin-bottom: 15rem;
      margin-left: 20rem;
    }

    &:not(.is-selected) {
      .name-text {
        @include text-ellipsis;
      }
    }

    .now-point {
      height: 12rem;
      width: 12rem;
      background-color: $blue;
      border-radius: 100%;
      margin-right: 10rem;
      position: absolute;
      left: -25rem;
      top: 40rem;
    }

    .icon-play {
      fill: #0296da;
      height: 30rem;
      width: 30rem;
      position: absolute;
      left: -35rem;
      top: 30rem;
    }

    &.is-selected {
      color: $blue;
      .name {
        transform: scale(1.2, 1.2);
        max-width: 507rem;
        margin-top: 12rem;
        font-weight: 400;
      }
      .hour {
        margin-top: 17rem;
      }
      .live{
        margin-left: 95rem;
      }
      .icon-play {
        top: 38rem;
      }
      .now-point {
        top: 48rem;
      }
    }

  }

</style>
