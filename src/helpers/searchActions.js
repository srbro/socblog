import store from 'src/vuex/store'
import router from 'src/router'

export const nowtvClick = (event, type, page) => {
  store.dispatch('epg/fetchEventDetail', {
    eventId: event.id,
    noInformationData: null
  }).then(() => {
    router.push({
      name: 'EventDetail'
    })
  })
}

export const vodClick = (event, type, page, initFilters) => {
  router.push({
    name: 'VodDetail',
    params: { asset: event }
  })
}
