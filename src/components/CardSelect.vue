<template>
  <div :class="cardSelectedClass">
    <p class="selectCardText">{{ selectedTitle }}</p>
    <svg class="now-tv-filter-arrow">
      <use xlink:href="#now-tv-filter-arrow"/>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'CardSelected',
  data () {
    return {
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  },
  computed: {
    cardSelectedClass () {
      return [
        'card-selected',
        {
          'is-selected': this.selectedItem,
          'is-filtered': this.selectedItemDefault && !this.selectedItem && this.showIsFiltered,
          'card-selected-vod': this.type === 'VOD',
          'card-selected-vod-empty': this.empty,
          'enable-hover': this.enableHover,
          'no-transition-animation': !this.uiMode.nowTvFilterTransitionAnimation,
          'no-shadow': !this.uiMode.nowTvFilterShadow,
          'no-scale': !this.uiMode.nowTvFilterScaling,
          'translate': this.translateMode.translate
        }
      ]
    }
  },
  props: {
    selectedTitle: {
      type: String,
      required: true
    },
    selectedItem: {
      type: Boolean,
      required: true
    },
    selectedItemDefault: { type: Boolean },
    type: { type: String },
    empty: { type: Boolean },
    showIsFiltered: { type: Boolean, default: true },
    enableHover: { type: Boolean }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

  .card-selected {
    opacity: 1;
    display: flex;
    justify-content: space-between;
    height: 98rem;
    width: 300rem;
    margin-right: 12rem;
    background-color: $white;
    line-height: 98rem;
    font-size: 40rem;
    color: #323e43;
    white-space: nowrap;
    box-sizing: border-box;
    padding: 0 29rem 0 29rem;
    font-family: "Roboto Condensed";
    font-weight: 300;
    box-shadow: 0 11rem 16rem 0 rgba($black, 0.18);
    transition: transform $transition, opacity $transition-fast;
    @include transform(translate3d(0, 0, 0));
    &.translate {
      @include transform(translate(0, 0));
    }
    &.hide {
      opacity: 0;
      @include transform(translate3d(0, -430rem, 0));
      &.translate {
        @include transform(translate(0, 0));
      }
    }
    p {
      @include text-ellipsis;
      padding-right: 15rem;
    }
    .selectCardText{
      display: block;
      width: 90%;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .now-tv-filter-arrow {
      flex-shrink: 0;
      width: 20rem;
      right: 10rem;
      fill: #323e43;
    }
    &.is-selected, body:not(.disable-hover) &.enable-hover:hover {
      background-color: $blue; // blue
      color: #fff;
      z-index: 1;
      &.card-selected{
        box-shadow: 0 29rem 38rem -6rem rgba($black, 0.3);
      }
      .now-tv-filter-arrow {
        fill: #fff;
      }
    }
    body:not(.disable-hover) &.enable-hover:hover {
      background-color: $blue-hover;
    }
    body:not(.disable-hover) &:hover {
      background-color: $blue-hover;
      color: #fff;
      .now-tv-filter-arrow {
        fill: #fff;
      }
    }
    &.is-selected {
      transform: scale3d(1.15, 1.15, 1.15);
    }
    &.is-filtered {
      background-color: #4f5f65;
      color: #fff;
      border: none;
      .now-tv-filter-arrow {
        fill: #fff;
      }
    }
  }
  .card-selected-vod {
    background-color: #4f5f65;
    color: $white;
    .now-tv-filter-arrow { fill: $white; }
    &-empty {
      background-color: transparent;
      border: 4px solid #4f5f65;
      &.is-selected, body:not(.disable-hover) &:hover { border: none; } // orange
    }
    &.is-selected { background-color: $yellow; } // orange
    body:not(.disable-hover) &:hover { background-color: $yellow-hover; } // orange
    &.is-filtered {
      background-color: $white;
      color: #323e43;
      .now-tv-filter-arrow { fill: #323e43; }
    }
  }
</style>
