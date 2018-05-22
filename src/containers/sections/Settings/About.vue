<template>
</template>

<script>
import common from './_infoListCommon'
import { getSerial, getMac, getType } from 'hal'

export default {
  name: 'SettingsAbout',
  mixins: [ common ],
  methods: {
    dialogItems () {
      let subLabels = [ `${getType()}-12345678`, getSerial(), getMac() ]
      return this.selectedSetting.values.items.map((item, index) => ({
        id: item.id,
        label: `${this.loc(item.label)}:`,
        subLabel: subLabels[index]
      }))
    }
  }
}
</script>
