import reject from 'lodash/fp/reject'
import find from 'lodash/fp/find'
import store from 'src/vuex/store'

export const UPDATE_PERIOD = 10000
let updates = []

export const registerUpdate = function (update) {
  if (!find({ id: update.id }, updates)) {
    updates.push(update)
  }
}

export const unregisterUpdate = function (updateId) {
  updates = reject({ id: updateId }, updates)
}

export const initUpdateTicker = function () {
  window.setTimeout(runAllUpdates, UPDATE_PERIOD)
}

const runAllUpdates = function () {
  updates.forEach(update => {
    if (update.type === 'FUNCTION') {
      update.func()
    } else if (update.type === 'ACTION') {
      store.dispatch(update.name, update.payload)
    }
  })
  window.setTimeout(runAllUpdates, UPDATE_PERIOD)
}
