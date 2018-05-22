<template>
  <li :class="[deviceClass(), 'item date-label', { 'hide': item.hide,
    'is-selected': isSelected, 'no-transition-animation': !uiMode.guideColumnTransitionAnimation }]"
    @click="click(clickId)">
    <span v-if="isSelected" class="day-name">
        {{ item.dayName }}
    </span>
    <div v-if="item.todayPoint" class="today-point"></div>
    {{ item.label }}
  </li>
</template>

<script>
import { deviceEPGClass } from 'animations'

export default {
  name: 'DateGuide',
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

.date-label {
  @include text-ellipsis;
  transform-origin: left center;
  text-rendering: optimizeSpeed;
  transform: scale(1, 1);
  margin-top: 6rem;
  height: 74rem;
  overflow: visible;

  .today-point {
    height: 12rem;
    width: 12rem;
    background-color: $blue;
    border-radius: 100%;
    margin-right: 10rem;
    position: absolute;
    // top: 48rem;
    top: 32rem;
    left: -25rem;
  }

  &.is-selected {
    color: $blue;
    font-weight: 400;
    transform: scale(1.2, 1.2);
    margin-top: 12rem;
  }
}

</style>
