import { loc } from 'helpers/localization'
import store from 'store'
import { exitApp } from 'hal'

export const blockUi = function () {
  store.dispatch('popup/toggle', {
    active: true,
    data: {
      priority: 0,
      back: false,
      type: 'reminder',
      title: loc('forced_update_title'),
      text: loc('forced_update_description'),
      buttons: [
        {
          id: 'exitApp',
          label: loc('forced_update_button_exit'),
          callback: () => { exitApp() }
        }
      ],
      selectedButtonIndex: 0
    }
  })
}
