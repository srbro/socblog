import { mapActions } from 'vuex'
import RegisterKeyHandler from 'containers/mixins/RegisterKeyHandler'
import CustomButton from 'components/Button'
import NumberPicker from './NumberPicker'

const BUTTON_LEVELS = ['back', 'pin']

export default {
  components: { CustomButton, NumberPicker },
  mixins: [ RegisterKeyHandler ],
  data () {
    return {
      currentSelection: 0,
      activeLevel: 'pin',
      pin: [null, null, null, null],
      direction: null,
      position: 5,
      pinPositions: [5, 5, 5, 5]
    }
  },
  computed: {
    numbers () {
      return this.pin
    },
    theme () {
      return this.playerMode === 'VOD' ? 'dark' : 'light'
    }
  },
  methods: {
    handleKey (key) {
      switch (key) {
        case 'BACK':
          // We replicate situation when user presses OK while BACK-BUTTON selected.
          this.activeLevel = 'back'
          this.pressOk()
          break
        case 'LEFT':
        case 'RIGHT':
          return this.moveSelection(key)
        case 'UP':
        case 'DOWN':
          return this.changeLevel(key)
        case 'OK':
          return this.pressOk()
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          this.setNumber(key)
          break
        case 'SCROLLUP':
        case 'SCROLLDOWN':
          if (this.parentalRatingActive) {
            this.toggleParentalRating({ active: false })
          }
          this.nextPrevChannel({ direction: key === 'SCROLLUP' ? 'next' : 'prev' })
          break
        default:
          break
      }
    },
    handleClickNumberPicker (index) {
      this.currentSelection = index
    },
    moveSelection (direction) {
      if (this.activeLevel !== 'pin') return
      if (this.currentSelection === 0 && direction === 'LEFT') {
        this.activeLevel = 'back'
        this.currentSelection = -1
      } else {
        const offset = direction === 'LEFT' ? -1 : 1
        this.currentSelection = Math.min(Math.max(this.currentSelection + offset, 0), this.numbers.length - 1)
        this.position = this.pinPositions[this.currentSelection]
        this.direction = 0
      }
    },
    changeLevel (direction) {
      const offset = direction === 'UP' ? -1 : 1
      if (this.activeLevel === 'pin') {
        this.setPosition(offset)
      } else {
        const currentLevelIndex = BUTTON_LEVELS.indexOf(this.activeLevel)
        this.activeLevel = BUTTON_LEVELS[Math.min(Math.max(currentLevelIndex + offset, 0), BUTTON_LEVELS.length - 1)]
        this.currentSelection = this.activeLevel === 'pin' ? 0 : -1
      }
    },
    pressOk () {
      if (this.activeLevel === 'back') {
        this.currentSelection = -1
        return this.exit()
      } else if (this.activeLevel === 'pin') {
        this.currentSelection < 3 ? this.moveSelection('RIGHT') : this.proceed()
      } else {
        let buttonPressed = this.numbers.length > 0 ? this.numbers[this.currentSelection] : null
        if (buttonPressed) this.proceed()
        return this.exit()
      }
    },
    setPosition (offset) {
      this.direction = offset
      this.position = this.position + offset * -1
      if (this.position > 9) this.position = 0
      if (this.position < 0) this.position = 9
    },
    onPinChange (value, position) {
      this.pin[this.currentSelection] = value
      this.pinPositions[this.currentSelection] = position
    },
    setNumber (number) {
      number = parseInt(number)
      if (number <= 5) {
        for (let i = 0; i <= 5; i++) {
          if (i === number) this.pinPositions[this.currentSelection] = 5 - i
        }
      } else {
        const a = [0, 0, 0, 0, 0, 0, 9, 8, 7, 6]
        for (let i = 6; i <= 9; i++) {
          if (i === number) this.pinPositions[this.currentSelection] = a[i]
        }
      }
      this.pin[this.currentSelection] = number
      this.moveSelection('RIGHT')
    },
    ...mapActions({
      checkPin: 'settings/checkPin'
    })
  }
}
