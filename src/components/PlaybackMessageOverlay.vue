<template>
  <transition name="show" appear>
    <div class="full-screen">
      <div class="main">
        <div class="image">
          <svg><use :xlink:href="`#playback-message`"></use></svg>
        </div>
        <div class="text">
          <div class="title">{{ title }}</div>
          <div class="desc">{{ text }}</div>
          <div class="desc">{{ textSub }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PlaybackMessageOverlay',
  props: {
    title: String,
    text: String,
    textSub: String
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.full-screen {
  align-items: center;
  background: linear-gradient(to top, #0f1214 0%, #252d31 50%, $blue-dark 100%);
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  justify-content: flex-start;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: -1;
  .main {
    display: flex;
    justify-content: flex-start;
    padding-top: 392rem;
    width: 100%;
    .image {
      height: 171rem;
      margin-left: 502rem;
      width: 211rem;
      svg {
        fill: $white;
        height: 171rem;
        width: 210rem;
      }
    }
    .text {
      margin-left: 112rem;
      padding-right: 100rem;
      .title, .desc {
        color: $white;
        font-family: $font-default;
        font-weight: 300;
        text-shadow: $text-shadow-default;
      }
      .title {
        font-size: 82rem;
        margin-bottom: 34rem;
      }
      .desc {
        font-size: 38rem;
        line-height: 1.368;
      }
    }
  }
}
</style>
