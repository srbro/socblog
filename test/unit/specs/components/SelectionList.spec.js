// import Vue from 'vue'
// import SelectionList from 'src/components/SelectionList'

// describe('SelectionList.vue', () => {
//   const propsData = {
//     active: true,
//     clearVisible: true,
//     clearActive: false,
//     clearText: 'Default selection',
//     items: [
//       { id: 'AZ', label: 'A-Z' },
//       { id: 'MOST_WATCHED', label: 'Most Watched' },
//       { id: 'RECOMMENDED', label: 'Recommended' }
//     ],
//     itemActive: 1,
//     theme: 'light',
//     title: 'Main title',
//     titleAbove: 'Above title',
//     titleBelow: 'Below title',
//     svgId: 'selection-nowtv',
//     transitionType: 'default'
//   }
//   const Ctor = Vue.extend(SelectionList)
//   const vm = new Ctor({ propsData }).$mount()

//   it('should render all selection items passed to it', () => {
//     expect(vm.$el.querySelectorAll('.list .item').length).to.equal(propsData.items.length)
//   })
//   it('should give special class to selected selection item', () => {
//     [...vm.$el.querySelectorAll('.list .item')].forEach(function (element, index) {
//       expect(element.classList.contains('is-active'))
//       .to.equal(propsData.clearActive ? false : index === propsData.itemActive)
//     })
//   })
//   it('should give special class to selected clear button', () => {
//     expect(vm.$el.querySelector('.clear').classList.contains('is-active')).to.equal(propsData.clearActive)
//   })
//   it('should display main title', () => {
//     expect(vm.$el.querySelector('.title').textContent).to.equal('Main title')
//   })
//   it('should display above title', () => {
//     expect(vm.$el.querySelector('.above-title').textContent).to.equal('Above title')
//   })
//   it('should display below title', () => {
//     expect(vm.$el.querySelector('.below-title').textContent).to.equal('Below title')
//   })
//   it('should display correct clear button label', () => {
//     expect(vm.$el.querySelector('.clear .text').textContent).to.equal('Default selection')
//   })
// })
