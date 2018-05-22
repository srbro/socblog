<template>
  <div>
    <div class="default-image"></div>
    <transition name="detail-transition" appear>
      <div :class="containerClass">
        <img class="background-image" :src="getBackground()">
        <div class="top">
          <custom-button
            :active="activeSection !== 'series'"
            round
            icon="back"
            :dark="dark"
            :button-click="doBack"
          />
          <div class="basic-info">
            <div class="title">
              {{ loc('ondemand_detailedscreen_season') }} {{ seasonTitle }}
            </div>
            <div v-if="imdbRating !== null && this.asset.categoryIds[0] !== 202" class="imdb-rating">
              <div class="logo"></div>
              <div class="text">
                {{ imdbRating }}
                <span class="text-smaller">/10</span>
              </div>
            </div>
            <div v-if="metascoreRating !== null && this.asset.categoryIds[0] !== 202" class="metascore">
              <div class="metascoreBox">
                {{ metascoreRating }}
              </div>
              <div class="text">
                <span class="text-smaller">Metascore</span>
              </div>
            </div>
          </div>
        </div>
        <div class="details">
          <div class="picture">
            <img :src="getPoster()">
          </div>
          <span class="episodes-number">{{ numberOfEpisodes }} {{ loc('ondemand_detailedscreen_episodes') }}</span>
          <div class="catalogue">
            <img :src="catalogueImage">
          </div>
        </div>
        <div class="description">
          <div class="main">
            <card-row
              :card-theme="'dark'"
              :card-type="'catchup'"
              :card-width="300"
              :height="{ closed: 328, open: 328 }"
              :display-count="false"
              :focused="episodesFocused"
              :items="episodes"
              :selected="activeCard"
              :expanded="true"
              :active-row="true"
              :arrow-class="arrowClass"
              :handle-click="handleClick"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import pick from 'lodash/fp/pick'
import { getImage, getVodCatalogueImagePath } from 'helpers/image'
import { emitKeyPress } from 'helpers/keyHold'

import CustomButton from 'components/Button'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import CardRow from 'containers/general/CardRow'
import vodPosterImage from 'assets/images/placeholders/vod_poster_placeholder_248x366.png'
import vodEventImage from 'assets/images/placeholders/vod_event_300x168.png'
import vodEventDetail from 'assets/images/placeholders/vod_event_detail_1920x1080.png'
import HistoryManager from 'mixins/HistoryManager'

const IMG_SMALL = 'STB_FHD'
const IMG_LARGE = 'STB_XL'
const TYPE_VOD_POSTER = 'VOD_POSTER_21_31'
const TYPE_EVENT = 'EVENT_16_9'

export default {
  name: 'SeasonDetail',
  mixins: [ RegisterKeyHandler, HistoryManager ],
  components: { CustomButton, CardRow },
  data: () => ({
    channelLogoImageUrl: '',
    backgroundImageUrl: `/static/uc/images/fake-video.jpg`,
    activeSection: 'series',
    episodesFocused: true,
    activeCard: 0,
    selectedIndex: 0
  }),
  props: {
    backActive: Boolean,
    dark: {
      type: Boolean,
      default: true
    },
    endTime: Object,
    fullActive: Boolean,
    rating: String,
    startTime: Object,
    title: String
  },
  computed: {
    containerClass () {
      return [
        'container',
        { 'is-dark': this.dark }
      ]
    },
    arrowClass () {
      return 'season-arrows-container'
    },
    numberOfEpisodes () { return this.season ? this.season.numberOfEpisodes : '' },
    season () {
      return find({id: this.$route.params.pageData.seasonId})(this.seasons)
    },
    seasonTitle () {
      return this.season ? this.season.seasonNumber : ''
    },
    getMetadataProviderByName (providers, name) {
      return providers.find(provider => provider.metadataProviderName === name)
    },
    imdbRating () {
      let provider = this.asset && Array.isArray(this.asset.assetRatings) ? this.asset.assetRatings.find(provider => provider.metadataProviderName === 'Imdb') : null
      return provider && provider.length !== 0 ? provider.rating : null
    },
    metascoreRating () {
      let provider = this.asset && Array.isArray(this.asset.assetRatings) ? this.asset.assetRatings.find(provider => provider.metadataProviderName === 'Metascore') : null
      return provider && provider.length !== 0 ? provider.rating : null
    },
    catalogueImage: function () {
      let items = this.catalogues
      let itemsLength = items.length
      let id = this.asset.catalogueIds[0]

      if (id > 0) {
        for (let i = 0; i < itemsLength; i++) {
          if (items[i].id === id) {
            return getVodCatalogueImagePath(items[i].images, 'COLOR') || ''
          }
        }
      } else {
        return ''
      }
    },
    episodes () {
      if (this.season && this.season !== -1) {
        let self = this
        return this.season.episodes.map((episode) => {
          let id = episode.id
          let doClick = function () {
            self.activeSection = 'series'
            self.activeCard = findIndex({ id: id })(self.episodes)
            self.handleKey('OK')
          }
          return {
            imageUrl: getImage(episode.images, IMG_SMALL, TYPE_EVENT, vodEventImage),
            progress: episode.watchProgress / episode.duration,
            subtitle: `${this.loc('general_episode_number_format_1').toUpperCase()} ${episode.episodeNumber}`,
            expanded: true,
            doClick: doClick,
            ...pick(['id', 'title', 'year', 'inFavorites'], episode)
          }
        })
      } else {
        return [{ episodes: [] }]
      }
    },
    ...mapState({
      asset: state => state.vod.detail,
      seasons: state => state.vod.seasons,
      catalogues: state => state.vod.catalogues,
      previousActiveCardId: state => state.vod.selectedItems.seasonDetailActiveCardId
    })
  },
  methods: {
    ...mapMutations({
      saveActiveCard: 'vod/UPDATE_SEASON_DETAIL_SELECTED_ITEM'
    }),
    doBack () {
      this.doHistoryBack()
    },
    getPoster () {
      return getImage(this.asset.images, IMG_SMALL, TYPE_VOD_POSTER, vodPosterImage)
    },
    getBackground () {
      return getImage(this.asset.images, IMG_LARGE, TYPE_EVENT, vodEventDetail)
    },
    handleClick (direction) {
      this.moveRow(direction)
    },
    handleClickBack () {
      this.handleKey('BACK')
    },
    moveRow (direction) {
      const offset = direction === 'LEFT' ? -1 : 1
      this.activeCard = Math.min(Math.max(this.activeCard + offset, 0), this.episodes.length - 1)
    },
    handleKey (key) {
      switch (key) {
        case 'BACK':
          this.doHistoryBack()
          // this.vodDetailRouterPush()
          break
        case 'LEFT':
          if (this.activeCard > 0) {
            this.moveRow(key)
          } else {
            // this.vodDetailRouterPush()
            this.doHistoryBack()
          }
          break
        case 'RIGHT':
          this.moveRow(key)
          break
        case 'LEFT_HOLD': // j for web
        case 'RIGHT_HOLD': // k for web
          if (emitKeyPress({ delay: 50 })) {
            this.moveRow(key === 'LEFT_HOLD' ? 'LEFT' : 'RIGHT')
          }
          break
        case 'UP':
          // this.backActive = true
          this.activeSection = 'back'
          this.episodesFocused = false
          break
        case 'DOWN':
          // this.backActive = false
          this.activeSection = 'series'
          this.episodesFocused = true
          break
        case 'HOLD_STOP': // l for web
          break
        case 'OK':
          this.selectCard()
          break
      }
    },
    selectCard () {
      if (this.activeSection === 'back') {
        // this.vodDetailRouterPush()
        this.doHistoryBack()
      } else {
        this.episodeDetailRouterPush()
      }
    },
    vodDetailRouterPush () {
      this.$router.push({
        name: 'VodDetail',
        params: { asset: this.asset }
      })
    },
    episodeDetailRouterPush () {
      this.$router.push({
        name: 'EpisodeDetail',
        params: {
          seasonId: this.$route.params.pageData.seasonId,
          episodeId: this.episodes[this.activeCard].id,
          asset: { imageUrl: this.getPoster() }
        }
      })
    }
  },
  mounted () {
    if (this.$route.params.pageData.episodeId) this.activeCard = findIndex({id: this.$route.params.pageData.episodeId})(this.episodes)
  },
  created () {
    if (this.previousActiveCardId !== null) {
      let activeCard = findIndex({ id: this.previousActiveCardId }, this.episodes)
      this.activeCard = activeCard !== -1 ? activeCard : this.activeCard
      this.saveActiveCard(null)
    }
  },
  watch: {
    activeCard (newVal) {
      this.saveActiveCard(this.episodes[this.activeCard].id)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "variables";

$more-offset: 960rem;

.default-image {
  background: $grey-darker;
  position: absolute;
  width: 1920rem;
  height: 100%;
  z-index: 100;
}

.container {
  height: 100%;
  width: 1920rem;
  transition: transform $transition;
  position: relative;
  z-index: 200;

  &.is-dark {
    .details {
      background: rgba($grey-darker, .7);
    }

    .description, .more-wrapper {
      background: rgba($grey-darker, 0.85);
    }

    .small-title { color: $white; }
    .main-title { color: $white; }
    .item { color: rgba($white, .7); }
    .main-text { color: rgba($white, .7); }
  }
}

  .background-image {
    height: 1080rem;
    left: 0;
    position: absolute;
    top: 0;
    width: 1920rem;
    z-index: -1;
  }

  .top {
    display: flex;
    justify-content: space-between;
    height: 505rem; //  410rem
    padding: 62rem 186rem 0 66rem;
    background: rgba($grey-darker, 0.7);
  }
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
    min-height: 45rem;
    display: flex;
    align-items: center;
    .metascoreBox {
      background: #66cc33;
      color: #fff;
      width: 45rem;
      height: 45rem;
      font-size: 20rem;
      text-align: center;
      line-height: 45rem;
      display: inline-block;
    }
  }

  .basic-info {
    display: flex;
    flex-direction: row;
    padding: 0 0 25rem 208rem;
    height: 95rem;
    margin-top: auto;
    width: 100%;
    color: white;
  }

  .title {
    font-size: 80rem;
    font-weight: 200;
  }

  .details {
    background: rgba($white-lighter, .72);
    border-top: 5rem solid $grey-med;
    height: 135rem;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 0 184rem 0 66rem;
    font-size: 28rem;
    font-weight: 200;
    color: white;
    .episodes-number {
      padding-left: 57rem;
    }
    .episodes-type { margin-left: auto;}
    .picture {
      width: 250rem;
      height: inherit;
      position: relative;
      img {
        position: absolute;
        width: 250rem;
        height: 360rem;
        bottom: -20rem;
        background-color: $blue-medium;
      }
    }
    .catalogue {
      display: flex;
      align-items: center;
      margin-left: auto;
    }
  }

  .description {
    background: rgba($white-lighter, .8);
    display: flex;
    height: 440rem;
    color: white;
  }

    .main {
      padding: 80rem 30rem 40rem 66rem;
      position: relative;
      width: 100%;
    }
.detail-transition {
  &-enter, &-leave-to { opacity: 0; }
  &-enter-to, &-leave { opacity: 1; }
  &-enter-active { transition: opacity .6s ease-in-out; }
  &-leave-active { transition: opacity .2s ease-in-out; }
}
</style>
