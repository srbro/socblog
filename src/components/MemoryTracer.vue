<template>
  <div class="memory-info">
      <p>Limit: {{limit}}</p>
      <p>HeapSize: {{heapSize}}</p>
  </div>
</template>

<script>

// This component is used to show and trace memory usage in our application
export default {
  name: 'MemoryTracer',
  data: () => ({
    limit: 0,
    heapSize: 0,
    timer: -1
  }),
  methods: {
    updateTrace () {
      clearTimeout(this.timer)
      this.limit = window.performance.memory.jsHeapSizeLimit
      this.heapSize = window.performance.memory.totalJSHeapSize
      this.timer = setTimeout(this.updateTrace, 1000)
    }
  },
  mounted () {
    this.updateTrace()
  },
  destroyed () {
    clearTimeout(this.timer)
  }
}
</script>

<style scoped lang="scss">
.memory-info { 
  position: absolute;
  bottom: 0rem;
  right: 0rem;
  width: 300rem;
  height: 200rem;
  z-index: 2000;
  background: black;
  color: white;

  p {
    font-size: 25rem;
    margin: 20rem;
  }
}
</style>
