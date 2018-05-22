import Vue from 'vue'
import VueRouter from 'vue-router'

// import Home from 'sections/Home/_main'
import Blank from 'sections/Blank/_main'
import ChannelChange from 'sections/ChannelChange/_main'
import Favorites from 'sections/Favorites/FavoritesIndex'
import FavoritesSeeAll from 'sections/Favorites/FavoritesSeeAll'
import Guide from 'sections/Guide/_main'
import EventDetail from 'sections/Detail/EventDetail'
import HomeLanding from 'sections/Home/Landing'
import HomeDetail from 'sections/Home/Detail'
import LanguageSelection from 'sections/Startup/LanguageSelection'
import Loading from 'sections/Startup/Loading'
import NowTv from 'sections/NowTV/_main'
import OTPActivation from 'sections/Startup/OtpActivation'
import Pin from 'sections/Pin/_main'
import PlayerRadio from 'sections/Player/_radio'
import PlayerTv from 'sections/Player/_tv'
import PlayerVod from 'sections/Player/_vod'
import Radio from 'sections/Radio/_main'
import Reminders from 'sections/Reminders/_main'
import ReminderSeeAll from 'sections/Reminders/ReminderSeeAll'
import Settings from 'sections/Settings/_main'
import SettingsAbout from 'sections/Settings/About'
import SettingsAccount from 'sections/Settings/Account'
import SettingsFavorites from 'sections/Settings/Favorites/_main'
import ListsOrder from 'sections/Settings/Favorites/ListsOrder'
import SettingsLanguage from 'sections/Settings/Language'
import SettingsMiscellaneous from 'sections/Settings/Miscellaneous'
import SettingsQuality from 'sections/Settings/Quality'
import SettingsNetwork from 'sections/Settings/Network/Network'
import SettingsNetworkStatus from 'sections/Settings/Network/NetworkStatus'
import SettingsNetworkCheckConnection from 'sections/Settings/Network/NetworkCheckConnection'
import SettingsNetworkSpeedTest from 'sections/Settings/Network/SettingsNetworkSpeedTest'
import SettingsSoftware from 'sections/Settings/SettingsSoftware'
import SettingsFAQ from 'sections/Settings/SettingsFAQ'
import SettingsDebug from 'sections/Settings/SettingsDebug'
import SettingsReminders from 'sections/Settings/Reminders'
import SettingsSummary from 'sections/Settings/Summary'
import SettingsSystem from 'sections/Settings/System'
import Training from 'sections/Startup/Training'
import VodDetail from 'sections/Vod/Detail'
import VodLanding from 'sections/Vod/Landing'
import VodSeeAll from 'sections/Vod/SeeAll'
import Search from 'sections/Search/_main'
import SeasonDetail from 'sections/Vod/Series/_main'
import EpisodeDetail from 'sections/Vod/Series/EpisodeDetail'
import MyLibrary from 'sections/MyLibrary/_main'

import PageWrapper from 'sections/_pageWrapper'
import PageWrapperNav from 'sections/_pageWrapperNav'

import TwoSidedDialogOverlay from 'src/containers/twoSidedDialog_i/TwoSidedDialog_i'

Vue.use(VueRouter)
/* eslint-disable object-property-newline */
export default new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes: [
    { path: '/nav', component: PageWrapperNav, children: [
      {
        path: 'favorites/overlay',
        components: {
          default: Favorites,
          overlay: TwoSidedDialogOverlay
        },
        name: 'Overlay' },
      { path: 'home', component: HomeLanding, name: 'Home' },
      { path: 'tvchannels', component: Guide, name: 'Guide',
        beforeEnter: (to, from, next) => {
          if (to && ((route => route.name === 'PlayerTv') || (from.matched.some(route => route.name === 'HomeDetail')))) {
            to.meta.fromRoute = from.name
          } else {
            to.meta.fromRoute = null
          }
          next()
        }
      },
      { path: 'radio', component: Radio, name: 'Radio' },
      { path: 'nowtv', component: NowTv, name: 'NowTv' },
      { path: 'vod-landing', component: VodLanding, name: 'VodLanding' },
      { path: 'reminders', component: Reminders, name: 'Reminders' },
      { path: 'favorites', component: Favorites, name: 'Favorites' },
      {
        path: 'settings/overlay/:dialogType?',
        components: {
          default: Settings,
          overlay: TwoSidedDialogOverlay
        },
        name: 'SettingsTwoSidedOvelay' },
      { path: 'settings', component: Settings, name: 'Settings' },
      { path: 'blank', component: Blank, name: 'Blank' },
      { path: 'reminder-see-all', component: ReminderSeeAll, name: 'ReminderSeeAll' },
      { path: 'favorites-see-all', component: FavoritesSeeAll, name: 'FavoritesSeeAll' },
      { path: 'vod-see-all', component: VodSeeAll, name: 'VodSeeAll',
        beforeEnter: (to, from, next) => {
          to.meta.fromRoute = from.name
          next()
        }
      },
      { path: 'my-library', component: MyLibrary, name: 'MyLibrary' }
    ] },
    { path: '/no-nav', component: PageWrapper, children: [
      { path: 'search', component: Search, name: 'Search' },
      { path: 'loading', component: Loading, name: 'Loading' },
      { path: 'language-selection', component: LanguageSelection, name: 'LanguageSelection' },
      { path: 'otpactivation', component: OTPActivation, name: 'OTPActivation' },
      { path: 'training', component: Training, name: 'Training' },
      { path: 'player-tv', component: PlayerTv, name: 'PlayerTv' },
      { path: 'player-radio', component: PlayerRadio, name: 'PlayerRadio' },
      { path: 'player-vod', component: PlayerVod, name: 'PlayerVod' },
      { path: 'channel-change', component: ChannelChange, name: 'ChannelChange' },
      { path: 'pin', component: Pin, name: 'Pin',
        beforeEnter: (to, from, next) => {
          if (from.name === 'Selection') next()
          to.meta.fromRoute = from.name
          next()
        }
      },
      { path: 'settings-favorites', component: SettingsFavorites, name: 'SettingsFavorites' },
      { path: 'settings-lists-order', component: ListsOrder, name: 'ListsOrder' },
      { path: 'settings-about', component: SettingsAbout, name: 'SettingsAbout' },
      { path: 'settings-account', component: SettingsAccount, name: 'SettingsAccount' },
      { path: 'settings-language', component: SettingsLanguage, name: 'SettingsLanguage' },
      { path: 'settings-miscellaneous', component: SettingsMiscellaneous, name: 'SettingsMiscellaneous' },
      { path: 'settings-quality', component: SettingsQuality, name: 'SettingsQuality' },
      { path: 'settings-network', component: SettingsNetwork, name: 'SettingsNetwork' },
      { path: 'settings-network-status', component: SettingsNetworkStatus, name: 'SettingsNetworkStatus' },
      { path: 'settings-network-checkconnection', component: SettingsNetworkCheckConnection, name: 'SettingsNetworkCheckConnection' },
      { path: 'settings-network-speedtest', component: SettingsNetworkSpeedTest, name: 'SettingsNetworkSpeedTest' },
      { path: 'settings-software', component: SettingsSoftware, name: 'SettingsSoftware' },
      { path: 'settings-faq', component: SettingsFAQ, name: 'SettingsFAQ' },
      { path: 'settings-debug', component: SettingsDebug, name: 'SettingsDebug' },
      { path: 'settings-reminders', component: SettingsReminders, name: 'SettingsReminders' },
      { path: 'settings-summary', component: SettingsSummary, name: 'SettingsSummary' },
      { path: 'settings-system', component: SettingsSystem, name: 'SettingsSystem' },
      { path: 'event-detail', component: EventDetail, name: 'EventDetail' },
      { path: 'home-detail', component: HomeDetail, name: 'HomeDetail' },
      { path: 'vod-detail', component: VodDetail, name: 'VodDetail',
        beforeEnter: (to, from, next) => {
          to.meta.rememberSelections = from.name === 'SeasonDetail'
          next()
        }
      },
      { path: 'season-detail', component: SeasonDetail, name: 'SeasonDetail' },
      { path: 'episode-detail', component: EpisodeDetail, name: 'EpisodeDetail' }
    ] },
    { path: '/', redirect: '/no-nav/loading' }
  ]
})
