<template>
  <div>
    <img :class="backgroundClass" :src="backgroundImageUrl">
    <transition name="detail-transition" appear>
      <div v-if="active" :class="containerClass">
        <div class="top">
          <custom-button
            :active="backActive"
            round icon="back"
            dark
            :buttonClick="handleClickBack"
          />
        </div>
        <div v-if="vodPoster" class="vod-poster-container">
          <img :src="vodPoster" class="vod-poster" />
          <img v-if="progress === 1" src="../../../static/uc/images/dog-ear.png" class="dog-ear" />
        </div>
        <div v-if="(progress || progress === 0) && !hasSeasons" class="progress">
          <div class="done" :style="progressStyle" />
        </div>
        <div class="buttons episode-buttons">
          <custom-button
            v-for="(button, index) in buttons"
            :key="`${button.icon}${index}`"
            :active="activeCtaButton === index"
            :icon="`detail-${button.icon}`"
            :class="{'check': button.active}"
            dark
            :buttonClick="mkHandleButtonClick(button.id, index, 1)"
          >{{ button.text }}</custom-button>
        </div>
        <div class="description">
          <div class="metadata">
            <template v-if="language">
              <div class="small-title">{{ loc('ondemand_detailedscreen_language') }}</div>
              <div class="item">{{ language }}</div>
            </template>
            <template v-if="director">
              <div class="small-title">{{ loc('ondemand_detailedscreen_director') }}</div>
              <div class="item">{{ director }}</div>
            </template>
            <template v-if="actors.length > 0">
              <div class="small-title">{{ loc('stb_ondemand_detailedscreen_starring') }}</div>
              <div v-for="actor in actors" :key="actor" class="item">{{ actor }}</div>
            </template>
          </div>
          <div class="main">
            <!--- IMDB rating -->
            <div class="rating">
              <div v-if="imdbRating !== null" class="imdb-rating">
                <div class="logo"></div>
                <div class="text">
                  {{ imdbRating }}
                  <span class="text-smaller">/10</span>
                </div>
              </div>
              <div v-if="metascoreRating !== null" class="metascore">
                <div class="metascoreBox">
                  {{ metascoreRating }}
                </div>
                <div class="text">
                  <span class="text-smaller">Metascore</span>
                </div>
              </div>
            </div>
            <!--- IMDB raiting ende, frende-->
            <img
              v-if="channelLogoImageUrl"
              class="channel-logo"
              :src="channelLogoImageUrl" />
            <div class="main-title-container">
              <div class="main-title" :style="trimmedItemsEventNameStyle">{{ title }}</div>
            </div>
            <div class="small-title">{{ formattedStartTime || quality }} <span class="subscribed"> {{ subscribed ? loc('ondemand_detailedscreen_subscribed') : ''}}</span></div>
            <div class="main-text">
              <span v-show="genre">{{genre}} • </span>
              <span v-show="duration">{{duration}}</span>
              <span v-show="year"> • {{year}}</span>
              <span v-show="rating"> • {{rating}}</span>
            </div>
            <template v-if="bannerDescription">
              <div class="main-text-long">{{ bannerDescription }}</div>
              <custom-button class="button-full" :active="fullActive" dark :buttonClick="openFullText">{{ loc('stb_ondemand_detailedscreen_synopsys_seefull') }} »</custom-button>
            </template>
            <template v-if="synopsis">
              <div class="small-title">{{ loc('ondemand_detailedscreen_synopsys') }}</div>
              <div class="main-text">
                <div class="transparent-cover"></div>
                <p class="synopsis">{{ synopsis }}</p>
              </div>
              <custom-button class="button-full" :active="fullActive" dark :buttonClick="openFullText">{{ loc('stb_ondemand_detailedscreen_synopsys_seefull') }} »</custom-button>
            </template>
          </div>
        </div>
        <div v-if="this.$slots.seasons" class="seasons-wrapper">
          <div class="seasons">
            <slot name="seasons" />
          </div>
        </div>
        <div v-if="this.$slots.more" class="more-wrapper">
          <div :class="['more', {'more-has-seasons': this.hasSeasons}]">
            <slot name="more" />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import common from './_common'

export default {
  name: 'DetailVod',
  mixins: [ common ],
  computed: {
    containerClass () {
      return [
        'container',
        {
          'has-seasons': this.moreActive && this.hasSeasons,
          'no-transition-animation': !this.uiMode.settingsTransitionAnimation,
          'no-shadow': !this.uiMode.settingsShadow
        },
        { 'is-scrolled-down': (this.moreActive && !this.hasSeasons) || (!this.moreActive && this.seasonsSelected) },
        { 'translate': this.translateMode.translate }
      ]
    },
    backgroundClass () {
      return [
        'background-image'
      ]
    }
  },
  props: {
    active: Boolean,
    activeCtaButton: Number,
    actors: { type: Array, default: () => [] },
    backActive: Boolean,
    bannerDescription: String,
    backgroundImageUrl: String,
    buttons: { type: Array, required: true },
    channelLogoImageUrl: String,
    customDuration: Number,
    director: String,
    endTime: Number,
    fullActive: Boolean,
    genre: String,
    handleClickBack: Function,
    hasSeasons: Boolean,
    imdbRating: Number,
    language: String,
    mkHandleButtonClick: {
      type: Function,
      requred: false,
      default: () => null
    },
    moreActive: Boolean,
    openFullText: Function,
    progress: Number,
    quality: String,
    rating: String,
    seasonsSelected: Boolean,
    showProgress: Boolean,
    startTime: Number,
    subscribed: Boolean,
    synopsis: String,
    title: String,
    vodPoster: String,
    year: Number,
    metascoreRating: Number
  }
}
</script>

<style lang="scss">
@import "variables";

@keyframes marquee {
  0% {
    @include transform(translate3d(0, 0, 0))
  }
}

@keyframes marqueeSecond {
  0% {
    @include transform(translate(0, 0))
  }
}
</style>

<style lang="scss" scoped>
@import "./common.scss";

.vod-poster-container {
  background-color: $blue-medium;
  box-shadow: 0 11rem 16rem 0 rgba($black, .18);
  height: 366rem;
  left: 66rem;
  position: absolute;
  top: 294rem;
  width: 248rem;
  z-index: 9999;

  .vod-poster {
    height: 100%;
    width: 100%;
  }

  .dog-ear {
    height: 60rem;
    position: absolute;
    right: -4px;
    top: -4px;
    width: 60rem;
  }
}

.progress {
  background: linear-gradient(to bottom, #f0f0f0, #cacaca);
  outline: 1rem solid $grey-lightish;
  .done {
    background: linear-gradient(to bottom, #fdb10e, #e09a05);
    outline: 1rem solid $brown-light;
  }
}

.buttons {
  background: rgba($grey-darker, .8);

  &.episode-buttons {
    .button {
      margin-right: 17rem;
    }
  }
}

.description {
  background: rgba($grey-darker, .95);
}

.small-title {
  color: $white;
  .subscribed { color: $yellow; font-weight: 300; }
}

.item {
  color: rgba($white, .7);
}

.main-title-container {
  .main-title {
    color: $white;
  }
}

.main-text {
  color: rgba($white, .7);
}

.main-text-long {
  color: rgba($white, .7);
}

.seasons-wrapper {
  background: rgba($grey-darker, .95);
  padding: 0 66rem;
  position: relative;
  z-index: 1;

  .seasons {
    border-top: 2rem solid #828282;
    height: $seasons-offset;
    padding-top: 158rem;
  }
}

.more-wrapper {
  background: rgba($grey-darker, .95);
  padding: 0 66rem;
  position: relative;
  z-index: 1;

  .more {
    border-top: 2rem solid #828282;
    height: $more-offset;
    padding-top: 158rem;
    &-has-seasons { height: $more-offset-has-seasons; }
  }
}

.channel-logo {
  height: 80rem;
  position: absolute;
  right: 0;
  top: 52rem;
}

.rating {
  position: absolute;
  bottom: 160rem;
  right: 20rem;
  width: 500rem;
  display: flex;

  .imdb-rating {
    display: flex;
    align-items: center;
    margin-top: 30rem;
    margin-left: auto;
  }

  .logo {
    background-image: url('data:image/png;base64,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');
    background-size: 100%;
    height: 33rem;
    width: 68rem;
  }

  .text {
    color: $white;
    font-size: 28rem;
    line-height: 36rem;
    margin-left: 14rem;
    text-shadow: 2rem 2rem 0 $black;
    &-smaller {
      font-size: 20rem;
    }
  }

  .metascore {
    margin: 20rem 0 0 30rem;
    min-height: 50rem;
    display: flex;
    align-items: center;
    .metascoreBox {
      background: #66cc33;
      color: #fff;
      width: 50rem;
      height: 50rem;
      font-size: 20rem;
      text-align: center;
      line-height: 50rem;
      display: inline-block;
    }
  }
}
</style>
