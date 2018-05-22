import { load, save } from 'hal'

const UI_MODE_CONFIG = {
  ADVANCED: {
    cardRowTransitionAnimation: true,
    cardRowCardTransitionAnimation: true,
    cardRowCardShadow: true,
    cardZapProgressShadow: true,
    cardRowCardProgressShadow: true,
    cardRowCardScale: true,
    pageHeaderTransitionAnimation: true,
    // Now Tv
    nowTvFilterTransitionAnimation: true,
    nowTvFilterShadow: true,
    nowTvFilterScaling: true,
    // Guide
    guideColumnTransitionAnimation: true,
    guideColumnShadow: true,
    // Radio
    radioTransitionAnimation: true,
    radioFilterTransitionAnimation: true,
    radioFilterScale: true,
    radioFilterShadow: true,
    // Main Menu Lanes
    menuLaneTransitionAnimation: true,
    menuLaneShadow: true,
    menuLaneScale: true,
    // Player
    playerTransitionAnimation: true,
    playerShadow: true,
    playerScale: true,
    channelTransitionAnimation: true,
    channelShadow: true,
    channelScale: true,
    // Settgins
    settingsTransitionAnimation: true,
    settingsShadow: true,
    settingsScale: true,
    // Buttons
    buttonsTransitionAnimation: true,
    buttonsShadow: true,
    buttonsScale: true,
    // Selection list
    selectionListTransition: true,
    // No items
    noItemsTransitionAnimation: true,
    // Arrows
    arrowsTransitionAnimation: true,
    // Reminder row
    reminderRowTransitionAnimation: true
  },
  BASIC: {
    cardRowTransitionAnimation: false,
    cardRowCardTransitionAnimation: false,
    cardRowCardShadow: false,
    cardZapProgressShadow: false,
    cardRowCardProgressShadow: false,
    cardRowCardScale: false,
    pageHeaderTransitionAnimation: false,
    // Now Tv
    nowTvFilterTransitionAnimation: false,
    nowTvFilterShadow: false,
    nowTvFilterScaling: false,
    // Guide
    guideColumnTransitionAnimation: false,
    guideColumnShadow: false,
    // Radio
    radioTransitionAnimation: false,
    radioFilterTransitionAnimation: false,
    radioFilterScale: false,
    radioFilterShadow: false,
    // Main Menu Lanes
    menuLaneTransitionAnimation: false,
    menuLaneShadow: false,
    menuLaneScale: false,
    // Player
    playerTransitionAnimation: false,
    playerShadow: false,
    playerScale: false,
    channelTransitionAnimation: false,
    channelShadow: false,
    channelScale: false,
    // Settgins
    settingsTransitionAnimation: false,
    settingsShadow: false,
    settingsScale: false,
    // Buttons
    buttonsTransitionAnimation: false,
    buttonsShadow: false,
    buttonsScale: false,
    // Selection list
    selectionListTransition: false,
    // No items
    noItemsTransitionAnimation: false,
    // Arrows
    arrowsTransitionAnimation: false,
    // Reminder row
    reminderRowTransitionAnimation: false
  }
}

const STORAGE_KEY = 'uiMode'
let activeMode = 'ADVANCED'
let uiModeCfg = UI_MODE_CONFIG[activeMode]

const saveMode = (mode) => {
  save(STORAGE_KEY, mode)
}
const getMode = () => {
  return load(STORAGE_KEY)
}

export const setUiMode = (mode) => {
  if (UI_MODE_CONFIG[mode] === undefined) {
    throw new Error('Unexisting ui-mode config.')
  }
  activeMode = mode
  uiModeCfg = UI_MODE_CONFIG[mode]
  saveMode(mode)
}

export const exposeUiMode = (name) => {
  window[name] = uiModeCfg
}

const initUiMode = () => {
  let mode = getMode()
  if (UI_MODE_CONFIG[mode]) {
    uiModeCfg = UI_MODE_CONFIG[mode]
  }
}

initUiMode()
