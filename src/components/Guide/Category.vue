<template>
  <li :class="[deviceClass(), 'item icon-category label category-label', { 'hide': item.hide,
    'is-selected': isSelected, 'no-transition-animation': !uiMode.guideColumnTransitionAnimation }]"
    :style="`background-image: url(${isSelected ? item.iconActive : item.icon})`"
    @click="click(clickId)">
      {{ item.label }}
  </li>
</template>

<script>
import { deviceEPGClass } from 'animations'

export default {
  name: 'CategoryGuide',
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

.icon-category {
  fill: rgba($blue-dark, 0.8);
  height: 45rem;
  margin-top: 25rem;
  background-size: 40rem;
  background-repeat: no-repeat;
  &.is-selected {
    fill: $blue;
    height: 48rem;
    margin-right: 4rem;
    background-size: 48rem;
  }
}
.category-label {
  @include text-ellipsis;
  margin-top: 20rem;
  width: 260rem;
  padding-left: 52rem;
  &.is-selected {
    margin-top: 20rem;
    width: 214rem;
  }
}

</style>
