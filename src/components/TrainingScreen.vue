<template>
  <div class="container">
    <div class="dark-container"></div>
    <img class="bg-image" :src="bgImageUrl">
    <div class="title-container">
      <h1 v-if="title" class="title">{{ title }}</h1>
      <img v-if="imageUrl" class="image" :src="imageUrl">
      <div class="chameleon-rainbow"></div>
      <h2 class="subtitle first">{{ subtitleFirstRow }}</h2>
      <h2 class="subtitle">{{ subtitleSecondRow }}</h2>
      <button v-if="btnTitle"
      :class="['btn', {'active': (activeIndex === 'next')}]">{{ btnTitle }}</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TrainingScreen',
  props: {
    bgImageUrl: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String
    },
    title: {
      type: String
    },
    subtitleFirstRow: {
      type: String,
      required: true
    },
    subtitleSecondRow: {
      type: String,
      required: true
    },
    btnTitle: {
      type: String
    },
    activeIndex: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped lang="scss">
  @import "variables";
  .container {
    position: relative;
    display: flex;
    justify-content: center;
    width: 1920rem;
    height: 1080rem;
    .dark-container {
      position: absolute;
      top: 0;
      left: 0;
      width: inherit;
      height: inherit;
      background-color: rgba($black, 0.5);
      z-index: 2;
    }
    .bg-image {
      position: absolute;
      top: 0;
      left: 0;
      width: inherit;
      z-index: 1;
    }
    .title-container {
      align-self: flex-end;
      text-align: center;
      z-index: 3;
    }
    .image {
      margin-bottom: 48rem;
    }
    .title {
      font-size: 80rem;
      color: $white-lighter;
      font-weight: 400;
      margin-bottom: 48rem;
    }
    .chameleon-rainbow {
      height: 4rem;
      width: 1360rem;
      margin-bottom: 36rem;
      background: $rainbow-gradient-horizontal;
    }
    .subtitle {
      font-size: 60rem;
      color: $white-lighter;
      font-weight: 300;
      text-shadow: 1px 1px 8px $black;
      &.first {
        text-transform: uppercase;
      }
    }
    .btn {
      margin-bottom: 87rem;
      margin-top: 220rem;
      height:110rem;
      width: 342rem;
      font-size: 30rem;
      border: none;
      background-color: $white;
      box-shadow: -1rem 10rem 50rem 0 rgba($black, 0.8);
      color: #313e44;
      z-index: 2;
      transition: background-color .1s, color .1s;
      &.active {
        background-color: #0094da;
        color: $white;
      }
      &:focus {
        cursor: pointer;
        background-color: #0094da;
        color: $white;
      }
    }
  }
</style>
