import Vue from 'vue'
import Vuex from 'vuex'
import Pin from 'src/containers/sections/Pin/_main'
import VueRouter from 'vue-router'
import PageWrapper from 'src/containers/sections/_pageWrapper'
import PageWrapperNav from 'src/containers/sections/_pageWrapperNav'
import Settings from 'src/containers/sections/Settings/_main'
import RegisterKeyHandler from 'src/containers/mixins/RegisterKeyHandler'
import CustomButton from 'src/components/Button'
import NumberPicker from 'src/containers/sections/Pin/NumberPicker'
import store from 'src/vuex/store'
import { loc } from 'helpers/localization' // Localization function
import { exposeUiMode } from 'helpers/uiMode'

exposeUiMode('uiMode')
Vue.use(VueRouter)
Vue.use(Vuex)
Vue.mixin({ methods: { loc } })

describe('Pin.vue', () => {
  const router = new VueRouter({routes: [
    { path: '/nav', component: PageWrapperNav, children: [ { path: 'settings', component: Settings, name: 'Settings' } ] },
    { path: '/no-nav', component: PageWrapper, children: [ { path: 'pin', component: Pin, name: 'Pin', meta: { fromRoute: 'Settings' } } ] }
  ]})
  router.push({name: 'Pin', params: {footer: 'My custom footer', title: null}})
  const Ctor = Vue.extend(Pin)
  const vm = new Ctor({
    mixins: [ RegisterKeyHandler ],
    components: { CustomButton, NumberPicker },
    router: router,
    store
  }).$mount()
  // const func = (number) => {
  //   if (number <= 5) {
  //     for (let i = 0; i <= 5; i++) {
  //       if (i === number) return 5 - i
  //     }
  //   } else {
  //     const a = [0, 0, 0, 0, 0, 0, 9, 8, 7, 6]
  //     for (let i = 6; i <= 9; i++) {
  //       if (i === number) return a[i]
  //     }
  //   }
  // }
  it('should have header back button', () => {
    expect(typeof vm.$el.querySelector('.top').firstChild).to.equal('object')
  })
  // it('should have header title', () => {
  //   expect(vm.$el.querySelector('.top .title').textContent).to.equal('PIN')
  // })
  // it('should have pin in data default values', () => {
  //   const defaultData = Pin.data()
  //   expect(JSON.stringify(defaultData.pin)).to.equal(JSON.stringify([null, null, null, null]))
  // })
  // it('should have pinPositions in data default values', () => {
  //   const defaultData = Pin.data()
  //   expect(JSON.stringify(defaultData.pinPositions)).to.equal(JSON.stringify([5, 5, 5, 5]))
  // })
  // it('should have fromRoute in $route meta', () => {
  //   expect(vm.$route.meta.fromRoute).to.equal('Settings')
  // })
  // it('should have main title', () => {
  //   expect(vm.$el.querySelector('.main .title').firstChild.textContent).to.equal('Enter Your PIN')
  // })
  // it('should have 4 numbers in main section', () => {
  //   expect(vm.$el.querySelector('.main .pin').children.length).to.equal(4)
  // })
  // it('should have footer computed', () => {
  //   const defaultData = Pin.data()
  //   vm.$route.params.footer ? expect(vm.footer).to.equal(vm.$route.params.footer) : expect(vm.footer).to.equal(defaultData.txtFooter)
  // })
  // it('should init focus be set on first number', () => {
  //   expect(vm.activeLevel).to.equal('pin')
  //   expect(vm.currentSelection).to.equal(0)
  // })
  // it('should LEFT key set focus on back button', () => {
  //   vm.moveSelection('LEFT')
  //   expect(vm.activeLevel).to.equal('back')
  //   expect(vm.currentSelection).to.equal(-1)
  // })
  // it('should RIGHT key change selection only to last number', () => {
  //   if (vm.activeLevel === 'back') vm.changeLevel('DOWN')
  //   for (let i = 0; i < 5; i++) {
  //     vm.moveSelection('RIGHT')
  //   }
  //   expect(vm.activeLevel).to.equal('pin')
  //   expect(vm.currentSelection).to.equal(3)
  // })
  // it('should LEFT key change selection all way to back button', () => {
  //   for (let i = 0; i < 5; i++) {
  //     vm.moveSelection('LEFT')
  //   }
  //   expect(vm.activeLevel).to.equal('back')
  //   expect(vm.currentSelection).to.equal(-1)
  // })
  // it('should key change pin number and current selection. On last should stop', () => {
  //   if (vm.activeLevel === 'back') vm.changeLevel('DOWN')
  //   let mockPositions = [5, 5, 5, 5]
  //   const mockPin = [ Math.floor(Math.random() * 9), Math.floor(Math.random() * 9), Math.floor(Math.random() * 9), Math.floor(Math.random() * 9) ]
  //   for (let i = 0; i <= 3; i++) {
  //     mockPositions[vm.currentSelection] = func(mockPin[i])
  //     vm.setNumber(mockPin[i])
  //   }
  //   expect(vm.pin).to.eql(mockPin)
  //   expect(vm.pinPositions).to.eql(mockPositions)
  // })
  // it('should OK key change selection to next number and set pin. On last number send pin.', () => {
  //   if (vm.activeLevel === 'back') vm.changeLevel('DOWN')
  //   const length = 3 - vm.currentSelection
  //   for (let i = 0; i <= length; i++) {
  //     vm.pressOk()
  //   }
  //   expect(vm.$route.name).to.equal('Settings')
  // })
})
