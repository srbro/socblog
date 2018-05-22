<template lang="html">
  <no-items
    :no-items-title="loc('general_navigation_mylibrary')"
    :no-items-text="loc('general_mylibrary_description')"
    :icon-set="false"
  />
</template>

<script>
import noItems from 'components/noItems'

export default {
  name: 'MyLibrary',
  components: { noItems }
}
</script>

<style lang="css">
</style>
