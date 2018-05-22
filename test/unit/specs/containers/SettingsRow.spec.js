// import Vue from 'vue'
// import SettingsRow from 'src/containers/sections/Settings/SettingsRow'

// describe('SettingsRow.vue', () => {
//   const propsData = {
//     items: [
//       { id: 'summary', label: 'Summary', type: 'selection' },
//       { id: 'favorites', label: 'Favorites', type: 'selection' },
//       { id: 'account', label: 'Account', type: 'selection' },
//       { id: 'reminders', label: 'Reminders', type: 'selection' },
//       { id: 'pin', label: 'PIN', type: 'selection' },
//       { id: 'language', label: 'Language', type: 'selection' },
//       { id: 'timezone', label: 'Timezone', type: 'selection' }
//     ],
//     selectedIndex: 2,
//     title: 'Title',
//     selected: true,
//     focused: true
//   }
//   const Ctor = Vue.extend(SettingsRow)
//   const vm = new Ctor({ propsData }).$mount()

//   it('should give special is-selected class', () => {
//     expect(vm.$el.classList.contains('is-selected')).to.equal(propsData.selected)
//   })
//   it('should display correct title', () => {
//     expect(vm.$el.querySelector('.title').textContent).to.equal(propsData.title)
//   })
//   it('should render settings items passed to it', () => {
//     expect(vm.$el.querySelectorAll('.card-row li').length).to.equal(propsData.items.length)
//   })
// })
