// import moment from 'moment'
// import Vue from 'vue'
// import Lane from 'src/components/Lane'

// describe('Lane.vue', () => {
//   const propsData = {
//     active: true,
//     icons: true,
//     items: [
//       {
//         id: 'home',
//         name: 'Home'
//       },
//       {
//         id: 'guide',
//         name: 'Guide'
//       },
//       {
//         id: 'on-demand',
//         name: 'On Demand'
//       },
//       {
//         id: 'settings',
//         name: 'Settings'
//       }
//     ],
//     selectedIndex: 1,
//     user: {
//       name: 'Mark Wahlberg Marky Mark',
//       avatar: 'http://a5.files.biography.com/image/upload/c_fill,cs_srgb,dpr_1.0,g_face,h_300,q_80,w_300/MTE1ODA0OTcxODYwOTg1MzU3.jpg'
//     },
//     time: moment(),
//     type: 'main',
//     showUser: true
//   }
//   const Ctor = Vue.extend(Lane)
//   const vm = new Ctor({ propsData }).$mount()

//   it('should render all navigation items passed to it', () => {
//     expect(vm.$el.querySelectorAll('.menu .item').length).to.equal(propsData.items.length)
//   })
//   it('should give special class to selected navigation item', () => {
//     [...vm.$el.querySelectorAll('.menu .item')].forEach(function (element, index) {
//       expect(element.classList.contains('is-selected')).to.equal(index === propsData.selectedIndex)
//     })
//   })
//   it('should give special class to active navigation lane', () => {
//     [...vm.$el.querySelectorAll('.lane')].forEach(function (element, index) {
//       expect(element.classList.contains('is-active')).to.equal(index === propsData.active)
//     })
//   })
//   it('should display user avatar in navigation', () => {
//     expect(vm.$el.querySelector('.user-image')).to.have.property('src')
//   })
//   it('should display username in navigation', () => {
//     expect(vm.$el.querySelector('.user-name').textContent).to.equal(propsData.user.name)
//   })
// })
