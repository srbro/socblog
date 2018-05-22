import { load, save } from 'hal'

const TRANSLATE_MODE_CONFIG = {
  TRANSLATE2D: {
    translate: true
  },
  TRANSLATE3D: {
    translate: false
  }
}

const STORAGE_KEY = 'translateMode'
let activeMode = 'TRANSLATE3D'
let translateModeCfg = TRANSLATE_MODE_CONFIG[activeMode]

const saveMode = (mode) => {
  save(STORAGE_KEY, mode)
}

const getMode = () => {
  return load(STORAGE_KEY)
}

export const setTranslateMode = (mode) => {
  if (TRANSLATE_MODE_CONFIG[mode] === undefined) {
    throw new Error('Unexisting translate-mode config.')
  }
  activeMode = mode
  translateModeCfg = TRANSLATE_MODE_CONFIG[mode]
  saveMode(mode)
}

export const exposeTranslateMode = (name) => {
  window[name] = translateModeCfg
}

const initTranslateMode = () => {
  let mode = getMode()
  if (TRANSLATE_MODE_CONFIG[mode]) {
    translateModeCfg = TRANSLATE_MODE_CONFIG[mode]
  }
}

initTranslateMode()
