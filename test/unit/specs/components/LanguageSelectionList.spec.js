// import Vue from 'vue'
// import LanguageSelectionList from 'src/components/LanguageSelectionList'

// describe('LanguageSelectionList.vue', () => {
//   const propsData = {
//     items: ['Bosnian', 'Croatian', 'English', 'Montenegrin', 'Serbian', 'Slovenian'],
//     activeIndex: 2
//   }
//   const Ctor = Vue.extend(LanguageSelectionList)
//   const vm = new Ctor({ propsData }).$mount()

//   // Logo currently disabled because of Samsung submission
//   // it('should display a logo image', () => {
//   //   expect(vm.$el.querySelector('.logo')).to.have.property('src')
//   // })
//   it('should display the title', () => {
//     expect(vm.$el.querySelector('.title').textContent).to.equal('Select Language')
//   })
//   it('should render all language items passed to it', () => {
//     expect(vm.$el.querySelectorAll('.list li').length).to.equal(propsData.items.length)
//   })
//   it('should give special class to active language item', () => {
//     [...vm.$el.querySelectorAll('.list li')].forEach(function (element, index) {
//       expect(element.classList.contains('is-active')).to.equal(index === propsData.activeIndex)
//     })
//   })
//   it('should calculate transform style property based on active item', () => {
//     [...vm.$el.querySelectorAll('.list li')].forEach(function (element, index) {
//       expect(vm.listTransform.transform).to.equal(`translate3d(0, -264rem, 0)`)
//     })
//   })
// })
