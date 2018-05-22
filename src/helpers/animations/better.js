export const trans = (left, top) => {
  return {
    transition: `transform .150s ease`,
    '-webkit-backface-visibility': `hidden`,
    '-webkit-perspective': 1000,
    'left': `${left}rem`,
    'top': top
  }
}

export const transWithScale = (left, top, percent) => {
  return {
    transition: `transform .150s ease`,
    '-webkit-backface-visibility': `hidden`,
    '-webkit-perspective': 1000,
    'left': `${left}rem`,
    'top': top,
    transform: 'scale3d(' + percent + ',' + percent + ', 1)'
  }
}

export const transScrollableList = (top) => {
  return {
    'top': top
  }
}

export const deviceZapClass = () => {
  return 'samsung-cell'
}

export const deviceEPGClass = () => {
  return 'samsung-item-row'
}
