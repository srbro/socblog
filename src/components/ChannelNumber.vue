<template>
  <div class="container">
    <div class="name">{{ channelName }}</div>
    <div class="number">{{ channelNo }}</div>
    <div class="chameleon-line"></div>
  </div>
</template>

<script>
export default {
  name: 'ChannelNumber',
  props: {
    channelName: String,
    channelNo: String
  }
}
</script>

<style scoped lang="scss">
@import "variables";

$text-shadow: 1rem 1rem 4rem rgba($black, 1);

.container {
  align-items: center;
  background-color: rgba($black, .4);
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  justify-content: flex-start;
  width: 100%;

  .name {
    color: $white;
    flex-shrink: 0;
    font-family: $font-default;
    font-size: 48rem;
    font-weight: 400;
    height: 52rem;
    line-height: 1.1;
    margin-top: 305rem;
    text-shadow: $text-shadow;
  }
  .number {
    color: $white;
    flex-shrink: 0;
    font-family: $font-default;
    font-size: 226rem;
    font-weight: 100;
    height: 226rem;
    line-height: 1;
    text-shadow: $text-shadow;
  }
  .chameleon-line {
    background: $rainbow-gradient-horizontal;
    flex-shrink: 0;
    height: 4rem;
    margin-top: 20rem;
    width: 546rem;
  }
}
</style>
