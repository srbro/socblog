import { getWrapperVersionPromise } from './serverData'
import { getPlatform, getWrapperVersion } from 'hal'
import { blockUi } from './uiBlocker'

/**
 * @param  {string} Version that is going to be checked, regex check /\d{1,3}.\d{1,3}\.\d{1,3}/
 * @param  {string} Version that is going to be compared against, regex check /\d{1,3}.\d{1,3}\.\d{1,3}/
 * @return {int}
 */
let compareVersion = (subject, target) => {
  let testRegexp = /(?:\d{1,3}\.{0,1}){1,3}/
  if (!testRegexp.test(subject) || !testRegexp.test(target)) {
    return null
  } else {
    let localVerArr = subject.split('.')
    let targetVerArr = target.split('.')
    let result = 0

    for (let i = 0; i < 3; i++) {
      result = Math.sign(((localVerArr[i] || 0) * 1) - ((targetVerArr[i] || 0) * 1))
      if (result !== 0) {
        break
      }
    }
    return result
  }
}

export const weapperVersionBlock = () => {
  let platform = getPlatform()
  let subject = getWrapperVersion()

  getWrapperVersionPromise(platform)
    .then(result => {
      let versionDiff = compareVersion(subject, result.min)
      if (versionDiff > -1 || versionDiff === null) {
        // Nothing happens, some error report maybe?
      } else {
        blockUi()
      }
    })
    .catch(/* Error processing here also */)
}
