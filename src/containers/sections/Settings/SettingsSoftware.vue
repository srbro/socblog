<template>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import common from './_infoListCommon'
import { initialise as initialiseInfoList } from 'containers/twoSidedDialog/infoList'
// import settingsValues from '../data/settingsValues'
import { getWrapperVersion, getSDKVersion, getReleaseVersion, getDeviceModel, getPlatform, getDeviceManufacturer } from 'hal'
import store from 'src/vuex/store'

export default {
  name: 'SettingsSoftware',
  mixins: [ common ],
  computed: {
    ...mapState({
      settings: state => state.settings,
      lastKey: state => state.twoSidedDialog.lastKey,
      appVersion: state => state.software.appVersion,
      wrapperVersion: state => state.software.wrapperVersion,
      SDKVersion: state => state.software.SDKVersion,
      releaseVersion: state => state.software.releaseVersion,
      PlatformVersion: state => state.software.PlatformVersion,
      Manufacturer: state => state.software.Manufacturer,
      TvModel: state => state.software.TvModel,
      buildVersion: state => state.software.buildVersion
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
      let appVersion = this.appVersion
      let wrapperVersion = this.wrapperVersion
      let SDKVersion = this.SDKVersion
      let releaseVersion = this.releaseVersion
      let PlatformVersion = this.PlatformVersion
      let TvModel = this.TvModel
      let buildVersion = this.buildVersion

      let appVerFinal = appVersion + ' / ' + wrapperVersion
      let OsVersion = PlatformVersion + ' / ' + releaseVersion + ' / ' + SDKVersion

      let num = -1

      subLabels.push(appVerFinal)
      subLabels.push(OsVersion)
      subLabels.push(PlatformVersion)
      subLabels.push(TvModel)
      subLabels.push(buildVersion)

      return this.selectedSetting.values.items.map((item) => {
        num++
        return {
          label: this.loc(item.label),
          subLabel: subLabels[num]
        }
      })
    },
    updateSoftwareInfo () {
      store.commit('software/SET_WRAPPER_VERSION', getWrapperVersion())
      store.commit('software/SET_SDK_VERSION', getSDKVersion())
      store.commit('software/SET_RELEASE_VERSION', getReleaseVersion())
      store.commit('software/SET_PLATFORM_VERSION', getPlatform())
      store.commit('software/SET_MANUFACTURER', getDeviceManufacturer())
      store.commit('software/SET_TVMODEL', getDeviceModel())
    },
    initFromRouteParams () {
      this.updateSoftwareInfo()
      this.selectedSetting = this.$route.params.setting

      initialiseInfoList({
        values: {
          items: this.dialogItemsloc(),
          description: {
            title: this.loc('stb_settings_systempreferences_software'),
            titleAbove: this.loc('general_navigation_settings'),
            titleBelow: this.loc('stb_settings_systempreferences_software_description'),
            svgId: (this.selectedSetting.values.description.svgId)
            // settings-software
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
      lastKey: function (newKey) {
        switch (newKey) {
          case 'LEFT':
            // this.moveSelectionLeft()
            break
          case 'RIGHT':
            // this.moveSelectionRight(newKey)
            break
          // case 'UP':
          //   this.changeLevel(newKey)
          //   break
          // case 'DOWN':
          //   this.changeLevel(newKey)
          //   break
          case 'OK':
            this.updateSoftwareInfo()
            store.commit('twoSidedDialog/UPDATE_LAST_KEY', 'RIGHT')
            break
          case 'BACK':
            break
        }
      },
      appVersion: function () {
        this.updateItems(this.dialogItemsloc())
      },
      wrapperVersion: function () {
        this.updateItems(this.dialogItemsloc())
      },
      SDKVersion: function () {
        this.updateItems(this.dialogItemsloc())
      },
      releaseVersion: function () {
        this.updateItems(this.dialogItemsloc())
      },
      platformVersion: function () {
        this.updateItems(this.dialogItemsloc())
      },
      manufacturer: function () {
        this.updateItems(this.dialogItemsloc())
      },
      TvModel: function () {
        this.updateItems(this.dialogItemsloc())
      }
    }
  }
}
</script>
