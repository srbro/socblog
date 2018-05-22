import { initialise as initialiseInfoList } from 'containers/twoSidedDialog/infoList'

export default {
  data: () => ({
    selectedSetting: {}
  }),
  methods: {
    initFromRouteParams () {
      this.selectedSetting = this.$route.params.setting
      this.showInfoList()
    },
    dialogItems () {
      return this.selectedSetting.values.items.map((item) => ({
        id: item.id,
        label: `${this.loc(item.label)}:`,
        subLabel: item.subLabel
      }))
    },
    callback ({ value }) {
      if (value === 'EXIT') {
        this.$router.push({
          name: 'Settings',
          params: {
            setting: this.selectedSetting.id
          }
        })
      }
    },
    showInfoList () {
      initialiseInfoList({
        values: {
          items: this.dialogItems(),
          description: this.locDesc(this.selectedSetting.values.description)
        },
        callback: (value) => this.callback({ value }),
        theme: 'light'
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
