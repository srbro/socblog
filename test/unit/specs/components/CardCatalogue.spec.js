import Vue from 'vue'
import CardBanner from 'src/components/Cards/CardCatalogue'
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
describe('CardCatalogue.vue', () => {
  const propsDataDetail = {
    selected: false,
    fasterAnimation: false,
    upperImageUrl: 'https://images.ug.cdn.united.cloud/2017/09/04/17/30/22/all_catalogues_tile.png',
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

  it('should display banner image', () => {
    expect(vmDetail.$el.style.background).to.equal(`url(${vmDetail.$props.upperImageUrl})`)
  })

  // This execute latest. Change route
  it('on banner click should change route', () => {
    vmDetail.doClick()
    expect(vmDetail.$route.name).to.equal(`HomeDetail`)
  })
})
