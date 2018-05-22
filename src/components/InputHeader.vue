<template>
  <div class="input">
    <custom-button
      :active="backActive"
      round
      icon="back"
      class="button-back"
      @click.native="doClick('BACK')"
    />
    <div class="field" @click="doClick('FIELD')" >
      <svg class="field-icon">
        <use :xlink:href="`#${icon}`"></use>
      </svg>
      <div v-if="text.join('').length > 0" class="field-text">{{ text[0] }}<div class="cursor" />{{ text[1] }}</div>
      <div v-else class="field-text is-placeholder"><div class="cursor" />{{ placeholder }}</div>
    </div>
  </div>
</template>

<script>
import CustomButton from 'components/Button'

export default {
  name: 'InputHeader',
  components: { CustomButton },
  props: {
    backActive: Boolean,
    icon: String,
    placeholder: String,
    text: Array,
    clickFn: {
      default: null,
      required: false
    }
  },
  methods: {
    doClick: function (value) {
      if (typeof this.clickFn === 'function') {
        this.clickFn(value)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'variables';

.input {
  background: $white-lightish;
  display: flex;
  margin-bottom: 200rem;
  justify-content: center;

  .button-back {
    left: 84rem;
    position: absolute;
    top: 62rem;
  }

  .field {
    $field-height: 112rem;
    background: $white;
    border-radius: 4rem;
    box-shadow: $box-shadow-card;
    display: flex;
    font-size: 36rem;
    height: $field-height;
    line-height: $field-height;
    margin-top: 58rem;
    width: 1200rem;

    .field-icon {
      fill: $blue;
      height: 94rem;
      margin: 9rem 24rem 9rem 17rem;
      width: 94rem;
    }

    .field-text {
      color: $grey-dark;
      display: flex;
      align-items: center;
      white-space: pre;
      overflow: hidden;
      &.is-placeholder { color: $grey; }

      .cursor {
        background: $grey-dark;
        height: 49rem;
        width: 2rem;
        animation: blink 1s step-end infinite;
        margin: 0 -1rem;
      }
    }
  }

}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
