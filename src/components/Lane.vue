<template>
  <div
    :class="laneClass"
    @click.stop="toggleNavigation"
  >
    <div v-if="user && showUser" class="user-container">
      <div class="user">
        <img class="user-image" :src="user.avatar">
        <div class="user-name">{{ user.name }}</div>
      </div>
    </div>
    <ul class="menu">
      <li v-for="(item, index) in items"
        :class="navItemClass(index)"
        :key="index"
        @click.stop="watch(item)"
        @mouseenter="mouseEnter(index)"
        @mouseleave="mouseLeave(index)"
       >
        <svg v-if="icons" :class="iconClass">
          <use :xlink:href="iconPath(index)"></use>
        </svg>
        <span :class="textClass">{{ loc(item.name) }}</span>
      </li>
    </ul>
    <div v-if="time" class="time">
      <div class="date">{{ formattedTime.date }}</div>
      <div class="hour">{{ formattedTime.time }}</div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { formatTime, formatShortDate, getDayName } from 'helpers/time'

export default {
  name: 'Lane',
  computed: {
    ...mapGetters({
      playerRoute: 'player/getRouteName'
    }),
    laneClass () {
      return [
        'lane',
        `lane-${this.type}`,
        {
          'is-active': this.active,
          'user-hidden': !this.showUser,
          'no-transition-animation': !this.uiMode.menuLaneTransitionAnimation,
          'no-shadow': !this.uiMode.menuLaneShadow,
          'translate': this.translateMode.translate
        }
      ]
    },
    textClass () {
      return [
        'text',
        {
          'no-transition-animation': !this.uiMode.menuLaneTransitionAnimation
        }
      ]
    },
    iconClass () {
      return [
        'icon',
        {
          'no-transition-animation': !this.uiMode.menuLaneTransitionAnimation
        }
      ]
    },
    formattedTime () {
      return {
        date: formatShortDate(this.time) + ' - ' + this.locDay(getDayName(this.time)),
        time: formatTime(this.time)
      }
    }
  },
  methods: {
    iconPath (index) {
      return `#${this.items[index].id + (index === this.selectedIndex ? '-active' : '')}`
    },
    navItemClass (index) {
      let watch = ''
      let selectedItem = ''
      if (index === this.selectedIndex) {
        selectedItem = 'is-selected'
      }
      if (this.items[index].id === 'watch') {
        watch = 'watch'
      }

      return `item ${watch} ${selectedItem}`
    },
    watch (item) {
      if (item.id !== 'watch') {
        item.click()
      } else {
        this.$router.push({ name: this.playerRoute })
      }
    }
  },
  props: {
    active: Boolean,
    icons: Boolean,
    showUser: Boolean,
    items: {
      type: Array,
      default: () => []
    },
    selectedIndex: {
      type: Number,
      required: false
    },
    user: Object,
    time: Number,
    type: {
      type: String,
      default: 'main',
      validator: (value) => ['main', 'sub'].indexOf(value) > -1
    },
    mouseEnter: {
      default: () => null,
      type: Function
    },
    mouseLeave: {
      type: Function,
      default: () => null
    },
    toggleNavigation: {
      type: Function,
      default: () => null,
      required: false
    },
    hoverNavigation: {
      type: Function,
      default: () => null,
      required: false
    },
    handleKey: {
      type: Function,
      default: () => null,
      required: false
    }
  },
  data () {
    return {
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.lane {
  align-items: flex-start;
  background-color: $blue-dark;
  display: flex;
  flex-flow: column nowrap;
  height: 100%;
  justify-content: flex-start;
  left: 0;
  max-height: 100%;
  position: absolute;
  top: 0;
  @include transform(translate3d(0, 0, 0));
  &.translate {
    @include transform(translate(0, 0))
  }
  transition: transform $transition-fast;
  will-change: transform;

  .user {
    align-items: flex-start;
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    width: 105rem;

    &-container {
      height: 312rem;
      padding-left: 65rem;
      padding-top: 62rem;
      width: 100%;
    }

    &-image {
      border-radius: 50%;
      flex-shrink: 0;
      height: 105rem;
      margin-right: 30rem;
      width: 105rem;
    }

    &-name {
      @include text-ellipsis;
      color: rgba($white, .5);
      font-family: $font-alternative;
      font-size: 28rem;
      font-weight: 300;
      margin-top: 24rem;
      width: 105rem;
      text-align: center;
    }
  }

  .menu {
    align-items: flex-start;
    display: flex;
    flex-flow: column nowrap;
    list-style: none;
    padding-left: 47rem;
    padding-right: 20rem;
    width: 100%;

    .item {
      transform: scale3d(1, 1, 1); // adds a layer, less repainting
      position: relative;
      align-items: center;
      display: flex;
      flex-flow: row nowrap;
      font-size: 40rem;
      font-family: $font-alternative;
      font-weight: 300;
      height: 97rem;
      user-select: none;
      width: 100%;
      body:not(.disable-hover) &:hover {
        .icon {
          background-color: rgba($white, 0.45);
        }
        .text {
          color: rgba($white, 0.8);
          font-weight: 100;
        }
        .tooltips {
          color: red;
        }
      }
      &.watch {
        position: absolute;
        flex-flow: row-reverse;
        bottom: 40rem;
        right: 37rem;
        max-width: 72rem;
        height:  auto;
        display: block;
        margin-right: 0;
        text-align: center;
        &.is-selected {
          body:not(.disable-hover) &:hover {
            .icon {
              background: rgba(0, 149, 218, 1);
            }
            .text {
              font-weight: 400;
            }
          }
        }
        body:not(.disable-hover) &:hover {
          .icon {
            background: rgba(255, 255, 255, 0.45);
          }
          .text {
            font-weight: 100;
          }
        }
        .icon {
          position: relative;
          top: 6rem;
          left: 50%;
          margin-left: -31rem;
          margin-right: 0;
          flex: none;
          display:block;
          background: none;
        }
        .text {
          position: relative;
          font-size: 20rem;
          bottom: 0;
          text-transform: uppercase;
          color: rgba(255, 255, 255, .7);
          left: 2rem;
        }
      }

      .text {
        @include text-ellipsis;
        color: rgba($white, .5);
        flex: 1;
        opacity: 0;
        transform-origin: left;
        transition: opacity $transition-fastest, transform $transition-fastest, color $transition-fastest;
        will-change: opacity;
      }

      .icon {
        fill: $white;
        background-color: rgba($white, 0.25);
        border-radius: 50%;
        height: 62rem;
        margin-right: 50rem;
        width: 62rem;
        transition: transform $transition-fastest;
        transform: scale3d(1, 1, 1);
        will-change: transform;
      }

      &.is-selected {
        font-weight: 400;

        .text {
          color: $white;
        }
        .icon {
          background-color: $blue;
          transform: scale3d(1.161, 1.161, 1);
        }
      }
    }
  }

  &-main {
    background-color: $blue-dark;
    justify-content: space-between;
    @include transform(translate3d(340rem, 0, 0));
    &.translate {
      @include transform(translate(340rem, 0));
    }
    width: $navigation-width - 4rem;
    z-index: 3;

    .menu {
      margin-top: 0rem;
      flex-grow: 1;
    }

    .is-active & {
      @include transform(translate3d(0, 0, 0));
      &.translate {
        @include transform(translate(0, 0))
      }

      &.is-active {
        @include transform(translate3d(0, 0, 0));
        &.translate {
          @include transform(translate(0, 0))
        }

        .menu .item .text {
          opacity: 1;
        }

        .user {
          align-items: center;
          flex-flow: row nowrap;
          justify-content: flex-start;
          width: 100%;

          &-name {
            font-size: 40rem;
            margin-top: 0;
            padding-right: 20rem;
            width: 100%;
          }
        }
      }
    }
  }

  &-sub {
    $width: $navigation-width - $navigation-width-closed;
    background-color: $blue-dark-2;
    box-shadow: inset $box-shadow-default-right;
    left: $navigation-width-closed - $navigation-border;
    @include transform(translate3d($width, 0, 0));
    &.translate {
      @include transform(translate($width, 0));
    }
    width: $width;
    z-index: 4;
    overflow: hidden;

    .menu {
      margin-top: 312rem;
      padding-left: 26rem;
    }

    .is-active & {

      &.is-active {
        @include transform(translate3d(0, 0, 0));
        &.translate {
          @include transform(translate(0, 0));
        }

        .menu .item .text {
          opacity: 1;
        }
      }
    }

  }

  &.user-hidden {
    .menu { margin-top: 312rem; }
  }

  .time {
    align-items: center;
    display: flex;
    flex-flow: column nowrap;
    font-family: $font-alternative;
    line-height: 1;
    margin-bottom: 40rem;
    width: $navigation-width-closed - $navigation-border;

    .date {
      color: rgba($white, .7);
      font-size: 20rem;
      text-transform: uppercase;
    }

    .hour {
      color: $white;
      font-size: 48rem;
      font-weight: 300;
      letter-spacing: 0.04em;
      margin-top: 12rem;
    }
  }
}
</style>
