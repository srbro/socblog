import Vue from 'vue'
import ChannelNumber from 'src/components/ChannelNumber'

describe('ChannelNumber.vue', () => {
  const propsData = {
    channelName: 'BBC',
    channelNo: '19',
    active: true
  }
  const Ctor = Vue.extend(ChannelNumber)
  const vm = new Ctor({ propsData: propsData }).$mount()

  it('should display correct channel name', () => {
    expect(vm.$el.querySelector('.name').textContent).to.equal('BBC')
  })
  it('should display correct channel number', () => {
    expect(vm.$el.querySelector('.number').textContent).to.equal('19')
  })
})
