import store from 'src/vuex/store'
import { handleKey as selectListHandleKey } from 'containers/twoSidedDialog/selectList'
import { handleKey as infoListHandleKey } from 'containers/twoSidedDialog/infoList'
import { handleKey as changeListHandleKey } from 'containers/twoSidedDialog/changeList'
import { sendLogToSentry, debugConfig, i as consoleInfo } from 'helpers/logger'
import { EventBus } from 'helpers/eventBus'

export const getRegisteredHandlers = () => {
  return store.state.keyHandler.registeredHandlers
}

export const handleKey = function (key) {
  let registeredHandlers = store.state.keyHandler.registeredHandlers

  if (debugConfig.debuggingMode) {
    consoleInfo(`KEY: ${key}`)
  }

  if (typeof key === 'undefined') return

  const globallyHandled = globalHandler(key)
  if (globallyHandled) return

  if (store.state.popup.active && registeredHandlers.has('Popup')) {
    registeredHandlers.get('Popup')(key)
  } else if (store.state.inputScreen.active && registeredHandlers.has('InputScreen')) {
    registeredHandlers.get('InputScreen')(key)
  } else if (registeredHandlers.has('TwoSidedDialog_i')) {
    registeredHandlers.get('TwoSidedDialog_i')(key)
  } else if (store.state.twoSidedDialog.active) {
    if (store.state.twoSidedDialog.type === 'selectList') { selectListHandleKey(key) }
    if (store.state.twoSidedDialog.type === 'infoList') { infoListHandleKey(key) }
    if (store.state.twoSidedDialog.type === 'changeList') { changeListHandleKey(key) }
  } else if (store.state.parentalRating.active && registeredHandlers.has('ParentalRating')) {
    registeredHandlers.get('ParentalRating')(key)
  } else if (store.state.navigation.active && registeredHandlers.has('Navigation')) {
    registeredHandlers.get('Navigation')(key)
  } else if (registeredHandlers.has(store.state.route.name)) {
    registeredHandlers.get(store.state.route.name)(key)
  } else {
    sendLogToSentry('KeyHandler - lost keys')
    EventBus.$emit('register_keyhandler', store.state.route)
  }
}

const globalHandler = function (key) {
  switch (key) {
    case 'EXIT':
      store.dispatch('general/exitApp')
      return true
    default:
      return false
  }
}
