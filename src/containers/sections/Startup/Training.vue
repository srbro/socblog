<template>
  <div class="training-screen-view">
    <custom-button
      class="button-back"
      :active="focus === 'back'"
      round
      icon="back" />
    <div class="training-component-container" :style="componentContainerStyle">
      <training-screen
        v-for="(item, index) in items"
        :key="index"
        :bg-image-url="item.bgImageUrl"
        :image-url="item.imageUrl"
        :title="item.title"
        :subtitle-first-row="item.subtitleFirstRow"
        :subtitle-second-row="item.subtitleSecondRow"
        :btn-title="item.btnTitle"
        :active-index="focus"
      />
    </div>
    <div class="ring-container">
      <div  v-for="(item, index) in items"
      :key="index"
      :class="['ring', {'active': (index === activeItem)}]">
      </div>
    </div>
  </div>
</template>

<script>
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import TrainingScreen from 'components/TrainingScreen'
import CustomButton from 'components/Button'

const ITEM_WIDTH = 1920

export default {
  name: 'Training',
  mixins: [ RegisterKeyHandler ],
  components: {
    TrainingScreen,
    CustomButton
  },
  data () {
    return {
      focus: 'next',
      activeItem: 0,
      items: [{
        bgImageUrl: '../../static/uc/images/training-screens/training1.jpg',
        imageUrl: '../../static/uc/images/training-screens/logo-white.png',
        title: '',
        subtitleFirstRow: 'TV OF THE FUTURE',
        subtitleSecondRow: 'Anytime, Anywhere, Any Screen',
        btnTitle: 'Next'
      },
      {
        bgImageUrl: '../../static/uc/images/training-screens/training2.jpg',
        imageUrl: '',
        title: 'On Demand',
        subtitleFirstRow: 'Thousand of Your Favorite',
        subtitleSecondRow: 'Movies and TV Shows',
        btnTitle: 'Next'
      },
      {
        bgImageUrl: '../../static/uc/images/training-screens/training3.jpg',
        imageUrl: '',
        title: 'CuTV',
        subtitleFirstRow: '7 Days back to find',
        subtitleSecondRow: 'Your Favorite Shows',
        btnTitle: 'Next'
      },
      {
        bgImageUrl: '../../static/uc/images/training-screens/training4.jpg',
        imageUrl: '',
        title: 'Watch Now!',
        subtitleFirstRow: 'On Any Screen',
        subtitleSecondRow: 'Smart TV, Smartphone, Tablet or PC/Mac',
        btnTitle: 'Sign in'
      }],
      translateMode: window.translateMode
    }
  },
  computed: {
    componentContainerStyle () {
      let transform3d = `translate3d(${this.screenPosition}rem, 0, 0)`
      let transform2d = `translate(${this.screenPosition}rem, 0)`
      return {
        transform: !this.translateMode.translate ? transform3d : transform2d,
        width: `${ITEM_WIDTH * this.items.length}rem`
      }
    },
    screenPosition () {
      return -this.activeItem * ITEM_WIDTH
    }
  },
  methods: {
    move (direction) {
      if (direction === 'prev' && this.activeItem === 0) {
        this.$router.push({ name: 'LanguageSelection' })
      } else if (direction === 'next' && this.activeItem === this.items.length - 1) {
        this.$router.push({ name: 'OTPActivation' })
      } else {
        this.activeItem += direction === 'next' ? 1 : -1
      }
    },
    handleKey (key) {
      switch (key) {
        case 'RIGHT':
          this.move('next')
          break
        case 'UP':
          this.focus = 'back'
          break
        case 'DOWN':
          this.focus = 'next'
          break
        case 'OK':
          this.move(this.focus === 'back' ? 'prev' : 'next')
          break
        case 'LEFT':
        case 'BACK':
          this.move('prev')
          break
      }
    }
  }
}
</script>

<style scoped lang="scss">
  @import "variables";
  .training-screen-view {
    width: 1920rem;
    height: 1080rem;
    overflow: hidden;
    .button-back {
      position: absolute;
      top: 60rem;
      left: 60rem;
      z-index: 5;
    }
    .training-component-container {
      display: flex;
      transition: transform .5s;
    }
    .ring-container {
      position: absolute;
      margin-bottom: 230rem;
      width: 100%;
      bottom: 0;
      left: 0;
      text-align: center;
      z-index: 3;
      .ring {
        transition: background .2s;
        display: inline-block;
        margin: 0 8px;
        width: 14rem;
        height: 14rem;
        border-radius: 100%;
        background-color: rgba($white-lighter, 0.5);
        &.active {
          background-color: $white-lighter;
        }
      }
    }
  }
</style>
