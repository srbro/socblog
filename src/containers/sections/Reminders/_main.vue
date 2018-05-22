<template>
  <loader v-if="showLoader" :left="(1920 - 500)/2" />
  <div v-else class="home-container">
    <page-header
      :hide="activeRow > 0 || navigationActive"
      :page-title="loc('stb_settings_personal_reminders')"
      :active="focusSection === 'search'"
      :icon-label="loc('general_search_searchcontent')"
      :buttonType="'search'"
      :handle-click="handleClickBack"
    />
    <reminder-row
      v-for="(row, index) in slicedRows"
      :key="index"
      :style="rowTransforms[index]"
      :selected="activeCards[index]"
      :show-details="!navigationActive"
      :items="row.cards"
      :focused="!navigationActive && activeRow === index"
      :title="row.title"
      :card-styles="cardStyles"
      :channel-num="rows[index].cards.length"
      :active-row="activeRow === index ? true : false"
      :handle-click="handleClick"
      :click-on-card="clickOnCard"
      :row-number="index"
    />
    <no-items v-if="this.rows.length === 0"
      :no-items-title="loc('mylibrary_noreminder_title')"
      :no-items-text="loc('mylibrary_noreminder_description')"
      :no-items-icon="'my-library-reminders'"
      :icon-set="true"
    />
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'
import HistoryManager from 'containers/mixins/HistoryManager'
import ReminderRow from './ReminderRow'
import PageHeader from 'components/PageHeader'
import noItems from 'components/noItems'
import Loader from 'components/Loader'
import loader from 'mixins/Loader'

const ROW_SPACING = 12
const NUMBER_OF_CHANNELS = 6

export default {
  name: 'Reminders',
  mixins: [ RegisterKeyHandler, HistoryManager, loader ],
  components: { ReminderRow, PageHeader, Loader, noItems },
  data: () => ({
    activeRow: 0,
    transitionRow: 0,
    activeCards: [0, 0, 0, 0],
    j: 0,
    focusSection: 'content',
    translateMode: window.translateMode
  }),
  computed: {
    activeCard: {
      get () {
        return this.activeCards[this.activeRow]
      },
      set (newValue) {
        this.$set(this.activeCards, this.activeRow, newValue)
      }
    },
    ...mapState({
      navigationActive: state => state.navigation.active,
      showSearchButton: state => state.general.gui.showSearchButton
    }),
    ...mapGetters({
      rows: 'reminders/rows',
      slicedRows: 'reminders/slicedRows'
    }),
    cardStyles () {
      const CARD_WIDTH = 300
      const CARD_SPACING = 12
      var letArr = []
      let translate = !this.translateMode.translate ? 'translate3d' : 'translate'
      let translateThirdParam = !this.translateMode.translate ? ', 0' : ''
      for (let i = this.j; i <= this.j + NUMBER_OF_CHANNELS; i++) {
        letArr.push(`transform: ${translate}(${(CARD_WIDTH + CARD_SPACING) * i}rem, 0${translateThirdParam});`)
      }
      return letArr
    },
    rowTransforms () {
      return this.slicedRows.map((row, index) => {
        const height = this.slicedRows
          .filter((slicedRows, rowIndex) => rowIndex < index)
          .reduce((heightSum, slicedRows) =>
            heightSum + slicedRows.height[this.navigationActive ? 'closed' : 'opened'] + ROW_SPACING,
          0
          )
        const scale = this.navigationActive ? 0.807 : 1

        let moveTop = this.slicedRows
          .filter((slicedRows, rowIndex) => rowIndex < this.activeRow)
          .reduce((heightSum, slicedRows) =>
            heightSum + slicedRows.height[this.navigationActive ? 'closed' : 'opened'] + ROW_SPACING,
          0
          )

        if (index > 0) {
          if (this.activeRow > 0) {
            // this.transitionRow = this.rows[this.activeRow - 1].height[this.navigationActive ? 'closed' : 'opened']
            this.transitionRow = moveTop
          } else if (this.activeRow === 0) {
            this.transitionRow = 0
          }
        } else if (index === 0) {
          if (this.activeRow > 0) {
            // this.transitionRow = this.rows[this.activeRow].height[this.navigationActive ? 'closed' : 'opened']
            this.transitionRow = moveTop
          } else if (this.activeRow === 0) {
            this.transitionRow = 0
          }
        }

        let transform3d = `translate3d(0, ${height - this.transitionRow}rem, 0) scale3d(${scale}, ${scale}, ${scale})`
        let transform2d = `translate(0, ${height - this.transitionRow}rem) scale3d(${scale}, ${scale}, ${scale})`

        return {
          transform: !this.translateMode.translate ? transform3d : transform2d
        }
      })
    }
  },
  methods: {
    clickOnCard (index, rowNumber, isSelectedRow) {
      if (!this.navigationActive) {
        this.activeRow = rowNumber
        this.changeCard(index)
        if (isSelectedRow) {
          this.runAction()
        }
      }
    },
    changeCard (id) {
      this.activeCard = id
    },
    handleKey (key) {
      switch (key) {
        case 'BACK':
          this.doHistoryBack()
          return
        case 'LEFT':
          if (this.activeCard === 0 || this.focusSection === 'search') {
            this.toggleNavigation(true)
            this.j = 0
          } else {
            this.moveRow(key)
          }
          break
        case 'RIGHT':
          if (this.rows.length !== 0) {
            if (this.focusSection === 'search') {
              this.focusSection = 'content'
              this.activeRow = 0
              this.activeCard = this.activeCard - 1
            }
            this.moveRow(key)
          }
          break
        case 'UP':
        case 'DOWN':
          if (this.rows.length !== 0) {
            this.changeRows(key)
          }
          break
        case 'OK':
          if (this.focusSection === 'search') {
            this.$router.push({ name: 'Search' })
          } else {
            this.runAction()
          }
          break
      }
    },
    handleClick (direction) {
      this.moveRow(direction)
    },
    handleClickBack () {
      this.$router.push({ name: 'Search' })
    },
    runAction () {
      const selectedItem = this.slicedRows[this.activeRow].cards[this.activeCard]
      for (let i = 0; i < this.slicedRows.length; i++) {
        switch (this.activeRow) {
          case i: // NOW TV ROW
            if (selectedItem.id === 'SHOW_ALL') {
              this.$router.push({ name: 'ReminderSeeAll', params: {pageData: this.rows[i]} })
            } else {
              this.fetchEventDetail({
                eventId: selectedItem.eventId,
                noInformationData: null
              }).then(() => {
                this.$router.push({
                  name: 'EventDetail'
                })
              })
            }
            break
        }
      }
    },
    moveRow (direction) {
      if (this.slicedRows && this.activeRow > -1) {
        const offset = direction === 'LEFT' ? -1 : 1
        const currentRow = this.slicedRows[this.activeRow]
        this.activeCard = Math.min(Math.max(this.activeCard + offset, 0), currentRow.cards.length - 1)
        if (offset === 1 && this.activeCard > 2 && this.activeCard < 5) {
          this.j -= offset
        }
        if (offset === -1 && this.activeCard > 1 && this.activeCard < 4) {
          this.j -= offset
        }
      }
    },
    changeRows (direction) {
      const offset = direction === 'UP' ? -1 : 1
      if (this.showSearchButton) {
        this.activeRow = Math.min(Math.max(this.activeRow + offset, -1), this.slicedRows ? this.slicedRows.length - 1 : 0)
        this.focusSection = this.activeRow === -1 ? 'search' : 'content'
      } else {
        this.activeRow = Math.min(Math.max(this.activeRow + offset, 1), this.slicedRows ? this.slicedRows.length - 1 : 0)
      }
    },
    ...mapActions({
      toggleNavigation: 'navigation/toggle',
      fetchChannels: 'general/fetchChannels',
      getRemindersData: 'reminders/fetchRemindersData',
      fetchEventDetail: 'epg/fetchEventDetail'
    })
  },
  async created () {
    this.initLoader()
    await this.getRemindersData()
    if (this.slicedRows.length === 0) {
      this.focusSection = 'search'
    }
    this.hideLoader()
    // this.rows[2].cards = this.nowTvItems()
  }
}
</script>

<style scoped lang="scss">
@import 'variables';

.home-container {
  height: 100%;
  width: 100%;
  padding: 0 86rem;
  .header-container {
    margin-bottom: 20rem;
  }
}
</style>
