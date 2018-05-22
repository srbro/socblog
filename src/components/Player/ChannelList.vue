<template>
   <transition-group
    :css="false"
    tag="div"
    :class="containerClass">
    <channel
      v-for="(item, index) in trimmedChannels"
      :key="item.id"
      :number="item.number"
      :img-url="item.imgUrl"
      :selected="index === $options.nrData.selectedElement + focusOnFast"
      :faster-animation="fasterAnimation"
      @click.native.prevent="handleClick(item.number)"
    />
   </transition-group>
</template>

<script>
import Channel from 'components/Player/Channel.vue'

export default {
  name: 'PlayerChannelList',
  components: { Channel },
  nrData: {
    selectedElement: 10,
    numberOfElement: 20
  },
  data: () => ({
    duplicateRowIndex: 0,
    duplicateMax: 0
  }),
  props: {
    selectedIndex: {
      type: Number,
      required: true
    },
    channels: {
      type: Array,
      required: true
    },
    active: {
      type: Boolean,
      required: true
    },
    animated: {
      type: Boolean,
      required: true
    },
    fasterAnimation: Boolean,
    focusOnFast: Number,
    handleClick: Function
  },
  computed: {
    containerClass () {
      return [
        'channels',
        { 'is-active': this.active },
        { 'is-animated': this.animated }
      ]
    },
    trimmedChannels () {
      if (this.channels.length < this.$options.nrData.numberOfElement) {
        return this.smallChannels
      } else {
        return this.bigChannels
      }
    },
    bigChannels () {
      let returnArray = []
      const startIndex = this.selectedIndex - this.$options.nrData.selectedElement

      for (let i = startIndex; i < startIndex + this.$options.nrData.numberOfElement; i++) {
        let actualIndex = i
        while (actualIndex < 0) { actualIndex += this.channels.length }
        while (actualIndex > this.channels.length - 1) { actualIndex -= this.channels.length }
        returnArray.push(this.channels[actualIndex])
      }

      return returnArray
    },
    smallChannelsList () {
      const channelsA = []
      let i = 0
      if (this.channels.length !== 0) {
        while (channelsA.length < this.$options.nrData.numberOfElement) {
          channelsA.push(...this.channels.map((channel) => ({ ...channel, id: channel.id + '_' + i })))
          i++
        }
        this.duplicateMax = i - 1
      }
      return channelsA
    },
    smallChannels () {
      let returnArray = []
      if (this.smallChannelsList.length !== 0) {
        const startIndex = this.selectedIndex + (this.channels.length * this.duplicateRowIndex) - this.$options.nrData.selectedElement
        for (let i = startIndex; i < startIndex + this.$options.nrData.numberOfElement; i++) {
          let actualIndex = i
          while (actualIndex < 0) { actualIndex += this.smallChannelsList.length }
          while (actualIndex > this.smallChannelsList.length - 1) { actualIndex -= this.smallChannelsList.length }
          returnArray.push(this.smallChannelsList[actualIndex])
        }
      }
      return returnArray
    }
  },
  watch: {
    selectedIndex (newIndex, oldIndex) {
      if (oldIndex === 0 && newIndex === this.channels.length - 1) {
        if (this.duplicateRowIndex > 0) {
          this.duplicateRowIndex--
        } else {
          this.duplicateRowIndex = this.duplicateMax
        }
      } else if (newIndex === 0 && oldIndex === this.channels.length - 1) {
        if (this.duplicateRowIndex < this.duplicateMax) {
          this.duplicateRowIndex++
        } else {
          this.duplicateRowIndex = 0
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import 'variables';

$channels-width: 375rem;
$channels-offset: $channels-width + 10rem;
$channels-top: -(180rem * 9 + 119);

.channels {
  height: 291rem;
  left: 0;
  margin: 0;
  position: absolute;
  top: $channels-top;
  transform: scale3d(1, 1, 1);
  width: $channels-width;

  &.is-active {
    .channel { visibility: visible; }
  }

  &.is-animated .channel { transition: transform $transition-fast; }
}
</style>
