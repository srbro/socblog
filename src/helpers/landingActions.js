import store from 'src/vuex/store'
import router from 'src/router'

export const bannerClick = (banner, type, page) => {
  if (!banner.description) {
    if (banner.type === 'VOD') {
      router.push({
        name: 'VodDetail',
        params: {
          asset: {
            id: banner.externalId
          }
        }
      })
    } else if (banner.type === 'EVENT') {
      store.dispatch('epg/fetchEventDetail', {
        eventId: banner.externalId,
        noInformationData: null
      }).then((e) => {
        router.push({
          name: 'EventDetail'
        })
      })
    } else if (banner.type === 'CHANNEL') {
      router.push({
        name: 'Guide',
        params: {
          columnToFocus: 'channels',
          channelId: banner.externalId
        }
      })
    }
  } else {
    router.push({
      name: 'HomeDetail',
      params: {
        banner: {
          id: banner.externalId,
          type: banner.type,
          image: banner.backgroundImageUrl,
          title: banner.title,
          description: banner.description,
          logo: banner.logo,
          return: page
        }
      }
    })
  }
  return ''
}

export const nowtvClick = (event, type, page) => {
  if (event.id === 'SEE_ALL') {
    router.push({ name: 'NowTv' })
  } else {
    let params = {
      channelId: event.channelId,
      eventId: event.id
    }

    if (event.id === store.state.player.playingEvent.id) {
      params.checkAgeRating = false
    }

    store.commit('parentalRating/UPDATE_PLAYER_MODE', 'TV')

    store.dispatch('parentalRating/checkChannelEventAgeRating', ({
      channelId: event.channelId,
      event
    }))

    if (store.state.parentalRating.ageRating) {
      store.commit('parentalRating/UPDATE_PLAYER_REDIRECT_PARAMS', params)
      store.dispatch('parentalRating/parentalRating', ({
        event,
        forcePINEnter: true
      }))
    } else {
      router.push({
        name: 'PlayerTv',
        params
      })
    }
  }
  return ''
}
export const radioClick = (event, type, page) => {
  if (event.id === 'SEE_ALL') {
    router.push({ name: 'Radio' })
  } else {
    store.commit('parentalRating/UPDATE_PLAYER_MODE', 'RADIO')

    router.push({
      name: 'PlayerRadio',
      params: {
        channelId: event.id
        // categoryType: 'CATEGORY',
        // categoryId: 101
      }
    })
  }
  return ''
}
export const catalogueClick = (event, type, page) => {
  router.push({
    name: 'VodSeeAll',
    params: {
      pageData: {
        title: 'On Demand',
        filter: {
          catalogId: !event.categoryId && !event.genreId ? event.id : null,
          categoryId: event.categoryId,
          genreId: event.genreId,
          sort: event.sort
        },
        type: 'VOD'
      }
    }
  })
}
export const vodClick = (event, type, page, initFilters) => {
  if (event.id === 'SEE_ALL') {
    if (page === 'Home') {
      router.push({ name: 'VodLanding' })
    } else if (event.id === 'SEE_ALL' && page === 'VodLanding') {
      router.push({
        name: 'VodSeeAll',
        params: {
          pageData: {
            title: 'On Demand',
            filter: initFilters,
            type: 'VOD'
          }
        }
      })
    }
  } else {
    router.push({
      name: 'VodDetail',
      params: { asset: event }
    })
  }
  return ''
}

export const vodFavClick = (event, type, page, initFilters) => {
  if (event.id === 'SEE_ALL') {
    router.push({
      name: 'FavoritesSeeAll',
      params: {
        pageData: {
          title: 'mylibrary_favorites_ondemand',
          filter: initFilters,
          type: 'vod'
        }
      }
    })
  } else {
    if (event.categories.indexOf(208) !== -1) {
      router.push({
        name: 'EpisodeDetail',
        params: {
          seasonId: null,
          episodeId: event.id,
          asset: { imageUrl: event.imageUrl }
        }
      })
    } else {
      router.push({
        name: 'VodDetail',
        params: { asset: event }
      })
    }
  }
}

export const nowTvFavClick = (event, type, page, initFilters) => {
  if (event.id === 'SEE_ALL') {
    router.push({
      name: 'FavoritesSeeAll',
      params: {
        pageData: {
          title: 'mylibrary_favorites_tvevents',
          filter: initFilters,
          type: 'nowtv'
        }
      }
    })
  } else {
    store.dispatch('epg/fetchEventDetail', {
      eventId: event.id,
      noInformationData: null
    }).then(() => {
      router.push({
        name: 'EventDetail'
      })
    })
  }
}

export const continueClick = (event, type, page) => {
  if (type === 'catchup') {
    // router.push({
    //   name: 'VodSeeAll',
    //   params: {
    //     pageData: {
    //       title: 'Continue Watching',
    //       filter: 1,
    //       type: 'Continue'
    //     }
    //   }
    // })
    router.push({
      name: 'VodDetail',
      params: {
        asset: {
          id: event.id
        }
      }
    })
  }
  return ''
}
