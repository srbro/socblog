<template>
  <div :class="settingsHeaderClass">
    <transition name="header-transition" mode="out-in" appear>
      <img v-if="!pageFocus" key="logo" :class="logoClass" src="../../../../static/uc/images/logo/eon-grey.png" />
      <div v-else :class="textClass" key="text">{{ label }}</div>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'SettingsHeader',
  props: {
    label: String,
    pageFocus: Boolean,
    visible: Boolean
  },
  data () {
    return {
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  },
  computed: {
    settingsHeaderClass () {
      return [
        'header',
        {
          'is-hidden': !this.visible,
          'no-transition-animation': !this.uiMode.settingsTransitionAnimation,
          'translate': this.translateMode.translate
        }
      ]
    },
    logoClass () {
      return [
        'logo',
        {
          'no-transition-animation': !this.uiMode.settingsTransitionAnimation
        }
      ]
    },
    textClass () {
      return [
        'text',
        {
          'no-transition-animation': !this.uiMode.settingsTransitionAnimation
        }
      ]
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.header {
  display: flex;
  flex-flow: row nowrap;
  height: 337rem;
  justify-content: flex-end;
  position: relative;
  transition: transform $transition;
  @include transform(translate3d(0, 0, 0));

  &.translate {
    @include transform(translate(0, 0));
  }

  &.is-hidden {
    @include transform(translate3d(0, -337rem, 0));

    &.translate {
      @include transform(translate(0, -337rem));
    }
  }

  .logo {
    position: absolute;
    right: 556rem;
    top: 78rem;
  }
  .text {
    color: $blue-medium;
    font-family: $font-default;
    font-size: 66rem;
    font-weight: 300;
    position: absolute;
    right: 216rem;
    top: 76rem;
  }
}

.header-transition {
  &-enter, &-leave-to { opacity: 0; }
  &-enter-to, &-leave { opacity: 1; }
  &-enter-active, &-leave-active { transition: opacity $transition-fast; }
}
</style>
