import Vue from 'vue'
import KeyboardOverlay from 'src/components/KeyboardOverlay'

describe('KeyboardOverlay.vue', () => {
  const propsData = {
    backActive: true,
    capsLock: true,
    confirmText: 'TRALALA',
    icon: 'monitor',
    keys: [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'BACKSPACE'],
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'],
      ['l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v'],
      ['w', 'x', 'y', 'z', '.', ',', '-', '_', '@', '?', '!'],
      [7, 7, 7, 7, 7, 7, 7, 'SPACE', 'CAPSLOCK', 'LEFT', 'RIGHT']
    ],
    placeholder: 'INSERT TEXT',
    selectedConfirm: true,
    selectedKey: [1, 2],
    selectedSuggestion: 2,
    suggestions: ['foo', 'bar', 'baz'],
    text: ['part1', 'part2']
  }

  const Ctor = Vue.extend(KeyboardOverlay)
  const vm = new Ctor({ propsData }).$mount()

  // describe('Back button', () => {
  //   it('should set .is-active class based on passed backActive property', () => {
  //     expect(vm.$el.querySelector('.button-back').classList.contains('is-active')).to.equal(propsData.backActive)
  //   })
  // })

  describe('Keyboard', () => {
    it('should render an element for each key', () => {
      const keysInArray = propsData.keys.reduce((a, b) => a.concat(b), []).length
      const keysInDom = vm.$el.querySelectorAll('.key').length
      expect(keysInArray).to.equal(keysInDom)
    })
    it('should insert <div> elements for regular keys and <svg> elements for special ones', () => {
      const allKeys = propsData.keys.reduce((a, b) => a.concat(b), [])
      const allKeyElements = vm.$el.querySelectorAll('.key')
      allKeys.forEach((key, index) => {
        const childElement = allKeyElements[index].childNodes[0]
        if (vm.isIcon(key)) {
          expect(childElement.constructor).to.equal(window.SVGSVGElement)
        } else {
          expect(childElement.constructor).to.equal(window.HTMLSpanElement)
        }
      })
    })
    it('should insert value of confirmText property into confirm button', () => {
      expect(vm.$el.querySelector('.confirm .button').textContent).to.equal(propsData.confirmText)
    })
    it('should set .is-uppercase class on keyboard wrapper element based on passed capsLock property', () => {
      expect(vm.$el.querySelector('.keys-wrapper').classList.contains('is-uppercase')).to.equal(propsData.capsLock)
    })
    it('should set .is-selected class on confirm key based on passed selectedConfirm property', () => {
      expect(vm.$el.querySelector('.confirm .button').classList.contains('is-selected')).to.equal(propsData.selectedConfirm)
    })
    it('should set .is-selected class on key with position specified in selectedKey property', () => {
      const keyThatShouldBeFocused =
        vm.$el.querySelector('.keys-wrapper')
          .childNodes[propsData.selectedKey[1]]
          .childNodes[propsData.selectedKey[0]]
      expect(keyThatShouldBeFocused.classList.contains('is-selected')).to.equal(true)
    })
  })

  // describe('Input field', () => {
  //   it('should use value of icon property as ID of icon', () => {
  //     expect(vm.$el.querySelector('.field-icon use').getAttribute('xlink:href')).to.equal(`#${propsData.icon}`)
  //   })

  //   it('should insert a cursor between two parts of text', () => {
  //     const [firstPart, cursor, secondPart] = vm.$el.querySelector('.field-text').childNodes
  //     expect(firstPart.textContent).to.equal(propsData.text[0])
  //     expect(cursor.classList.contains('cursor')).to.equal(true)
  //     expect(secondPart.textContent).to.equal(propsData.text[1])
  //   })
  //   it('should display a placeholder with the value of placeholder property if no text is inserted', done => {
  //     vm.text = ['', '']
  //     Vue.nextTick(() => {
  //       const placeholder = vm.$el.querySelector('.field-text.is-placeholder')
  //       expect(placeholder.constructor).to.equal(window.HTMLDivElement)
  //       expect(placeholder.textContent).to.equal(propsData.placeholder)
  //       done()
  //     })
  //   })
  // })

  describe('Suggestions', () => {
    it('should render an element for each suggestion', () => {
      expect(vm.$el.querySelectorAll('.suggestion').length).to.equal(propsData.suggestions.length)
    })
    it('should set .is-selected class on suggestion with position specified in selectedSuggestion property', () => {
      expect([...vm.$el.querySelectorAll('.suggestion')].indexOf(vm.$el.querySelector('.suggestion.is-selected'))).to.equal(propsData.selectedSuggestion)
    })
  })
})
