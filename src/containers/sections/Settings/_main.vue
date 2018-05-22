<template>
  <div :class="[
          'settings-container',
          {'no-transition-animation': !uiMode.settingsTransitionAnimation}
        ]">
    <settings-header
      :label="loc('general_navigation_settings')"
      :pageFocus="!navigationActive"
      :visible="this.selectedRow === 0"
    />
    <settings-row v-for="(row, index) in rows"
      :style="rowTransform[index]"
      :key="row.id"
      :items="row.items"
      :selectedIndex="selectedCards[index]"
      :title="row.label"
      :selected="selectedRow === index && !navigationActive"
      :focused="!navigationActive"
      :row-index="index"
      :handle-click="handleClick"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import findIndex from 'lodash/fp/findIndex'
import includes from 'lodash/fp/includes'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'
import { emitKeyPress } from 'helpers/keyHold'
import HistoryManager from 'containers/mixins/HistoryManager'
import { OFFSET_LEFT } from 'helpers/oneliners'
import SettingsRow from './SettingsRow'
import SettingsHeader from './SettingsHeader'
import allSettings from 'settings' // imports settings for platform
import settingsValues from './data/settingsValues'
import { debugConfig } from 'helpers/logger'

const ROW_HEIGHT = 248
const ROW_SPACING = 26
const ROW_ADDITIONAL_SPACING = 160

export default {
  name: 'Settings',
  mixins: [ RegisterKeyHandler, HistoryManager ],
  components: { SettingsRow, SettingsHeader },
  data () {
    return {
      rows: [
        { id: 0, label: this.loc('stb_settings_personal'), items: this.localize(allSettings.personal) },
        { id: 1, label: this.loc('stb_settings_systempreferences'), items: this.localize(allSettings.systemPreferences) }
      ],
      selectedRow: 0,
      selectedCards: [],
      uiMode: window.uiMode,
      translateMode: window.translateMode
    }
  },
  computed: {
    ...mapState({
      navigationActive: state => state.navigation.active,
      settings: state => state.settings,
      route: state => state.route
    }),
    selectedCard: {
      get () { return this.selectedCards[this.selectedRow] },
      set (newValue) { this.$set(this.selectedCards, this.selectedRow, newValue) }
    },
    rowTransform () {
      return this.rows.map((row, index) => {
        const translateX = !this.navigationActive ? OFFSET_LEFT.active : OFFSET_LEFT.inactive
        let translateY

        if (!this.navigationActive) {
          const additionalOffset = (ROW_ADDITIONAL_SPACING - ROW_SPACING) * index
          translateY = (ROW_HEIGHT + ROW_ADDITIONAL_SPACING) * this.selectedRow - additionalOffset
        } else {
          translateY = (ROW_HEIGHT + ROW_SPACING) * this.selectedRow
        }

        let transform3d = `translate3d(${translateX}rem, ${-translateY}rem, 0)`
        let transform2d = `translate(${translateX}rem, ${-translateY}rem)`

        return {
          transform: !this.translateMode.translate ? transform3d : transform2d
        }
      })
    },
    selectedSetting () {
      return this.rows[this.selectedRow].items[this.selectedCard]
    }
  },
  watch: {
    '$route' (to, from) {
      if (this.$route.params) {
        this.initFromHistoryRouteParams()
      }
    }
  },
  methods: {
    ...mapActions({
      toggleNavigation: 'navigation/toggle',
      updateSetting: 'settings/updateSetting',
      fetchSettings: 'settings/fetchSettings'
    }),
    handleKey (key) {
      switch (key) {
        case 'BACK':
          this.doHistoryBack()
          break
        case 'LEFT':
          this.selectedCard === 0 ? this.toggleNavigation(true) : this.moveRow(key)
          break
        case 'RIGHT':
          this.moveRow(key)
          break
        case 'UP':
        case 'DOWN':
          this.changeRow(key)
          break
        case 'HOLD_STOP': // l for web
          break
        case 'UP_HOLD':
        case 'DOWN_HOLD':
          if (emitKeyPress({ delay: 50 })) {
            this.changeRow(key === 'UP_HOLD' ? 'UP' : 'DOWN')
          }
          break
        case 'LEFT_HOLD': // j for web
        case 'RIGHT_HOLD': // k for web
          if (emitKeyPress({ delay: 50 })) {
            this.moveRow(key === 'LEFT_HOLD' ? 'LEFT' : 'RIGHT')
          }
          break
        case 'OK':
          this.runAction()
          break
      }
    },
    handleClick ({ rowIndex, cardIndex }) {
      if (!this.navigationActive) {
        if (this.selectedRow === rowIndex) {
          if (cardIndex !== undefined) {
            this.selectedCard = cardIndex
          }
          this.runAction()
          return
        }
        this.selectedRow = rowIndex
        if (cardIndex !== undefined) {
          this.selectedCard = cardIndex
        }
      }
    },
    localize (items) {
      return items.map((item) => ({
        id: item.id,
        label: this.loc(item.label),
        type: item.type,
        listType: item.listType,
        values: item.values
      }))
    },
    moveRow (direction) {
      const offset = direction === 'LEFT' ? -1 : 1
      const currentRow = this.rows[this.selectedRow]
      this.selectedCard = Math.min(Math.max(this.selectedCard + offset, 0), currentRow.items.length - 1)
    },
    changeRow (direction) {
      const offset = direction === 'UP' ? -1 : 1
      this.selectedRow = Math.min(Math.max(this.selectedRow + offset, 0), this.rows.length - 1)
    },
    initialiseSelectedCards (rowLength) {
      this.selectedCards = Array(rowLength).fill(0)
    },
    settingValues (id) {
      let values

      if (settingsValues[id] !== undefined) {
        values = settingsValues[id]
      } else if (this.selectedSetting.id === 'language') {
        values = this.settings.values.languages
      }

      return values
    },
    runAction () {
      switch (this.selectedSetting.type) {
        case 'selection':
          break
        case 'list':
          this.$router.push({
            name: 'SelectList',
            params: {
              setting: this.selectedSetting
            }
          })
          break
        case 'info':
          this.$router.push({
            name: 'InfoList',
            params: {
              setting: this.selectedSetting
            }
          })
          break
        case 'favorites':
          this.doHistorySave()
          this.$router.push({ name: 'SettingsTwoSidedOvelay', params: { dialogType: 'favoritesCategories' } })
          break
        case 'pin':
          this.doHistorySave()
          this.$router.push({
            name: 'Pin',
            params: {
              footer: null,
              title: null
            }
          })
          break
        default:
          this.$router.push({
            name: `Settings${this.selectedSetting.type}`,
            params: {
              setting: this.selectedSetting
            }
          })
          break
      }
    },
    initFromRouteParams () {
      let settingIndex

      this.rows.forEach((item, index) => {
        settingIndex = findIndex({ id: this.$route.params.setting }, item.items)

        if (settingIndex > -1) {
          this.selectedRow = index
          this.selectedCard = settingIndex
          this.toggleNavigation(false)
        }
      })
    },
    initFromHistoryRouteParams () {
      if (this.$route.params.historyBackPerformed) {
        this.selectedRow = this.$route.params.selectedRow || 0
        this.selectedCard = this.$route.params.selectedCard || 0
      }
    }
  },
  created () {
    let historySave = this.doHistorySave
    this.doHistorySave = () => {
      if (this.$route.name === 'Settings') {
        historySave()
      }
    }
    if (debugConfig.debuggingMode) {
      this.rows.push({ id: 2, label: 'Developer Settings', items: this.localize(allSettings.dev) })
    }
    this.initialiseSelectedCards(this.rows.length)
    if (Object.keys(this.$route.params).length > 0) {
      this.initFromRouteParams()
    }
    this.initFromHistoryRouteParams()
  },
  async mounted () {
    if (!includes('settings', this.route.from.path)) {
      await this.fetchSettings()
    }
  }
}
</script>

<style scoped lang="scss">
.settings-container {
  height: 100%;
  width: 100%;
}
</style>
