let keyPressTimestamp = 0

export const emitKeyPress = ({ delay }) => {
  let now = nowTimestamp()
  if (now > keyPressTimestamp) {
    keyPressTimestamp = now + delay
    return true
  }
  return false
}

const nowTimestamp = () => (Date.now())
