import { emitKeyPress } from 'src/helpers/keyHold'

describe('keyHold.js', () => {
  const delay = 100
  const sleep = () => new Promise(resolve => setTimeout(resolve, 200))

  it('emitKeyPress should return correct boolean', () => {
    expect(emitKeyPress({ delay })).to.equal(true)
  })
  it('emitKeyPress should return correct boolean', () => {
    emitKeyPress({ delay: 250 })
    sleep()
    const secondRun = emitKeyPress({ delay: 250 })
    expect(secondRun).to.equal(false)
  })
})
