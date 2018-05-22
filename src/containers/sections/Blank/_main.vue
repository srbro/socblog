<template>
  <div class="container">
    <h1>To be developed</h1>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import RegisterKeyHandler from 'mixins/RegisterKeyHandler'

export default {
  name: 'Blank',
  mixins: [ RegisterKeyHandler ],
  computed: { ...mapState({ navigationActive: state => state.navigation.active }) },
  methods: {
    ...mapActions({ toggleNavigation: 'navigation/toggle' }),
    handleKey (key) {
      switch (key) {
        case 'LEFT':
        case 'BACK':
          if (!this.navigationActive) {
            this.toggleNavigation(true)
          }
          break
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "variables";

.container {
  // background: rgba($white-lighter, 0.9);
  height: 1080rem;
  position: relative;
  width: 1920rem;
}

h1 {
  color: #323e43;
  font-size: 80rem;
  font-weight: 300;
  padding: 100rem;
}

</style>
