import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import router from 'src/router'
import store from 'src/vuex/store'
import { redirectToRoute } from 'helpers/redirect'

Vue.use(VueRouter)
Vue.use(Vuex)

router.push({name: 'Loading'})

const routes = ['Guide', 'NowTv', 'Radio', 'VodLanding', 'PlayerTv', 'Home']
let i = 0
describe('Helpers redirect', () => {
  describe('not signed', () => {
    let vm = new Vue({ router: router, store })
    vm.$store.commit('auth/UPDATE_SIGNED', false)
    vm.$store.commit('auth/UPDATE_ROUTE_REDIRECT', 'Home')
    redirectToRoute({ routeName: routes[0] })

    beforeEach((done) => {
      setTimeout(done, 1000)
    })

    it('not redirect', () => {
      expect(vm.$route.name).to.not.equal(routes[0])
    })
  })
  describe('signed', () => {
    let vm = new Vue({ router: router, store })
    vm.$store.commit('auth/UPDATE_SIGNED', true)
    vm.$store.commit('auth/UPDATE_ROUTE_REDIRECT', 'Home')
    beforeEach((done) => {
      redirectToRoute({ routeName: routes[i++] })
      setTimeout(done, 1000)
    })

    it('-> Guide', () => {
      expect(vm.$route.name).to.equal(`Guide`)
    })
    it('-> NowTv', () => {
      expect(vm.$route.name).to.equal(`NowTv`)
    })
    it('-> Radio', () => {
      expect(vm.$route.name).to.equal(`Radio`)
    })
    it('-> VodLanding', () => {
      expect(vm.$route.name).to.equal(`VodLanding`)
    })
    it('-> PlayerTv', () => {
      expect(vm.$route.name).to.equal(`PlayerTv`)
    })
  })
})
