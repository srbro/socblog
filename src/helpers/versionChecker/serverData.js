import { fetchForcedUpdateFile } from 'helpers/api'

const WRAPPER = 'wrapper'
// const JS = 'js'
/**
 * [description]
 * @param  {[type]} platform [description]
 * @return {Promise}          [description]
 */
export const getWrapperVersionPromise = function (platform) {
  if (platform === undefined) {
    throw new Error('Platform argument must be defined.')
  }
  return new Promise(function (resolve, reject) {
    fetchForcedUpdateFile()
      .then(response => {
        resolve(response.data[platform].versions[WRAPPER])// Check if platform exists
      })
      .catch(response => {
        reject(new Error(response))// Some error message here
      })
  })
}
