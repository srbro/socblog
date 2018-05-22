import Vue from 'vue'
import Vuex from 'vuex'

import auth from './modules/auth'
import corePlayer from './modules/corePlayer'
import epg from './modules/epg'
import eventFavorites from './modules/eventFavorites'
import favorites from './modules/favorites'
import general from './modules/_general'
import guide from './modules/guide'
import history from './modules/history'
import inputScreen from './modules/inputScreen'
import keyboard from './modules/keyboard'
import landingPage from './modules/landingPage'
import navigation from './modules/navigation'
import networking from './modules/networking'
import nowtv from './modules/nowTv'
import parentalRating from './modules/parentalRating'
import playbackMessage from './modules/playbackMessage'
import player from './modules/player'
import popup from './modules/popup'
import reminders from './modules/reminders'
import search from './modules/search'
import servers from './modules/servers'
import settings from './modules/settings'
import software from './modules/software'
import twoSidedDialog from './modules/twoSidedDialog'
import vod from './modules/vod'
import clicker from './modules/clicker'
import playerEvents from './modules/playerEvents'
import globalActions from './modules/globalActions'
import keyHandler from './modules/keyHandler'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    auth,
    corePlayer,
    epg,
    eventFavorites,
    favorites,
    general,
    guide,
    history,
    inputScreen,
    keyboard,
    landingPage,
    navigation,
    networking,
    nowtv,
    parentalRating,
    playbackMessage,
    player,
    popup,
    reminders,
    search,
    servers,
    settings,
    software,
    twoSidedDialog,
    vod,
    clicker,
    playerEvents,
    globalActions,
    keyHandler
  },
  strict: process.env.NODE_ENV !== 'production'
})
