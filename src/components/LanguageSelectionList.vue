<template>
  <div class="container">
    <div class="header">
      <h1 class="title">Select Language</h1>
      <!--<img class="logo" src="../../static/uc/images/general/logo-small.png">-->
    </div>
    <ul class="list" :style="listTransform" @transitionend.self="movingEnded">
      <li v-for="(item, index) in items"
        :key="index"
        :class="['item', {'is-active': (index === activeIndex)}, {'no-border': (index === activeIndex-1 || index === items.length-1)}]"
        @click.prevent="handleClick(index)">
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script>
const ITEM_HEIGHT = 132

export default {
  name: 'LanguageSelectionList',
  data: () => ({
    moving: false,
    translateMode: window.translateMode
  }),
  computed: {
    listTransform () {
      let translate3d = `translate3d(0, ${-1 * ITEM_HEIGHT * this.activeIndex}rem, 0)`
      let translate2d = `translate(0, ${-1 * ITEM_HEIGHT * this.activeIndex}rem)`
      return {
        transform: !this.translateMode.translate ? translate3d : translate2d
      }
    }
  },
  props: {
    items: {
      type: Array,
      required: true
    },
    activeIndex: {
      type: Number,
      required: true
    },
    handleClick: Function
  },
  methods: {
    movingEnded () { this.moving = false }
  },
  watch: {
    activeIndex () { this.moving = true }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

$border-width: 4rem;

.container {
  background-color: $white-light;
  height: 100%;
  width: 100%;
}

.title {
  font-size: 82rem;
  margin: 55rem 0 0 0;
  font-weight: 300;
  color: $blue-dark;
}


.logo {
  width: 119rem;
  height: 74rem;
  margin: 77rem 86rem 0 0;
}

.header {
  background-color: $white-light;
  border-bottom: $border-width solid transparent;
  box-shadow: $box-shadow-default-down;
  display: flex;
  height: 190rem;
  justify-content: center;
  position: relative;
  z-index: 1;
  &:after {
    content: '';
    position: absolute;
    bottom: -$border-width;
    height: $border-width;
    background: $rainbow-gradient-horizontal;
    width: 100%;
    left: 0;
  }
}

.list {
  align-items: center;
  display: flex;
  font-size: 40rem;
  flex-direction: column;
  padding-top: 380rem;
  color: $blue-dark;
  transition: transform .25s;
  .item {
    width: 851rem;
    height: 132rem;
    font-family: $font-alternative;
    font-weight: 200;
    line-height: 130rem;
    text-align: center;
    padding-top: 5rem;
    border-bottom: 2.5rem solid $grey-light;
    transition: font-size .25s;
    &.no-border {
      border-bottom: 0;
    }
    &.is-active {
      font-size: 48rem;
      font-weight: 400;
      color: $blue;
      position: relative;
      border-bottom: 0;
    &:before {
      content: '';
      position: absolute;
      top: -15rem;
      width: 120%;
      height: 15rem;
      left: -10%;
      right: -10%;
      background: radial-gradient(ellipse at 50% 99%, rgba(00, 00, 00, 0.18), rgba(97, 97, 97, 0.0) 75%);
     }
      &:after {
        content: '';
        position: absolute;
        bottom: -15rem;
        width: 120%;
        height: 15rem;
        left: -10%;
        right: -10%;
        background: radial-gradient(ellipse at 50% -1%, rgba(00, 00, 00, 0.2), rgba(97, 97, 97, 0.0) 75%);
       }
    }
    body:not(.disable-hover) &:hover { color: $blue-hover; }
  }
}
</style>
