<template>
  <div :class="pageWrapperClass">
    <navigation />
    <div :class="classNameMain">
     <transition name="show" mode="out-in" appear>
        <router-view />
     </transition>
    </div>
    <router-view name="overlay"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Navigation from 'containers/Navigation'

export default {
  name: 'PageWrapperNav',
  components: { Navigation },
  data () {
    return {
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  },
  computed: {
    ...mapState({
      navigationActive: state => state.navigation.active,
      navigationHidden: state => state.navigation.hidden
    }),
    pageWrapperClass () {
      return [
        'page-wrapper',
        {
          'vod': this.$route.name === 'VodLanding' || this.$route.name === 'VodSeeAll'
        }
      ]
    },
    classNameMain () {
      return [
        'right-side',
        {
          'no-transition-animation': !this.uiMode.menuLaneTransitionAnimation,
          'navigation-hidden': this.navigationHidden,
          'navigation-active': this.navigationActive,
          'translate': this.translateMode.translate
        }
      ]
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.page-wrapper {
  height: 100%;
  background: rgba($white-lighter, .9);

  &.vod {
    background: rgba($grey-darker, 1);
  }
}

.right-side {
  height: 100%;
  position: relative;
  transition: transform 0.2s ease;
  will-change: transform;
  z-index: 1;
  @include transform(translate3d(160rem, 0, 0));
  &.translate {
    @include transform(translate(160rem, 0));
  }
}

.main {
  height: 100%;
  position: relative;
  transition: transform $transition-fast;
  will-change: transform;
  z-index: 1;
  @include transform(translate3d($navigation-width-closed, 0, 0));
  &.translate {
    @include transform(translate($navigation-width-closed, 0));
  }
}
.navigation-active {
  @include transform(translate3d($navigation-width, 0, 0));
  &.translate {
    @include transform(translate($navigation-width, 0));
  }
}
.navigation-hidden {
  @include transform(translate3d(0, 0, 0));
  &.translate {
    @include transform(translate(0, 0));
  }
}
</style>
