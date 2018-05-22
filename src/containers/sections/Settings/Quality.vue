<template>
</template>

<script>
import { mapState } from 'vuex'
// import common from './_selectListCommon'
import settingsValues from './data/settingsValues'
import common from './_selectListLeveledCommon'
import { localizeVideoQualityData } from 'helpers/player/quality.js'

export default {
  name: 'SettingsQuality',
  mixins: [ common ],
  computed: {
    ...mapState({
      settings: state => state.settings
    })
  },
  methods: {
    settingValues (id) {
      let values

      if (settingsValues[id] !== undefined) {
        values = settingsValues[id]
      } else {
        values = this.settings.values.videoQualities.map(videoQuality => ({
          id: videoQuality.type,
          label: localizeVideoQualityData(videoQuality.type)
        }))
      }

      return values
    }
  }
}
</script>
