const height = '50px'
const width = '50px'
const color1 = 'red'
const color2 = 'green'

const mkElement = (height, width, color) => {
  let div = document.createElement('DIV')
  div.style.width = width
  div.style.height = height
  div.style.backgroundColor = color

  return div
}

const element1 = mkElement(height, width, color1)
const element2 = mkElement(height, width, color2)

const attachElement = (element, anchor, offset = '0') => {
  element.style.position = 'fixed'
  element.style.top = offset + 'px'
  element.style.left = offset + 'px'
  element.style.zIndex = '34903'

  anchor.appendChild(element)
}

const removeElement = (elem) => {
  elem.parentNode && elem.parentNode.removeChild(elem)
}

const blink = (n, c, t, element, attached, offset) => {
  let cnt = c

  if (attached) {
    removeElement(element, document.getElementsByTagName('BODY')[0])
  } else {
    attachElement(element, document.getElementsByTagName('BODY')[0], offset)
  }
  attached = !attached

  if (cnt++ < n) {
    window.setTimeout(() => { blink(n, cnt, t, element, attached) }, t)
  } else {
    removeElement(element)
  }
}

export default (n, t) => { blink(n, 0, t, element1, false, 0) }
export const greenBlinker = (n, t) => { blink(n, 0, t, element2, false, 30) }
