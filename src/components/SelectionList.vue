<template>
  <transition name="selection-transition" appear>
    <div :class="containerClass">
      <transition name="selection-main-transition" appear>
        <div
          :class="[
            'main',
            { 'no-transition-animation': !this.uiMode.selectionListTransition }
          ]"
        >
          <div class="text">
            <h3 class="above-title">{{ titleAbove }}</h3>
            <h1 class="title">{{ title }}</h1>
            <h3 class="below-title">{{ titleBelow }}</h3>
          </div>
          <div :class="imageClass">
            <svg><use :xlink:href="`#${svgId}`"></use></svg>
          </div>
          <transition name="button-transition" appear>
            <custom-button
              v-if="backVisible"
              class="button-back"
              :active="backActive"
              round
              icon="back"
              @click.native.prevent="handleClickBack" />
          </transition>
        </div>
      </transition>
      <transition name="selection-side-transition" appear>
        <div :class="[
          'side',
          { 'no-transition-animation': !this.uiMode.selectionListTransition }
          ]"
        >
          <transition name="button-transition" appear>
            <div v-if="clearVisible" :class="clearClass" @click.prevent="handleClickClear">
              <div class="icon">
                <svg><use :xlink:href="`#selection-clear`"></use></svg>
              </div>
              <div class="text">{{ clearText }}</div>
            </div>
          </transition>
          <transition name="button-transition" appear>
            <div v-if="questionVisible" class="question">
              <div class="text">{{ questionText }}</div>
            </div>
          </transition>
          <transition :name="listTransition" mode="out-in" appear>
            <div class="list-container" :key="items[0].label">
              <ul
                :style="listTransform"
                :class="[
                  'list',
                  { 'no-transition-animation': !this.uiMode.selectionListTransition }
                ]"
              >
                <li v-for="(item, index) in items"
                  :key="index"
                  :class="itemClass(index)"
                  @click.prevent="handleClickListItem(index)">
                  <div :class="[
                      'text',
                      { 'no-transition-animation': !uiMode.selectionListTransition }
                    ]"
                  >{{ item.label }}</div>
                  <div v-if="item.subLabel" :class="textSubClass">
                      {{ item.subLabel }}
                  </div>
                  <div
                    :class="[
                      'bullet',
                      { 'no-transition-animation': !uiMode.selectionListTransition }
                    ]"
                    v-if="item.selected && activeVisible"
                    >
                    </div>
                  <div v-if="item.type && item.selected && activeVisible" :class="directionClass(item)"> up</div>
                </li>
              </ul>
            </div>
          </transition>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script>
import CustomButton from 'components/Button'

const ITEM_HEIGHT = 130

export default {
  name: 'SelectionList',
  components: { CustomButton },
  data: () => ({
    uiMode: window.uiMode,
    translateMode: window.translateMode
  }),
  computed: {
    containerClass () {
      return [
        'container',
        `${this.theme}`,
        {
          'is-active': this.active,
          'clear-visible': this.clearVisible
        }
      ]
    },
    textSubClass () {
      return [
        'text-sub',
        {
          'no-transition-animation': !this.uiMode.selectionListTransition
        }
      ]
    },
    imageClass () { return ['image', `${this.theme === 'light' ? 'square' : 'circle'}`] },
    clearClass () { return ['clear', { 'is-active': this.clearActive }] },
    listTransform () {
      const offset = this.clearActive ? 0 : this.itemActive
      const transform3d = `translate3d(0, ${-1 * ITEM_HEIGHT * offset}rem, 0)`
      const transform2d = `translate(0, ${-1 * ITEM_HEIGHT * offset}rem)`
      return {
        transform: !this.translateMode.translate ? transform3d : transform2d
      }
    },
    listTransition () { return `list-transition-${this.transitionType}` }
  },
  methods: {
    directionClass (item) {
      if (item.type === 'ASC' || item.type === 'DESC') {
        return ['direction', {'desc': item.type === 'DESC', 'vod': this.$route.name === 'VodSeeAll'}]
      }
    },
    itemClass (index) {
      return [
        'item',
        {
          'has-sublabel': this.items[index].subLabel !== undefined && this.items[index].subLabel !== '',
          'is-active': index === this.itemActive && !this.clearActive && !this.backActive && this.activeVisible,
          'no-transition-animation': !this.uiMode.selectionListTransition,
          'non-clickable': !this.activeVisible
        }
      ]
    }
  },
  props: {
    active: { type: Boolean, required: true },
    activeVisible: { type: Boolean, default: true },
    backVisible: { type: Boolean, default: false },
    backActive: Boolean,
    clearVisible: { type: Boolean, default: false },
    clearActive: Boolean,
    clearText: {
      type: String,
      default: 'Clear selection'
    },
    questionVisible: { type: Boolean, default: false },
    questionText: {
      type: String,
      default: 'Do you want to proceed?'
    },
    items: Array,
    itemActive: Number,
    theme: {
      type: String,
      default: 'dark',
      required: true,
      validator (value) {
        return ['dark', 'light', 'vod'].indexOf(value) > -1
      }
    },
    title: { type: String, required: true },
    titleAbove: { type: String, required: true },
    titleBelow: { type: String, required: true },
    svgId: String,
    transitionType: {
      type: String,
      default: 'default',
      validator (value) {
        return ['default', 'left', 'right'].indexOf(value) > -1
      }
    },
    handleClickListItem: Function,
    handleClickBack: Function,
    handleClickClear: Function
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.container {
  display: flex;
  height: 1080rem;
  left: 0;
  position: absolute;
  top: 0;
  width: 1920rem;
  z-index: 3;
}

.main {
  background: $blue-dark-2;
  display: flex;
  flex: 3 0;
  justify-content: flex-end;
  padding-top: 432rem;
  position: relative;
  text-align: right;
  .light & {
    background: $white-lighter
  }

  .text {
    margin-right: 32rem;

    .above-title, .below-title {
      color: rgba($white, 0.5);
      font-family: $font-alternative;
      .light & { color: rgba($blue-dark, 0.5); }
    }

    .above-title {
      font-size: 36rem;
      line-height: 60rem;
    }

    .below-title {
      font-size: 28rem;
      line-height: 52rem;
    }

    .title {
      color: $white;
      font-size: 72rem;
      font-weight: 300;
      line-height: 96rem;
      .light & { color: $blue-dark; }
    }
  }

  .image {
    align-items: center;
    background-color: rgba($white, 0.25);
    box-shadow: 0 11rem 16rem 0 rgba(0, 0, 0, 0.18);
    display: flex;
    justify-content: center;
    margin-right: 32rem;
    height: 208rem;
    width: 208rem;
    &.circle { border-radius: 50%; }

    svg {
      fill: $white;
      height: 170rem;
      width: 170rem;
      .light & { fill: $grey-medium; }
    }
  }

  .button-back {
    left: 66rem;
    position: absolute;
    top: 62rem;
    z-index: 1;
    transition: transform $transition-fast, background-color $transition-fast;
    &.is-active {
      box-shadow: 5rem 5rem 20rem 0rem rgba($black, 0.5);
      transform: scale3d(1.2, 1.2, 1.2);
    }
  }
}

.light .side .clear.is-active .text, body:not(.disable-hover) .light .side .clear:hover .text {
 color: #323e43;
}
.vod .side .clear.is-active .text, body:not(.disable-hover) .vod .side .clear:hover .text {
 color: #323e43;
}
.dark .side .clear.is-active .text, body:not(.disable-hover) .dark .side .clear:hover .text {
 color: $white;
}

.vod .side .clear.is-active .icon {
 background: $white;
}
body:not(.disable-hover) .vod .side .clear:hover .icon {
  background: rgba($black, 0.7);
}

.light .side .clear.is-active .icon, .dark .side .clear.is-active .icon {
 background: $blue;
}
body:not(.disable-hover) .light .side .clear:hover .icon, body:not(.disable-hover) .dark .side .clear:hover .icon {
  background: $blue-hover;
}


body:not(.disable-hover) .vod {
  .side {
    .list {
      .item {
        &:hover { 
          background: rgba(255, 255, 255, 0.6);
        }
      }
    }
  }
}

.side {
  background: $blue-dark;
  box-shadow: $box-shadow-default-left;
  border-left-width: 4rem;
  border-left-style: solid;
  border-image: $rainbow-gradient-vertical 1 100%;
  flex: 2 0;
  overflow: hidden;
  position: relative;
  .light & { background: $white-lighter; }
  .vod & { background: $yellow; }

  .list {
    list-style: none;
    padding-top: 476rem;
    transition: transform .2s;
    &-container { overflow: hidden; }

    .item {
      font-family: $font-alternative;
      font-weight: 400;
      height: 130rem;
      padding: 0 60rem;
      position: relative;

      .text {
        @include text-ellipsis;
        color: $white-lighter;
        font-size: 44rem;
        line-height: 130rem;
        .light & { color: $blue-dark; }
        .vod & { color: $black !important; }
      }
      &.has-sublabel {
        padding-top: 20rem;
        .text {
          line-height: 50rem;
          .light & { color: $blue-dark; }
          .vod & { color: $black; }
        }
        .text-sub {
          @include text-ellipsis;
          color: rgba($white, 0.5);
          font-size: 32rem;
          line-height: 44rem;
          .light & { color: rgba($blue-dark, .5); }
          .vod & { color: $black; }
        }
      }

      .bullet {
        border-radius: 50%;
        background-color: rgba($white, .5);
        height: 12rem;
        left: 25rem;
        position: absolute;
        top: 59rem;
        width: 12rem;
        .light & { background-color: rgba($black, .5); }
        .vod & { background-color: rgba($black, .5); }
      }
      .direction {
        right: 58rem;
        position: absolute;
        top: 56rem;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 0 16rem 16rem 16rem;
        border-color: transparent transparent #ffffff transparent;
        &.desc {
          border-width: 16rem 16rem 0 16rem;
          border-color: #ffffff transparent transparent transparent;
          &.vod {
            border-color: $black transparent transparent transparent;
          }
        }
        &.vod {
          border-color: transparent transparent $black transparent;
        }
      }

      &.is-active, &.is-active.has-sublabel, body:not(.disable-hover) &.has-sublabel:hover, body:not(.disable-hover) &:hover {
        background-color: $blue;
        transition: background .1s .2s;
        .text {
          color: $white-lighter;
          transition: color .1s .2s;
        }
        .text-sub {
          color: rgba($white, 0.5);
          transition: color .1s .2s;
        }
        .bullet {
          background-color: rgba($white, .5);
          transition: background .1s .2s;
          .light & { background-color: rgba($white, .5); }
          .vod & { background-color: rgba($black, .5); }
        }
        .vod & {
          background-color: $white;
          color: $black;
        }
      }
      body:not(.disable-hover) &.has-sublabel:hover, body:not(.disable-hover) &:hover { 
        background-color: $blue-hover;
      }
      body:not(.disable-hover) &.non-clickable:hover { 
        background-color: transparent;
        .text {
          color: $blue-dark;
        }
        .text-sub {
          color: rgba(50, 62, 67, 0.5);
        }
      }
      body:not(.disable-hover) &:hover, body:not(.disable-hover) &:hover .text, body:not(.disable-hover) &:hover .text-sub, body:not(.disable-hover) &:hover .bullet {
        transition: all 0s 0s;
      }
    }
  }
  .question {
    box-sizing: content-box;
    display: flex;
    font-size: 40rem;
    height: 60rem;
    left: 0;
    line-height: 60rem;
    padding: 264rem 0 0 60rem;
    position: absolute;
    top: 0;
    width: calc(100% - 30rem);
    z-index: 1;
    .text {
      color: $blue-dark;
      font-size: 44rem;
      line-height: 130rem;
      transition: color $transition-fast;
    }
  }

  .clear {
    background: $blue-dark;
    box-sizing: content-box;
    display: flex;
    font-size: 40rem;
    height: 60rem;
    left: 0;
    line-height: 60rem;
    padding: 83rem 0 53rem 30rem;
    position: absolute;
    top: 0;
    width: calc(100% - 30rem);
    z-index: 1;
    .light & { background: $white-lighter; }
    .vod & { background: $yellow; }

    .icon {
      align-items: center;
      background-color: rgba($white, .25);
      border-radius: 50%;
      box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.47);
      display: flex;
      justify-content: center;
      height: 60rem;
      margin-right: 24rem;
      width: 60rem;
      text-align: center;
      transition: background-color $transition-fast;
      .light & { background-color: rgba($blue-dark, .5);}
      .vod & { background-color: rgba($black, .25);}

      svg {
        height: 24rem;
        fill: $white;
        width: 24rem;
        .vod & { fill: $yellow; }
      }
    }

    .text {
      color: rgba($white, .5);
      font-family: $font-alternative;
      font-weight: 300;
      transition: color $transition-fast;
      .light & { color: rgba($blue-dark, .5); }
      .vod & { color: rgba($black, .5); }
    }

    &.is-active, body:not(.disable-hover) &:hover {
      .icon {
        background: $blue-hover;
        .vod & { background: $white;}
      }
      .text {
        color: $white;
        .light & { color: $blue-dark; }
        .vod & { color: $black; }
      }
    }
    body:not(.disable-hover) &:hover {
      color: red;
    }
  }
}

$transition-offset: 1150rem;

.selection-transition,
.button-transition {
  &-enter, &-leave-to {
    opacity: 0;
  }
  &-enter-to, &-leave {
    opacity: 1;
  }
  &-enter-active, &-leave-active {
    transition: opacity $transition-fast;
  }
}
.selection-main-transition {
  &-enter, &-leave-to {
    @include transform(translate3d(-$transition-offset, 0, 0));
    &.translate {
      @include transform(translate(-$transition-offset, 0));
    }
  }
  &-enter-to, &-leave {
    @include transform(translate3d(0, 0, 0));
    &.translate {
      @include transform(translate(-$transition-offset, 0));
    }
  }
  &-enter-active, &-leave-active {
    transition: transform $transition-fast;
  }
}
.selection-side-transition {
  &-enter, &-leave-to {
    @include transform(translate3d($transition-offset, 0, 0));
    &.translate {
      @include transform(translate($transition-offset, 0));
    }
  }
  &-enter-to, &-leave {
    @include transform(translate3d(0, 0, 0));
    &.translate {
      @include transform(translate($transition-offset, 0));
    }
  }
  &-enter-active, &-leave-active {
    transition: transform $transition-fast;
  }
}
.list-transition-default {
  &-enter, &-leave-to {
    opacity: 0;
  }
  &-enter-to, &-leave {
    opacity: 1;
  }
  &-enter-active {
    transition: opacity $transition-fast;
  }
  &-leave-active {
    transition: none;
  }
}
.list-transition-right, .list-transition-left {
  &-enter, &-leave-to {
    opacity: 0;
  }
  &-enter-to, &-leave {
    opacity: 1;
    @include transform(translate3d(0, 0, 0));
    &.translate {
      @include transform(translate(0, 0));
    }
  }
  &-enter-active {
    transition: transform $transition-fastest, opacity $transition-fast;
  }
  &-leave-active {
    transition: none;
  }
}
.list-transition-right {
  &-enter {
    @include transform(translate3d(500rem, 0, 0));
    &.translate {
      @include transform(translate(500rem, 0));
    }
  }
  &-leave-to {
    @include transform(translate3d(-500rem, 0, 0));
    &.translate {
      @include transform(translate(-500rem, 0));
    }
  }
}
.list-transition-left {
  &-enter {
    @include transform(translate3d(-500rem, 0, 0));
    &.translate {
      @include transform(translate(-500rem, 0));
    }
  }
  &-leave-to {
    @include transform(translate3d(500rem, 0, 0));
    &.translate {
      @include transform(translate(500rem, 0));
    }
  }
}
</style>
