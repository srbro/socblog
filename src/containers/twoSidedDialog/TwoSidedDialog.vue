<template>
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
    :question-visible="questionVisible"
    :question-text="questionText"
    :theme="theme"
    :transition-type="transitionType"
    :handle-click-list-item="handleClickListItem"
    :handle-click-back="handleClickBack"
    :handle-click-clear="handleClickClear"
  />
</template>

<script>
import { mapState } from 'vuex'
import SelectionList from 'components/SelectionList'

export default {
  name: 'twoSidedDialog',
  components: {
    SelectionList
  },
  computed: {
    ...mapState({
      active: state => state.twoSidedDialog.active,
      items: state => state.twoSidedDialog.items,
      itemActive: state => state.twoSidedDialog.itemActive,
      itemActiveVisible: state => state.twoSidedDialog.itemActiveVisible,
      callback: state => state.twoSidedDialog.callback,
      descriptionMain: state => state.twoSidedDialog.descriptionMain,
      descriptionAbove: state => state.twoSidedDialog.descriptionAbove,
      descriptionBelow: state => state.twoSidedDialog.descriptionBelow,
      descriptionSvgId: state => state.twoSidedDialog.descriptionSvgId,
      backVisible: state => state.twoSidedDialog.backVisible,
      backActive: state => state.twoSidedDialog.backActive,
      clearVisible: state => state.twoSidedDialog.clearVisible,
      clearActive: state => state.twoSidedDialog.clearActive,
      clearText: state => state.twoSidedDialog.clearText,
      questionVisible: state => state.twoSidedDialog.questionVisible,
      questionText: state => state.twoSidedDialog.questionText,
      theme: state => state.twoSidedDialog.theme,
      transitionType: state => state.twoSidedDialog.transitionType,
      handleClickListItem: state => state.twoSidedDialog.handleClickListItem,
      handleClickBack: state => state.twoSidedDialog.handleClickBack,
      handleClickClear: state => state.twoSidedDialog.handleClickClear
    })
  }
}
</script>
