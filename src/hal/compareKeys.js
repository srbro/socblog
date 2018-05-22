/*
// Set of tools for comparing key maps.
// Not used in production.
*/

import { KEY_MAP as keyMapAndroid } from './consts/constsAndroidTv.js'
import { KEY_MAP as keyMapSamsung } from './consts/constsSamsung.js'
import { KEY_MAP as keyMapWeb } from './consts/constsWeb.js'
import { KEY_MAP as keyMapLg } from './consts/constsLg.js'
import { KEY_MAP as keyMapStb } from './consts/constsSTB.js'

export const compareMaps = (map1, map2) => {
  let diff12 = {}
  let diff21 = Object.assign({}, map2)
  let keyIntersection = []
  let intersection = {}

  Object.keys(map1).forEach(key => {
    if (map2[key]) {
      delete diff21[key]
      keyIntersection.push(key)
      map1[key] === map2[key] && (intersection[key] = map1[key])
    } else {
      diff12[key] = map1[key]
    }
  })
  return { diff12, diff21, keyIntersection, intersection }
}

const applyBinaryRelation = (set1, set2, rule) => {
  let pairsSet = []
  Object.keys(set1).forEach(key1 => {
    Object.keys(set2).forEach(key2 => {
      if (rule(key1, set1[key1], key2, set2[key2])) {
        pairsSet.push([key1, key2])
      }
    })
  })
  return pairsSet
}

const inverseMap = (map) => {
  let inverseMap = {}
  Object.keys(map).forEach(key => {
    inverseMap[map[key]] = key
  })
  return inverseMap
}

export const findAllKeyValues = () => {
  let keyMaps = [
    keyMapWeb,
    keyMapLg,
    keyMapSamsung,
    keyMapAndroid,
    keyMapStb
  ]

  let keys = new Set()

  keyMaps.forEach(e => {
    Object.keys(e).forEach(key => {
      keys.add(e[key])
    })
  })

  return keys
}

export const compareKeyMaps = () => {
  let keyMaps = {
    keyMapWeb,
    keyMapLg,
    keyMapSamsung,
    keyMapAndroid,
    keyMapStb
  }

  let mapCombinations = applyBinaryRelation(keyMaps, keyMaps, (key1, val1, key2, val2) => key1 !== key2)

  mapCombinations.forEach((e, i) => {
    console.log(`Comparation result for maps ${e[0]} and ${e[1]} `, compareMaps(keyMaps[e[0]], keyMaps[e[1]]))
    console.log(
      `Comparation result for inversed maps ${e[0]} and ${e[1]} `,
      compareMaps(
        inverseMap(keyMaps[e[0]]),
        inverseMap(keyMaps[e[1]])
      )
    )
  })
}

// Will log keys on screen, for development only.
const mkLogOnMonitor = () => {
  const ID = 'monitorLog'
  const TIMEOUT = 1000 * 3

  let div = document.createElement('div')
  div.id = ID
  div.style.position = 'fixed'
  div.style.top = 0
  div.style.left = 0
  div.style.color = 'white'
  div.style.fontSize = '27px'
  div.style.backgroundColor = 'black'
  div.style.padding = '0px 20px'
  div.style.zIndex = '99999'
  div.style.opacity = '0.5'
  document.getElementsByTagName('body')[0].appendChild(div)

  return (log) => {
    let h1 = document.createElement('h1')
    h1.innerText = log
    div.prepend(h1)

    window.setTimeout(() => {
      h1.parentNode.removeChild(h1)
    }, TIMEOUT)
  }
}

export const logOnMonitor = mkLogOnMonitor()
