<template>
  <div :class="containerClass" v-if="display">
    <!-- <div class="logo"> -->
       <!-- <template v-if="logoAnimation">
        <div class="logo-above">
          <transition name="logo-animate-above" appear>
            <img class="logo-real" src="../../static/uc/images/logo/eon-text.png" alt="">
          </transition>
          <transition name="chameleon-line">
            <img class="chameleon-line" src="../../static/uc/images/logo/chameleon-line.png" alt="">
          </transition>
        </div>
        <div class="logo-below">
          <transition name="logo-animate-below" appear>
            <img class="logo-reflection" src="../../static/uc/images/logo/eon-text-2.png" alt="">
          </transition>
        </div>
      </template> -->
      <!-- <template v-if="logoAnimation">
        <img class="logo-real" src="../../static/uc/images/logo/eon-text.png" alt="">
        <img class="chameleon-line" src="../../static/uc/images/logo/chameleon-line.png" alt="">
      </template>
     </div> -->
    <div class="logo">
      <img class="logo-real" :src="logoImg" alt="">
      <img class="chameleon-line" src="../../static/uc/images/logo/chameleon-line.png" alt="">
      <h1 class="text">{{ message }}</h1>
    </div>
  </div>
</template>

<script>
// if value ANIMATION_TIME_JS change css ANIMATION_TIME_CSS
const ANIMATION_TIME_JS = 4000

export default {
  name: 'LogoMessage',
  props: {
    message: {
      type: String,
      required: true
    },
    logoAnimation: {
      type: Boolean,
      required: true
    },
    display: {
      tyoe: Boolean,
      required: true
    },
    blackTheme: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    logoImg () {
      return this.blackTheme ? require('../../static/uc/images/logo/eon-text-white.png') : require('../../static/uc/images/logo/eon-text.png')
    },
    containerClass () {
      return ['container',
        {
          'invert': this.blackTheme
        }
      ]
    }
  },
  mounted: function () {
    clearTimeout(this.animationTimeout)
    this.animationTimeout = setTimeout(function () {
      this.$emit('end')
    }.bind(this), ANIMATION_TIME_JS)
  }
}
</script>

<style scoped lang="scss">
@import "variables";
// if value ANIMATION_TIME_CSS change css ANIMATION_TIME_JS
$ANIMATION_TIME_CSS: 4s;
$ANIMATION_TIME_CSS_2: $ANIMATION_TIME_CSS/2;
$ANIMATION_TIME_CSS_2_5: $ANIMATION_TIME_CSS/2.5;
$ANIMATION_TIME_CSS_3: $ANIMATION_TIME_CSS/3;

.container {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(15deg, #d6d6d6, #ffffff);
  height: 1080rem;
  width: 1920rem;
  &.invert {
    background: #212121; 
    .text {
      color: #fcfcfc;
    }
  }
  .logo {
    position: relative;
    height: 270rem;
    width: 712rem;
    text-align: center;
    &-reflection {
      opacity: 0;
    }
    &-above {
      position: relative;
      z-index: 1;
    }
    &-animate-above- {
      // &leave-active {
        // transition: all 5s ease;
      // }
      &enter-active {
        opacity: 0;
        transition: all 1s $ANIMATION_TIME_CSS_2_5 ease;
      }
      &enter, &leave-to {
        opacity: 0;
        // transform: scale3d(1.4, 1.4, 1.4);
      }
      &enter-to, &leave {
        opacity: 1;
      }
    }
    &-below {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -365.5rem;
      margin-top: -136.5rem;
      z-index: 0;
      transform: scale3d(0.61, 0.61, 0.61);
    }
    &-animate-below- {
      &leave-active {
        transition: transform $ANIMATION_TIME_CSS_2 ease, opacity $ANIMATION_TIME_CSS_3 ease;
      }
      &enter-active {
        transition: transform $ANIMATION_TIME_CSS_2 ease, opacity $ANIMATION_TIME_CSS_3 ease;
      }
      &enter, &leave-to {
        opacity: 0;
        transform: scale3d(1.4, 1.4, 1.4);
      }
      &enter-to, &leave {
        opacity: 1;
      }
    }
  }
  .logo-real {
    width: 100%;
  }
  .text {
    color: $blue-dark;
    font-size: 38rem;
    line-height: 38rem;
    // position: relative;
    top: 100rem;
    z-index: 21;
    position: absolute;
    top: 470rem;
    left: 0;
    right: 0;
    margin: 0 auto;
  }
}
.chameleon-line {
  position: absolute;
  top: 48%;
  left: -10%;
  width: 120%;
}


</style>
