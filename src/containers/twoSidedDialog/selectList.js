import store from 'src/vuex/store'
import clone from 'lodash/fp/clone'
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'
import { loc } from 'helpers/localization'

let st
var state = {}

function initialiseState ({ values, callback, preCallback }) {
  state = {
    activeSection: 'list',
    previousActiveSection: 'list',
    activeIds: [],
    values,
    callback,
    preCallback
  }
}

function setItemActiveIndex (selected) {
  return selected > -1 ? selected : 0
}

function updateItems () {
  let newItems = clone(st.items)

  state.activeIds.forEach((id) => {
    newItems = find({ id }, newItems).children
  })

  store.commit('twoSidedDialog/SET_ITEMS', newItems)
}

function changeActiveItem (direction) {
  if (st.itemActive === 0 && st.clearVisible && direction === 'UP') {
    state.activeSection = 'clear'
    store.commit('twoSidedDialog/SET_CLEAR_ACTIVE', true)
  } else if (state.activeSection === 'clear' && direction === 'DOWN') {
    state.activeSection = 'list'
    store.commit('twoSidedDialog/SET_CLEAR_ACTIVE', false)
  } else {
    const offset = direction === 'UP' ? -1 : 1
    const index = Math.min(Math.max(st.itemActive + offset, 0), st.items.length - 1)
    store.commit('twoSidedDialog/SET_ITEM_ACTIVE', index)
    updateDescription()
  }
}

async function moveRight () {
  const currentActiveIndex = st.itemActive
  if (st.items[st.itemActive].children) {
    const newActiveIndex = findIndex('selected', st.items[st.itemActive].children)
    state.activeIds.push(st.items[currentActiveIndex].id)
    store.commit('twoSidedDialog/SET_ITEMS', updateItems())
    store.commit('twoSidedDialog/SET_ITEM_ACTIVE', setItemActiveIndex(newActiveIndex))
    // this.transitionType = 'right'
  } else {
    const newActiveIds = clone(state.activeIds)
    newActiveIds.push(st.items[currentActiveIndex].id)
    // store.commit('twoSidedDialog/SET_ITEMS', updateItems())
    if (state.preCallback !== undefined) {
      await state.preCallback(newActiveIds)
    }
    hideSelection()
    state.callback(newActiveIds)
  }
}

function moveLeft () {
  const parentOfCurrent = st.items[st.itemActive].parent
  if (parentOfCurrent !== undefined) {
    state.activeIds.pop()
    store.commit('twoSidedDialog/SET_ITEMS', updateItems())
    store.commit('twoSidedDialog/SET_ITEM_ACTIVE', findIndex({ id: parentOfCurrent }, st.items))
  } else {
    focusBackOrHideSelection()
  }
  // this.transitionType = 'left'
}

function updateDescription () {
  const description = state.values.items[st.itemActive].description || {}
  const parentDescription = state.values.description

  store.commit('twoSidedDialog/SET_DESCRIPTION_MAIN', description.title || parentDescription.title)
  store.commit('twoSidedDialog/SET_DESCRIPTION_ABOVE', description.titleAbove || parentDescription.titleAbove)
  store.commit('twoSidedDialog/SET_DESCRIPTION_BELOW', description.titleBelow || parentDescription.titleBelow)
  store.commit('twoSidedDialog/SET_DESCRIPTION_SVG_ID', description.svgId || parentDescription.svgId)
}

function clearSelection () {
  if (state.preCallback !== undefined) {
    state.preCallback([])
  }
  hideSelection()
  state.callback([])
}

function focusBackOrHideSelection () {
  if (st.backVisible) {
    state.previousActiveSection = state.activeSection
    state.activeSection = 'back'
    store.commit('twoSidedDialog/SET_BACK_ACTIVE', true)
  } else {
    hideSelectionWithCallback()
  }
}

function unfocusBack () {
  state.activeSection = state.previousActiveSection
  store.commit('twoSidedDialog/SET_BACK_ACTIVE', false)
}

function hideSelection () {
  store.commit('twoSidedDialog/SET_ACTIVE_OFF')
}

function hideSelectionWithCallback () {
  hideSelection()
  state.callback('EXIT')
}

export const handleKey = function (key) {
  switch (key) {
    case 'OK':
      if (state.activeSection === 'list') {
        moveRight()
      } else if (state.activeSection === 'clear') {
        clearSelection()
      } else if (state.activeSection === 'back') {
        hideSelectionWithCallback()
      }
      break
    case 'UP':
    case 'DOWN':
      if (state.activeSection !== 'back') {
        changeActiveItem(key)
      }
      break
    case 'DOWN_HOLD':
      if (state.activeSection !== 'back') {
        changeActiveItem('DOWN')
      }
      break
    case 'UP_HOLD':
      if (state.activeSection !== 'back') {
        changeActiveItem('UP')
      }
      break
    case 'RIGHT':
      if (state.activeSection === 'list') {
        moveRight()
      } else if (state.activeSection === 'back') {
        unfocusBack()
      }
      break
    case 'LEFT':
      if (state.activeSection === 'list') {
        moveLeft()
      }
      break
    case 'BACK':
      // state.activeSection === 'list' ? moveLeft() : hideSelectionWithCallback()
      hideSelectionWithCallback()
      break
  }
}

function handleClickListItem (index) {
  if (state.activeSection !== 'list') {
    state.activeSection = 'list'
  }
  store.commit('twoSidedDialog/SET_ITEM_ACTIVE', index)
  updateDescription()
  moveRight()
}

function handleClickBack () {
  hideSelectionWithCallback()
}

function handleClickClear () {
  clearSelection()
}

export const initialise = function ({
  values,
  itemActive = findIndex('selected', values.items),
  callback,
  preCallback,
  backVisible = false,
  backActive = false,
  clearVisible = false,
  clearText = loc('stb_settings_general_cancel'),
  questionVisible = false,
  questionText = 'Do you want to proceed?',
  theme = 'dark',
  transitionType = 'default'
}) {
  if (!values || !values.items || values.items.length === 0 || !values.description) {
    throw new Error('Incorrect parameter passed.')
  }

  st = store.state.twoSidedDialog

  initialiseState({ values, callback, preCallback })

  store.dispatch('twoSidedDialog/toggle', ({
    active: true,
    items: values.items,
    itemActive: setItemActiveIndex(itemActive),
    itemActiveVisible: true,
    backVisible,
    backActive,
    clearVisible,
    clearActive: false,
    clearText,
    questionVisible,
    questionText,
    theme,
    transitionType,
    type: 'selectList',
    handleClickListItem,
    handleClickBack,
    handleClickClear
  }))

  updateDescription()
}
