import privateConfig from '../../config/private.json'
import { config } from 'hal'

export const setResolution = function () {
  // const finalWidth = privateConfig && privateConfig.force720 ? 720 : (window.screen.width * window.devicePixelRatio)
  const finalWidth = privateConfig && privateConfig.force720 ? 720 : window.screen.width
  document.documentElement.style.fontSize = finalWidth >= 1920 ? config.resolution[0] : config.resolution[1]
}
