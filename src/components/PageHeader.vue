<template lang="html">
  <div :class="containerClass">
    <div :class="contentClass">
      <div class="button-wrapper">
        <custom-button
          v-if="showButton"
          round
          :active="active"
          :icon="buttonType"
          :dark="theme === 'dark'"
          :buttonClick="handleClick"
        />
        <label :class="labelClass">{{ iconLabel }}</label>
      </div>
      <div :class="pageHeaderClass">
        {{ pageTitle }}
      </div>
    </div>
    <img
      :class="['provider-logo', { 'is-hidden': !hide }]"
      :src="logoProvider"
    />
  </div>
</template>

<script>
import CustomButton from 'components/Button'
import logoProvider from 'assets/images/logo/eon-grey.png'
import logoProviderDark from 'assets/images/logo/eon-white.png'

export default {
  name: 'PageHeader',
  components: { CustomButton },
  props: {
    pageTitle: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    hide: Boolean,
    iconLabel: String,
    buttonType: String,
    theme: String,
    handleClick: Function
  },
  data: () => ({
    uiMode: window.uiMode,
    translateMode: window.translateMode
  }),
  computed: {
    logoProvider () {
      return this.theme === 'dark' ? logoProviderDark : logoProvider
    },
    pageHeaderClass () {
      return [
        'page-title',
        {
          'is-hidden': this.hide,
          'no-transition-animation': !this.uiMode.pageHeaderTransitionAnimation
        }
      ]
    },
    containerClass () {
      return [
        'header-container',
        this.theme,
        {
          'no-transition-animation': !this.uiMode.pageHeaderTransitionAnimation,
          'translate': this.translateMode.translate
        }
      ]
    },
    contentClass () {
      return [
        'header-content',
        {
          'is-hidden': this.hide,
          'button-hidden': !this.showButton,
          'no-transition-animation': !this.uiMode.pageHeaderTransitionAnimation,
          'translate': this.translateMode.translate
        }
      ]
    },
    labelClass () {
      return [
        'label',
        {
          'is-active': this.active,
          'no-transition-animation': !this.uiMode.pageHeaderTransitionAnimation
        }
      ]
    },
    showButton () {
      return this.buttonType !== undefined
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.header-container {
  // margin-bottom: 125rem;
  margin-bottom: 102rem;
  padding: 65rem 0 65rem 0;
  position: relative;
  transform-origin: center left;
  transition: transform $transition, opacity $transition;
  width: 1548rem;

  .header-content {
    width: 100%;
    font-family: "Roboto";
    font-weight: 300;
    opacity: 1;
    display: flex;
    justify-content: space-between;
    font-size: 66rem;
    color: $blue-medium;
    @include transform(translate3d(0, 0, 0));
    &.translate {
      @include transform(translate(0, 0));
    }
    transition: opacity $transition;

    &.is-hidden {
      opacity: 0;
      @include transform(translate3d(0, -300rem, 0));
      &.translate {
        @include transform(translate(0, -300rem));
      }
    }

    &.button-hidden { justify-content: flex-end;}
  }

    .page-title {
      opacity: 1;
      display: inline-block;
      font-size: 66rem;
      transition: opacity $transition;
      position: relative;
      &.is-hidden { opacity: 0; }
    }

    .button-wrapper {
      display: flex;
      align-items: center;
      .label {
        font-size: 48rem;
        margin: 0 0 2rem 29rem;
        opacity: 0;
        transition: opacity $transition;
        &.is-active { opacity: 1; }
      }
    }

  .provider-logo {
    opacity: 1;
    position: absolute;
    right: 318rem;
    top: 75rem;
    width: 256rem;
    transition: opacity $transition;
    &.is-hidden { opacity: 0; }
  }

  &.dark {
    .page-title { color: rgba($white, 0.7); }
    .button-wrapper .label.is-active { color: rgba($white, 0.7); }
  }
}
</style>
