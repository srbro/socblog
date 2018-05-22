<template>
  <detail-vod
    :active="true"
    :active-cta-button="activeButtonLevel === 'cta' ? activeCtaButton : -1"
    :actors="actors()"
    :background-image-url="getBackground()"
    :back-active="activeButtonLevel === 'back'"
    :buttons="buttons"
    :channel-logo-image-url="catalogueImage"
    :custom-duration="duration"
    :full-active="activeButtonLevel === 'full'"
    dark
    :director="director()"
    :has-seasons="isSerie"
    :genre="assetGenres"
    :imdb-rating="imdbRating()"
    :language="asset.language"
    :metascore-rating="metascoreRating()"
    :more-active="activeButtonLevel === 'more'"
    :progress="asset.watchProgress"
    :quality="asset.mediaQuality || 'HD'"
    :rating="asset.ageRating"
    :seasonsSelected="activeButtonLevel === 'seasons'"
    :subscribed="asset.subscribed"
    :synopsis="asset.longDescription"
    :title="asset.title"
    :vod-poster="getPoster()"
    :year="asset.year"
    :mkHandleButtonClick="mkHandleButtonClick"
    :openFullText="openFullText"
    :handleClickBack="handleClickBack"
  >
    <card-row
      v-if="isSerie"
      slot="seasons"
      card-theme="dark"
      card-type="vod"
      :card-width="248"
      expanded
      :focused="activeButtonLevel === 'seasons'"
      :items="displaySeasons"
      :custom-row-width="1788"
      :selected="selectedSeasonsCard"
      short-title="Seasons"
      :active-row="true"
      show-details
      :handle-click="handleClick"
      :series="true"
      :arrow-class="arrowClass"
    />
    <card-row
      slot="more"
      card-theme="dark"
      card-type="vod"
      :card-width="248"
      display-count
      :count="moreCards.length"
      expanded
      :focused="activeButtonLevel === 'more'"
      :items="moreCards"
      :custom-row-width="1788"
      :selected="selectedMoreCard"
      short-title="More like this"
      :active-row="true"
      show-details
      :handle-click="handleClick"
      :series="false"
      :arrow-class="arrowClass"
    />
  </detail-vod>
</template>

<script>
import pick from 'lodash/fp/pick'
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import indexOf from 'lodash/fp/indexOf'
import reject from 'lodash/fp/reject'
import { mapState, mapActions, mapMutations } from 'vuex'

import { getImage, getVodCatalogueImagePath } from 'helpers/image'
import { emitKeyPress } from 'helpers/keyHold'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import DetailScreenMixin from 'mixins/DetailScreen'
import CardRow from 'containers/general/CardRow'
import DetailVod from 'components/Detail/Vod'
import vodPosterImage from 'assets/images/placeholders/vod_poster_placeholder_248x366.png'
import vodBackgroundImage from 'assets/images/placeholders/vod_event_detail_1920x1080.png'
import HistoryManager from 'mixins/HistoryManager'

const IMG_SMALL = 'STB_FHD'
const IMG_LARGE = 'STB_XL'
const IMG_MID = 'M'
const TYPE_VOD_POSTER = 'VOD_POSTER_21_31'
const TYPE_EVENT = 'EVENT_16_9'

export default {
  name: 'VodDetail',
  mixins: [ DetailScreenMixin, RegisterKeyHandler, HistoryManager ],
  components: { CardRow, DetailVod },
  data () {
    return {
      buttonLevels: ['back', 'cta', 'full', 'seasons', 'more'],
      selectedMoreCard: 0,
      selectedSeasonsCard: 0
    }
  },
  computed: {
    buttons () {
      let buttons = [
        { id: 'watch', icon: 'watch', text: this.loc('ondemand_detailedscreen_watch') },
        // { id: 'trailer', icon: 'trailer', text: this.loc('ondemand_detailedscreen_trailer') },
        { id: 'more', icon: 'more', text: this.loc('ondemand_detailedscreen_synopsys_more') }
      ]

      if (this.asset.inFavorites) {
        buttons.splice(1, 0, { id: 'removeFavorite', icon: 'favorite-active', text: this.loc('ondemand_detailedscreen_favorites'), active: true })
      } else {
        buttons.splice(1, 0, { id: 'addFavorite', icon: 'favorite', text: this.loc('ondemand_detailedscreen_favorites'), active: false })
      }

      if (this.asset.watched) {
        buttons.splice(2, 0, { id: 'markWatched', icon: 'mark-active', text: this.loc('stb_ondemand_detailedscreen_markaswatched'), active: true })
      } else {
        buttons.splice(2, 0, { id: 'markNotWatched', icon: 'mark-inactive', text: this.loc('stb_ondemand_detailedscreen_markaswatched'), actvie: false })
      }

      if (this.isSerie) buttons[0] = { id: 'seasons', icon: 'seasons', text: 'Seasons' }
      return buttons
    },
    isSerie () {
      return indexOf(202)(this.asset.categoryIds) !== -1 // 202 is for series
    },
    moreCards () {
      return this.moreItems.filter((asset) => Math.abs(asset.year - this.asset.year) <= 5).map(asset => {
        let doClick = () => {
          this.activeSection = 'more'
          this.selectedMoreCard = findIndex({ id: asset.id })(this.moreCards)
          this.handleKey('OK')
        }
        return {
          id: asset.id,
          firstRowText: asset.title,
          secondRowText: String(asset.year),
          imageUrl: getImage(asset.images, IMG_MID, TYPE_VOD_POSTER, vodPosterImage),
          doClick
        }
      }).slice(0, 7)
    },
    displaySeasons () {
      if (!this.isSerie) return []
      return this.seasons.map(season => {
        let doClick = () => {
          this.activeSection = 'seasons'
          this.selectedSeasonsCard = findIndex({ id: season.id })(this.displaySeasons)
          this.handleKey('OK')
        }
        return {
          subtitle: String(season.year),
          imageUrl: getImage(season.images, IMG_SMALL, TYPE_VOD_POSTER, vodPosterImage),
          seasonNumber: season.seasonNumber,
          episodesNumber: season.episodes.length,
          doClick,
          ...pick(['id', 'title'], season)
        }
      })
    },
    assetGenres () {
      return this.asset && this.asset.genreIds ? this.asset.genreIds
        .map(genreId => find({id: genreId}, this.genres).name)
        .join(', ') : ''
    },
    duration () {
      return Math.ceil(this.asset.duration / 60000)
    },
    arrowClass () {
      return 'season-arrows-container'
    },
    catalogueImage () {
      let items = this.catalogues
      let itemsLength = items.length
      let id = this.asset && this.asset.catalogueIds ? this.asset.catalogueIds[0] : 0

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
    ...mapState({
      asset: state => state.vod.detail,
      genres: state => state.vod.genres,
      moreItems: state => reject({ id: state.vod.detail.id }, state.vod.assets),
      seasons: state => state.vod.seasons,
      catalogues: state => state.vod.catalogues,
      ageRating: state => state.parentalRating.ageRating,
      previouslySelectedSeason: state => state.vod.selectedItems.vodDetailActiveSeason
    })
  },
  methods: {
    handleClickBack () {
      this.activeButtonLevel = 'back'
      this.handleKey('BACK')
    },
    openFullText () {
      this.activeButtonLevel = 'full'
      this.handleKey('OK')
    },
    mkHandleButtonClick (id, index) {
      let handleButtonClick = function () {
        this.activeButtonLevel = 'cta'
        this.activeCtaButton = index
        this.pressActiveButton()
      }
      return handleButtonClick.bind(this)
    },
    getPoster () {
      return getImage(this.asset.images, IMG_SMALL, TYPE_VOD_POSTER, vodPosterImage)
    },
    getBackground () {
      return getImage(this.asset.images, IMG_LARGE, TYPE_EVENT, vodBackgroundImage)
    },
    imdbRating () {
      let provider = this.asset && Array.isArray(this.asset.assetRatings) ? this.asset.assetRatings.find(provider => provider.metadataProviderName === 'Imdb') : null
      return provider && provider.length !== 0 ? provider.rating : null
    },
    metascoreRating () {
      let provider = this.asset && Array.isArray(this.asset.assetRatings) ? this.asset.assetRatings.find(provider => provider.metadataProviderName === 'Metascore') : null
      return provider && provider.length !== 0 ? provider.rating : null
    },
    director () {
      let index = findIndex({occupation: {id: 3}})(this.asset.people)
      return index === -1 ? null : `${this.asset.people[index].firstName} ${this.asset.people[index].lastName}`
    },
    actors () {
      let actors = this.asset.people ? this.asset.people.filter(e => e.occupation.id === 1).map(e => `${e.firstName} ${e.lastName}`).slice(0, 2) : []
      return actors
    },
    handleKey (key) {
      if (key === 'BACK') {
        this.doHistoryBack()
      } else if (key === 'LEFT_HOLD' || key === 'RIGHT_HOLD') {
        if (
          (this.activeButtonLevel !== 'cta' || this.activeCtaButton !== 0) &&
          (this.activeButtonLevel !== 'seasons' || this.selectedSeasonsCard !== 0) &&
          (this.activeButtonLevel !== 'more' || this.selectedMoreCard !== 0)
        ) {
          if (emitKeyPress({ delay: 50 })) {
            this.handleKey(key === 'LEFT_HOLD' ? 'LEFT' : 'RIGHT')
          }
        }
      } else if ((this.activeButtonLevel === 'more' || (this.activeButtonLevel === 'seasons' && key !== 'DOWN')) && key !== 'UP') {
        switch (key) {
          case 'LEFT':
            if ((this.selectedMoreCard === 0 && this.activeButtonLevel === 'more') || (this.selectedSeasonsCard === 0 && this.activeButtonLevel === 'seasons')) {
              this.doHistoryBack()
            } else {
              if (this.activeButtonLevel === 'seasons') {
                this.selectedSeasonsCard = Math.min(Math.max(this.selectedSeasonsCard + (key === 'LEFT' ? -1 : 1), 0), this.seasons.length - 1)
              }
              if (this.activeButtonLevel === 'more') {
                this.selectedMoreCard = Math.min(Math.max(this.selectedMoreCard + (key === 'LEFT' ? -1 : 1), 0), this.moreCards.length - 1)
              }
            }
            break
          case 'RIGHT':
            if (this.activeButtonLevel === 'seasons') {
              this.selectedSeasonsCard = Math.min(Math.max(this.selectedSeasonsCard + (key === 'LEFT' ? -1 : 1), 0), this.seasons.length - 1)
            }
            if (this.activeButtonLevel === 'more') {
              this.selectedMoreCard = Math.min(Math.max(this.selectedMoreCard + (key === 'LEFT' ? -1 : 1), 0), this.moreCards.length - 1)
            }
            break
          case 'LEFT_HOLD': // j for web
          case 'RIGHT_HOLD': // k for web

            break
          case 'BACK':
            this.activeButtonLevel = this.isSerie ? 'seasons' : 'full'
            break
          case 'OK':
            if (this.activeButtonLevel === 'seasons') {
              // this.initialize(this.seasons[this.selectedSeasonsCard].id)
              this.$router.push({
                name: 'SeasonDetail',
                params: {
                  pageData: { seasonId: this.seasons[this.selectedSeasonsCard].id }
                }
              })
            }
            if (this.activeButtonLevel === 'more') {
              this.initialize(this.moreCards[this.selectedMoreCard].id)
            }
            this.selectedSeasonsCard = 0
            this.selectedMoreCard = 0
            this.activeButtonLevel = 'cta'
            this.activeCtaButton = 0
            break
        }
      } else {
        this.handleKeyCommon(key)
      }
    },
    handleClick (direction) {
      this.handleKey(direction)
    },
    pressActiveButton () {
      if (this.activeButtonLevel === 'back') {
        this.doHistoryBack()
      } else if (this.activeButtonLevel === 'full') {
        this.togglePopup({
          active: true,
          data: {
            type: 'title-text',
            title: this.asset.title,
            text: this.asset.longDescription,
            priority: 2,
            theme: 'dark'
          }
        })
      } else {
        let buttonPressed = this.buttons.length > 0 ? this.buttons[this.activeCtaButton] : null
        if (buttonPressed) {
          switch (buttonPressed.id) {
            case 'watch':
            case 'trailer':
              this.playAsset()
              break
            case 'addFavorite':
            case 'removeFavorite':
              this.toggleFavorite({
                assetId: this.asset.id,
                favoriteStatus: buttonPressed.id === 'addFavorite'
              })
              break
            case 'markWatched':
            case 'markNotWatched':
              this.toggleWatched({
                assetId: this.asset.id,
                watchedStatus: buttonPressed.id !== 'markWatched'
              })
              break
            case 'more':
              this.activeButtonLevel = 'more'
              break
            case 'seasons':
              this.activeButtonLevel = 'seasons'
              break
          }
        }
      }
    },
    playAsset () {
      if (this.asset && this.asset.subscribed && this.asset.publishingPoint && this.asset.publishingPoint.length !== 0) {
        this.updateParentalPlayerMode('VOD')
        this.checkAssetAgeRating()
        if (this.ageRating) {
          this.parentalRating()
        } else {
          this.$router.push({
            name: 'PlayerVod',
            params: {
              assetId: this.asset.id,
              publishingPoint: this.asset.publishingPoint,
              imageUrl: this.$route.params.asset.imageUrl,
              startTime: 0,
              drmRequired: this.asset.drmRequired,
              duration: this.asset.duration
            }
          })
        }
      } else {
        const text = this.loc(this.asset && this.asset.subscribed === false
          ? 'ondemand_detailedscreen_notsubscribed_information_description'
          : 'message_streaming_error_description'
        )
        this.togglePopup({
          active: true,
          data: {
            type: 'reminder',
            title: this.loc('ondemand_detailedscreen_notsubscribed_information_title'),
            text,
            theme: 'dark'
          }
        })
      }
    },
    initialize (assetId) {
      Promise.all([
        this.resetAssets(),
        this.fetchCategories(),
        this.fetchGenres(),
        this.fetchDetail(assetId || this.$route.params.asset.id).then((response) => {
          this.fetchAssets({
            genreId: this.asset.genreIds[0],
            categoryId: this.asset.categoryIds[0],
            vodSort: 'RATING',
            imageSize: 'M',
            page: 0,
            size: 1000
          })
        }),
        this.getSeasons({ serieId: assetId || this.$route.params.asset.id })
      ]).then(() => {
        if (!this.isSerie) this.buttonLevels.splice(3, 1)
      })
    },
    ...mapActions({
      fetchAssets: 'vod/fetchAssets',
      fetchCategories: 'vod/fetchCategories',
      fetchDetail: 'vod/fetchDetail',
      fetchGenres: 'vod/fetchGenres',
      toggleFavorite: 'vod/toggleFavorite',
      toggleWatched: 'vod/toggleWatched',
      getSeasons: 'vod/getSeasons',
      checkAssetAgeRating: 'parentalRating/checkAssetAgeRating',
      parentalRating: 'parentalRating/parentalRatingVOD'
    }),
    ...mapMutations({
      updateParentalPlayerMode: 'parentalRating/UPDATE_PLAYER_MODE',
      updateActiveSeason: 'vod/UPDATE_VOD_DETAIL_SELECTED_SEASON',
      resetAssets: 'vod/RESET_ASSETS'
    })
  },
  created () {
    this.initialize()
    if (this.previouslySelectedSeason !== null && this.$route.meta.rememberSelections) {
      let prevIndex = findIndex({id: this.previouslySelectedSeason})(this.displaySeasons)
      if (prevIndex !== -1) {
        this.selectedSeasonsCard = prevIndex
        this.activeButtonLevel = 'seasons'
        this.updateActiveSeason(null)
      }
    }
  },
  watch: {
    selectedSeasonsCard (newVal) {
      this.updateActiveSeason(this.displaySeasons[newVal].id)
    },
    displaySeasons (newVal) {
      newVal[0] && findIndex({id: this.previouslySelectedSeason})(this.displaySeasons) === -1 && this.updateActiveSeason(newVal[0].id)
    }
  }
}
</script>
