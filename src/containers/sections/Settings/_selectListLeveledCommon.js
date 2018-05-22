import store from 'src/vuex/store'
import { mapState, mapActions } from 'vuex'
import cloneDeep from 'lodash/fp/cloneDeep'
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import isEqual from 'lodash/fp/isEqual'
import { initialise as initialiseSelectList } from 'containers/twoSidedDialog/selectList'
import settingsValues from './data/settingsValues'
import { setDebuggingMode, sendLogToSentry } from 'helpers/logger'

export default {
  data: () => ({
    selectedSetting: {}
  }),
  computed: {
    ...mapState({
      settings: state => state.settings
    }),
    dialogItems () {
      return this.selectedSetting.values.items
        .map((item) => {
          const subLabelItem = find({ id: this.settings[item.id] }, this.settingValues(item.id))
          return {
            id: item.id,
            listType: item.listType,
            label: this.loc(item.label),
            subLabel: subLabelItem ? subLabelItem.label : '',
            description: {
              titleBelow: this.loc(item.description.titleBelow)
            }
          }
        })
    }
  },
  methods: {
    ...mapActions({
      updateSetting: 'settings/updateSetting',
      signOut: 'auth/resetAuth',
      reset: 'auth/resetApp'
    }),
    initFromRouteParams () {
      this.selectedSetting = this.$route.params.setting
      this.showSections()
    },
    settingValues (id) {
      let values = []

      if (settingsValues[id] !== undefined) {
        values = settingsValues[id].map(setting => {
          let label = setting.locReplace
            ? this.locReplace('X', setting.label, this.loc(setting.locReplace))
            : this.loc(setting.label)

          return {
            id: setting.id,
            label
          }
        })
      }

      return values
    },
    callbackSections ({ value }) {
      let newItems = this.settingValues(value[0])
      if (value === 'EXIT') {
        this.$router.push({
          name: 'Settings',
          params: {
            setting: this.selectedSetting.id
          }
        })
        return
      }
      if (newItems !== undefined) {
        this.showOptions(value[0], this.selectedSetting.listType)
      }
    },
    preCallbackOptions ({ value, id }) {
      return new Promise((resolve, reject) => {
        if (value.length !== 0 && value !== 'EXIT' && id !== 'debuging') {
          this.updateSetting({ name: id, value: value[0] }).then(response => {
            resolve()
          })
        } else {
          resolve()
        }
      })
      // if (value.length !== 0 && value !== 'EXIT') {
      //   this.updateSetting({ name: id, value: value[0] })
      // }
    },
    callbackOptions ({ value, id }) {
      if (id === 'debuging' && isEqual(value, [1])) {
        setDebuggingMode(false)
        this.$router.push({
          name: 'Settings',
          params: {
            setting: 0
          }
        })
        // this.signOut()
      } else {
        let activeIndex = findIndex({ id })(this.dialogItems)
        this.showSections(activeIndex)
      }
    },
    callbackActions ({ value, id }) {
      if (id === 'signOut' && isEqual(value, [0])) {
        this.signOut()
      } else if (id === 'restartApp' && isEqual(value, [0])) {
        this.reset()
      } else {
        let activeIndex = findIndex({ id })(this.dialogItems)
        this.showSections(activeIndex)
      }
    },
    showSections (activeIndex = 0) {
      initialiseSelectList({
        values: {
          items: JSON.parse(JSON.stringify(this.dialogItems)),
          // items: this.dialogItems,
          description: {
            title: this.loc(this.selectedSetting.values.description.title),
            titleAbove: this.loc(this.selectedSetting.values.description.titleAbove),
            titleBelow: this.loc(this.selectedSetting.values.description.titleBelow),
            svgId: (this.selectedSetting.values.description.svgId)
          }
        },
        itemActive: activeIndex,
        callback: (value) => this.callbackSections({ value }),
        backVisible: true,
        // transitionType: 'left'
        theme: 'light'
      })
    },
    showOptions (id, listType) {
      if (id === 'sendLog') {
        sendLogToSentry()
        store.dispatch('popup/toggle', {
          active: true,
          data: {
            type: 'disclaimer',
            title: 'stb_settings_help_problem_debug_sendlog',
            text: 'The log was sent',
            priority: 1,
            back: false,
            buttons: [
              {
                id: 'view',
                label: 'OK',
                callback: (newValue) => {
                  // this.fetchData(newState)
                }
              }
            ],
            selectedButtonIndex: 0
          }
        })
        this.$router.push({
          name: 'Settings',
          params: {
            setting: 0
          }
        })
        return
      }
      let activeIndex = findIndex({ id })(this.dialogItems)
      if (listType === 'info') {
        this.$router.push({
          name: this.getNetworkInfoID(activeIndex),
          params: { setting: this.selectedSetting }
        })
      } else {
        let descriptionItem = find({ id })(this.dialogItems)
        let newItems = cloneDeep(this.settingValues(id))
        let selectedItem = find({ id: this.settings[id] })(newItems)
        if (selectedItem !== undefined) selectedItem.selected = true
        if (descriptionItem.listType === 'question') {
          initialiseSelectList({
            values: {
              items: newItems,
              description: {
                title: descriptionItem.label,
                titleAbove: `${this.loc('general_navigation_settings')} // ${this.selectedSetting.label}`,
                titleBelow: descriptionItem.description.titleBelow,
                svgId: `settings-${this.selectedSetting.id}`
              }
            },
            callback: (value) => this.callbackActions({ value, id }),
            clearVisible: false,
            backVisible: true,
            questionVisible: true,
            questionText: this.loc('settings_signout_change_message_title'),
            clearText: this.loc('stb_settings_systempreferences_quality_cancel'),
            theme: 'light'
          })
        } else if (descriptionItem.listType === 'info') {
          initialiseSelectList({
            values: {
              items: newItems,
              description: {
                title: descriptionItem.label,
                titleAbove: `${this.loc('general_navigation_settings')} // ${this.selectedSetting.label}`,
                titleBelow: descriptionItem.description.titleBelow,
                svgId: `settings-${this.selectedSetting.id}`
              }
            },
            callback: (value) => this.callbackOptions({ value, id }),
            backVisible: true,
            theme: 'light'
          })
        } else {
          initialiseSelectList({
            values: {
              items: newItems,
              description: {
                title: descriptionItem.label,
                // titleAbove: `Settings // ${this.selectedSetting.label}`,
                titleAbove: `${this.loc('general_navigation_settings')} // ${this.selectedSetting.label}`,
                titleBelow: descriptionItem.description.titleBelow,
                svgId: `settings-${this.selectedSetting.id}`
              }
            },
            callback: (value) => this.callbackOptions({ value, id }),
            preCallback: (value) => this.preCallbackOptions({ value, id }),
            clearVisible: true,
            clearText: this.loc('stb_settings_systempreferences_quality_cancel'),
            // transitionType: 'right',
            theme: 'light'
          })
        }
      }
    }

  },
  created () {
    if (Object.keys(this.$route.params).length > 0) {
      this.initFromRouteParams()
    } else {
      throw new Error('Incorrect parameter passed.')
    }
  }
}
