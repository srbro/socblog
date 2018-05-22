<template>
    <li :class="eventClass">
        <div :class="[`card-${this.type}`, {'small': navigationActive}]">
            <h1>{{ loc('general_seeall') }}</h1>
            <h2>{{ sectionTitle }}</h2>
        </div>
    </li>
</template>


<script>
import { mapState } from 'vuex'
/*
TODO: Card detail view
TODO: Cards (and See all card) focus
TODO: Move cards
TODO: Banner
*/
export default {
  name: 'CardSeeAll',
  props: {
    sectionTitle: String,
    selected: {
      type: Boolean,
      required: true
    },
    showDetails: {
      type: Boolean,
      default: false
    },
    type: String
  },
  computed: {
    eventClass () {
      return ['card-container', {'is-selected': this.selected}, `card-${this.type}`]
    },
    ...mapState({
      navigationActive: state => state.navigation.active
    })
  }
}
</script>

<style scoped lang="scss">
@import "variables";

$width: 263rem;
$height: 436rem;
$spacing: 12rem;

.card-container {
  transform-origin: center center;
  transition: transform $transition;
  transform-origin: left top;
  .card-radio {
    width: 300rem;
    height: 266rem;
    box-shadow: 0 11rem 16rem 0 rgba($black, .18);
    background-color: #596569;
    align-items: center;
    justify-content: center;
    display: flex;
    flex-flow: column nowrap;
    transform-origin: center center;
    transition: all $transition;
    &.small {
      height: 170rem;
    }
  }

  .card-nowtv {
    width: 300rem;
    height: 440rem;
    box-shadow: 0 11rem 16rem 0 rgba($black, .18);
    background-color: #596569;
    align-items: center;
    justify-content: center;
    display: flex;
    flex-flow: column nowrap;
    transform-origin: center center;
    transition: all $transition;
    &.small {
      height: 328rem;
    }
  }

  h1, h2 {
    margin-left: auto;
    margin-right: auto;
    font-family: "Roboto Condensed";
    text-transform: uppercase;
  }
  h1 {
    font-size: 50rem;
    color: $white;
    font-stretch: condensed;
    font-weight: 300;
  }

  h2 {
    font-size: 28rem;
    color: rgba($white, .5);
    font-stretch: condensed;
    font-weight: 400;
    text-align: center;
  }
  &.is-selected {
    z-index: 2;
    background-color: $blue;
    box-shadow: 0 29rem 43rem 0 rgba($black, .47);

    .card-radio {
      background-color: $blue;
      transition: transform $transition;
      transform: scale3d(1.32556,1.32556,1);
    }
    .card-nowtv {
      background-color: $blue;
      transition: transform $transition;
      transform: scale3d(1.12556,1.12556,1);
    }
  }

}

</style>
