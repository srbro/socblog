import { OFFSET_LEFT } from 'helpers/oneliners'

export default {
  data () {
    return {
      translateMode: window.translateMode
    }
  },
  computed: {
    containerStyle () {
      let transform3d = `transform: translate3d(${OFFSET_LEFT[!this.navigationActive ? 'active' : 'inactive']}rem, 0, 0);`
      let transform2d = `transform: translate(${OFFSET_LEFT[!this.navigationActive ? 'active' : 'inactive']}rem, 0);`
      return !this.translateMode.translate ? transform3d : transform2d
    }
  }
}
