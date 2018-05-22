<template>
  <div>
  <selection-list
    :active="active"
    :items="items"
    :item-active="itemActive"
    :active-visible="itemActiveVisible"
    :title="descriptionMain"
    :title-above="descriptionAbove"
    :title-below="descriptionBelow"
    :svg-id="descriptionSvgId"
    :back-visible="backVisible"
    :back-active="backActive"
    :clear-visible="clearVisible"
    :clear-active="clearActive"
    :clear-text="clearText"
    :theme="theme"
    :transition-type="transitionType"
    :handle-click-list-item="handleClickListItem"
    :handle-click-back="handleClickBack"
    :handle-click-clear="handleClickClear"
  />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import SelectionList from 'components/SelectionList'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'
import HistoryManager from 'mixins/HistoryManager'
import { emitKeyPress } from 'helpers/keyHold'
import makeDialogDefinitions from './dialogDefinitions'

export default {
  name: 'TwoSidedDialog_i',
  mixins: [ RegisterKeyHandler, HistoryManager ],
  components: {
    SelectionList
  },
  data: () => ({
    dialogName: null,
    active: true,
    items: null,
    itemActive: null,
    itemActiveVisible: null,
    callback: null,
    descriptionMain: null,
    descriptionAbove: null,
    descriptionBelow: null,
    descriptionSvgId: null,
    backVisible: null,
    backActive: null,
    clearVisible: null,
    clearActive: null,
    clearText: null,
    theme: null,
    transitionType: null,
    activeSection: null,
    leftBackActive: false,
    editDialog: false
  }),
  watch: {
    '$route' (to, from) {
      this.doHistorySave()
      this.beforeMountHistoryLogic()
      this.init({ store: this.$store })
    }
  },
  created () {
    this.init(this)
  },
  computed: {
    // ...mapState({ //
    //   // active: state => state.twoSidedDialog.active,
    //   items: state => state.twoSidedDialog.items,
    //   itemActive: state => state.twoSidedDialog.itemActive,
    //   itemActiveVisible: state => state.twoSidedDialog.itemActiveVisible,
    //   callback: state => state.twoSidedDialog.callback,
    //   descriptionMain: state => state.twoSidedDialog.descriptionMain,
    //   descriptionAbove: state => state.twoSidedDialog.descriptionAbove,
    //   descriptionBelow: state => state.twoSidedDialog.descriptionBelow,
    //   descriptionSvgId: state => state.twoSidedDialog.descriptionSvgId,
    //   backVisible: state => state.twoSidedDialog.backVisible,
    //   backActive: state => state.twoSidedDialog.backActive,
    //   clearVisible: state => state.twoSidedDialog.clearVisible,
    //   clearActive: state => state.twoSidedDialog.clearActive,
    //   clearText: state => state.twoSgit idedDialog.clearText,
    //   theme: state => state.twoSidedDialog.theme,
    //   transitionType: state => state.twoSidedDialog.transitionType,
    //   activeSection: state => state.twoSidedDialog.activeSection
    // })
    ...mapState({
      inputActive: state => state.inputScreen.active
    })
  },
  methods: {
    init () {
      let dialogDefinitions = makeDialogDefinitions()

      let bindData = function (definition) {
        this.items = definition.items
        this.itemActive = definition.itemActive
        this.itemActiveVisible = definition.itemActiveVisible
        this.callback = definition.callback
        this.descriptionMain = definition.descriptionMain
        this.descriptionAbove = definition.descriptionAbove // loc(definition.descriptionAbove)
        this.descriptionBelow = definition.descriptionBelow // loc(definition.descriptionBelow)
        this.descriptionSvgId = definition.descriptionSvgId
        this.backVisible = definition.backVisible
        this.backActive = definition.backActive
        this.clearVisible = definition.clearVisible
        this.clearActive = definition.clearActive
        this.clearText = definition.clearText
        this.theme = definition.theme
        this.transitionType = definition.transitionType
        this.activeSection = definition.activeSection
        this.leftBackActive = definition.leftBackActive
        this.editDialog = definition.editDialog

        if (this.editDialog) {
          this.clearVisible = true
          this.backVisible = false
        }
      }
      bindData = bindData.bind(this)

      this.dialogName = this.$route.params.dialogType
      let definition = dialogDefinitions[this.dialogName]
      if (typeof definition.initDeclarative === 'function') {
        definition.initDeclarative({ store: this.$store, bindData: bindData, self: this })
      }
      bindData(definition)
      // this.items[this.itemActive].selected = true
    },
    moveRight () {
      // const currentActiveIndex = st.itemActive
      // if (st.items[st.itemActive].children) {
      //   const newActiveIndex = findIndex('selected', st.items[st.itemActive].children)
      //   state.activeIds.push(st.items[currentActiveIndex].id)
      //   store.commit('twoSidedDialog/SET_ITEMS', updateItems())
      //   store.commit('twoSidedDialog/SET_ITEM_ACTIVE', setItemActiveIndex(newActiveIndex))
      //   // this.transitionType = 'right'
      // } else {
      //   const newActiveIds = clone(state.activeIds)
      //   newActiveIds.push(st.items[currentActiveIndex].id)
      //   // store.commit('twoSidedDialog/SET_ITEMS', updateItems())
      //   if (state.preCallback !== undefined) {
      //     // await state.preCallback(newActiveIds)
      //   }
      //   hideSelection()
      //   state.callback(newActiveIds)
      // }
    },
    moveLeft () {
      // const parentOfCurrent = st.items[st.itemActive].parent
      // if (parentOfCurrent !== undefined) {
      //   state.activeIds.pop()
      //   store.commit('twoSidedDialog/SET_ITEMS', updateItems())
      //   store.commit('twoSidedDialog/SET_ITEM_ACTIVE', findIndex({ id: parentOfCurrent }, st.items))
      // } else {
      //   focusBackOrHideSelection()
      // }
      // // this.transitionType = 'left'
    },
    changeActiveItem (direction) {
      if (this.itemActive === 0 && this.clearVisible && direction === 'UP') {
        this.activeSection = 'clear'
        this.clearActive = true
      } else if (this.activeSection === 'clear' && direction === 'DOWN') {
        this.activeSection = 'list'
        this.clearActive = false
      } else {
        const offset = direction === 'UP' ? -1 : 1
        const index = Math.min(Math.max(this.itemActive + offset, 0), this.items.length - 1)
        this.itemActive = index
        // updateDescription()
      }
    },
    handleKey (key) {
      switch (key) {
        case 'OK':
          if (this.activeSection === 'list') {
            this.items[this.itemActive].goTo({ router: this.$router, store: this.$store })
          } else if (this.activeSection === 'clear') {
            this.doHistoryBack()
          } else if (this.activeSection === 'back') {
            this.doHistoryBack()
          }
          break
        case 'DOWN_HOLD':
        case 'UP_HOLD':
          key = key.replace('_HOLD', '')
          if (emitKeyPress({ delay: 200 })) {
            this.changeActiveItem(key)
          }
          break
        case 'HOLD_STOP':
          break
        case 'UP':
        case 'DOWN':
          if (this.activeSection !== 'back') {
            this.changeActiveItem(key)
          }
          break
        case 'RIGHT':
          if (this.activeSection === 'list') {
            // this.moveRight()
            if (!this.editDialog) {
              this.items[this.itemActive].goTo({ router: this.$router, store: this.$store })
            }
          } else if (this.activeSection === 'back') {
            this.activeSection = 'list'
            this.backActive = false
          }
          break
        case 'LEFT':
          if (this.activeSection === 'list' && this.backVisible) {
            // this.moveLeft()
            this.activeSection = 'back'
            this.backActive = true
          } else if (this.activeSection === 'back') {
            if (this.leftBackActive) { this.doHistoryBack() }
          }
          break
        case 'BACK':
          this.doHistoryBack()
          // this.activeSection === 'list' ? this.moveLeft() : hideSelectionWithCallback()
          break
      }
    },
    handleClickListItem ($event) {
      this.items[$event].goTo({ router: this.$router, store: this.$store })
    },
    handleClickBack () { this.doHistoryBack() },
    handleClickClear () { this.doHistoryBack() }

  }
}
</script>
