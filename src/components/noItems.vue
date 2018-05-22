<template lang="html">
  <div :class="containerClass">
    <div :class="textContainerClass">
      <svg v-if="iconSet" class="icon">
        <use :xlink:href="`#${noItemsIcon}`"></use>
      </svg>
      <h2 class="no-items-title">{{ noItemsTitle }}</h2>
      <p class="no-items-text">{{ noItemsText }}</p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'noItems',
  props: {
    noItemsTitle: {
      type: String,
      required: true
    },
    noItemsText: {
      type: String,
      required: true
    },
    noItemsIcon: {
      type: String
    },
    iconSet: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  },
  computed: {
    getIcon () {
      return `#${this.noItemsIcon}`
    },
    containerClass () {
      return [
        'container',
        {
          'opened-navigation': this.navigationActive,
          'no-transition-animation': !this.uiMode.noItemsTransitionAnimation
        }
      ]
    },
    textContainerClass () {
      return [
        'text-container',
        {
          'no-icon': !this.iconSet,
          'no-transition-animation': !this.uiMode.noItemsTransitionAnimation,
          'translate': this.translateMode.translate
        }
      ]
    },
    ...mapState({
      navigationActive: state => state.navigation.active
    })
  }
}
</script>

<style lang="scss" scoped>
@import "variables";

.container {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -300rem;
  margin-left: -500rem;
  height: 600rem;
  width: 1000rem;

  &.opened-navigation {
    .text-container {
      @include transform(translate3d(-250rem, 0, 0));
      &.translate {
        @include transform(translate(-250rem, 0));
      }
      width: 700rem;
    }
  }
  .icon {
    position: relative;
    top: -35rem;
    display: block;
    float: left;
    width: 90rem;
    fill: $grey-medium;
    margin-right: 40rem;
  }
  .text-container {
    @include transform(translate3d(-100rem, 0, 0));
    &.translate {
      @include transform(translate(-100rem, 0))
    }
    transition: all .4s ease;
    width: 700rem;
    margin: auto;
    display: inline-block;
    text-align: left;
    .no-items-title {
      font-size: 58rem;
      font-family: 'Roboto';
      font-weight: 300;
      color: $blue-dark;
    }
    .no-items-text {
      font-size: 23rem;
      font-family: 'Roboto';
      font-weight: 400;
      padding-left: 130rem;
      margin-top: 10rem;
      color: rgba($blue-dark, 0.5);
    }
    &.no-icon {
      text-align: center;
      .no-items-title {
        font-size: 68rem;
        font-weight: 300;
        color: #323e43;
        font-family: 'Roboto';
      }
      .no-items-text {
        color: $black;
        padding-left: 0;
        font-size: 40rem;
        font-weight: 300;
        font-family: 'Roboto Condensed';
        color: rgba($black, 0.5);
      }
    }
  }
}

</style>
