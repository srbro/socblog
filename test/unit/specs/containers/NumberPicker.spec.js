import Vue from 'vue'
import NumberPicker from 'src/containers/sections/Pin/NumberPicker'
import { exposeTranslateMode } from 'helpers/translate'

exposeTranslateMode('translateMode')

describe('NumberPicker.vue', () => {
  const propsData = {
    currentValue: 6,
    selected: true,
    direction: 0,
    position: 9
  }
  const Ctor = Vue.extend(NumberPicker)
  const vm = new Ctor({ propsData }).$mount()

  const symbolsValues = ['&mdash;', '&bull;']
  const symbols = {
    8212: 'mdash',
    8226: 'bull'
  }
  const escapeHtmlEntities = (text) => {
    return text.replace(/[\u00A0-\u2666<>\\&]/g, (c) => {
      return '&' + (symbols[c.charCodeAt(0)] || '#' + c.charCodeAt(0)) + ';'
    })
  }
  // it('should have symbol if not selected', () => {
  //   expect(vm.$el.classList.contains('.symbol')).to.equal(!propsData.selected)
  // })
  // it('should have element class if selected', () => {
  //   expect(vm.$el.firstChild.classList.contains('element')).to.equal(propsData.selected)
  // })
  // it('should have active class if selected', () => {
  //   expect(vm.$el.querySelector('.element').firstChild.classList.contains('active')).to.equal(propsData.selected)
  // })
  it('should dash be displayed if currentValue IS NOT set', () => {
    if (propsData.selected === false && propsData.currentValue === null) {
      expect(escapeHtmlEntities(vm.$el.querySelector('.symbol .dash').textContent)).to.equal(symbolsValues[0])
    }
  })
  it('should bull be displayed if currentValue IS set', () => {
    if (propsData.selected === false && propsData.currentValue !== null) {
      expect(escapeHtmlEntities(vm.$el.querySelector('.symbol .color-blue').textContent)).to.equal(symbolsValues[1])
    }
  })
  // it('should active item be equal currentValue', () => {
  //   [...vm.$el.querySelectorAll('.item')].forEach(function (element, index) {
  //     const styles = element.getAttribute('style').split(';')
  //     if (styles[0] === '-webkit-transform: translate3d(0rem, 126rem, 0rem)' && styles[1].trim === 'color: rgb(255, 255, 255)') {
  //       expect(element.textContent).to.equal(propsData.currentValue)
  //     }
  //   })
  // })
})
