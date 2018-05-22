import Vue from 'vue'
import CardVod from 'src/components/Cards/CardVod'
import { exposeUiMode } from 'helpers/uiMode'
import { exposeTranslateMode } from 'helpers/translate'
import VodLanding from 'sections/Vod/Landing'
import PageWrapperNav from 'src/containers/sections/_pageWrapperNav'
import PageWrapper from 'src/containers/sections/_pageWrapper'
import VodDetail from 'sections/Vod/Detail'
import VueRouter from 'vue-router'
import { loc } from 'helpers/localization' // Localization function
exposeUiMode('uiMode')
exposeTranslateMode('translateMode')

Vue.use(VueRouter)
Vue.mixin({ methods: { loc } })

const router = new VueRouter({routes: [
  { path: '/nav', component: PageWrapperNav, children: [ { path: 'vod-landing', component: VodLanding, name: 'VodLanding' } ] },
  { path: '/no-nav', component: PageWrapper, children: [ { path: 'vod-detail', component: VodDetail, name: 'VodDetail' } ] }
]})
router.push({name: 'VodLanding'})
describe('CardVod.vue', () => {
  describe('With detail', () => {
    const propsDataDetail = {
      event: {
        firstRowText: 'Winnie The Pooh',
        id: 14949,
        imageUrl: 'https://images.ug.cdn.united.cloud/2017/11/13/13/26/52/stb_fhd_vini.jpg',
        secondRowText: '2011',
        subtitle: '2011',
        title: 'Winnie The Pooh',
        duration: 3625000,
        watchProgress: 3122045
      },
      selected: false,
      showDetails: true,
      fasterAnimation: false,
      clickFn: (vodCard) => router.push({
        name: 'VodDetail',
        params: {
          vodCard: {
            id: vodCard.id,
            title: vodCard.title,
            return: {}
          }
        }
      })
    }
    const Ctor = Vue.extend(CardVod)
    const vmDetail = new Ctor({ propsData: propsDataDetail, router: router }).$mount()

    it('should display detail text title on vod', () => {
      expect(vmDetail.$el.querySelector('.first-row-text').textContent).to.equal(vmDetail.$props.event.firstRowText)
    })
    it('should display detail text second row on vod', () => {
      expect(vmDetail.$el.querySelector('.description').childNodes[3].textContent.trim()).to.equal(vmDetail.$props.event.secondRowText.trim())
    })
    it('should display vod image', () => {
      expect(vmDetail.$el.style.background).to.equal(`url(${vmDetail.$props.event.imageUrl})`)
    })

    // This execute latest. Change route
    it('on vod click should change route', () => {
      vmDetail.doClick()
      expect(vmDetail.$route.name).to.equal(`VodDetail`)
    })
  })
  describe('Without detail ', () => {
    const propsData = {
      event: {
        firstRowText: 'Winnie The Pooh',
        id: 14949,
        imageUrl: 'https://images.ug.cdn.united.cloud/2017/11/13/13/26/52/stb_fhd_vini.jpg',
        secondRowText: '2011',
        subtitle: '2011',
        title: 'Winnie The Pooh'
      },
      selected: false,
      showDetails: false,
      fasterAnimation: false,
      clickFn: (vodCard) => router.push({
        name: 'VodDetail',
        params: {
          vodCard: {
            id: vodCard.id,
            title: vodCard.title,
            return: {}
          }
        }
      })
    }
    const Ctor = Vue.extend(CardVod)
    // console.log('Ctor ', Ctor)
    const vm = new Ctor({ propsData: propsData, router: router }).$mount()

    it('should hide detail text on vodCard', () => {
      expect(vm.$el.querySelector('.description')).to.equal(null)
    })
    it('should display vodCard image', () => {
      expect(vm.$el.style.background).to.equal(`url(${vm.$props.event.imageUrl})`)
    })
  })
  describe('See all card', () => {
    const propsDataSeeAll = {
      event: {
        id: 'SEE_ALL',
        theme: 'light',
        type: 'vod'
      },
      selected: false,
      showDetails: true,
      fasterAnimation: false,
      seeAllText: 'true',
      clickFn: (vodCard) => router.push({
        name: 'VodSeeAll',
        params: {
          vodCard: {
            return: {}
          }
        }
      })
    }
    const Ctor = Vue.extend(CardVod)
    const vm = new Ctor({ propsData: propsDataSeeAll, router: router }).$mount()
    it('should display see all card', () => {
      expect(vm.$el.querySelector('.subtitle').textContent).to.equal(vm.$props.seeAllText)
    })
  })
})
