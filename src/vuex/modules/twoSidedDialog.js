export default {
  namespaced: true,
  state: {
    active: false,
    items: [],
    itemActive: 0,
    itemActiveVisible: true,
    descriptionMain: '',
    descriptionAbove: '',
    descriptionBelow: '',
    descriptionSvgId: '',
    backVisible: false,
    backActive: false,
    clearVisible: false,
    clearActive: false,
    clearText: 'Clear selection',
    questionVisible: false,
    questionText: 'Do you want to proceed?',
    theme: 'dark',
    transitionType: 'default',
    type: 'default',
    lastKey: '',
    handleClickListItem: () => {},
    handleClickBack: () => {},
    handleClickClear: () => {}
    // speedTSpeed: ''
  },
  actions: {
    toggle ({ commit }, {
      active,
      items,
      itemActive,
      itemActiveVisible,
      descriptionMain,
      descriptionAbove,
      descriptionBelow,
      descriptionSvgId,
      backVisible,
      backActive,
      clearVisible,
      clearActive,
      clearText,
      questionVisible,
      questionText,
      theme,
      transitionType,
      type,
      handleClickListItem,
      handleClickBack,
      handleClickClear
    }) {
      commit(active ? 'SET_ACTIVE_ON' : 'SET_ACTIVE_OFF')
      commit('SET_ITEMS', items)
      commit('SET_ITEM_ACTIVE', itemActive)
      commit('SET_ITEM_ACTIVE_VISIBLE', itemActiveVisible)
      commit('SET_DESCRIPTION_MAIN', descriptionMain)
      commit('SET_DESCRIPTION_ABOVE', descriptionAbove)
      commit('SET_DESCRIPTION_BELOW', descriptionBelow)
      commit('SET_DESCRIPTION_SVG_ID', descriptionSvgId)
      commit('SET_BACK_VISIBLE', backVisible)
      commit('SET_BACK_ACTIVE', backActive)
      commit('SET_CLEAR_VISIBLE', clearVisible)
      commit('SET_CLEAR_ACTIVE', clearActive)
      commit('SET_CLEAR_TEXT', clearText)
      commit('SET_QUESTION_VISIBLE', questionVisible)
      commit('SET_QUESTION_TEXT', questionText)
      commit('SET_THEME', theme)
      commit('SET_TRANSITION_TYPE', transitionType)
      commit('SET_TYPE', type)
      commit('SET_HANDLE_CLICK_LIST_ITEMS', handleClickListItem)
      commit('SET_HANDLE_CLICK_BACK', handleClickBack)
      commit('SET_HANDLE_CLICK_CLEAR', handleClickClear)
    }
  },
  mutations: {
    SET_ACTIVE_ON (state) { state.active = true },
    SET_ACTIVE_OFF (state) { state.active = false },
    SET_ITEMS (state, newItems) { state.items = Object.freeze(newItems) },
    SET_ITEM_ACTIVE (state, newItemActive) { state.itemActive = newItemActive },
    SET_ITEM_ACTIVE_VISIBLE (state, newItemActiveVisible) { state.itemActiveVisible = newItemActiveVisible },
    SET_DESCRIPTION_MAIN (state, newDescriptionMain) { state.descriptionMain = newDescriptionMain },
    SET_DESCRIPTION_ABOVE (state, newDescriptionAbove) { state.descriptionAbove = newDescriptionAbove },
    SET_DESCRIPTION_BELOW (state, newDescriptionBelow) { state.descriptionBelow = newDescriptionBelow },
    SET_DESCRIPTION_SVG_ID (state, newDescriptionSvgId) { state.descriptionSvgId = newDescriptionSvgId },
    SET_BACK_VISIBLE (state, newBackVisible) { state.backVisible = newBackVisible },
    SET_BACK_ACTIVE (state, newBackActive) { state.backActive = newBackActive },
    SET_CLEAR_VISIBLE (state, newClearVisible) { state.clearVisible = newClearVisible },
    SET_CLEAR_ACTIVE (state, newClearActive) { state.clearActive = newClearActive },
    SET_CLEAR_TEXT (state, newClearText) { state.clearText = newClearText },
    SET_QUESTION_VISIBLE  (state, newQuestionVisible) { state.questionVisible = newQuestionVisible },
    SET_QUESTION_TEXT (state, newQuestionText) { state.questionText = newQuestionText },
    SET_THEME (state, newTheme) { state.theme = newTheme },
    SET_TRANSITION_TYPE (state, newTransitionType) { state.transitionType = newTransitionType },
    SET_TYPE (state, newType) { state.type = newType },
    UPDATE_LAST_KEY (state, newKey) { state.lastKey = newKey },
    SET_HANDLE_CLICK_LIST_ITEMS (state, newHandleClick) { state.handleClickListItem = newHandleClick },
    SET_HANDLE_CLICK_BACK (state, newHandleClick) { state.handleClickBack = newHandleClick },
    SET_HANDLE_CLICK_CLEAR (state, newHandleClick) { state.handleClickClear = newHandleClick }
  }
}
