<template>
  <li :class="cardClass" @click.prevent="handleClick({ rowIndex, cardIndex })">
    <svg class="icon"><use :xlink:href="`#${icon}`"></use></svg>
    <div class="text">{{ text }}</div>
  </li>
</template>

<script>
export default {
  name: 'CardSettings',
  data () {
    return {
      uiMode: window.uiMode
    }
  },
  computed: {
    cardClass () {
      return [
        'card',
        {
          'is-selected': this.selected,
          'enable-hover': this.enableHover,
          'no-transition-animation': !this.uiMode.settingsTransitionAnimation,
          'no-shadow': !this.uiMode.settingsShadow
        }
      ]
    }
  },
  props: {
    icon: String, // svg on 140by140 sized canvas
    text: String,
    selected: Boolean,
    cardIndex: Number,
    rowIndex: Number,
    handleClick: Function,
    enableHover: Boolean
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.card {
  align-items: center;
  background-color: $white;
  box-shadow: $box-shadow-card;
  flex-flow: column nowrap;
  flex-shrink: 0;
  display: flex;
  justify-content: flex-start;
  height: 248rem;
  margin-right: 12rem;
  width: 248rem;
  transform-origin: center center;
  transition: transform $transition;

  &:last-of-type { margin-right: 0; }

  .text {
    @include text-ellipsis;
    color: $blue-dark;
    flex-shrink: 0;
    font-family: $font-alternative;
    font-size: 28rem;
    font-weight: 400;
    padding: 0 10rem;
    text-align: center;
    width: 100%;
  }

  .icon {
    flex-shrink: 0;
    fill: $grey-medium;
    height: 140rem;
    margin-bottom: 16rem;
    margin-top: 18rem;
    width: 140rem;
  }

  body:not(.disable-hover) &.enable-hover:hover {
    background-color: $blue-hover;
    z-index: 2;
    .text { color: $white; }
    .icon { fill: $white; }
  }

  .row.is-selected & {
    &.is-selected {
      background-color: $blue;
      box-shadow: $box-shadow-down-large;
      transform: scale3d(1.19354, 1.19354, 1);
      z-index: 3;
      .text {
        color: $white !important;
      }
      .icon {
        fill: $white !important;
      }
    }
  }

}
</style>
