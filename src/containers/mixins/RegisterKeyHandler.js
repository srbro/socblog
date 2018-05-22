import { getRegisteredHandlers } from 'src/KeyHandler'
import { mapActions } from 'vuex'
import { EventBus } from 'helpers/eventBus'

export default {
  created () {
    this.registerComponentHandler({ name: this.$options.name, handler: this.handleKey })
  },
  mounted () {
    EventBus.$on('register_keyhandler', (route) => {
      if (route.name === this.$options.name && !getRegisteredHandlers().has(route.name)) {
        this.registerComponentHandler({ name: this.$options.name, handler: this.handleKey })
      }

      if (this.$options.name === 'Navigation' && !getRegisteredHandlers().has('Navigation') && !route.fullPath.includes('no-nav')) {
        this.registerComponentHandler({ name: this.$options.name, handler: this.handleKey })
      }
    })
  },
  methods: {
    ...mapActions({
      registerComponentHandler: 'keyHandler/registerComponentHandler',
      unregisterComponentHandler: 'keyHandler/unregisterComponentHandler'
    })
  },
  beforeDestroy () {
    EventBus.$off('register_keyhandler')
    this.unregisterComponentHandler(this.$options.name)
  }
}
