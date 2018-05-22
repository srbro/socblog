import Vue from 'vue'
import CardSelect from 'src/components/CardSelect'

describe('CardSelect.vue', () => {
  const propsData = {
    selectedTitle: 'Filter',
    selectedItem: true,
    selectedItemDefault: false,
    empty: false,
    showIsFiltered: true
  }
  const Ctor = Vue.extend(CardSelect)
  const vm = new Ctor({ propsData }).$mount()

  it('should give special is-selected class if selected is true', () => {
    expect(vm.$el.classList.contains('is-selected')).to.equal(propsData.selectedItem)
  })
  it('should give special is-filtered class', () => {
    expect(vm.$el.classList.contains('is-filtered')).to.equal(propsData.selectedItemDefault && !propsData.selectedItem)
  })
  it('should display text', () => {
    expect(vm.$el.querySelector('.selectCardText').textContent).to.equal('Filter')
  })
})
