const mkLock = () => ({
  key: false,
  lock: function () {
    this.key = true
  },
  unlock: function () {
    this.key = false
  },
  delayedUnlock: function (t) {
    let unlock = this.unlock.bind(this)
    window.setTimeout(
      unlock,
      t
    )
  }
})
export default mkLock
