<template>
  <detail-vod
    dark
    :active="true"
    :active-cta-button="activeButtonLevel === 'cta' ? activeCtaButton : -1"
    :actors="actors()"
    :background-image-url="eventPresent ? eventImageUrl() : null"
    :vod-poster="vodPosterUrl()"
    :back-active="activeButtonLevel === 'back'"
    :buttons="buttons"
    :channel-logo-image-url="catalogueImage"
    :custom-duration="event.duration"
    :director="director()"
    :full-active="activeButtonLevel === 'full'"
    :genre="findGenre()"
    :language="event.language"
    :quality="event.mediaQuality"
    :rating="event.ageRating"
    :subscribed="event.subscribed"
    :synopsis="event.shortDescription"
    :title="event.title"
    :year="event.year"
    :imdb-rating="imdbRating()"
    :metascore-rating="metascoreRating()"
    :progress="asset.watchProgress"
    :click-button="buttonClick"
    :mkHandleButtonClick="mkHandleButtonClick"
    :openFullText="openFullText"
    :handleClickBack="handleClickBack"
  />
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import { generatePath as generateImagePath, generatePathRaw as generateImagePathRaw, findDesiredIndex, getVodCatalogueImagePath } from 'helpers/image'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import DetailScreenMixin from 'mixins/DetailScreen'
import HistoryManager from 'mixins/HistoryManager'

import DetailVod from 'components/Detail/Vod'
import { emitKeyPress } from 'helpers/keyHold'

export default {
  name: 'EpisodeDetail',
  mixins: [ DetailScreenMixin, RegisterKeyHandler, HistoryManager ],
  components: { DetailVod },
  data: () => ({
    buttonLevels: ['back', 'cta', 'full'],
    episodeId: null
  }),
  computed: {
    eventPresent () {
      return Object.keys(this.event).length > 0
    },
    buttons () {
      if (this.asset.id === 0) return []

      let buttons = [
        { id: 'watch', icon: 'watch', text: this.loc('stb_guide_nowtv_details_watch') }
        // { id: 'trailer', icon: 'trailer', text: this.loc('ondemand_detailedscreen_trailer') }
      ]

      if (this.asset.inFavorites) {
        buttons.push({ id: 'delfavorite', icon: 'favorite-active', text: this.loc('guide_nowtv_event_details_favorites'), active: true })
      } else {
        buttons.push({ id: 'addfavorite', icon: 'favorite', text: this.loc('guide_nowtv_event_details_favorites'), active: false })
      }

      if (!this.asset.watched) {
        buttons.push({ id: 'markWatched', icon: 'mark-inactive', text: this.loc('stb_ondemand_detailedscreen_markaswatched'), active: false })
      } else {
        buttons.push({ id: 'markWatched', icon: 'mark-active', text: this.loc('stb_ondemand_detailedscreen_markaswatched'), active: true })
      }
      // buttons.push({ id: 'more', icon: 'more', text: this.loc('stb_ondemand_detailedscreen_more') })
      return buttons
    },
    event () {
      // const season = find({id: this.$route.params.seasonId})(this.seasons)
      // return find({id: this.$route.params.episodeId})(season.episodes)
      // const assetGenreIds = this.asset && this.asset.genreIds ? this.asset.genreIds.map(genreId => ({ id: genreId })) : []
      // const matched = intersectionBy(this.genres, assetGenreIds, 'id').map(genre => genre.name)
      const matched = this.asset.genreIds && this.asset.genreIds.length > 0 ? this.asset.genreIds.map(id => {
        const result = find({id: id})(this.genres)
        return result.name
      }) : ''
      return {
        ...this.asset,
        genre: matched !== '' ? matched.join(', ') : '',
        duration: Math.ceil((this.asset.duration / 1000) / 60)
      }
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
      genres: state => state.vod.genres,
      asset: state => state.vod.episodeDetail,
      seasons: state => state.vod.seasons,
      catalogues: state => state.vod.catalogues,
      ageRating: state => state.parentalRating.ageRating
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
    buttonClick (index) {
      this.activeCtaButton(index)
      this.handleKey('OK')
    },
    eventImageUrl () {
      return this.event.id === undefined || this.event.id === 0 ? null : generateImagePath({
        imageProperty: this.event.images,
        index: findDesiredIndex(
          this.event.images,
          'EVENT_16_9',
          { size: 'XL' }
        )
      })
    },
    vodPosterUrl () {
      return this.event.id === undefined || this.event.id === 0 ? null : generateImagePath({
        imageProperty: this.event.images,
        index: findDesiredIndex(
          this.event.images,
          'VOD_POSTER_21_31',
          { size: 'XL' }
        )
      })
    },
    director () {
      let index = findIndex({occupation: {id: 3}})(this.event.people)
      return index === -1 ? null : `${this.event.people[index].firstName} ${this.event.people[index].lastName}`
    },
    actors () {
      let actors = this.event && this.event.people ? this.event.people.filter(e => e.occupation.id === 1).map(e => `${e.firstName} ${e.lastName}`).slice(0, 2) : []
      return actors
    },
    handleKey (key) {
      if (key === 'LEFT_HOLD' || key === 'RIGHT_HOLD') {
        if ((this.activeButtonLevel !== 'cta' || this.activeCtaButton !== 0)) {
          if (emitKeyPress({ delay: 50 })) {
            this.handleKey(key === 'LEFT_HOLD' ? 'LEFT' : 'RIGHT')
          }
        }
      }
      this.handleKeyCommon(key)
    },
    pressActiveButton () {
      if (this.activeButtonLevel === 'back') {
        return this.doHistoryBack()
      } else if (this.activeButtonLevel === 'full') {
        this.togglePopup({
          active: true,
          data: {
            type: 'title-text',
            title: this.event.title,
            text: this.event.longDescription,
            priority: 2,
            theme: 'dark'
          }
        })
      } else {
        let buttonPressed = this.buttons.length > 0 ? this.buttons[this.activeCtaButton] : null
        // if (buttonPressed) this.playSelectedEvent()

        if (buttonPressed) {
          switch (buttonPressed.id) {
            case 'watch':
            case 'trailer':
              return this.playSelectedEvent()
            case 'addfavorite':
            case 'delfavorite':
              this.toggleInFavorites({
                assetId: this.asset.id,
                favoriteStatus: buttonPressed.id === 'addfavorite'
              })
              break
            case 'markWatched':
              this.toggleWatched({
                assetId: this.asset.id,
                watchedStatus: !this.asset.watched
              })
              break
            default:
              break
          }
        }
      }
    },
    playSelectedEvent () {
      if (this.asset && this.asset.subscribed && this.asset.publishingPoint && this.asset.publishingPoint.length !== 0) {
        this.updateParentalPlayerMode('VOD')
        this.checkAssetAgeRating()
        if (this.ageRating) {
          this.parentalRating()
        } else {
          let now = Date.now()
          this.$router.push({
            name: 'PlayerVod',
            params: {
              assetId: this.asset.id,
              publishingPoint: this.asset.publishingPoint,
              imageUrl: generateImagePathRaw(this.asset.images[4]),
              startTime: now + this.asset.watchProgress,
              currentTime: now + this.asset.watchProgress,
              duration: this.asset.duration,
              title: this.asset.title,
              drmRequired: this.asset.drmRequired
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
    exit () {
      this.activeCtaButton = 0
      this.activeButtonLevel = 'cta'
      this.$router.push({
        name: 'SeasonDetail',
        params: { pageData: {
          seasonId: this.redirectTo,
          episodeId: this.$route.params.episodeId
        }}
      })
      // return 'exit'
    },
    ...mapActions({
      toggleInFavorites: 'vod/toggleEpisodeFavorite',
      toggleWatched: 'vod/toggleWatched',
      fetchEpisodeDetail: 'vod/fetchEpisodeDetail',
      checkAssetAgeRating: 'parentalRating/checkAssetAgeRating',
      parentalRating: 'parentalRating/parentalRatingVOD',
      togglePopup: 'popup/toggle'
    }),
    ...mapMutations({
      updateParentalPlayerMode: 'parentalRating/UPDATE_PLAYER_MODE'
    }),
    getMetadataProviderByName (providers, name) {
      return providers.find(provider => provider.metadataProviderName === name)
    },
    imdbRating () {
      let provider = this.asset && this.asset.assetRatings ? this.getMetadataProviderByName(this.asset.assetRatings, 'Imdb') : null
      return provider ? provider.rating : null
    },
    metascoreRating () {
      let provider = this.asset && this.asset.assetRatings ? this.getMetadataProviderByName(this.asset.assetRatings, 'Metascore') : null
      return provider ? provider.rating : null
    },
    findGenre () {
      let genre = this.genres && this.asset && this.asset.genreIds ? this.genres.find(genre => genre.id === this.asset.genreIds[0]) : ''
      return genre ? genre.name : null
    }
  },
  async created () {
    await this.fetchEpisodeDetail(this.$route.params.episodeId)
    this.episodeId = this.$route.params.episodeId
    this.redirectTo = this.$route.params.seasonId
  }
}
</script>
