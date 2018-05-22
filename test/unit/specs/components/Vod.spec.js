import Vue from 'vue'
import Vod from 'src/components/Detail/Vod'

describe('Vod.vue', () => {
  const propsData = {
    active: true,
    backgroundImageUrl: 'https://placehold.it/350x1500',
    backActive: true,
    // imdbRating: 2,
    buttons: [
      {
        icon: 'watch',
        myid: 'watch',
        text: 'Watch'
      },
      {
        icon: 'start-over',
        myid: 'startover',
        text: 'Start over'
      },
      {
        icon: 'favorite',
        myid: 'addFavorite',
        text: 'Favorite'
      }],
    activeCtaButton: 2,
    channelLogoImageUrl: 'https://placehold.it/350x1500',
    title: 'Reporter',
    // startTime: Number,
    // endTime: Number,
    // genre: 'Horror',
    live: true,
    // year: '2016',
    // rating: 'Bla bla',
    synopsis: 'Event synopsis',
    fullActive: true
  }
  const Ctor = Vue.extend(Vod)
  const vm = new Ctor({ propsData }).$mount()

  it('should display text', () => {
    expect(vm.$el.querySelector('.main-title').textContent).to.equal('Reporter')
  })
  it('should give special active button', () => {
    expect(vm.$el.querySelector('.button').classList.contains('is-active')).to.equal(propsData.activeCtaButton === 2)
  })
  it('should give special class to selected selection item', () => {
    [...vm.$el.querySelectorAll('.list .item')].forEach(function (element, index) {
      expect(element.classList.contains('is-active')).to.equal(propsData.clearActive ? false : index === propsData.itemActive)
    })
  })
  it('should display background image', () => {
    expect(vm.$el.querySelector('.container img').getAttribute('src')).to.equal(propsData.backgroundImageUrl)
  })
  it('should display logo image', () => {
    expect(vm.$el.querySelector('.main img').getAttribute('src')).to.equal(propsData.channelLogoImageUrl)
  })
  it('should display title text', () => {
    expect(vm.$el.querySelector('.main-title').textContent).to.equal(propsData.title)
  })
  it('should display language text', () => {
    expect(vm.$el.querySelector('.main-title').textContent).to.equal(propsData.title)
  })
  it('should display synopsis text', () => {
    expect(vm.$el.querySelector('.synopsis').textContent).to.equal(propsData.synopsis)
  })
  it('should each event in items array have icon field', () => {
    [...vm.$el.querySelectorAll('.buttons .icon use')].forEach(function (element, index) {
      expect(element.getAttribute('xlink:href')).to.equal(`#detail-${propsData.buttons[index].icon}`)
    })
  })
  it('should each event in items array have text field', () => {
    [...vm.$el.querySelectorAll('.buttons .text')].forEach(function (element, index) {
      expect(element.textContent).to.equal(propsData.buttons[index].text)
    })
  })
})
