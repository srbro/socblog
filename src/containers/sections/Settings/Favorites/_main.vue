<template>
  <div style="background-color: #fbfbfb;width:100%;height:100%;">
    <loader v-if="showLoader"/>
    <div :class="[
      'container',
      {'animate-for-header-hight': focusSection === 'rows'}
      ]"
      v-else>
      <page-header
        @click.native="clickBack()"
        :page-title="pageTitle"
        :hide="navigationActive"
        icon-label="Back"
        buttonType="back"
        :active="focusLevel === -1"
        class="header"
      />
      <div :class="filterContainerClass">
        <card-selected
          v-for="(item, index) in filters"
          @click.native="clickFilters()"
          :key="item.id"
          :selected-title="filterLabel(item.id)"
          :selected-item="focusSection === 'filters' && index === filterSelected"
          :selected-item-default="filterLabel(item.id) !== filters[index].label && filterLabel(item.id) !== ''"
        />
      </div>
      <div :class="cardsContentClass" :style="[transformY]">
        <h1 class="row-title">
          {{ filterLabel('categories') === 'Categories' ? 'ALL TV' : filterLabel('categories') }} <span class="numberForlists"> {{ channels.length }}</span>
        </h1>
        <div :class="rowClass" :css="false" v-if="channels.length > 0">
          <mouse-arrows
            v-show="focusLevel === 1"
            :selected-card="focusLevel === 1 ? position : listPosition"
            :active-row="true"
            :items-number="focusLevel === 1 ? channels.length : favoriteChannels.length"
            :focused-rows="focusSection === 'rows' ? true : false"
            :handle-click="handleClick"
            :style-mouse="styleMouse"
          />
          <favorite-card
            v-for="(item, index) in trimmedItems"
            @click.native="clickChannel(item)"
            :key="item.id"
            :selected="trimmedIndex(item, channels) === position && focusLevel === 1"
            :upper-image-url="item.logoUrl"
            :first-row-text="item.name"
            :second-row-text="item.shortName"
            :class="[deviceClass(), { 'hide': item.hide }]"
            :isFavorite="booleanListOfFavorites[trimmedIndex(item, channels)]"
            :faster-animation="fasterAnimation"
          />
        </div>
        <h1 class="row-title">
          {{ pageTitle }} <span class="numberForlists"> {{ favoriteChannels ? favoriteChannels.length : 0}}</span>
        </h1>
        <div class="row" :css="false" v-if="favoriteChannels && favoriteChannels.length > 0">
          <mouse-arrows
            v-show="focusLevel === 2"
            :selected-card="focusLevel === 1 ? position : listPosition"
            :active-row="true"
            :items-number="focusLevel === 1 ? channels.length : favoriteChannels.length"
            :focused-rows="focusSection === 'rows' ? true : false"
            :handle-click="handleClick"
            :style-mouse="styleMouse"
          />
          <favorite-card
            v-for="(item, index) in trimmedFavoriteItems"
            @click.native="clickFavorite(item)"
            :class="[deviceClass(), { 'hide': item.hide }]"
            :ctaSelectedPosition="ctaSelectedPosition"
            :ctaButtons="ctaButtons"
            @ctaClick="handleClickCardCta"
            :displayCta="selectedChannel && item.id === selectedChannel.id"
            :first-row-text="item.name"
            :faster-animation="fasterAnimation"
            :key="item.id"
            :selected="trimmedIndex(item, favoriteChannels) === listPosition && focusLevel === 2"
            :second-row-text="item.shortName"
            :upper-image-url="item.logoUrl"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import clone from 'lodash/fp/clone'
import { mapActions, mapState, mapGetters } from 'vuex'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'
import HistoryManager from 'containers/mixins/HistoryManager'
import { emitKeyPress } from 'helpers/keyHold'
import filterData from './filterData.json'
import CardSelected from 'components/CardSelect'
import PageHeader from 'components/PageHeader'
import FavoriteCard from 'containers/sections/Settings/Favorites/FavoriteCard'
import { getImage } from 'helpers/image'
import { initialise as initialiseSelectList } from 'containers/twoSidedDialog/selectList'
import loader from 'mixins/Loader'
import Loader from 'components/Loader'
import tvLogoDefaultImage from 'assets/images/placeholders/lending_page_logo_300x168.png'
import MouseArrows from 'components/MouseArrows'

import { deviceZapClass } from 'animations'

const BUTTONS = [{id: 'cta-drag'}, {id: 'cta-trash'}, {id: 'cta-check'}]
const IMG_SMALL = 'STB_FHD'
const TYPE_LOGO = 'LOGO_16_9'

export default {
  name: 'SettingsFavorites',
  mixins: [ RegisterKeyHandler, loader, HistoryManager ],
  components: {
    CardSelected,
    PageHeader,
    FavoriteCard,
    Loader,
    MouseArrows
  },
  data: () => ({
    filters: [
      { id: 'categories', label: 'Categories' }
    ],
    filterItems: filterData,
    filterSelected: 0,
    focusSection: 'rows', // back, filters, rows
    pageTitle: '',
    selectionIds: { categories: [] }, // filter
    position: 0, // current position in channels
    listPosition: 0, // current position in list
    ctaSelectedPosition: 0, // selected button among CTA buttons
    selectedChannel: null,
    dragActive: false, // dragging channel is active
    ctaLevel: false, // display CTA buttons
    ctaButtons: BUTTONS.slice(0, 2),
    focusLevel: 1, // indicator for level selector (back, filter, all channels, lists)
    favLists: {}, // this is list from store
    favChannels: [], // array of favorite channels in real channels
    moveTopSum: 0,
    favoriteList: {
      id: '',
      name: '',
      channels: [] // list to edit / create
    },
    channelsType: 'tvChannels',
    allChannels: [],
    fasterAnimation: false,
    uiMode: window.uiMode,
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
    filterContainerClass () {
      return [
        'filter-container',
        {
          'hide': this.focusLevel > 1,
          'translate': this.translateMode.translate
        }
      ]
    },
    rowClass () {
      return [
        'row',
        {
          'no-transition-animation': !this.uiMode.settingsTransitionAnimation
        }
      ]
    },
    styleMouse () {
      return `left: ${1600}rem;`
    },
    filteredItemsCategories () {
      // return this.filteredSelectionItems({ itemsRaw: this.filterItems.categories.items, selectionIds: this.selectionIds.categories })
      return this.filteredSelectionItems({
        itemsRaw: this.channelCategories.filter(category => {
          return this.allChannels[category.id].length > 0
        })
          .map(category => ({
            id: category.id,
            name: category.name,
            label: category.name,
            images: category.images
          })),
        selectionIds: this.selectionIds.categories
      })
    },
    channels () {
      if (Object.keys(this.allChannels).length === 0) { return [] }
      const category = this.selectionIds.categories[0] ? this.selectionIds.categories[0] : (this.channelsType === 'tvChannels' ? 1 : 101) // By default "All" is 6. category in allChannels
      if (this.favoriteList) this.favChannels = this.allChannels[category].map(channel => findIndex({id: channel.id})(this.favoriteList.channels) >= 0)
      return this.allChannels[category].map(channel => ({
        type: 'channel',
        name: channel.name,
        shortName: channel.shortName,
        number: channel.position,
        id: channel.id,
        images: channel.images,
        logoUrl: getImage(channel.images, IMG_SMALL, TYPE_LOGO, tvLogoDefaultImage)
      }))
    },
    favoriteChannels () {
      if (!this.favoriteList || Object.keys(this.favoriteList).length === 0) { return [] }
      this.favChannels = this.channels.map(channel => findIndex({id: channel.id})(this.favoriteList.channels) >= 0)
      return this.favoriteList.channels.map(channel => ({
        type: 'channel',
        name: channel.name,
        shortName: channel.shortName,
        number: channel.position,
        id: channel.id,
        images: channel.images,
        logoUrl: getImage(channel.images, IMG_SMALL, TYPE_LOGO, tvLogoDefaultImage)
      }))
    },
    trimmedItems () {
      const lengthOfChannels = this.channels.length
      let startPosition = Math.max(0, this.position - 5)
      let endPosition = Math.min(this.position + 6, lengthOfChannels)
      let fakeArray = []
      if (this.position < 3) {
        startPosition = 0
        endPosition = 8
        fakeArray = [{id: `fake-0`, hide: true}, {id: `fake-1`, hide: true}, {id: `fake-2`, hide: true}]
      }
      if (this.position >= 3 && this.position < 6) {
        for (let i = 1; i < 6 - this.position; i++) {
          fakeArray.push({id: `fake-${i}`, hide: true})
        }
      }
      if (lengthOfChannels - this.position < 4) {
        startPosition = lengthOfChannels - 8 > 0 ? lengthOfChannels - 8 : 0
        endPosition = lengthOfChannels
      }
      let newArray = this.channels.slice(startPosition, endPosition)
      newArray = fakeArray.concat(newArray)
      return newArray
    },
    trimmedFavoriteItems () {
      const lengthOfChannels = this.favoriteChannels.length
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
      let newArray = this.favoriteChannels.slice(startPosition, endPosition)
      newArray = fakeArray.concat(newArray)
      return newArray
    },
    channelsCardStyles () {
      return this.cardStyles(this.channels.length)
    },
    favoritesCardStyles () {
      return this.cardStyles(this.favoriteChannels.length)
    },
    transformY () {
      let finalPosition = 0
      if (this.focusLevel === 1) finalPosition = this.focusLevel * -267
      if (this.focusLevel > 1) finalPosition = -((this.focusLevel - 1) * 394 + 267)
      if (this.focusLevel > 1 && this.channels.length === 0) finalPosition = -((this.focusLevel - 1) * 394 - 55)
      let transform3d = `translate3d(0, ${finalPosition}rem, 0)`
      let transform2d = `translate(0, ${finalPosition}rem)`
      return {
        transform: !this.translateMode.translate ? transform3d : transform2d
      }
    },
    booleanListOfFavorites: {
      // getter
      get: function () {
        return this.favChannels
      },
      // setter
      set: function (newValue) {
        this.favChannels[this.trimmedIndex(this.channels[this.position], this.channels)] = newValue
      }
    },
    ...mapState({
      navigationActive: state => state.navigation.active,
      tvChannels: state => state.general.tvChannels,
      tvCategories: state => state.general.tvCategories,
      radioChannels: state => state.general.radioChannels,
      radioCategories: state => state.general.radioCategories
    }),
    ...mapGetters({
      getAllLists: 'favorites/getAllLists'
    })
  },
  methods: {
    clickBack () {
      this.focusLevel = -1
      this.focusSection = 'back'
      this.innerBackPressed()
    },
    clickFilters () {
      this.focusLevel = 0
      this.focusSection = 'filters'
      this.showSelection(this.filters[this.filterSelected])
    },
    clickChannel (item) {
      const trimmedIndex = this.trimmedIndex(item, this.channels)
      this.position = trimmedIndex

      this.$set(this.booleanListOfFavorites, this.position, !this.favChannels[trimmedIndex]) // always add, can't remove from this part

      if (trimmedIndex > -1 && this.favChannels[trimmedIndex]) {
        if (this.$route.params.action === 'new') this.favoriteList.channels.push(item)
        if (this.$route.params.action === 'edit') this.updateChannelOrder({type: this.type, index: this.favoriteList.id, action: 'push', parameter: item})
      } else {
        if (this.$route.params.action === 'new') this.favoriteList.channels.splice(findIndex({id: item.id})(this.favoriteList.channels), 1)
        if (this.$route.params.action === 'edit') this.updateChannelOrder({type: this.type, index: this.favoriteList.id, action: 'splice', parameter: findIndex({id: item.id})(this.favoriteList.channels)})
      }
      this.focusLevel = 1
      this.focusSection = 'rows'
    },
    clickFavorite (item) {
      const index = findIndex({id: item.id})(this.favoriteList.channels)
      if (index && index > -1) this.listPosition = index
      this.focusLevel = 2
      this.focusSection = 'rows'
      this.pressOk()
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
            this.ctaButtons = [BUTTONS[0], BUTTONS[1]]
          } else {
            this.innerBackPressed()
          }
          break
        case 'LEFT':
        case 'RIGHT':
          return this.moveSelection(key)
        case 'LEFT_HOLD': // j for web
        case 'RIGHT_HOLD': // k for web
          if (emitKeyPress({ delay: 100 })) {
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
    handleClick (direction) {
      this.moveSelection(direction)
    },
    moveSelection (direction) {
      const offset = direction === 'RIGHT' ? 1 : -1
      if (this.focusLevel === 1 && (this.position + offset >= this.channels.length || this.position + offset < 0)) return
      if (!this.ctaLevel) {
        if (this.focusLevel === 1) {
          this.position = this.position + offset
        } else if (this.focusLevel === 2) {
          if (this.listPosition + offset >= this.favoriteChannels.length || this.listPosition + offset < 0) return
          this.listPosition = this.listPosition + offset
        }
      } else if (this.ctaLevel && this.dragActive) { // Case for dragging channel LEFT or RIGHT
        if (this.listPosition + offset >= this.favoriteChannels.length || this.listPosition + offset < 0) return
        this.listPosition = this.listPosition + offset
        const newValue = this.favoriteChannels[this.listPosition]
        this.favoriteChannels[this.listPosition] = this.selectedChannel
        this.favoriteList.channels[this.listPosition] = this.selectedChannel
        this.favoriteChannels[this.listPosition - offset] = newValue
        this.favoriteList.channels[this.listPosition - offset] = newValue
      } else {
        this.ctaSelectedPosition = offset < 0 ? 0 : 1
      }
    },
    changeLevel (direction) {
      const offset = direction === 'DOWN' ? 1 : -1
      if (this.ctaLevel || this.dragActive) return false
      if (this.focusLevel + offset < -1 || this.focusLevel + offset > 2) return false
      this.focusLevel = this.focusLevel + offset
      if (this.focusLevel === -1 || this.focusLevel === 0) {
        this.focusLevel === 0 ? this.focusSection = 'filters' : this.focusSection = 'back'
      }
      if (this.focusLevel > 0) {
        this.focusSection = 'rows'
        // this.position = 0
      }
      if (this.focusLevel === 1 && this.channels.length === 0) this.changeLevel(direction)
    },
    pressOk () {
      if (this.focusLevel === -1) { // back
        this.innerBackPressed()
      } else if (this.focusLevel === 0) { // filter
        this.showSelection(this.filters[this.filterSelected])
      } else if (this.focusLevel === 1) { // All channels row
        // this.booleanListOfFavorites[this.position] = !this.booleanListOfFavorites[this.position]

        this.$set(this.booleanListOfFavorites, this.position, !this.favChannels[this.position]) // always add, can't remove from this part
        const selectedChannel = this.channels[this.position]
        if (this.favChannels[this.position]) {
          if (this.$route.params.action === 'new') this.favoriteList.channels.push(selectedChannel)
          if (this.$route.params.action === 'edit') this.updateChannelOrder({type: this.type, index: this.favoriteList.id, action: 'push', parameter: selectedChannel})
        } else {
          if (this.$route.params.action === 'new') this.favoriteList.channels.splice(findIndex({id: selectedChannel.id})(this.favoriteList.channels), 1)
          if (this.$route.params.action === 'edit') this.updateChannelOrder({type: this.type, index: this.favoriteList.id, action: 'splice', parameter: findIndex({id: selectedChannel.id})(this.favoriteList.channels)})
        }
        this.listPosition = this.favoriteList.channels.length - 1
      } else if (this.focusLevel === 2) {
        if (this.selectedChannel && this.selectedChannel.id === this.favoriteChannels[this.listPosition].id) { // drag/remove marked channel in favorites row
          this.handleCtaClick()
        } else { // part to mark favorite channel
          this.selectedChannel = this.favoriteChannels[this.listPosition]
          this.ctaLevel = true
        }
      }
    },
    innerBackPressed () {
      let items = clone(this.favoriteList)
      items.channels = items.channels.map((channel) => ({id: channel.id}))
      if (this.$route.params.action === 'new') this.createFavoriteList(items)
      if (this.$route.params.action === 'edit') this.editFavoriteList({index: items.id, list: items})
      return this.doHistoryBack() // this.$router.push({name: 'Settings'})
    },
    handleCtaClick () {
      if (this.ctaButtons[this.ctaSelectedPosition].id === 'cta-drag') {
        this.ctaButtons = [BUTTONS[2], BUTTONS[1]]
        this.dragActive = true
        return
      }
      if (this.ctaSelectedPosition === 0 && this.dragActive) { // drag button active
        if (this.ctaButtons[this.ctaSelectedPosition].id === 'cta-check') { // save position
          this.ctaButtons = [BUTTONS[0], BUTTONS[1]]
          this.selectedChannel = null
          this.ctaLevel = false
          this.dragActive = false
          return
        }
      }
      if (this.ctaButtons[this.ctaSelectedPosition].id === 'cta-trash') { // save position
        if (this.$route.params.action === 'new') this.favoriteList.channels.splice(findIndex({id: this.selectedChannel.id})(this.favoriteList.channels), 1)
        if (this.$route.params.action === 'edit') this.updateChannelOrder({type: this.type, index: this.favoriteList.id, action: 'splice', parameter: findIndex({id: this.selectedChannel.id})(this.favoriteList.channels)})

        // this.updateChannelOrder({index: findIndex({id: this.favoriteList.id})(this.favLists), list: this.favoriteList})
        this.ctaButtons = [BUTTONS[0], BUTTONS[1]]
        this.selectedChannel = null
        this.ctaLevel = false
        this.dragActive = false
      }
    },
    trimmedIndex (item, array) {
      return findIndex({id: item.id})(array)
    },
    filterLabel (itemId) {
      if (this.filterItems[itemId].items && this.filterItems[itemId].items.length === 0) return ''
      let result = find({ 'id': this.selectionIds[itemId][0] }, this.filterItems[itemId].items)
      let label = result ? result.label : 'Categories'
      return label
    },
    filteredSelectionItems ({ itemsRaw, selectionIds }) {
      let items = clone(itemsRaw)
      if (selectionIds.length === 0) items = this.clearSelectionSelectedItems(items)
      if (selectionIds.length !== 0) {
        let item
        let tempItems = items
        selectionIds.forEach((id) => {
          item = find('selected', tempItems)
          if (item !== undefined && item.selected) delete item.selected
          item = find({ id }, tempItems)
          if (!item.children) item.selected = true
          tempItems = item.children
        })
      }

      return items
    },
    clearSelectionSelectedItems (items) {
      let newItems = clone(items)

      newItems.forEach((item) => {
        if (item.selected !== undefined && item.selected) delete item.selected
        if (item.children) this.clearSelectionSelectedItems(item.children)
      })

      return newItems
    },
    showSelection (data) {
      let currentItems
      if (this.filterSelected === 0) currentItems = this.filteredItemsCategories

      if (currentItems.length !== 0) {
        initialiseSelectList({
          values: {
            items: currentItems,
            description: this.filterItems[data.id].description
          },
          callback: (newValue) => {
            this.position = 0
            this.$set(this.selectionIds, data.id, newValue)
          },
          clearText: this.loc('stb_settings_general_cancel'),
          clearVisible: true,
          theme: 'light'
        })
      }
    },
    cardStyles (channelsLength) {
      const CARD_WIDTH = 300
      const CARD_SPACING = 12
      let letArr = []
      let translate = !this.translateMode.translate ? 'translate3d' : 'translate'
      let translateThirdParam = !this.translateMode.translate ? ', 0' : ''
      for (let i = 0; i <= channelsLength; i++) {
        letArr.push(`transform: ${translate}(${(CARD_WIDTH + CARD_SPACING) * i}rem, 0${translateThirdParam});`)
      }
      return letArr
    },
    deviceClass () {
      return deviceZapClass()
    },
    ...mapActions({
      fetchChannels: 'general/fetchChannels',
      createFavoriteList: 'favorites/create',
      editFavoriteList: 'favorites/edit',
      updateChannelOrder: 'favorites/updateChannelOrder'
    })
  },
  async created () {
    this.initLoader()
    await this.fetchChannels()
    if (this.$route.params.channelsType) {
      this.channelsType = this.$route.params.channelsType
    }
    this.type = this.channelsType === 'tvChannels' ? 'tv' : 'radio'
    // channelsType must be: 'tvChannels' or 'radioChannels'
    // categories must be: 'tvCategories' or 'radioCategories'
    this.allChannels = this[this.channelsType]
    this.channelCategories = this[this.channelsType === 'tvChannels' ? 'tvCategories' : 'radioCategories']
    this.filterItems.categories.items = this.filteredItemsCategories
    this.favLists = this.getAllLists(this.type)
    if (this.$route.params.action === 'new') {
      // this.favoriteList.id = Math.ceil(Math.random() * 100)
      this.favoriteList.name = this.$route.params.pageTitle
      this.favoriteList.type = this.channelsType === 'tvChannels' ? 'CUSTOM_TV' : 'CUSTOM_RADIO'
    } else {
      if (this.$route.params.action === 'edit') this.favoriteList = this.$route.params.listToEdit
    }
    this.pageTitle = this.favoriteList.name
    this.hideLoader()
  }
}
</script>

<style lang="scss" scoped>
@import "variables";
$font-size: 40rem;
$margin: 27rem;

.container {
  .header-container {
    padding: 65rem 110rem 65rem 110rem;
  }
}

.header {
  width: inherit;
  margin-bottom: 35rem;
  padding-left: 66rem;
  padding-right: 66rem;
}
.filter-container {
  display: flex;
  padding: 0 111rem;
  height: 120rem;
  margin-top: 65rem;
  transition: all $transition;
  justify-content: space-between;
  transform-origin: left bottom;
  @include transform(translate3d(0, 0, 0));

  &.translate {
    @include transform(translate(0, 0));
  }
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
  &.animate-for-header-hight {
    transition: transform $transition;
    .header-container {
      @include transform(translate3d(0, -267rem, 0));

      &.translate {
        @include transform(translate(0, -267rem));
      }
    }
    .filter-container {
      @include transform(translate3d(0, -267rem, 0));

      &.translate {
        @include transform(translate(0, -267rem));
      }
      &.hide {
        @include transform(translate3d(0, -654rem, 0));

        &.translate {
          @include transform(translate(0, -654rem));
        }
      }
    }
    .cards-content {
      @include transform(translate3d(0, -267rem, 0));

      &.translate {
        @include transform(translate(0, -267rem));
      }
    }
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

.setting-favorites-transition {
  &-enter, &-leave-to { opacity: 0; }
  &-enter-to, &-leave { opacity: 1; }
  &-enter-active { transition: opacity .6s ease-in-out; }
  &-leave-active { transition: opacity .2s ease-in-out; }
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
