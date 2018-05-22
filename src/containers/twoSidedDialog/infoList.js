import store from 'src/vuex/store'
import clone from 'lodash/fp/clone'
import { tryActivateDebug } from 'helpers/logger'

let st
var state = {}

function initialiseState ({ values, callback, activeSection }) {
  state = clone({
    activeSection,
    values,
    callback
  })
}

function setItemActiveIndex (noOfItems) {
  return noOfItems > 0 ? Math.ceil(noOfItems / 2 - 1) : 0
}

function changeActiveItem (direction) {
  const offset = direction === 'UP' ? -1 : 1
  const index = Math.min(Math.max(st.itemActive + offset, 0), st.items.length - 1)
  store.commit('twoSidedDialog/SET_ITEM_ACTIVE', index)
}

function changeActiveSection () {
  if (state.activeSection === 'back') {
    state.activeSection = 'list'
    store.commit('twoSidedDialog/SET_BACK_ACTIVE', false)
  } else {
    state.activeSection = 'back'
    store.commit('twoSidedDialog/SET_BACK_ACTIVE', true)
  }
}

function updateDescription () {
  const description = state.values.items[st.itemActive].description || {}
  const parentDescription = state.values.description

  store.commit('twoSidedDialog/SET_DESCRIPTION_MAIN', description.title || parentDescription.title)
  store.commit('twoSidedDialog/SET_DESCRIPTION_ABOVE', description.titleAbove || parentDescription.titleAbove)
  store.commit('twoSidedDialog/SET_DESCRIPTION_BELOW', description.titleBelow || parentDescription.titleBelow)
  store.commit('twoSidedDialog/SET_DESCRIPTION_SVG_ID', description.svgId || parentDescription.svgId)
}

function hideSelection () {
  store.commit('twoSidedDialog/SET_ACTIVE_OFF')
  state.callback('EXIT')
}

export const handleKey = function (key) {
  store.commit('twoSidedDialog/UPDATE_LAST_KEY', key)
  switch (key) {
    case 'OK':
      if (state.activeSection === 'back') {
        hideSelection()
        store.commit('twoSidedDialog/UPDATE_LAST_KEY', 'BACK')
      }
      if (store.state.route.name === 'SettingsSoftware' && state.activeSection === 'list' && tryActivateDebug()) {
        store.dispatch('popup/toggle', {
          active: true,
          data: {
            type: 'disclaimer',
            title: 'stb_settings_help_problem_debug',
            text: 'On',
            priority: 1,
            back: false,
            buttons: [
              {
                id: 'view',
                label: 'OK',
                callback: (newValue) => {
                  // this.fetchData(newState)
                }
              }
            ],
            selectedButtonIndex: 0
          }
        })
      }
      break
    case 'UP':
    case 'DOWN':
      if (state.activeSection === 'list') {
        changeActiveItem(key)
        store.commit('twoSidedDialog/UPDATE_LAST_KEY', key)
      }
      break
    case 'RIGHT':
      if (state.activeSection === 'back') {
        changeActiveSection()
        store.commit('twoSidedDialog/UPDATE_LAST_KEY', key)
      }
      break
    case 'LEFT':
    case 'BACK':
      hideSelection()
      break
  }
}

function handleClickListItem (index) {
  if (state.activeSection !== 'list') {
    state.activeSection = 'list'
  }
  store.commit('twoSidedDialog/SET_ITEM_ACTIVE', index)
  updateDescription()
}

function handleClickBack () {
  hideSelection()
  store.commit('twoSidedDialog/UPDATE_LAST_KEY', 'BACK')
}

function handleClickClear () {}

export const initialise = function ({
  values,
  itemActive,
  callback,
  theme,
  backActive = true,
  activeSection = 'back',
  handleClickListItemCustom
}) {
  if (!values || !values.items || values.items.length === 0 || !values.description) {
    throw Error('Incorrect parameter passed.')
  }

  st = store.state.twoSidedDialog

  initialiseState({ values, callback, activeSection })

  store.dispatch('twoSidedDialog/toggle', ({
    active: true,
    items: values.items,
    itemActive: itemActive || setItemActiveIndex(values.items.length),
    itemActiveVisible: false,
    backVisible: true,
    backActive: backActive,
    clearVisible: false,
    clearActive: false,
    clearText: '',
    questionVisible: false,
    questionText: '',
    theme,
    transitionType: 'default',
    type: 'infoList',
    handleClickListItem: handleClickListItemCustom || handleClickListItem,
    handleClickBack,
    handleClickClear
  }))
  updateDescription()
}
