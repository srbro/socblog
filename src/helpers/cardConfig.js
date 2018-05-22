import store from 'src/vuex/store'
import pick from 'lodash/fp/pick'
import find from 'lodash/fp/find'
import { getCategory } from 'helpers/oneliners'
import { currentEventProgress, formatShortDateCard, formatTime } from 'helpers/time'
import { bannerClick, nowtvClick, vodClick, vodFavClick, nowTvFavClick, catalogueClick, radioClick, continueClick } from 'helpers/landingActions'
import { getImage } from 'helpers/image'

import tvLogoDefaultImage from 'assets/images/placeholders/lending_page_logo_300x168.png'
import tvEventDefaultImage from 'assets/images/placeholders/landing_page_event_300x168.png'
import radioDefaultImage from 'assets/images/placeholders/radio_placeholder_300x168.png'
import bannersDefaultImage from 'assets/images/placeholders/landing_page_banner_650x366.png'
import vodPosterImage from 'assets/images/placeholders/vod_poster_placeholder_248x366.png'
import vodCatalogueImage from 'assets/images/placeholders/vod_event_300x168.png'
import vodBannerImage from 'assets/images/placeholders/vod_banner_650x366.png'

const IMG_SMALL = 'STB_FHD'
const IMG_LARGE = 'STB_XL'
const TYPE_VOD_POSTER = 'VOD_POSTER_21_31'
const TYPE_EVENT = 'EVENT_16_9'
const TYPE_LOGO = 'LOGO_16_9'
const TYPE_BANNER = 'LANDING_PAGE_STB_16_9'
const TYPE_APPLICATION = 'APPLICATION'

const click = (params) => { store.dispatch('clicker/click', params) }

export const getConfig = (id, theme, rowIndex) => {
  switch (id) {
    case 'BANNER':
      return {
        cardType: 'banner',
        cardWidth: -1,
        height: { closed: 310, open: 650 },
        mapCallback: (banner, index) => ({
          imageUrl: getImage(banner.images, IMG_SMALL, TYPE_BANNER, theme === 'light' ? bannersDefaultImage : vodBannerImage),
          backgroundImageUrl: getImage(banner.images, IMG_LARGE, TYPE_BANNER, bannersDefaultImage),
          logo: getImage(banner.channelLogos, IMG_SMALL, TYPE_LOGO, ''),
          // width: calculateBannerWidth(banner, 366),
          width: 650,
          click: bannerClick,
          doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
          subtitle: banner.shortDescription ? banner.shortDescription : `${banner.year ? banner.year + ' | ' : ''} ${banner.categoryId ? getCategory('event', banner.categoryId).name : ''}`,
          ...pick(['type', 'id', 'title', 'description', 'externalId', 'longDescription'], banner)
        })
      }
    case 'RADIO':
      return {
        cardType: 'radio',
        cardWidth: 300,
        height: { closed: 150, open: 428 },
        mapCallback: (channel, index) => ({
          imageUrl: getImage(channel.images, IMG_SMALL, TYPE_LOGO, radioDefaultImage),
          subtitle: (channel.categories.length > 0) ? getCategory('radio', find('primary')(channel.categories).id).name : NaN,
          click: radioClick,
          doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
          ...pick(['id', 'name'], channel)
        })
      }
    case 'APP':
    case 'CATALOGUE':
    case 'VIRTUAL_CATALOGUE':
      return {
        cardType: 'catalogue',
        cardWidth: 300,
        height: { closed: 150, open: 284 },
        mapCallback: (catalogue, index) => ({
          imageUrl: getImage(catalogue.images, null, TYPE_APPLICATION, vodCatalogueImage, null),
          click: catalogueClick,
          oClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
          ...pick(['id', 'sort', 'categoryId', 'genreId'], catalogue)
        })
      }
    case 'LIVE':
      return {
        cardType: 'nowtv',
        cardWidth: 300,
        height: { closed: 288, open: 554 },
        mapCallback: (event, index) => {
          return {
            logoUrl: getImage(event.images, IMG_SMALL, TYPE_EVENT, tvEventDefaultImage),
            imageUrl: getImage(event.channelLogos, IMG_SMALL, TYPE_LOGO, tvLogoDefaultImage),
            ageRating: event.ageRating,
            type: 'nowtv',
            id: event.id,
            channelId: event.channelId,
            startTime: new Date().getTime(),
            subtitle: formatShortDateCard(event.startTime) + ' // ' + formatTime(event.startTime) + ' - ' + formatTime(event.endTime),
            click: nowtvClick,
            doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
            progress: currentEventProgress({ startTime: event.startTime, endTime: event.endTime }),
            ...pick(['id', 'title', 'subtitle'], event)
          }
        }
      }
    case 'CONTINUE_WATCHING':
      return {
        cardType: 'catchup',
        cardWidth: 300,
        height: { closed: 150, open: 428 },
        theme: 'dark',
        mapCallback: (vodItem, index) => {
          return {
            subtitle: String(vodItem.year),
            imageUrl: getImage(vodItem.images, IMG_SMALL, TYPE_EVENT, vodCatalogueImage),
            click: continueClick,
            progress: vodItem.watchProgress / vodItem.duration,
            ...pick(['id', 'title'], vodItem)
          }
        }
      }
    case 'VOD':
    case 'CATALOGUE_VOD':
    case 'VIRTUAL_CATALOGUE_VOD':
      return {
        cardType: 'vod',
        cardWidth: 248,
        height: { closed: 310, open: 622 },
        background: '#3c3c3c',
        theme: 'dark',
        mapCallback: (vodItem, index) => ({
          subtitle: String(vodItem.year),
          imageUrl: getImage(vodItem.images, IMG_SMALL, TYPE_VOD_POSTER, vodPosterImage),
          click: vodClick,
          ...pick(['id', 'title'], vodItem)
        })
      }
    case 'FAVORITES_VOD':
      return {
        cardType: 'vod',
        cardWidth: 248,
        height: { closed: 310, open: 622 },
        background: '#FFF',
        theme: 'vod-light ',
        mapCallback: (vodItem, index) => ({
          subtitle: String(vodItem.year),
          imageUrl: getImage(vodItem.images, IMG_SMALL, TYPE_VOD_POSTER, vodPosterImage),
          click: vodFavClick,
          doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
          ...pick(['id', 'title'], vodItem)
        })
      }
    case 'FAVORITES_LIVE':
      return {
        cardType: 'nowtv',
        cardWidth: 300,
        height: { closed: 278, open: 554 },
        mapCallback: (event, index) => {
          return {
            logoUrl: getImage(event.images, IMG_SMALL, TYPE_EVENT, tvEventDefaultImage),
            imageUrl: getImage(event.channelLogos, IMG_SMALL, TYPE_LOGO, tvLogoDefaultImage),
            ageRating: event.ageRating,
            type: 'nowtv',
            id: event.id,
            channelId: event.channelId,
            startTime: new Date().getTime(),
            subtitle: formatShortDateCard(event.startTime) + ' // ' + formatTime(event.startTime) + ' - ' + formatTime(event.endTime),
            click: nowTvFavClick,
            doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
            cutvEnabled: event.cutvEnabled,
            progress: currentEventProgress({ startTime: event.startTime, endTime: event.endTime }),
            ...pick(['id', 'title', 'subtitle'], event)
          }
        }
      }
    default:
      break
  }
}
