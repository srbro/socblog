import store from 'src/vuex/store'
import { initCheckReminders } from 'sections/Reminders/remindersChecker'
import { getImage } from 'helpers/image'
import find from 'lodash/fp/find'
import pick from 'lodash/fp/pick'
import { sendLogToSentry, e as consoleError } from 'helpers/logger'

import tvLogoDefaultImage from 'assets/images/placeholders/lending_page_logo_300x168.png'
import tvEventDefaultImage from 'assets/images/placeholders/landing_page_event_300x168.png'
import radioDefaultImage from 'assets/images/placeholders/radio_placeholder_300x168.png'
import bannersDefaultImage from 'assets/images/placeholders/landing_page_banner_650x366.png'
import vodPosterImage from 'assets/images/placeholders/vod_poster_placeholder_248x366.png'
import vodBannerImage from 'assets/images/placeholders/vod_banner_650x366.png'
import vodCatalogueImage from 'assets/images/placeholders/vod_event_300x168.png'

// eslint-disable-next-line no-unused-vars
import { OFFSET_LEFT, getCategory, getRadioCategory } from 'helpers/oneliners'
import { currentEventProgress, formatShortDateCard, formatTime } from 'helpers/time'

import { loc } from 'helpers/localization'

// eslint-disable-next-line no-unused-vars
import { bannerClick, nowtvClick, vodClick, vodFavClick, nowTvFavClick, catalogueClick, radioClick, continueClick } from 'helpers/landingActions'

export async function loadData () {
  return Promise.all([
    store.dispatch('corePlayer/fetchPlayerInfo'),
    store.dispatch('settings/fetchSettings'),
    store.dispatch('general/fetchEventCategories'),
    store.dispatch('general/fetchChannels'),
    store.dispatch('vod/fetchForSelectionCCGSF'),
    store.dispatch('reminders/fetchRemindersData'),
    store.dispatch('favorites/initFavoriteLists'),
    store.dispatch('servers/fetchServers'),
    store.dispatch('networking/updateLocalIp')
    // store.dispatch('epg/fetchCurrentEvents',
    //   0,
    //   'RECOMMENDED',
    //   {
    //     channelType: 'TV',
    //     page: 0,
    //     size: 1000
    //   }
    // )
  ]).then(() => {
    store.dispatch('globalActions/playFirstChannel')
    store.dispatch('landingPage/fetchLandingPageData')
    store.dispatch('vod/fetchLandingPage')
    store.dispatch('eventFavorites/fetchFavoritesData')
    store.dispatch('epg/fetchAgeRatingCache')
    initCheckReminders()
    return 'ok'
  }).catch((e) => {
    consoleError(`DATA loadData Error caught` + e.stack)
    sendLogToSentry('data - loadData')
    return e.toString()
  })
}

export async function reloadData () {
  return Promise.all([
    store.dispatch('corePlayer/fetchPlayerInfo'),
    store.dispatch('general/fetchChannels'),
    store.dispatch('vod/fetchForSelectionCCGSF')
  ]).catch((e) => {
    console.log('DATA loadData Error caught')
    return e.toString()
  })
}

export const convertStoredData = (value, type) => {
  switch (type) {
    case 'number':
      value = parseInt(value, 10)
      break
    case 'boolean':
      value = value === 'true'
      break
    case 'object':
      value = JSON.parse(value)
      break
  }
  return value
}
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////**** Landing page data parser *****/////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
const click = (params) => { store.dispatch('clicker/click', params) }

export const getExtractor = (id) => {
  const IMG_SMALL = 'STB_FHD'
  const IMG_LARGE = 'STB_XL'
  const TYPE_VOD_POSTER = 'VOD_POSTER_21_31'
  const TYPE_EVENT = 'EVENT_16_9'
  const TYPE_LOGO = 'LOGO_16_9'
  const TYPE_BANNER = 'LANDING_PAGE_STB_16_9'
  const TYPE_APPLICATION = 'APPLICATION'
  const MODE_CATALOGUE = 'WEB_STB'

  let extractors = {
    'BANNER': ({theme, rowIndex}) => ({
      cardType: 'banner',
      cardWidth: -1,
      height: { closed: 310, open: 650 },
      mapCallback: (banner, index) => ({
        firstRowText: banner.title,
        secondRowText: banner.shortDescription ? banner.shortDescription : `${banner.year ? banner.year + ' | ' : ''} ${banner.categoryId ? getCategory('event', banner.categoryId).name : ''}`,
        imageUrl: getImage(banner.images, IMG_SMALL, TYPE_BANNER, theme === 'light' ? bannersDefaultImage : vodBannerImage),
        backgroundImageUrl: getImage(banner.images, IMG_LARGE, TYPE_BANNER, bannersDefaultImage),
        logo: getImage(banner.channelLogos, IMG_SMALL, TYPE_LOGO, ''),
        // width: calculateBannerWidth(banner, 366),
        width: 650,
        click: bannerClick,
        doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
        // subtitle: banner.shortDescription ? banner.shortDescription : `${banner.year ? banner.year + ' | ' : ''} ${banner.categoryId ? getCategory('event', banner.categoryId).name : ''}`,
        ...pick(['type', 'id', 'title', 'description', 'externalId', 'longDescription'], banner)
      })
    }),
    'RADIO': ({theme, rowIndex}) => ({
      cardType: 'radio',
      cardWidth: 300,
      height: { closed: 150, open: 428 },
      title: loc('home_radio'),
      mapCallback: (channel, index) => ({
        firstRowText: channel.name,
        secondRowText: (channel.categories.length > 0) ? getCategory('radio', find('primary')(channel.categories).id).name : NaN,
        imageUrl: getImage(channel.images, IMG_SMALL, TYPE_LOGO, radioDefaultImage),
        // subtitle: (channel.categories.length > 0) ? getCategory('radio', find('primary')(channel.categories).id).name : NaN,
        // title: channel.name,
        click: radioClick,
        doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
        ...pick(['id', 'name'], channel)
      })
    }),
    'LIVE': ({theme, rowIndex}) => ({
      cardType: 'nowtv',
      cardWidth: 300,
      height: { closed: 288, open: 554 },
      title: loc('home_nowontv'),
      mapCallback: (event, index) => {
        return {
          logoUrl: getImage(event.channelLogos, IMG_SMALL, TYPE_LOGO, tvLogoDefaultImage),
          imageUrl: getImage(event.images, IMG_SMALL, TYPE_EVENT, tvEventDefaultImage),
          type: 'nowtv',
          id: event.id,
          channelId: event.channelId,
          startTime: new Date().getTime(),
          firstRowText: event.title,
          secondRowText: event.startTime !== null && event.endTime !== null ? `${formatShortDateCard(event.startTime)} // ${formatTime(event.startTime)} - ${formatTime(event.endTime)}` : '',
          click: nowtvClick,
          doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
          progress: currentEventProgress(event.startTime, event.endTime),
          ...pick(['id', 'firstRowText', 'secondRowText'], event)
        }
      }
    }),
    'VOD': ({theme, rowIndex}) => ({
      cardType: 'vod',
      cardWidth: 248,
      height: { closed: 310, open: 622 },
      background: '#3c3c3c',
      theme: 'dark',
      title: loc('home_ondemand'),
      mapCallback: (vodItem, index) => ({
        firstRowText: vodItem.title,
        secondRowText: String(vodItem.year),
        subtitle: String(vodItem.year),
        imageUrl: getImage(vodItem.images, IMG_SMALL, TYPE_VOD_POSTER, vodPosterImage),
        click: vodClick,
        doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
        ...pick(['id', 'title'], vodItem)
      })
    }),
    'VIRTUAL_CATALOGUE_VOD': ({theme, rowIndex}) => ({
      cardType: 'vod',
      cardWidth: 248,
      height: { closed: 310, open: 622 },
      // background: '#3c3c3c',
      theme: 'dark',
      // title: loc('home_ondemand'),
      mapCallback: (vodItem, index) => ({
        firstRowText: vodItem.title,
        secondRowText: String(vodItem.year),
        subtitle: String(vodItem.year),
        imageUrl: getImage(vodItem.images, IMG_SMALL, TYPE_VOD_POSTER, vodPosterImage),
        click: vodClick,
        doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
        ...pick(['id', 'title'], vodItem)
      })
    }),
    'CATALOGUE': ({theme, rowIndex}) => ({
      cardType: 'catalogue',
      cardWidth: 300,
      height: { closed: 150, open: 284 },
      // title: loc('ondemand_categories'),
      mapCallback: (catalogue, index) => ({
        imageUrl: getImage(catalogue.images, null, TYPE_APPLICATION, vodCatalogueImage, MODE_CATALOGUE),
        click: catalogueClick,
        doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
        ...pick(['id', 'sort', 'categoryId', 'genreId'], catalogue)
      })
    }),
    'APP': ({theme, rowIndex}) => ({
      cardType: 'catalogue',
      cardWidth: 300,
      height: { closed: 150, open: 284 },
      mapCallback: (catalogue, index) => ({
        imageUrl: getImage(catalogue.images, null, TYPE_APPLICATION, vodCatalogueImage, MODE_CATALOGUE),
        click: catalogueClick,
        doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
        ...pick(['id', 'sort', 'categoryId', 'genreId'], catalogue)
      })
    }),
    'FAVORITES_VOD': ({theme, rowIndex}) => ({
      cardType: 'vod',
      cardWidth: 248,
      height: { closed: 310, open: 622 },
      background: '#FFF',
      theme: 'vod-light ',
      mapCallback: (vodItem, index) => ({
        firstRowText: vodItem.title,
        secondRowText: String(vodItem.year),
        // subtitle: String(vodItem.year),
        imageUrl: getImage(vodItem.images, IMG_SMALL, TYPE_VOD_POSTER, vodCatalogueImage),
        click: vodFavClick,
        categories: vodItem.categoryIds,
        doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
        progress: vodItem.watchProgress / vodItem.duration,
        ...pick(['id', 'title'], vodItem)
      })
    }),
    'FAVORITES_LIVE': ({theme, rowIndex}) => ({
      cardType: 'nowtv',
      cardWidth: 300,
      height: { closed: 278, open: 554 },
      mapCallback: (event, index) => {
        return {
          firstRowText: event.title,
          secondRowText: `${formatShortDateCard(event.startTime)} // ${formatTime(event.startTime)} - ${formatTime(event.endTime)}`,
          logoUrl: getImage(event.channelLogos, IMG_SMALL, TYPE_LOGO, tvLogoDefaultImage),
          imageUrl: getImage(event.images, IMG_SMALL, TYPE_EVENT, tvEventDefaultImage),
          type: 'nowtv',
          id: event.id,
          channelId: event.channelId,
          startTime: new Date().getTime(),
          click: nowTvFavClick,
          doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
          cutvEnabled: event.cutvEnabled,
          progress: currentEventProgress(event.startTime, event.endTime),
          ...pick(['id', 'title', 'subtitle'], event)
        }
      }
    }),
    'CONTINUE_WATCHING': ({theme, rowIndex}) => ({
      cardType: 'catchup',
      cardWidth: 300,
      height: { closed: 150, open: 428 },
      theme: 'dark',
      title: loc('ondemand_landingpage_continuewatching'),
      mapCallback: (vodItem, index) => {
        return {
          firstRowText: vodItem.title,
          secondRowText: String(vodItem.year),
          // subtitle: String(vodItem.year),
          imageUrl: getImage(vodItem.images, IMG_SMALL, TYPE_EVENT, vodCatalogueImage),
          click: continueClick,
          doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
          progress: vodItem.watchProgress / vodItem.duration,
          ...pick(['id', 'title'], vodItem)
        }
      }
    })
  }

  extractors['CATALOGUE_VOD'] = extractors.VOD
  extractors['VIRTUAL_CATALOGUE'] = extractors['CATALOGUE'] = extractors.APP

  return extractors[id]
}

export const parseLandingPageData = ({ data, vodOption }) => {
  return data
    .filter(row => row.type !== 'APP' && row.type !== 'CONTINUE_WATCHING')
    .filter(row => (vodOption || (row.type !== 'VOD' && row.type !== 'FAVORITES_VOD')) && row.items.length !== 0)
    .map((row, index) => {
      const config = getExtractor(row.type)({ theme: 'light', rowIndex: index })
      let cards = row.items.map(config.mapCallback)

      if (cards.length > 4 && row.type !== 'BANNER' && row.type !== 'CATALOGUE' && row.type !== 'VIRTUAL_CATALOGUE' && row.type !== 'CONTINUE_WATCHING') {
        cards = cards.slice(0, 6).concat([{
          id: 'SEE_ALL',
          type: config.cardType,
          click: cards[0].click,
          doClick: () => { click({ id: `${row.type}_${index}_4`, className: row.type, params: { rowIndex: index, index: 6, seeAll: true } }) },
          theme: 'light'
        }])
      }
      if (row.type === 'VIRTUAL_CATALOGUE_VOD') {
        if (row.categoryId === 202) {
          row.title = loc('ondemand_landingpage_recentlyaddedseries')
        }
        if (row.categoryId === 201) {
          row.title = loc('ondemand_landingpage_recentlyaddedmovies')
        }
        if (row.categoryId === 203) {
          row.title = loc('ondemand_landingpage_recentlyaddedkids_title')
        }
      }

      return {
        title: row.type !== 'BANNER' && row.type !== 'CATALOGUE' && row.type !== 'VIRTUAL_CATALOGUE' ? row.title : '',
        ...pick(['height', 'cardType', 'cardWidth', 'background', 'theme', 'title'], config),
        cards,
        count: row.type !== 'BANNER' ? row.items.length : null,
        blockSlide: row.blockSlide,
        categoryId: row.categoryId
      }
    })
}
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
