// import store from 'src/vuex/store'
// import { initialise } from 'src/containers/twoSidedDialog/selectList'

// describe('selectList.js', () => {
//   describe('initialise', () => {
//     const params = {
//       values: {
//         items: [{
//           id: 'zapBannerTimeout',
//           label: 'Zapbanner Time Out',
//           subLabel: '',
//           description: {
//             titleBelow: 'Select after how many seconds the zapbanner should disappear.'
//           }
//         },
//         {
//           id: 'zapBannerOnNewEvent',
//           label: 'Zapbanner On New Event',
//           subLabel: '',
//           description: {
//             titleBelow: 'Select appearance of zapbanner every time a new program starts.'
//           }
//         },
//         {
//           id: 'rememberThePincode',
//           label: 'Remember The Pincode',
//           subLabel: '',
//           description: {
//             titleBelow: 'Select the default timeout value for this option.'
//           }
//         }],
//         description: {
//           title: 'Miscellaneous',
//           titleAbove: 'Settings',
//           titleBelow: 'Select after how many seconds the zapbanner should disappear.',
//           svgId: `settings-miscellaneous`
//         }
//       },
//       itemActive: 0,
//       backVisible: true,
//       clearVisible: true,
//       theme: 'light'
//     }

//     initialise(params)

//     it('should be defined', () => {
//       expect(store.state.twoSidedDialog.active).not.to.equal(undefined)
//     })
//     it('should change active to true', () => {
//       expect(store.state.twoSidedDialog.active).to.equal(true)
//     })
//     it('should change itemActive to true', () => {
//       expect(store.state.twoSidedDialog.itemActive).to.equal(0)
//     })
//     it('should have correct theme', () => {
//       expect(store.state.twoSidedDialog.theme).to.equal(params.theme)
//     })
//     it('should have correct type', () => {
//       expect(store.state.twoSidedDialog.type).to.equal('selectList')
//     })
//     it('should have transitionType type', () => {
//       expect(store.state.twoSidedDialog.transitionType).to.equal('default')
//     })
//     it('should have correct itemActiveVisible value', () => {
//       expect(store.state.twoSidedDialog.itemActiveVisible).to.equal(true)
//     })
//     it('should have correct backVisible value', () => {
//       expect(store.state.twoSidedDialog.backVisible).to.equal(true)
//     })
//     it('should have correct backActive value', () => {
//       expect(store.state.twoSidedDialog.backActive).to.equal(false)
//     })
//     it('should have correct clearVisible value', () => {
//       expect(store.state.twoSidedDialog.clearVisible).to.equal(true)
//     })
//     it('should have correct clearActive value', () => {
//       expect(store.state.twoSidedDialog.clearActive).to.equal(false)
//     })
//     it('should have correct clearText value', () => {
//       expect(store.state.twoSidedDialog.clearText).to.equal('Cancel')
//     })
//   })
// })
