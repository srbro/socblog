<template>
</template>

<script>
import { mapState } from 'vuex'
// import common from './_infoListCommon'
import common from './_selectListLeveledCommon'
import settingsValues from './data/settingsValues'

export default {
  name: 'SettingsAccount',
  mixins: [ common ],
  computed: {
    ...mapState({
      settings: state => state.settings
    })
  },
  methods: {
    settingValues (id) {
      let values
      if (id === 'accountInfo') {
        values = settingsValues[id].map((item) => {
          let itemSubLabel = this.settings.values.household[item.type]
          return {
            id: item.id,
            label: `${this.loc(item.label)}:`,
            subLabel: itemSubLabel || item.subLabel
          }
        })
      } else if (id === 'signOut') {
        values = settingsValues[id].map(option => ({
          id: option.id,
          label: this.loc(option.label)
        }))
      }
      return values
    }
  }
}
</script>
