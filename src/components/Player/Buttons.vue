<template>
  <div :class="['buttons', {'one-button': oneButton}, {'vod-buttons': vodButtons}]">
    <custom-button
      v-for="(button, index) in buttons"
      :key="button"
      :active="index === activeButtonIndex"
      :icon="`player-${button}`"
      :id="button"
      @click.native.prevent="handleClick(index)"
    />
  </div>
</template>

<script>
import CustomButton from 'components/Button'

export default {
  name: 'PlayerButtons',
  components: { CustomButton },
  props: {
    activeButtonIndex: {
      type: Number,
      required: true
    },
    buttons: {
      type: Array,
      required: true
    },
    oneButton: {
      type: Boolean,
      required: true
    },
    vodButtons: {
      type: Boolean
    },
    handleClick: Function
  }
}
</script>

<style lang="scss" scoped>
@import "variables";

.buttons {
  display: flex;
  height: 135rem;
  justify-content: space-between;
  padding: 0 703rem 0 342rem;
  &.one-button {
    justify-content: center;
  }
}
</style>
