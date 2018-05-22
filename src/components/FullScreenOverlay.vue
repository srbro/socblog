<template>
  <div :class="className">
    <custom-button
      v-if="back"
      :active="backActive"
      round
      icon="back"
      class="button-back"
      :dark="theme === 'dark'"
      @click.native.prevent="handleClickBack" />
    <h1 v-if="elements.title" class="title">{{ loc(title) }}</h1>
    <div v-if="elements.rainbow" class="rainbow"></div>
    <p v-if="elements.text" class="message">{{ text }}</p>
    <p v-if="elements.textSub && textSub" class="message-sub">{{ textSub }}</p>
    <div v-if="buttons" class="buttons">
      <div
        v-for="(button, index) in buttons"
        :key="index"
        :class="['button', { 'is-selected': index === selectedButtonIndex }, { 'dark': theme === 'dark' }]"
        @click.prevent="handleClickButton(index)">
        {{ loc(button.label) }}
      </div>
    </div>
  </div>
</template>

<script>
import CustomButton from 'components/Button'

export default {
  name: 'FullScreenOverlay',
  components: { CustomButton },
  computed: {
    elements () {
      switch (this.type) {
        case 'title-text':
          return {
            title: true,
            text: true
          }
        case 'reminder':
          return {
            title: true,
            rainbow: true,
            text: true,
            textSub: true
          }
        case 'disclaimer':
          return {
            title: true,
            rainbow: true,
            text: true,
            textSub: true
          }
      }
    },
    className () {
      return [
        'full-screen',
        this.theme,
        this.type
      ]
    }
  },
  props: {
    theme: {
      type: String,
      default: 'light',
      validator: theme => ['light', 'dark'].indexOf(theme) > -1
    },
    back: Boolean,
    backActive: Boolean,
    title: {
      type: String,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    textSub: String,
    buttons: Array,
    selectedButtonIndex: Number,
    type: {
      type: String,
      required: true,
      validator: type => ['title-text', 'reminder', 'disclaimer'].indexOf(type) > -1
    },
    handleClickButton: Function,
    handleClickBack: Function
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.full-screen {
  align-items: center;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  justify-content: flex-start;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 50;
  &.dark {
    background: rgba($blue-dark-2, 0.98);
    color: $white;
  }
  &.light {
    background: rgba($white, 0.98);
    color: $blue-dark;
  }
  .button-back {
    position: absolute;
    top: 62rem;
    left: 66rem;
  }
  .title {
    @include text-ellipsis;
    font-size: 82rem;
    font-weight: 300;
    margin-top: 320rem;
    text-align: center;
    width: 1600rem;
  }
  .message {
    display: -webkit-box;
    $line-height: 36rem;
    flex: 1;
    font-size: 28rem;
    font-weight: 300;
    line-height: $line-height;
    margin-top: 23rem;
    max-height: 17 * $line-height;
    overflow: hidden;
    // text-align: justify;
    width: 930rem;
    -webkit-line-clamp: 18;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: wrap;
  }
  .buttons {
    // margin-bottom: 94rem;
    display: flex;
    justify-content: center;
    .button {
      @include text-ellipsis;
      background-color: $white;
      box-shadow: $box-shadow-alternative-down;
      color: $blue-dark;
      font-size: 40rem;
      font-weight: 300;
      height: 98rem;
      line-height: 98rem;
      margin: 0 25rem;
      padding: 0 10rem;
      text-align: center;
      width: 300rem;
      transition: background-color $transition-fast, color $transition-fast, transform $transition-fast;

      body:not(.disable-hover) &:hover {
        background-color: $blue-hover;
        color: $white;
      }

      &.is-selected {
        background-color: $blue;
        color: $white;
        transform: scale3d(1.12, 1.12, 1);
        &.dark {
          background-color: $yellow;
          color: $black;
        }
      }
    }
  }
  .rainbow {
    background-image: url('data:image/png;base64,#{$messages-rainbow-gradient}');
    background-position: top center;
    background-repeat: no-repeat;
    height: 4rem;
    margin-top: 14rem;
    width: 1440rem;
  }

  &.title-text {
    justify-content: center;
    padding: 166rem 0;
    .title {
      flex: 0 0 auto;
      margin-top: 0;
      width: 1180rem;
    }
    .message {
      flex: 0 1 auto;
    }
  }

  &.reminder {
    .title {
      margin-top: 428rem;
    }
    .message {
      @include text-ellipsis;
      $line-height: 48rem;
      flex: none;
      font-size: 40rem;
      line-height: $line-height;
      max-height: $line-height;
      margin-top: 68rem;
      text-align: center;
      width: 1440rem;
      &-sub {
        @extend .message;
        margin-top: 6rem;
      }
    }
    .buttons {
      margin-top: 178rem;
    }
  }
  &.disclaimer {
    .title {
      margin-top: 400rem;
    }
    .message {
      // @include text-ellipsis;
      $line-height: 48rem;
      flex: none;
      font-size: 40rem;
      line-height: $line-height;
      // max-height: $line-height;
      margin-top: 68rem;
      text-align: center;
      width: 1440rem;
      &-sub {
        @extend .message;
        margin-top: 6rem;
      }
    }
    .buttons {
      margin-top: 140rem;
      text-transform: capitalize;
    }
  }
}
</style>
