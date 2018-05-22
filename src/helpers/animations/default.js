export const trans = (left, top) => {
  return {
    transition: `transform .150s`,
    transform: `translateX(${left}rem) translateY(${top}rem) translateZ(.0001rem)`
  }
}

export const transWithScale = (left, top) => {
  return {
    transition: `transform .150s linear`,
    '-webkit-backface-visibility': `hidden`,
    '-webkit-perspective': 1000,
    transform: `translateX(${left}rem) translateY(${top}) translateZ(0)`
  }
}

export const transScrollableList = (top) => {
  return {
    transform: `translateY(${top})`
  }
}

export const deviceZapClass = () => {
  return 'cell'
}

export const deviceEPGClass = () => {
  return 'item-row'
}
