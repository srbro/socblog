import Vue from 'vue'
import Activation from 'src/components/Activation'

describe('Activation.vue', () => {
  const propsData = {
  //  items: ['Bosnian', 'Croatian', 'English', 'Montenegrin', 'Serbian', 'Slovenian'],
  //  activeIndex: 2
  }
  const Ctor = Vue.extend(Activation)
  const vm = new Ctor({ propsData }).$mount()

  // Logo currently disabled because of Samsung submission
  // it('should display a logo image', () => {
  //   expect(vm.$el.querySelector('.logo')).to.have.property('src')
  // })
  // it('should display the title', () => {
  //   expect(vm.$el.querySelector('.title').textContent).to.equal('Activation')
  // })
  it('should display activation instructions', () => {
    expect(vm.$el.querySelector('.textActCode').textContent).to.not.equal('stb_login_activation_activationcode')
  })
  // it('should display activation code title', () => {
  //   expect(vm.$el.querySelector('.otpText').textContent).to.equal('activation code')
  // })
  it('OTP code itself', () => {
    expect(vm.$el.querySelectorAll('.pin').length).to.not.equal('.......')
  })
  // it('instructions should be shown', () => {
  //   expect(vm.$el.querySelectorAll('.footer-text').length).to.equal('This screen will automatically update once')
  // })
})
