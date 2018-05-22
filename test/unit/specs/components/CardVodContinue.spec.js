import Vue from 'vue'
import CardBanner from 'src/components/Cards/CardVodContinue'
import VodLanding from 'sections/Vod/Landing'
import PageWrapperNav from 'src/containers/sections/_pageWrapperNav'
import PageWrapper from 'src/containers/sections/_pageWrapper'
import VodDetail from 'sections/Vod/Detail'
import VueRouter from 'vue-router'
import { loc } from 'helpers/localization' // Localization function
import { exposeUiMode } from 'helpers/uiMode'
import { exposeTranslateMode } from 'helpers/translate'
// import { continueClick } from 'helpers/landingActions'

exposeUiMode('uiMode')
exposeTranslateMode('translateMode')

Vue.use(VueRouter)
Vue.mixin({ methods: { loc } })

const router = new VueRouter({routes: [
  { path: '/nav', component: PageWrapperNav, children: [ { path: 'vod-landing', component: VodLanding, name: 'VodLanding' } ] },
  { path: '/no-nav', component: PageWrapper, children: [ { path: 'vod-detail', component: VodDetail, name: 'VodDetail' } ] }
]})
router.push({name: 'VodLanding'})
describe('CardVodContinue.vue', () => {
  describe('With detail', () => {
    const propsDataDetail = {
      event: {
        // click: continueClick,
        // doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
        firstRowText: 'Misterija cvećare: Ubistvo na venčanju',
        id: 15007,
        imageUrl: 'https://images.ug.cdn.united.cloud/2017/11/20/09/39/46/stb_fhd_ogv8dic6carq3gnyz2peapeuh7l.jpg',
        progress: 0.043413529168390565,
        secondRowText: '2016',
        title: 'Misterija cvećare: Ubistvo na venčanju'
      },
      selected: false,
      showDetails: true,
      fasterAnimation: false,
      clickFn: (banner) => router.push({
        name: 'VodDetail',
        params: {
          asset: {
            id: 15007
          }
        }
      })
    }
    // console.log('Ctor ', CardBanner)
    const Ctor = Vue.extend(CardBanner)
    const vm = new Ctor({ propsData: propsDataDetail, router: router }).$mount()

    it('should display detail text title on card', () => {
      expect(vm.$el.querySelector('.first-row').textContent).to.equal(vm.$props.event.firstRowText)
    })
    it('should display detail text second row on card', () => {
      expect(vm.$el.querySelector('.second-row').textContent).to.equal(vm.$props.event.secondRowText)
    })
    it('should display banner image', () => {
      expect(vm.$el.style.background).to.equal(`url(${vm.$props.event.imageUrl})`)
    })
    it('should display progress', () => {
      expect(vm.$el.querySelector('.completed').style.transform || vm.$el.querySelector('.completed').style.webkitTransform || vm.$el.querySelector('.completed').style.mozTransform).to.equal(`scaleX(${vm.$props.event.progress})`)
    })
    // This execute latest. Change route
    it('on banner click should change route', () => {
      vm.doClick()
      expect(vm.$route.name).to.equal(`VodDetail`)
    })
  })
  describe(' detail ', () => {
    const propsData = {
      event: {
        // click: continueClick,
        // doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
        firstRowText: 'Misterija cvećare: Ubistvo na venčanju',
        id: 15007,
        imageUrl: 'https://images.ug.cdn.united.cloud/2017/11/20/09/39/46/stb_fhd_ogv8dic6carq3gnyz2peapeuh7l.jpg',
        progress: 0.043413529168390565,
        secondRowText: '2016',
        title: 'Misterija cvećare: Ubistvo na venčanju'
      },
      selected: false,
      showDetails: false,
      fasterAnimation: false,
      clickFn: (banner) => router.push({
        name: 'VodDetail',
        params: {
          asset: {
            id: 15007
          }
        }
      })
    }
    const Ctor = Vue.extend(CardBanner)
    // console.log('Ctor ', Ctor)
    const vm = new Ctor({ propsData: propsData, router: router }).$mount()

    it('should hide detail text on banner', () => {
      expect(vm.$el.querySelector('.description')).to.equal(null)
    })
    it('should display banner image', () => {
      expect(vm.$el.style.background).to.equal(`url(${vm.$props.event.imageUrl})`)
    })
  })
  describe('Without detail ', () => {
    const propsData = {
      event: {
        // click: continueClick,
        // doClick: () => { click({ id: `${id}_${rowIndex}_${index}`, className: id, params: { rowIndex: rowIndex, index: index } }) },
        firstRowText: 'Misterija cvećare: Ubistvo na venčanju',
        id: 15007,
        imageUrl: 'https://images.ug.cdn.united.cloud/2017/11/20/09/39/46/stb_fhd_ogv8dic6carq3gnyz2peapeuh7l.jpg',
        progress: 0.043413529168390565,
        secondRowText: '2016',
        title: 'Misterija cvećare: Ubistvo na venčanju'
      },
      selected: false,
      showDetails: false,
      fasterAnimation: false,
      clickFn: (banner) => router.push({
        name: 'VodDetail',
        params: {
          asset: {
            id: 15007
          }
        }
      })
    }
    const Ctor = Vue.extend(CardBanner)
    // console.log('Ctor ', Ctor)
    const vm = new Ctor({ propsData: propsData, router: router }).$mount()

    it('should hide detail text on banner', () => {
      expect(vm.$el.querySelector('.description')).to.equal(null)
    })
    it('should display banner image', () => {
      expect(vm.$el.style.background).to.equal(`url(${vm.$props.event.imageUrl})`)
    })
  })
  describe('See all card', () => {
    const propsDataSeeAll = {
      event: {
        id: 'SEE_ALL',
        theme: 'light',
        type: 'catchup'
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
    const Ctor = Vue.extend(CardBanner)
    const vm = new Ctor({ propsData: propsDataSeeAll, router: router }).$mount()

    it('should display see all card', () => {
      expect(vm.$el.querySelector('.subtitle').textContent).to.equal(vm.$props.seeAllText)
    })
  })
})
