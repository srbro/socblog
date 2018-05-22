<template>
  <div class="keyboard-container">
    <div class="language-text">
      <span>{{ language }}</span>
    </div>
    <div class="keyboard">
      <div class="suggestions" style="display: none;">
        <div
          v-for="(suggestion, index) in suggestions"
          :key="index"
          :class="getSuggestionClass(index)"
        >
          {{ suggestion }}
        </div>
      </div>
      <div :class="['keys-wrapper', { 'is-uppercase': capsLock }]" @mouseleave="mouseLeaveFn">
        <div
          v-for="(row, offsetY) in keys"
          :key="offsetY"
          class="keys-row"
        >
          <div
            v-for="(key, offsetX) in row"
            :key="offsetX"
            :class="getKeyClass(offsetX, offsetY)"
            @click="typeof key === 'string' ? doClick(key, offsetX, offsetY) : null"
            @mouseover="typeof key === 'string' ? doHover(key, offsetX, offsetY) : null"
            @mouseleave="mouseLeaveFn"
          >
            <svg v-if="isIcon(key)">
              <use :xlink:href="`#keyboard-${key.toLowerCase()}`"></use>
            </svg>
            <span v-else>{{ typeof key === 'string' ? key : '' }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="confirm">
      <div @click="doClick('SEARCH')" :class="getConfirmClass()">{{ confirmText }}</div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'KeyboardOverlay',
  props: {
    capsLock: Boolean,
    confirmText: String,
    keys: Array,
    language: String,
    placeholder: String,
    selectedConfirm: Boolean,
    disableSubmit: Boolean,
    selectedKey: Array,
    selectedSuggestion: Number,
    suggestions: Array,
    text: Array,
    clickFn: {
      default: null,
      required: false,
      type: Function
    },
    hoverFn: {
      default: null,
      required: false,
      type: Function
    },
    mouseLeaveFn: {
      default: () => null,
      type: Function
    }
  },
  methods: {
    isIcon: key => ['BACKSPACE', 'CAPSLOCK', 'SPACE', 'LEFT', 'RIGHT', 'LANGUAGE'].indexOf(key) > -1,
    getKeyClass (x, y) {
      return ['key', { 'is-selected': this.selectedKey[0] === x && this.selectedKey[1] === y }]
    },
    getSuggestionClass (index) {
      return ['suggestion', { 'is-selected': index === this.selectedSuggestion }]
    },
    getConfirmClass () {
      return ['button', {'disabled': this.disableSubmit}, { 'is-selected': this.selectedConfirm }]
    },
    doClick: function (key, offsetX, offsetY) {
      if (typeof this.clickFn === 'function') {
        this.clickFn(key, offsetX, offsetY)
      }
    },
    doHover: function (key, offsetX, offsetY) {
      if (typeof this.hoverFn === 'function') {
        this.hoverFn(key, offsetX, offsetY)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'variables';

$cyan: #30c6b4;
  .keyboard-container{
    left: 0;
    position: absolute;
    bottom: 0;
    width: 100%;
    z-index: 2;
  }

  .is-selected { background-color: rgba(white, .25); }

  .keyboard {
    background: #49545a;
    bottom: 0;
    color: $white;
    width: 100%;
    user-select: none;
  }

    .suggestions {
      background: #263238;
      display: flex;
      height: 56rem;
      justify-content: center;
    }

      .suggestion {
        border-radius: 22rem;
        color: $cyan;
        font-family: $font-alternative;
        font-size: 36rem;
        line-height: 36rem;
        margin: 6rem 0;
        padding: 4rem 16rem;
      }

    .keys-wrapper {
      height: 412rem + 56rem; // delete 56rem when adding suggestions
      padding: 20rem 546rem;
      &.is-uppercase { text-transform: uppercase; }
    }

      .keys-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 19rem;
      }

        .key {
          $key-size: 51rem;
          border-radius: 50%;
          font-family: $font-default;
          font-size: 35rem;
          font-weight: 200;
          height: $key-size;
          line-height: $key-size + 2rem;
          width: $key-size;
          text-align: center;
          svg {
            $icon-size: 31rem;
            fill: $white;
            width: $icon-size;
            height: $icon-size;
            margin: ($key-size - $icon-size) / 2;
          }
          /*
          body:not(.disable-hover) &:hover {
            background-color: rgba(white, .25);
          }
          */
        }


  .language-text{
    display: flex;
    justify-content: center;
    position: absolute;
    left: 0;
    bottom: 235rem;
    width: 546rem;

    span{
      $size: 64rem;
      color: #798084;
      font-size: 36rem;
      height: $size;
      line-height: $size + 2;
      padding: 0 $size/2;
      text-transform: capitalize;
    }
  }

  .confirm {
    display: flex;
    justify-content: center;
    position: absolute;
    right: 0;
    bottom: 235rem;
    width: 546rem;

  }

    .button {
      $size: 64rem;
      border-radius: $size/2;
      color: #fdfcfd;
      font-size: 36rem;
      height: $size;
      line-height: $size + 2;
      padding: 0 $size/2;
      text-transform: uppercase;

      &.disabled {
              color: #798084;

              &.is-selected { background-color: rgba(white, .75); }

              body:not(.disable-hover) &:hover {
              background-color: rgba(white, .75);
            }

      }

      body:not(.disable-hover) &:hover {
        background-color: rgba(white, .25);
      }

    }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
