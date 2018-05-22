// import Vuex from 'vuex'
// import store from 'src/vuex/modules/playerEvents'
// import { expect } from 'chai'
// import cloneDeep from 'lodash/fp/cloneDeep'
// import axios from 'axios'
// import MockAdapter from 'axios-mock-adapter'

// import {
//   calcDayOffset,
//   adjustedMoment
// } from 'helpers/time'

// import fetchEvents from './playerEventsJSON/fetchEvents.json'
// import mappedEvents from './playerEventsJSON/fetchEventsResult.json'

// const mock = new MockAdapter(axios)

// describe('PlayerEvents vuex', () => {
//   let PlayerEventsStore

//   const day = (t) => {
//     t = t || adjustedMoment()
//     let day = new Date(t)
//     return day.getDay()
//   }

//   const checkDay = (diff) => {
//     let t = adjustedMoment()
//     let day = new Date(t).getDay() + diff

//     if (day <= 6 && day >= 0) {
//       return day
//     } else if (day < 0) {
//       return day + Math.abs(diff)
//     }

//     switch (day) {
//       case 7:
//         return 1
//       case 8:
//         return 2
//       case 9:
//         return 3
//     }
//   }

//   beforeEach(() => {
//     // Clone the default store options so we can ensure clean state
//     const cloneStore = { modules:
//       {
//         playerEvents: cloneDeep(store),
//         general: {
//           namespaced: true,
//           state: {
//             tvChannelsMap: {
//               '8': {
//                 'cutvEnabled': true,
//                 'startOverEnabled': true
//               }
//             }
//           }
//         }
//       }
//     }
//     PlayerEventsStore = new Vuex.Store(cloneStore)
//   })

//   mock.onGet(/.*?\/events\/epg.+/).reply(200, [
//     ...fetchEvents
//   ])

//   describe('Mock events API', () => {
//     it('Get events', () => {
//       PlayerEventsStore.dispatch('playerEvents/getInitalEvents', { channelId: 8, eventId: 3942370 }).then(() => {
//         expect(PlayerEventsStore.state.events).to.deep.equal(mappedEvents)
//       }).catch((err) => {
//         return err
//       })
//     })
//   })

//   describe('Events boundaries', () => {
//     it('Events for 3 days ahead', () => {
//       expect(day(calcDayOffset(3))).to.equal(checkDay(3))
//     })
//     it('Events for 7 days before', () => {
//       expect(day(calcDayOffset(-7))).to.equal(checkDay(-7))
//     })
//   })
// })
