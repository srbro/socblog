<template>
  <div class="container">
    <img class="coming-soon-photo"
         :src="comingSoonPhoto">
    <div :class="comingSoonText">
      <h1 class="header-title">{{ headerTitle }}!</h1>
      <p class="first-paragraph">{{ firstParagraph }}</p>
      <p class="second-paragraph">{{ secondParagraph }}</p>
    </div>
    <img class="provider-logo"
      :src="logoProvider"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import comingSoonPhoto from 'assets/images/placeholders/coming_soon_bg_photo.jpg'
import logoProvider from 'assets/images/logo/eon-white.png'

export default {
  name: 'ComingSoon',
  data () {
    return {
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  },
  computed: {
    comingSoonPhoto () {
      return comingSoonPhoto
    },
    comingSoonText () {
      return [
        'coming-soon-text',
        {
          'no-transition-animation': !this.uiMode.noItemsTransitionAnimation,
          'translate': this.translateMode.translate
        }
      ]
    },
    logoProvider () {
      return logoProvider
    },
    ...mapState({
      navigationActive: state => state.navigation.active
    })
  },
  methods: {
    handleKey (key) {
      switch (key) {
        case 'LEFT':
          this.toggleNavigation(true)
          break
      }
    },
    handleClickBack () {
      this.$router.push({ name: 'Search' })
    },
    ...mapActions({
      toggleNavigation: 'navigation/toggle'
    })
  },
  props: {
    headerTitle: String,
    firstParagraph: String,
    secondParagraph: String
  }
}
</script>

<style scoped lang="scss">
@import 'variables';

.right-side {
  &.navigation-active {
    .container {
      .coming-soon-text {
        @include transform(translate3d(0rem, 0, 0));
        h1, p {
          @include multipleTransform(translate3d(410rem, 0, 0), scale3d(1, 1, 1));
        }
        .header-title {
          font-size: 84rem;
        }
        .first-paragraph {
          font-size: 49rem;
        }
        .second-paragraph {
          font-size: 44rem;
        }
      }
      .provider-logo {
        @include transform(translate3d(-240rem, 0, 0));
      }
    }
  }
  .container {
    height: 100%;
    position: relative;
    z-index: -1;
    transition: transform $transition;
    &-dark { background-color: $grey-darker; }
    // default background is white
    .coming-soon-photo {
      position: absolute;
      top: 0;
      left: 0;
    }
    .coming-soon-text {
      @include transform(translate3d(50rem, 0, 0));
      transition: transform $transition;
      h1, p {
        @include multipleTransform(translate3d(550rem, 0, 0), scale3d(1.20, 1.20, 1.20));
        position: absolute;
        font-weight: 100;
        color: #fff;
        transition: transform $transition;
      }
      .header-title {
        top: 420rem;
        font-weight: 300;
        font-size: 84rem;
        left: 50rem;
      }
      .first-paragraph {
        font-family: "Roboto Condensed";
        top: 555rem;
        font-size: 49rem;
      }
      .second-paragraph {
        font-family: "Roboto Condensed";
        top: 620rem;
        font-size: 44rem;
        left: 125rem;
      }
    }
    .provider-logo {
      opacity: 1;
      position: absolute;
      right: 318rem;
      top: 75rem;
      width: 256rem;
      transition: transform $transition;
      @include transform(translate3d(100rem, 0, 0));
    }
  }
}
</style>
