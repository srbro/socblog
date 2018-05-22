import { mapState, mapActions } from 'vuex'
import cloneDeep from 'lodash/fp/cloneDeep'
import find from 'lodash/fp/find'
import settingsValues from './data/settingsValues'
import { initialise as initialiseSelectList } from 'containers/twoSidedDialog/selectList'

export default {
  name: 'SelectList',
  data: () => ({
    selectedSetting: {}
  }),
  computed: {
    ...mapState({
      settings: state => state.settings
    })
  },
  methods: {
    ...mapActions({
      updateSetting: 'settings/updateSetting'
    }),
    initFromRouteParams () {
      this.selectedSetting = this.$route.params.setting
      this.showOptions(this.selectedSetting.id)
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
    callback ({ value, id }) {
      if (value.length !== 0 && value !== 'EXIT') {
        this.updateSetting({ name: id, value: value[0] })
      }
      this.$router.push({
        name: 'Settings',
        params: {
          setting: this.selectedSetting.id
        }
      })
    },
    showOptions (id) {
      let newItems = cloneDeep(this.settingValues(id))
      let selectedItem = find({ id: this.settings[id] })(newItems)
      if (selectedItem !== undefined) selectedItem.selected = true

      initialiseSelectList({
        values: {
          items: newItems,
          // description: this.selectedSetting.values.description
          description: {
            title: this.loc(this.selectedSetting.values.description.title),
            titleAbove: this.loc(this.selectedSetting.values.description.titleAbove),
            titleBelow: this.loc(this.selectedSetting.values.description.titleBelow),
            svgId: (this.selectedSetting.values.description.svgId)
          }
        },
        callback: (value) => this.callback({ value, id }),
        // clearVisible: true,
        // clearText: this.loc('stb_settings_systempreferences_quality_cancel'),
        // transitionType: 'right',
        theme: 'light',
        backVisible: true
      })
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
