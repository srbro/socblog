<template>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import common from './_infoListCommon'
import { initialise as initialiseInfoList } from 'containers/twoSidedDialog/infoList'

export default {
  name: 'SettingsFAQ',
  mixins: [ common ],
  computed: {
    ...mapState({
      settings: state => state.settings,
      providerSupportDataPhone: state => state.settings.providerSupportDataPhone,
      providerSupportDataWeb: state => state.settings.providerSupportDataWeb
    })
  },
  methods: {

    dialogItems () {
      return this.selectedSetting.values.items.map((item) => {
        let itemSubLabel = this.settings.values.items
        return {
          id: item.id,
          label: item.label,
          subLabel: itemSubLabel || item.subLabel
        }
      })
    },
    dialogItemsloc () {
      let subLabels = []
      let supportPhone = this.providerSupportDataPhone
      let supportWeb = this.providerSupportDataWeb

      let num = -1

      subLabels.push(supportPhone)
      subLabels.push(supportWeb)

      return this.selectedSetting.values.items.map((item) => {
        num++
        return {
          label: this.loc(item.label),
          subLabel: subLabels[num]
        }
      })
    },
    initFromRouteParams () {
      this.selectedSetting = this.$route.params.setting

      initialiseInfoList({
        values: {
          items: this.dialogItemsloc(),
          description: {
            title: this.loc('settings_help'),
            titleAbove: this.loc('general_navigation_settings'),
            titleBelow: this.loc(''), // za sada nema
            svgId: (this.selectedSetting.values.description.svgId)
          }
        },
        callback: (newValue) => {
          if (newValue === 'EXIT') {
            this.$router.push({
              name: 'Settings',
              params: {
                setting: this.selectedSetting.id
              }
            })
          }
        },
        theme: 'light'
      })
    },
    ...mapMutations({
      updateItems: 'twoSidedDialog/SET_ITEMS'
    }),
    watch: {
      providerSupportDataPhone: function () {
        this.updateItems(this.dialogItemsloc())
      },
      providerSupportDataWeb: function () {
        this.updateItems(this.dialogItemsloc())
      }
    }
  }
}
</script>
