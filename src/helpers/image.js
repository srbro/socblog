// import config from 'config'
import servers from 'servers'

import includes from 'lodash/fp/includes'
import findIndex from 'lodash/fp/findIndex'

const CATALOGUE_IMAGE_WIDTH = 170
const CATALOGUE_IMAGE_HEIGHT = 58
const CATALOGUE_IMAGE_TYPE = 'APPLICATION'

const closest = (array, closestTo) => {
  let i = 0
  let minDiff = 1000
  let ans = array[0]
  for (i in array) {
    let m = Math.abs(closestTo - array[i].height)
    if (m < minDiff) {
      minDiff = m
      ans = array[i]
    }
  }

  return ans
}
const bannersSTB = ['LANDING_PAGE_STB_16_9', 'LANDING_PAGE_STB_21_31', 'LANDING_PAGE_STB_1_1']

export const generatePath = ({ imageProperty, index, defaultImage }) => {
  let path = imageProperty && imageProperty[index] && imageProperty[index].path ? generatePathRaw(imageProperty[index]) : (defaultImage || '')
  return path
}

export const generatePathRaw = image => {
  if (image && image.path) return `${servers.imageServerUrl}${image.path}`
  return image
}

export const calculateWidth = (banner, height) => {
  const closestImage = closest(banner.images, height)
  const imageProportion = closestImage.width / closestImage.height
  return imageProportion * height
}

export const searchBannerSTB = (images, size) => {
  const myImages = images.map(value => {
    return includes(value.type)(bannersSTB) ? value : false
  })
  return findIndex({size: size})(myImages)
}

export const findDesiredIndex = (images, type, size = {size: 'S'}) => {
  // VOD_POSTER_2_1
  // VOD_POSTER_21_31
  // LOGO_16_9 // radio channels
  const myImages = images.map(value => {
    return type === value.type ? value : false
  })
  return findIndex(size)(myImages)
}

export const searchIndex = (images, size) => {
  const myImages = images.map(value => {
    return size === value.size ? value : false
  })
  return findIndex({size: size})(myImages)
}

export const findImages = (images, size) => {
  if (images) {
    const img = images.map(value => {
      return value.size === size ? value : false
    })
    let n = 0
    for (let i = 0; i < img.length; i++) {
      if (img[i] !== false) {
        n++
        return img[i]
      }
    }
    return n > 0
  }
}

export const getImage = (images, size, type, defaultImg, mode) => {
  if (images === null || images === 'undefined' || images === '' || typeof images === 'undefined' || images.length === 0) {
    return defaultImg
  } else {
    const img = images.map(value => {
      if (mode === undefined) {
        return value.size === size && value.type === type ? value : false
      } else {
        return value.size === size && value.type === type && value.mode === mode ? value : false
      }
    })
    let imagesPath = ''
    for (let i = 0; i < img.length; i++) {
      if (img[i] !== false) {
        imagesPath = `${servers.imageServerUrl}${img[i].path}`
      } else if (img[i] === false && imagesPath === '') {
        imagesPath = defaultImg
      }
    }
    return imagesPath
  }
}

export const getVodCatalogueImagePath = function (images, mode) {
  return getModeImagePath(images, CATALOGUE_IMAGE_WIDTH, CATALOGUE_IMAGE_HEIGHT, CATALOGUE_IMAGE_TYPE, mode)
}

function getModeImagePath (images, width, height, type, mode) {
  let modeImages = images
  if (mode) {
    modeImages = images.filter((image) => {
      return image.mode === mode
    })
  }
  return getImagePath(modeImages, width, height, type)
}

function getImagePath (images = [], width, height, type) {
  let len = images.length
  let selectedWidth = 0
  let selectedImg = ''
  for (let i = 0; i < len; i++) {
    let image = images[i]

    if (image && image.type === type) {
      if (image.width === width && image.height === height) {
        selectedImg = image
        break
      } else if (image.width > selectedWidth) {
        selectedWidth = image.width
        selectedImg = image
      }
    }
  }

  return selectedImg ? (servers.imageServerUrl + selectedImg.path).replace(/'/g, "\\'") : ''
}
