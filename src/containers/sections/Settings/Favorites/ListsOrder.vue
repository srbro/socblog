<template>
  <div style="background-color: #fbfbfb;width:100%;height:100%;">
    <loader v-if="showLoader"/>
    <div class="container"
      v-else>
      <page-header
        :handleClick="clickBack"
        :page-title="loc(pageTitle)"
        :hide="navigationActive"
        icon-label="Back"
        buttonType="back"
        :active="focusLevel === -1"
        class="header"
      />
      <div :class="cardsContentClass">
        <h1 class="row-title">
          {{ loc('stb_settings_personal_favorites') }} <span class="numberForlists"> {{ favoriteLists.length }}</span>
        </h1>
        <mouse-arrows
          :selected-card="listPosition"
          :items-number="favoriteLists.length"
          :focused-rows="focusLevel === 0"
          :handle-click="handleClick"
          :style-mouse="styleMouse"
          :activeRow="true"
        />
        <div class="row" v-if="favoriteLists && favoriteLists.length > 0">
          <favorite-card
            v-for="(item, index) in trimmedFavoriteItems"
            :ctaSelectedPosition="ctaSelectedPosition"
            :ctaButtons="ctaButtons"
            @click.native="clickFavorite(item)"
            @ctaClick="handleClickCardCta"
            :key="item.id"
            :selected="trimmedIndex(item, favoriteLists) === listPosition && focusLevel === 0"
            :upper-image-url="item.logoUrl"
            :first-row-text="item.name"
            :second-row-text="item.shortName"
            :displayCta="selectedChannel && item.id === selectedChannel.id"
            :class="[deviceClass(), { 'hide': item.hide }]"
            :faster-animation="fasterAnimation"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import { mapActions, mapState, mapGetters } from 'vuex'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'
import HistoryManager from 'containers/mixins/HistoryManager'
import { emitKeyPress } from 'helpers/keyHold'
import PageHeader from 'components/PageHeader'
import FavoriteCard from 'containers/sections/Settings/Favorites/FavoriteCard'
import { deviceZapClass } from 'animations'
import loader from 'mixins/Loader'
import Loader from 'components/Loader'
import favoritesImage from 'assets/images/general/favorite-list-order.png'
import servers from 'servers'
import MouseArrows from 'components/MouseArrows'

const BUTTONS = [{id: 'cta-drag'}, {id: 'cta-check'}]
// const CARD_WIDTH = 300
// const CARD_SPACING = 12
// const ROW_WIDTH = 1548

export default {
  name: 'ListsOrder',
  mixins: [ RegisterKeyHandler, loader, HistoryManager ],
  components: {
    PageHeader,
    // Card,
    FavoriteCard,
    Loader,
    MouseArrows
  },
  data: () => ({
    focusSection: 'rows', // back, filters, rows
    pageTitle: 'stb_settings_personal_favorites_favoritelistsorder', // stb_settings_personal_favorites_favoriteslisorder 'Favorites List Order'
    listPosition: 0, // current position in list
    ctaSelectedPosition: 0, // selected button among CTA buttons
    selectedChannel: null,
    dragActive: false, // dragging channel is active
    ctaLevel: false, // display CTA buttons
    ctaButtons: [BUTTONS[0]],
    focusLevel: 0, // indicator for level selector (back, filter, all channels, lists)
    favoriteList: {
      id: '',
      name: '',
      channels: [] // list to edit / create
    },
    channelsType: 'tvChannels',
    fasterAnimation: false,
    translateMode: window.translateMode
  }),
  computed: {
    cardsContentClass () {
      return [
        'cards-content',
        {
          'translate': this.translateMode.translate
        }
      ]
    },
    styleMouse () {
      return `left: ${1600}rem;`
    },
    favoriteLists () {
      const listOfType = this.type === 'tv' ? this.tvLists : this.radioLists
      let finalList = listOfType.map(list => {
        let returnList = null
        const category = find({ id: list.id })(this[`${this.type}Categories`])
        const favorite = find({ id: list.id })(this[`${this.type}FavoriteLists`])
        returnList = category && category !== -1 ? category : favorite && favorite !== -1 ? favorite : null
        let logoUrl = favoritesImage
        if (list.type && list.type === 'CATEGORY') {
          const desiredCategory = find({ id: list.id })(this[`${this.type}Categories`])
          let desiredImage
          if (desiredCategory) {
            desiredImage = find({ width: 300 })(desiredCategory.images)
          }
          logoUrl = desiredImage ? `${servers.imageServerUrl}${desiredImage.path}` : ''
        }
        return returnList ? {
          ...list,
          name: returnList.name,
          shortName: list.type && list.type === 'CATEGORY' ? this.type.toUpperCase() + ' CATEGORY' : 'CUSTOM LIST',
          logoUrl: logoUrl
        } : null
      })
      finalList = finalList.filter(value => value !== null)
      return finalList
    },
    ...mapState({
      navigationActive: state => state.navigation.active,
      tvCategories: state => state.general.tvCategories,
      radioCategories: state => state.general.radioCategories,
      tvFavoriteLists: state => state.favorites.tvFavoriteLists,
      radioFavoriteLists: state => state.favorites.radioFavoriteLists,
      tvLists: state => state.general.tvList,
      radioLists: state => state.general.radioList
    }),
    ...mapGetters({
      getTvList: 'general/getTvList'
    }),
    trimmedFavoriteItems () {
      const lengthOfChannels = this.favoriteLists.length
      let startPosition = Math.max(0, this.listPosition - 5)
      let endPosition = Math.min(this.listPosition + 6, lengthOfChannels)
      let fakeArray = []
      if (this.listPosition < 3) {
        startPosition = 0
        endPosition = 8
        fakeArray = [{id: `fake-0`, hide: true}, {id: `fake-1`, hide: true}, {id: `fake-2`, hide: true}]
      }
      if (this.listPosition >= 3 && this.listPosition < 6) {
        for (let i = 1; i < 6 - this.listPosition; i++) {
          fakeArray.push({id: `fake-${i}`, hide: true})
        }
      }
      if (lengthOfChannels - this.listPosition < 4) {
        startPosition = lengthOfChannels - 8 > 0 ? lengthOfChannels - 8 : 0
        endPosition = lengthOfChannels
      }
      let newArray = this.favoriteLists.slice(startPosition, endPosition)
      newArray = fakeArray.concat(newArray)
      return newArray

      // return this.trimItems(this.favoriteChannels, this.listPosition, false)
    }
  },
  methods: {
    clickFavorite (item) {
      const index = findIndex({id: item.id})(this.favoriteLists)
      if (index && index > -1) this.listPosition = index
      this.pressOk()
    },
    clickBack () {
      this.innerBackPressed()
    },
    handleClickCardCta (index) {
      this.ctaSelectedPosition = index
      this.handleCtaClick()
    },
    handleKey (key) {
      switch (key) {
        case 'BACK':
          if (this.ctaLevel) {
            this.selectedChannel = null
            this.ctaLevel = false
            this.dragActive = false
            this.ctaButtons = [BUTTONS[0]]
          } else {
            this.innerBackPressed()
          }
          break
        case 'LEFT':
        case 'RIGHT':
          return this.moveSelection(key)
        case 'LEFT_HOLD': // j for web
        case 'RIGHT_HOLD': // k for web
          if (emitKeyPress({ delay: 150 })) {
            this.moveSelection(key === 'LEFT_HOLD' ? 'LEFT' : 'RIGHT')
            this.fasterAnimation = true
          }
          break
        case 'HOLD_STOP': // l for web
          this.fasterAnimation = false
          break
        case 'UP':
        case 'DOWN':
          return this.changeLevel(key)
        case 'OK':
          return this.pressOk()
      }
    },
    moveSelection (direction) {
      const offset = direction === 'RIGHT' ? 1 : -1
      if (this.focusLevel === 0 && (this.listPosition + offset >= this.favoriteLists.length || this.listPosition + offset < 0)) return
      if (!this.ctaLevel) {
        if (this.focusLevel === 0) {
          if (this.listPosition + offset >= this.favoriteLists.length || this.listPosition + offset < 0) return
          this.listPosition = this.listPosition + offset
        }
      } else if (this.ctaLevel && this.dragActive) { // Case for dragging channel LEFT or RIGHT
        if (this.listPosition + offset >= this.favoriteLists.length || this.listPosition + offset < 0) return
        this.listPosition = this.listPosition + offset
        const newValue = this.favoriteLists[this.listPosition]
        this.favoriteLists[this.listPosition] = this.selectedChannel
        // this.favoriteLists[this.listPosition] = this.selectedChannel
        this.favoriteLists[this.listPosition - offset] = newValue
      } else {
        // this.ctaSelectedPosition = offset < 0 ? 0 : 1
        this.ctaSelectedPosition = 0
      }
    },
    changeLevel (direction) {
      const offset = direction === 'DOWN' ? 1 : -1
      if (this.ctaLevel || this.dragActive) return false
      if (this.focusLevel + offset < -1 || this.focusLevel + offset > 0) return false
      this.focusLevel = this.focusLevel + offset
      this.focusLevel === 0 ? this.focusSection = 'rows' : this.focusSection = 'back'
    },
    handleClick (direction) {
      this.moveSelection(direction)
    },
    handleCtaClick () {
      if (this.ctaButtons[this.ctaSelectedPosition].id === 'cta-drag') {
        this.ctaButtons = [BUTTONS[1]]
        this.dragActive = true
        this.ctaLevel = true
        return
      }
      if (this.ctaSelectedPosition === 0 && this.dragActive) { // drag button active
        if (this.ctaButtons[this.ctaSelectedPosition].id === 'cta-check') { // save position
          this.ctaButtons = [BUTTONS[0]]
          this.selectedChannel = null
          this.ctaLevel = false
          this.dragActive = false
        }
      }
    },
    pressOk () {
      if (this.focusLevel === -1) { // back
        // need to update and send modified list
        this.innerBackPressed()
      } else if (this.focusLevel === 0) {
        if (this.selectedChannel && this.selectedChannel.id === this.favoriteLists[this.listPosition].id) { // drag/remove marked channel in favorites row
          this.handleCtaClick()
        } else {
          this.selectedChannel = this.favoriteLists[this.listPosition]
          this.ctaLevel = true
        }
      }
    },
    deviceClass () { return deviceZapClass() },
    trimmedIndex (item, array) {
      return findIndex({id: item.id})(array)
    },
    innerBackPressed () {
      this.changeList({ type: this.type.toUpperCase(), list: this.favoriteLists })
      // need to update and send modified list
      return this.doHistoryBack() // this.$router.push({name: 'Settings'})
    },
    ...mapActions({
      editFavoriteList: 'favorites/edit',
      changeList: 'general/changeList'
    })
  },
  async created () {
    this.initLoader()
    // tvFavoriteLists / radioFavoriteLists
    this.type = this.$route.params.channelsType
  },
  mounted () {
    this.hideLoader()
  }
}
</script>

<style lang="scss" scoped>
@import "variables";
$font-size: 40rem;
$margin: 27rem;

.header {
  width: inherit;
  margin-bottom: 35rem;
  padding-left: 66rem;
  padding-right: 66rem;
}

.container {
  color: #576567;
  background: rgba($white-lightish, 1);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  height: 100%;
  width: 100%;
  .arrows-container {
    left: 120rem;
    top: calc(50% + 34rem);
  }
}
.selected-item-container {
  font-size: 18rem;
}
.cards-content {
  transition: transform $transition;
  height: auto;
  width: 100%;
  padding: 0 111rem;
  @include transform(translate3d(0, 0, 0));

  &.translate {
    @include transform(translate(0, 0));
  }
}
.row {
  height: 300rem;
  width: 100%;
  position: relative;
  display: flex;
  transform-origin: left top;
  transition: transform $transition;
}
.row-title {
  padding-top: 20rem;
  margin-top: 23rem;
  font-family: "Roboto Condensed";
  font-size: $font-size;
  margin-bottom: $margin;
  color: #5a5a5a;
  .numberForlists {
    background-color: #56656a; //rgba(86, 101, 106, 1)
    color: $white;
    border-radius: 3rem;
    padding: 5rem 8rem 5rem 7rem;
    font-size: 20rem;
    vertical-align: 6rem;
    font-weight: 300;
  }
}

$elements: 15;
@for $i from 0 to $elements {
  .cell:nth-of-type(#{$i}) {
    left: ($i - 4)*312rem; //67rem
    transition: transform .100s;
  }
}

@for $i from 0 to $elements {
  .samsung-cell:nth-child(#{$i}) {
    left: ($i - 4)*312rem; //67rem
    transition: transform .300s;
  }
}

.hide {
  visibility: hidden;
}
</style>
