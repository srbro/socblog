import Vue from 'vue'
import CardBanner from 'src/components/Cards/CardBanner'
import { exposeUiMode } from 'helpers/uiMode'
import { exposeTranslateMode } from 'helpers/translate'
import VodLanding from 'sections/Vod/Landing'
import PageWrapperNav from 'src/containers/sections/_pageWrapperNav'
import PageWrapper from 'src/containers/sections/_pageWrapper'
import HomeDetail from 'sections/Home/Detail'
import VueRouter from 'vue-router'

exposeUiMode('uiMode')
exposeTranslateMode('translateMode')

Vue.use(VueRouter)

const router = new VueRouter({routes: [
  { path: '/nav', component: PageWrapperNav, children: [ { path: 'vod-landing', component: VodLanding, name: 'VodLanding' } ] },
  { path: '/no-nav', component: PageWrapper, children: [ { path: 'home-detail', component: HomeDetail, name: 'HomeDetail' } ] }
]})
router.push({name: 'VodLanding'})
describe('CardBanner.vue', () => {
  describe('With detail', () => {
    const propsDataDetail = {
      event: {
        firstRowText: 'BILLIONS',
        secondRowText: '2016 | 57 min | Drama ',
        imageUrl: 'https://images.ug.cdn.united.cloud/2017/11/09/13/39/18/stb_fhd_billions_rs_bih_1920x1080.jpg',
        backgroundImageUrl: 'https://images.ug.cdn.united.cloud/2017/11/09/13/39/17/stb_xl_billions_rs_bih_1920x1080.jpg',
        logo: '',
        width: 650,
        type: 'VOD',
        id: 0,
        title: 'BILLIONS',
        description: '',
        externalId: 3735
      },
      selected: false,
      showDetails: true,
      fasterAnimation: false,
      clickFn: (banner) => router.push({
        name: 'HomeDetail',
        params: {
          banner: {
            id: banner.externalId,
            type: banner.type,
            image: banner.backgroundImageUrl,
            title: banner.title,
            description: banner.description,
            logo: banner.logo,
            return: {}
          }
        }
      })
    }
    // console.log('Ctor ', CardBanner)
    const Ctor = Vue.extend(CardBanner)
    // console.log('Ctor ', Ctor)
    const vmDetail = new Ctor({ propsData: propsDataDetail, router: router }).$mount()

    it('should display detail text title on banner', () => {
      expect(vmDetail.$el.querySelector('.first-row').textContent).to.equal(vmDetail.$props.event.firstRowText)
    })
    it('should display detail text second row on banner', () => {
      expect(vmDetail.$el.querySelector('.description').childNodes[1].textContent.trim()).to.equal(vmDetail.$props.event.secondRowText.trim())
    })
    it('should display banner image', () => {
      expect(vmDetail.$el.style.background).to.equal(`url(${vmDetail.$props.event.imageUrl})`)
    })

    // This execute latest. Change route
    it('on banner click should change route', () => {
      vmDetail.doClick()
      expect(vmDetail.$route.name).to.equal(`HomeDetail`)
    })
  })
  describe('Without detail ', () => {
    const propsData = {
      event: {
        firstRowText: 'BILLIONS',
        secondRowText: '2016 | 57 min | Drama ',
        imageUrl: 'https://images.ug.cdn.united.cloud/2017/11/09/13/39/18/stb_fhd_billions_rs_bih_1920x1080.jpg',
        backgroundImageUrl: 'https://images.ug.cdn.united.cloud/2017/11/09/13/39/17/stb_xl_billions_rs_bih_1920x1080.jpg',
        logo: '',
        width: 650,
        type: 'VOD',
        id: 0,
        title: 'BILLIONS',
        description: '',
        externalId: 3735
      },
      selected: false,
      showDetails: false,
      fasterAnimation: false,
      clickFn: (banner) => router.push({
        name: 'HomeDetail',
        params: {
          banner: {
            id: banner.externalId,
            type: banner.type,
            image: banner.backgroundImageUrl,
            title: banner.title,
            description: banner.description,
            logo: banner.logo,
            return: {}
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
})
