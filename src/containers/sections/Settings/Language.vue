<template>
</template>

<script>
import settingsValues from './data/settingsValues'
import common from './_selectListLeveledCommon'

export default {
  name: 'SettingsLanguage',
  mixins: [ common ],
  methods: {
    settingValues (id) {
      let values

      if (settingsValues[id] !== undefined) {
        values = settingsValues[id]
      } else {
        values = this.settings.values.languages
      }

      return values
    }
  }
}
</script>
