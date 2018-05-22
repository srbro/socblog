let dontShowContent = false
let switchOff = 0

export default {
  data: () => ({
    showLoader: false
  }),
  methods: {
    initLoader () {
      dontShowContent = false
      this.showLoader = true
      this.$router.beforeEach((to, from, next) => {
        dontShowContent = true
        next()
      })
    },
    hideLoader () {
      clearTimeout(switchOff)
      switchOff = setTimeout(() => {
        if (!dontShowContent) this.showLoader = false
      }, 200)
    }
  }
}
