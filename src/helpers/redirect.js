/* global window */

import router from 'src/router'
import store from 'src/vuex/store'
import isEmpty from 'lodash/fp/isEmpty'

export const redirectToRoute = ({ routeName, eventId, channelId }) => {
  let params = {}
  switch (routeName) {
    case 'Home':
      params = {toggleNavigation: true}
      changeRoute('Home')
      break
    case 'PlayerTv':
      changeRoute('PlayerTv')
      break
    case 'Guide':
      params = {columnToFocus: 'channels'}
      changeRoute('Guide', params)
      break
    case 'NowTv':
      params = {activeStripe: 'filters', toggleNavigation: true}
      changeRoute('NowTv', params)
      break
    case 'VodLanding':
      params = {toggleNavigation: true}
      changeRoute('VodLanding', params)
      break
    case 'Radio':
      params = {focusSection: 'filters', toggleNavigation: true}
      changeRoute('Radio', params)
      break
    case 'VodDetail':
      params = {
        asset: {
          id: eventId
        },
        historyBack: false
      }
      changeRoute('VodDetail', params)
      break
    case 'EventDetail':
      params = {
        detail: true,
        channelId,
        eventId,
        info: true,
        columnToFocus: 'DETAIL',
        movedToDetails: true
      }
      store.dispatch('epg/fetchEventDetail', ({
        eventId,
        noInformationData: null
      })).then(() => { changeRoute('Guide', params) })
      break
  }
}
const changeRoute = (routeName, params = {}) => {
  if (store.state.auth.loadingRedirectRoute === '') {
    store.commit('auth/UPDATE_FORCE_FIRST_PAGE', routeName)
    if (!isEmpty(params)) {
      store.commit('auth/UPDATE_FORCE_FIRST_PAGE_PARAMS', params)
    }
  } else {
    if (!store.state.auth.signed) return
    router.push({ name: routeName, params })
  }
}
