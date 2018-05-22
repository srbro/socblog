import store from 'src/vuex/store'
import clone from 'lodash/fp/clone'
import find from 'lodash/fp/find'
import findIndex from 'lodash/fp/findIndex'

let st

var state = {}

function initialiseState () {
  state = clone({
    activeSection: 'list',
    previousActiveSection: 'list',
    activeIds: [],
    callback: function () {}
  })
}

function updateItems () {
  let newItems = clone(st.items)

  state.activeIds.forEach((id) => {
    newItems = find({ id }, newItems).children
  })

  store.commit('twoSidedDialog/SET_ITEMS', newItems)
}

function setCurrentActiveIndex (selected) {
  return selected > -1 ? selected : 0
}

function changeActiveItem (direction) {
  if (st.itemActive === 0 && st.clearVisible && direction === 'UP') {
    state.activeSection = 'clear'
    store.commit('twoSidedDialog/SET_CLEAR_ACTIVE', true)
    return
  }
  if (state.activeSection === 'clear' && direction === 'DOWN') {
    state.activeSection = 'list'
    store.commit('twoSidedDialog/SET_CLEAR_ACTIVE', false)
    return
  }

  const offset = direction === 'UP' ? -1 : 1
  const index = Math.min(Math.max(st.itemActive + offset, 0), st.items.length - 1)
  store.commit('twoSidedDialog/SET_ITEM_ACTIVE', index)
}

function moveRight () {
  const currentActiveIndex = st.itemActive
  if (st.items[st.itemActive].children) {
    const newActiveIndex = findIndex('selected', st.items[st.itemActive].children)
    state.activeIds.push(st.items[currentActiveIndex].id)
    store.commit('twoSidedDialog/SET_ITEM_ACTIVE', setCurrentActiveIndex(newActiveIndex))
    updateItems()
    // this.transitionType = 'right'
  } else {
    let newActiveIds = clone(state.activeIds)
    newActiveIds.push(st.items[currentActiveIndex].id)
    // updateItems()
    // hideSelection()
    moveLeft()
    state.callback(newActiveIds)
  }
}

function moveLeft () {
  const parentOfCurrent = st.items[st.itemActive].parent
  if (parentOfCurrent !== undefined) {
    state.activeIds.pop()
    updateItems()
    store.commit('twoSidedDialog/SET_ITEM_ACTIVE', findIndex({ id: parentOfCurrent }, st.items))
  } else {
    focusBackOrHideSelection()
  }
  // this.transitionType = 'left'
}

function clearSelection () {
  hideSelection()
  state.callback([])
}

function focusBackOrHideSelection () {
  if (st.showBackButton) {
    state.previousActiveSection = state.activeSection
    state.activeSection = 'back'
  } else {
    hideSelection()
  }
}

function hideSelection () {
  store.commit('twoSidedDialog/SET_ACTIVE_OFF')
}

function pressOK () {
  const currentActiveIndex = st.itemActive
  let newActiveIds = clone(state.activeIds)
  newActiveIds.push(st.items[currentActiveIndex].id)
  state.callback(newActiveIds)
}

export const handleKey = function (key) {
  switch (key) {
    case 'OK':
      if (state.activeSection === 'list') {
        // moveRight()
        pressOK()
      } else if (state.activeSection === 'clear') {
        clearSelection()
      } else if (state.activeSection === 'back') {
        hideSelection()
      }
      break
    case 'UP':
    case 'DOWN':
      changeActiveItem(key)
      break
    case 'RIGHT':
      if (state.activeSection === 'list') {
        moveRight()
      } else if (state.activeSection === 'back') {
        state.activeSection = state.previousActiveSection
      }
      break
    case 'LEFT':
      if (state.activeSection === 'list') {
        moveLeft()
      } else if (state.activeSection === 'back') {
        hideSelection()
      } else if (state.activeSection === 'clear') {
        focusBackOrHideSelection()
      }
      break
    case 'BACK':
      state.activeSection === 'list' ? moveLeft() : hideSelection()
      break
  }
}

function handleClickListItem (index) {
  if (state.activeSection !== 'list') {
    state.activeSection = 'list'
  }
  store.commit('twoSidedDialog/SET_ITEM_ACTIVE', index)
  pressOK()
}

function handleClickBack () {
  hideSelection()
}

function handleClickClear () {
  clearSelection()
}

export const initialise = function ({
  items,
  callback,
  descriptionMain,
  descriptionAbove,
  descriptionBelow,
  descriptionSvgId,
  clearText,
  theme,
  type
}) {
  st = store.state.twoSidedDialog

  const newActiveIndex = findIndex('selected', items)

  initialiseState()
  state.callback = callback

  store.dispatch('twoSidedDialog/toggle', ({
    active: true,
    items,
    itemActive: setCurrentActiveIndex(newActiveIndex),
    itemActiveVisible: true,
    descriptionMain,
    descriptionAbove,
    descriptionBelow,
    descriptionSvgId,
    backVisible: true,
    backActive: false,
    clearVisible: true,
    clearActive: false,
    clearText,
    theme,
    transitionType: 'default',
    type,
    handleClickListItem,
    handleClickBack,
    handleClickClear
  }))
}
