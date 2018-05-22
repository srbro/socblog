import { KEY_NAMES } from 'src/hal/consts/consts'
import { KEY_MAP as KEY_MAP_STB } from 'src/hal/consts/constsSTB'

describe('HAL key definitions', () => {
  describe('Each keys should be subset of keys superset', () => {
    const testMeBabe = (keyName) => {
      it(`Key ${keyName} exists in keys superset.`, () => {
        expect(KEY_NAMES.has(keyName)).to.equal(true)
      })
    }

    Object.keys(KEY_MAP_STB).forEach(keyCode => {
      testMeBabe(KEY_MAP_STB[keyCode])
    })
  })
})
