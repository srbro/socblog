<template>
  <div :class="infoContainer">
    <h1 class="row-title">{{ loc('ondemand_detailedscreen_titles') }}<span class="channel-num">{{ channelNumber }}</span></h1>
  </div>
</template>

<script>
  export default {
    name: 'ItemInfo',
    props: {
      channelNumber: Number,
      hide: Boolean
    },
    data: () => ({
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }),
    computed: {
      infoContainer () {
        return [
          'info-container',
          {
            'is-hidden': this.hide,
            'no-transition-animation': !this.uiMode.pageHeaderTransitionAnimation,
            'translate': this.translateMode.translate
          }
        ]
      }
    }
  }
</script>

<style scoped lang="scss">
  @import "variables";

  .info-container{
    width: 100%;
    height: 50rem;
    margin-top: 100rem;
    margin-bottom: -120rem;
    box-sizing: border-box;
    &.is-hidden {
      opacity: 0;
    }

    .row-title {
      font-family: "Roboto Condensed";
      color: $white;
      font-size: 40rem;
      display: flex;
      text-transform: uppercase;

      .channel-num {
        display: inline-block;
        height: 44rem;
        min-width: 44rem;
        background-color: $blue-medium;
        font-size: 24rem;
        color: #fff;
        text-align: center;
        line-height: 45rem;
        border-radius: 4rem;
        margin-left: 20rem;
        padding-left: 5rem;
        padding-right: 5rem;
      }
    }
  }
</style>