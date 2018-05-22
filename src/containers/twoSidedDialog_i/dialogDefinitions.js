import { loc } from 'helpers/localization'

export default () => ({
  favoritesCategories: {
    items: [
      {
        id: 0,
        label: loc('stb_settings_personal_favorites_tvlists'),
        goTo: ({ router }) => {
          router.push({
            path: '/nav/settings/overlay/favoritesTvLists'
          })
        }
      },
      {
        id: 1,
        label: loc('stb_settings_personal_favorites_radiostationlists'),
        goTo: ({ router }) => {
          router.push({
            path: '/nav/settings/overlay/favoritesRadioLists'
          })
        }
      }
    ],
    backVisible: true,
    backActive: false,
    itemActive: 0,
    descriptionMain: loc('stb_settings_personal_favorites'),
    descriptionAbove: loc('general_navigation_settings'),
    descriptionBelow: loc('stb_settings_personal_favorites_tvlists_categories_description'),
    descriptionSvgId: 'settings-favorites',
    clearText: loc('stb_settings_personal_favorites_radiolists_cancel'),
    clearActive: false,
    clearVisible: false,
    questionVisible: false,
    questionText: '',
    itemActiveVisible: true,
    theme: 'light',
    transitionType: 'default',
    type: 'default',
    activeSection: 'list',
    leftBackActive: false,
    editDialog: false
  },
  favoritesRadioLists: {
    items: [
      {
        id: 0,
        label: loc('stb_settings_personal_favorites_tvlists_newlist'),
        goTo: ({ router, store }) => {
          store.dispatch('inputScreen/show', {
            icon: 'radio',
            text: '',
            callback: (finalValue) => {
              router.push({
                name: 'SettingsFavorites',
                params: {
                  channelsType: 'radioChannels', // tvChannels or radioChannels CUSTOM_TV or CUSTOM_RADIO
                  action: 'new',
                  pageTitle: finalValue
                }
              })
            }
          })
        }
      },
      {
        id: 1,
        label: loc('stb_settings_personal_favorites_tvlists_edit'),
        goTo: ({ router }) => {
          router.push({
            path: '/nav/settings/overlay/favoritesEditRadioLists'
          })
        }
      },
      {
        id: 2,
        label: loc('stb_settings_personal_favorites_tvlists_delete'),
        goTo: ({ router }) => {
          router.push({
            path: '/nav/settings/overlay/favoritesDeleteRadioLists'
          })
        }
      },
      {
        id: 3,
        label: loc('stb_settings_personal_favorites_tvlists_rename'),
        goTo: ({ router }) => {
          router.push({
            path: '/nav/settings/overlay/favoritesRenameRadioLists'
          })
        }
      },
      {
        id: 4,
        label: loc('stb_settings_personal_favorites_favoritelistsorder'),
        goTo: ({ router }) => {
          router.push({
            name: 'ListsOrder',
            params: { channelsType: 'radio' } // tvChannels or radioChannels
          })
        }
      }
    ],
    backVisible: true,
    backActive: false,
    itemActive: 0,
    descriptionMain: loc('stb_settings_personal_favorites_radiostationlists'),
    descriptionAbove: `${loc('general_navigation_settings')} // ${loc('guide_nowtv_event_details_favorites')}`,
    descriptionBelow: loc('stb_settings_personal_radiolists_edit_description'),
    descriptionSvgId: 'settings-favorites',
    clearText: loc('stb_settings_personal_favorites_radiolists_cancel'),
    clearActive: false,
    clearVisible: false,
    questionVisible: false,
    questionText: '',
    itemActiveVisible: true,
    theme: 'light',
    transitionType: 'default',
    type: 'default',
    activeSection: 'list',
    leftBackActive: true,
    editDialog: false,
    initDeclarative ({ store }) {
      const favRadio = store.getters['favorites/getAllLists']('radio')
      if (Object.keys(favRadio).length === 0 && favRadio.constructor === Object) {
        // console.warn(this.items.splice(1, 3))
        this.items.splice(1, 3)
      }
    }
  },
  favoritesTvLists: {
    items: [
      {
        id: 0,
        label: loc('stb_settings_personal_favorites_tvlists_newlist'),
        goTo: ({ router, store }) => {
          store.dispatch('inputScreen/show', {
            icon: 'monitor',
            text: '',
            callback: (finalValue) => {
              router.push({
                name: 'SettingsFavorites',
                params: {
                  channelsType: 'tvChannels', // tvChannels or radioChannels CUSTOM_TV or CUSTOM_RADIO
                  action: 'new',
                  pageTitle: finalValue
                }
              })
            }
          })
        }
      },
      {
        id: 1,
        label: loc('stb_settings_personal_favorites_tvlists_edit'),
        goTo: ({ router }) => {
          router.push({
            path: '/nav/settings/overlay/favoritesEditTvLists'
          })
        }
      },
      {
        id: 2,
        label: loc('stb_settings_personal_favorites_tvlists_delete'),
        goTo: ({ router }) => {
          router.push({
            path: '/nav/settings/overlay/favoritesDeleteTvLists'
          })
        }
      },
      {
        id: 3,
        label: loc('stb_settings_personal_favorites_tvlists_rename'),
        goTo: ({ router }) => {
          router.push({
            path: '/nav/settings/overlay/favoritesRenameTvLists'
          })
        }
      },
      {
        id: 4,
        label: loc('stb_settings_personal_favorites_favoritelistsorder'),
        goTo: ({ router }) => {
          router.push({
            name: 'ListsOrder',
            params: { channelsType: 'tv' } // tvChannels or radioChannels
          })
        }
      }
    ],
    backVisible: true,
    backActive: false,
    itemActive: 0,
    descriptionMain: loc('stb_settings_personal_favorites_tvlists'),
    descriptionAbove: `${loc('general_navigation_settings')} // ${loc('guide_nowtv_event_details_favorites')}`,
    descriptionBelow: loc('stb_settings_personal_favorites_tvlists_edit_description'),
    descriptionSvgId: 'settings-favorites',
    clearText: loc('stb_settings_personal_favorites_tvlists_cancel'),
    clearActive: false,
    clearVisible: false,
    questionVisible: false,
    questionText: '',
    itemActiveVisible: true,
    theme: 'light',
    transitionType: 'default',
    type: 'default',
    activeSection: 'list',
    leftBackActive: true,
    editDialog: false,
    initDeclarative ({ store }) {
      const favTv = store.getters['favorites/getAllLists']('tv')
      if (Object.keys(favTv).length === 0 && favTv.constructor === Object) {
        // console.warn(this.items.splice(1, 3))
        this.items.splice(1, 3)
      }
    }
  },
  favoritesEditRadioLists: {
    items: [],
    backVisible: true,
    backActive: false,
    itemActive: 0,
    descriptionMain: loc('stb_settings_personal_favorites_tvlists_edit'),
    descriptionAbove: `${loc('general_navigation_settings')} // ${loc('guide_nowtv_event_details_favorites')} // ${loc('stb_settings_personal_favorites_radiostationlists')}`,
    descriptionBelow: loc('stb_settings_personal_radiolists_edit_description'),
    descriptionSvgId: 'settings-favorites',
    clearText: loc('stb_settings_personal_favorites_radiolists_cancel'),
    clearActive: false,
    clearVisible: false,
    itemActiveVisible: true,
    theme: 'light',
    transitionType: 'default',
    type: 'default',
    activeSection: 'list',
    leftBackActive: true,
    editDialog: true,
    initDeclarative ({ store }) {
      let items = store.getters['favorites/getAllLists']('radio')
      this.items = Object.values(items).map((item) => ({
        id: item.id,
        label: item.name,
        name: item.name,
        goTo: ({ router }) => {
          const listIds = store.getters['favorites/getAllLists']('radio')
          router.push({
            name: 'SettingsFavorites',
            params: {
              channelsType: 'radioChannels', // tvChannels or radioChannels
              action: 'edit',
              listToEdit: listIds[item.id]
            }
          })
        }
      }))
    }
  },
  favoritesEditTvLists: {
    items: [],
    backVisible: true,
    backActive: false,
    itemActive: 0,
    descriptionMain: loc('stb_settings_personal_favorites_tvlists_edit'),
    descriptionAbove: `${loc('general_navigation_settings')} // ${loc('guide_nowtv_event_details_favorites')} // ${loc('stb_settings_personal_favorites_tvlists')}`,
    descriptionBelow: loc('stb_settings_personal_favorites_tvlists_edit_description'),
    descriptionSvgId: 'settings-favorites',
    clearText: loc('stb_settings_personal_favorites_tvlists_cancel'),
    clearActive: false,
    clearVisible: false,
    questionVisible: false,
    questionText: '',
    itemActiveVisible: true,
    theme: 'light',
    transitionType: 'default',
    type: 'default',
    activeSection: 'list',
    leftBackActive: true,
    editDialog: true,
    initDeclarative ({ store }) {
      let items = store.getters['favorites/getAllLists']('tv')
      this.items = Object.values(items).map((item) => ({
        id: item.id,
        label: item.name,
        name: item.name,
        goTo: ({ router }) => {
          const listIds = store.getters['favorites/getAllLists']('tv')
          router.push({
            name: 'SettingsFavorites',
            params: {
              channelsType: 'tvChannels', // tvChannels or radioChannels
              action: 'edit',
              listToEdit: listIds[item.id]
            }
          })
        }
      }))
    }
  },
  favoritesRenameTvLists: {
    items: [],
    backVisible: true,
    backActive: false,
    itemActive: 0,
    descriptionMain: loc('stb_settings_personal_favorites_tvlists_rename'),
    descriptionAbove: `${loc('general_navigation_settings')} // ${loc('guide_nowtv_event_details_favorites')} // ${loc('stb_settings_personal_favorites_tvlists')}`,
    descriptionBelow: loc('stb_settings_personal_favorites_tvlists_rename_description'),
    descriptionSvgId: 'settings-favorites',
    clearText: loc('stb_settings_personal_favorites_tvlists_cancel'),
    clearActive: false,
    clearVisible: false,
    questionVisible: false,
    questionText: '',
    itemActiveVisible: true,
    theme: 'light',
    transitionType: 'default',
    type: 'default',
    activeSection: 'list',
    leftBackActive: true,
    initDeclarative ({ store, bindData, self }) {
      let items = store.getters['favorites/getAllLists']('tv')
      let makeItems = () => (Object.values(items).map((item) => ({
        id: item.id,
        label: item.name,
        name: item.name,
        goTo: ({ router }) => {
          const listIds = store.getters['favorites/getAllLists']('tv')
          let list = {...listIds[item.id]}
          store.dispatch('inputScreen/show', {
            icon: 'monitor',
            text: item.name,
            callback: (finalValue) => {
              if (finalValue) {
                list.name = finalValue
                store.dispatch('favorites/edit', { index: item.id, list: list })
              }
            }
          })
        }
      }))
      )

      this.items = makeItems()

      let updateItems = function (mutation, state) {
        if (mutation.type === 'favorites/INIT_FAVORITE_LISTS') {
          let items = store.getters['favorites/getAllLists']('tv')
          this.items = makeItems(items)
          this.itemActive = this.items.length - 1 < self.itemActive ? self.itemActive - 1 : self.itemActive
          bindData(this)
        }
      }
      updateItems = updateItems.bind(this)
      store.subscribe(updateItems)
    }
  },
  favoritesDeleteTvLists: {
    items: [],
    backVisible: true,
    backActive: false,
    itemActive: 0,
    descriptionMain: loc('stb_settings_personal_favorites_tvlists_delete'),
    descriptionAbove: `${loc('general_navigation_settings')} // ${loc('guide_nowtv_event_details_favorites')} // ${loc('stb_settings_personal_favorites_tvlists')}`,
    descriptionBelow: loc('stb_settings_personal_tvlists_delete_description'),
    descriptionSvgId: 'settings-favorites',
    clearText: loc('stb_settings_personal_favorites_tvlists_cancel'),
    clearActive: false,
    clearVisible: false,
    questionVisible: false,
    questionText: '',
    itemActiveVisible: true,
    theme: 'light',
    transitionType: 'default',
    type: 'default',
    activeSection: 'list',
    leftBackActive: true,
    initDeclarative ({ store, bindData, self }) {
      console.log('sdasdsaddas')
      let items = store.getters['favorites/getAllLists']('tv')
      let makeItems = (items) => Object.values(items).map((item, index) => ({
        id: item.id,
        label: item.name,
        name: item.name,
        goTo: ({ router }) => {
          store.dispatch('favorites/delete', { index: item.id, type: 'tv' })
        }
      }))
      this.items = makeItems(items)

      let updateItems = function (mutation, state) {
        if (mutation.type === 'favorites/DELETE') {
          let items = store.getters['favorites/getAllLists']('tv')
          this.items = makeItems(items)
          this.itemActive = this.items.length - 1 < self.itemActive ? self.itemActive - 1 : self.itemActive
          bindData(this)
        }
      }
      updateItems = updateItems.bind(this)
      store.subscribe(updateItems)
    }
  },
  favoritesDeleteRadioLists: {
    items: [],
    backVisible: true,
    backActive: false,
    itemActive: 0,
    descriptionMain: loc('stb_settings_personal_favorites_tvlists_delete'),
    descriptionAbove: `${loc('general_navigation_settings')} // ${loc('guide_nowtv_event_details_favorites')} // ${loc('stb_settings_personal_favorites_radiostationlists')}`,
    descriptionBelow: loc('stb_settings_personal_radiolists_delete_description'),
    descriptionSvgId: 'settings-favorites',
    clearText: loc('stb_settings_personal_favorites_radiolists_cancel'),
    clearActive: false,
    clearVisible: false,
    questionVisible: false,
    questionText: '',
    itemActiveVisible: true,
    theme: 'light',
    transitionType: 'default',
    type: 'default',
    activeSection: 'list',
    initDeclarative ({ store, bindData, self }) {
      let items = store.getters['favorites/getAllLists']('radio')
      let makeItems = (items) => Object.values(items).map((item, index) => ({
        id: item.id,
        label: item.name,
        name: item.name,
        goTo: ({ router }) => {
          store.dispatch('favorites/delete', { index: item.id, type: 'radio' })
        }
      }))
      this.items = makeItems(items)

      let updateItems = function (mutation, state) {
        if (mutation.type === 'favorites/DELETE') {
          let items = store.getters['favorites/getAllLists']('radio')
          this.items = makeItems(items)
          this.itemActive = this.items.length - 1 < self.itemActive ? self.itemActive - 1 : self.itemActive
          bindData(this)
        }
      }
      updateItems = updateItems.bind(this)
      store.subscribe(updateItems)
    }
  },
  favoritesRenameRadioLists: {
    items: [],
    backVisible: true,
    backActive: false,
    itemActive: 0,
    descriptionMain: loc('stb_settings_personal_favorites_tvlists_rename'),
    descriptionAbove: `${loc('general_navigation_settings')} // ${loc('guide_nowtv_event_details_favorites')} // ${loc('stb_settings_personal_favorites_radiostationlists')}`,
    descriptionBelow: loc('stb_settings_personal_radiolists_rename_description'),
    descriptionSvgId: 'settings-favorites',
    clearText: loc('stb_settings_personal_favorites_radiolists_cancel'),
    clearActive: false,
    clearVisible: false,
    questionVisible: false,
    questionText: '',
    itemActiveVisible: true,
    theme: 'light',
    transitionType: 'default',
    type: 'default',
    activeSection: 'list',
    leftBackActive: true,
    editDialog: true,
    initDeclarative ({ store, bindData, self }) {
      let items = store.getters['favorites/getAllLists']('radio')
      let makeItems = () => {
        return Object.values(items).map((item) => ({
          id: item.id,
          label: item.name,
          name: item.name,
          goTo: ({ router }) => {
            const listIds = store.getters['favorites/getAllLists']('radio')
            let list = {...listIds[item.id]}
            store.dispatch('inputScreen/show', {
              icon: 'radio',
              text: item.name,
              callback: (finalValue) => {
                if (finalValue) {
                  list.name = finalValue
                  store.dispatch('favorites/edit', { index: item.id, list: list })
                }
              }
            })
          }
        }))
      }

      this.items = makeItems()

      let updateItems = function (mutation, state) {
        if (mutation.type === 'favorites/EDIT') {
          let items = store.getters['favorites/getAllLists']('radio')
          this.items = makeItems(items)
          // this.itemActive = this.items.length - 1 < self.itemActive ? self.itemActive - 1 : self.itemActive
          bindData(this)
        }
      }
      updateItems = updateItems.bind(this)
      store.subscribe(updateItems)
    }
  }
})
