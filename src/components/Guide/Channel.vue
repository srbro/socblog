<template>
  <li :class="[deviceClass(), 'channel-logo-list', { 'hide': item.hide,
    'is-selected': isSelected, 'no-transition-animation': !uiMode.guideColumnTransitionAnimation }]"
    :style="`background-image: url(${item.logoUrl})`"
    @click="click(clickId)">
      {{ item.number }}
  </li>
</template>

<script>
import { deviceEPGClass } from 'animations'

export default {
  name: 'ChannelGuide',
  data: () => ({
    uiMode: window.uiMode
  }),
  props: {
    item: Object,
    isSelected: Boolean,
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

.channel-logo-list {
  width: 311rem;
  background-repeat: no-repeat;
  background-position-x: 50%;
  background-size: 160rem 90rem;
  position: absolute;
  font-size: 40rem;
  font-weight: 300;
  line-height: 2.2;
  transform-origin: center center;

  &.is-selected {
    transform: scale(1.2, 1.2);
    color: $blue;
    font-weight: 400;
    padding-left: 15rem;
  }
}
</style>
