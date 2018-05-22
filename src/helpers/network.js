
import store from 'src/vuex/store'
import { loc } from 'helpers/localization'

export const networkChange = (networkStatus) => {
  try {
    const result = JSON.parse(networkStatus)
    if (!result) {
      store.dispatch('popup/toggle', {
        active: true,
        data: {
          type: 'reminder',
          title: loc('stb_loading_error_networkerror'),
          text: loc('stb_settings_systempreferences_network_checkconnection'),
          priority: 1,
          back: false,
          networkCheck: true,
          // buttons: [
          //   {
          //     id: 'view',
          //     label: loc('stb_login_activation_errormessage_action_retry'),
          //     callback (newValue) {
          //       exitApp()
          //     }
          //   }
          // ],
          selectedButtonIndex: 0
        }
      })
    } else {
      // const previousNetworkState = store.getters['popup/getActiveState']
      const isNetworkPopup = store.getters['popup/getNetworkPopup']
      if (isNetworkPopup && store.state.popup.data.length > 1) store.dispatch('popup/removeSinglePopup', isNetworkPopup)
      else if (isNetworkPopup && store.state.popup.data.length === 1) store.dispatch('popup/toggle', {active: false})
    }
  } catch (err) {
    console.error('ERROR onNetworkCheck: ' + err)
  }
}
