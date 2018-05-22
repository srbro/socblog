<template>
</template>

<script>
import common from '../_selectListLeveledCommon'

export default {
  name: 'SettingsNetwork',
  mixins: [ common ],
  methods: {
    getNetworkInfoID (ind) {
      let elementsObjID = this.selectedSetting.values.items[ind].id
      let neededID
      switch (elementsObjID) {
        case 'networkStatus':
          neededID = 'SettingsNetworkStatus'
          break
        case 'checkConnection':
          neededID = 'SettingsNetworkCheckConnection'
          break
        case 'speedTest':
          neededID = 'SettingsNetworkSpeedTest'
          break
      }
      return neededID
    }
  }
}
</script>
