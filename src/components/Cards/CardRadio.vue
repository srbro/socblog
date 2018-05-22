<template>
	<div :class="this.seeAllText ? this.cardSeeAll() : this.cardClass()" :style="image"
    @click="doClick()"
  >
    <template v-if="seeAllText">
      {{ loc('general_seeall') }}
      <span class="subtitle">{{ seeAllText }}</span>
    </template>
		<template v-else>
			<div v-if="showDetails" :class="detailClass()">
				<span class="first-row">{{ firstRowText }}</span>
			  {{ secondRowText }}
			</div>
		</template>
	</div>
</template>

<script>
export default {
  name: 'CardRadio',
  props: {
    upperImageUrl: String,
    selected: {
      type: Boolean,
      required: true
    },
    showDetails: {
      type: Boolean,
      required: true
    },
    firstRowText: String,
    secondRowText: String,
    currentPlaying: Boolean,
    fasterAnimation: Boolean,
    seeAllText: String,
    clickFn: {
      default: null,
      required: false
    }
  },
  data () {
    return {
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  },
  computed: {
    containerClass () {
      return ['card-container', { 'is-selected': this.selected && !this.fasterAnimation }]
    },
    image () {
      return this.upperImageUrl ? {backgroundImage: `url(${this.upperImageUrl})`} : {}
    }
  },
  methods: {
    doClick: function () {
      typeof this.clickFn === 'function' && this.clickFn(this)
    },
    cardClass () {
      return [
        'card-container',
        {
          'is-selected': this.selected && !this.fasterAnimation,
          'no-transition-animation': !this.uiMode.cardRowCardTransitionAnimation,
          'no-scale': this.selected && !this.uiMode.cardRowCardScale,
          'no-shadow': !this.uiMode.cardRowCardShadow
        }
      ]
    },
    cardSeeAll () {
      return [
        'card-container',
        'see-all',
        {
          'is-selected': this.selected && !this.fasterAnimation,
          'is-closed': !this.showDetails,
          'no-transition-animation': !this.uiMode.cardRowCardTransitionAnimation,
          'no-scale': !this.uiMode.cardRowCardScale,
          'no-shadow': !this.uiMode.cardRowCardShadow,
          'faster-animation': this.selected && this.fasterAnimation
        }
      ]
    },
    detailClass () {
      return [
        'description',
        {
          'faster-animation': this.selected && this.fasterAnimation,
          'current-playing': this.currentPlaying,
          'no-shadow': !this.uiMode.cardRowCardProgressShadow
        }
      ]
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";
@import "./_common.scss";

.card-container {
  width: 300rem;
  height: 168rem;
  background-size: 300rem 168rem;
  background-color: $white;
  .description {
    width: 300rem;
    height: 88rem;
    bottom: -88rem;
    padding: 0 26rem;
    font-size: 23rem;
    color: rgba($black, 0.5);
    .first-row {
      margin-top: 12rem;
      margin-bottom: 4rem;
      font-size: 27rem;
      color: $black;
    }
    &.current-playing {
      background-color: #637279;
      color: rgba($white, .5);
      .first-row { color: $white; }
    }
  }
  &.is-selected {
    transform: scale3d(1.25, 1.25, 1);
    .current-playing {
      &.description {
        background-color: $blue;
      }
    }
  }
  &.see-all {
    font-weight: 300;
    height: 266rem;
    margin-bottom: 4rem;
    &.is-closed { height: 168rem; }
    &.faster-animation {
      background-color: $blue;
      color: $white;
      .subtitle { color: rgba($white, 0.5); }
    }
  }
}

</style>
