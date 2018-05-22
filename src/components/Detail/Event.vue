<template>
  <transition name="detail-transition" appear>
    <div v-if="active" :class="containerClass">
      <img class="background-image" :src="backgroundImageUrl">
      <div class="top">
        <custom-button
          :active="backActive"
          round icon="back"
          :buttonClick="handleClickBack"
        />
      </div>
      <div v-if="showProgress" class="progress">
        <div :class="['done', { 'blocked': !currentEventCutv || (currentCutvDelay && !currentEventCutv), 'no-transition-animation': !uiMode.guideColumnTransitionAnimation }]" :style="progressStyle" />
      </div>
      <div class="buttons">
        <div v-if="showProgress" class="line"></div>
        <custom-button
          v-for="(button, index) in buttons"
          :key="`${button.icon}${index}`"
          :active="activeCtaButton === index"
          :icon="`detail-${button.icon}`"
          :class="{'check': button.active}"
          :buttonClick="mkHandleButtonClick(button.id, index)"
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
          <img
            v-if="channelLogoImageUrl"
            class="channel-logo"
            :src="channelLogoImageUrl" />
          <div class="main-title-container">
            <div class="main-title" :style="trimmedItemsEventNameStyle">{{ title }}</div>
          </div>
          <div class="small-title">{{ formattedStartTime || quality }} <span class="subscribed"> {{ subscribed ? ' SUBSCRIBED' : ''}}</span></div>
          <div class="main-text">
            <!-- <span v-show="genre">{{genre}} • </span> -->
            <span v-show="duration">{{duration}}</span>
            <span v-show="live"> • <span class="live-flag">LIVE</span></span>
            <span v-show="year"> • {{year}}</span>
            <span v-show="rating"> • {{rating}}</span>
          </div>
          <template v-if="bannerDescription">
            <div class="main-text-long">{{ bannerDescription }}</div>
            <custom-button class="button-full" :active="fullActive" :buttonClick="openFullText">{{ loc('stb_ondemand_detailedscreen_synopsys_seefull') }} »</custom-button>
          </template>
          <template v-if="synopsis">
            <div class="small-title">{{ loc('ondemand_detailedscreen_synopsys') }}</div>
            <div class="main-text">
              <div class="transparent-cover"></div>
              <p class="synopsis">{{ synopsis }}</p>
            </div>
            <custom-button class="button-full" :active="fullActive" :buttonClick="openFullText">{{ loc('stb_ondemand_detailedscreen_synopsys_seefull') }} »</custom-button>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import common from './_common'

export default {
  name: 'DetailEvent',
  mixins: [ common ],
  computed: {
    containerClass () {
      return [
        'container',
        {
          'no-transition-animation': !this.uiMode.settingsTransitionAnimation,
          'no-shadow': !this.uiMode.settingsShadow
        },
        { 'translate': this.translateMode.translate }
      ]
    }
  },
  props: {
    active: Boolean,
    activeCtaButton: Number,
    actors: { type: Array, default: () => [] },
    backActive: Boolean,
    backgroundImageUrl: String,
    bannerDescription: String,
    buttons: { type: Array, required: true },
    channelLogoImageUrl: String,
    currentEventCutv: Boolean,
    currentCutvDelay: Boolean,
    currentStartOverEnabled: Boolean,
    customDuration: Number,
    director: String,
    endTime: Number,
    fullActive: Boolean,
    // genre: String,
    handleClickBack: Function,
    language: String,
    live: Boolean,
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
    showProgress: Boolean,
    startTime: Number,
    subscribed: Boolean,
    synopsis: String,
    title: String,
    year: Number
  }
}
</script>

<style lang="scss" scoped>
@import "./common.scss";

.progress {
  background:$grey-gradient-vertical;
  .done {
    background: $blue-gradient-vertical;
    &.blocked {
      background: $grey-dark-gradient-vertical;
    }
  }
}

  .buttons {
    background: rgba($white-lighter, .72);
  }

  .description {
    background: rgba($white-lighter, .8);
  }

.small-title {
  color: $blue-dark;
  .subscribed { color: $yellow; font-weight: 300; }
}

.item {
  color: rgba($blue-dark, .5);
}

.main-text {
  color: $blue-dark;
}

.main-text-long {
  color: $blue-dark;
}
</style>
