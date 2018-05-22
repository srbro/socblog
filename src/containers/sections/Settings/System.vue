<template>
</template>

<script>
import { mapState } from 'vuex'
// import common from './_infoListCommon'
import common from './_selectListLeveledCommon'
import settingsValues from './data/settingsValues'

export default {
  name: 'SettingsSystem',
  mixins: [ common ],
  computed: {
    ...mapState({
      settings: state => state.settings
    })
  },
  methods: {
    settingValues (id) {
      let values
      if (id === 'restartApp') {
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
