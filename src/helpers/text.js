const canvas = document.createElement('canvas')

export const measureWidth = (text, fontSize, font = 'default', fontWidth = 400) => {
  const defaultFonts = {
    normal: 'Roboto',
    condensed: 'Roboto Condensed'
  }
  const fontFamily = Object.keys(defaultFonts).indexOf(font) > -1 ? defaultFonts[font] : font
  const context = canvas.getContext('2d')

  context.font = `${fontWidth} ${fontSize}px ${fontFamily}`

  return context.measureText(text).width
}

export const uppercaseFirstLetter = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
