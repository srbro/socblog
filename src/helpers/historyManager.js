import router from 'src/router'
import { mapGetters, mapActions } from 'vuex'

const NAVIGATION_HISTORY_PARAMS = 'navigationHistoryParams'
const BACK_FLAG = 'historyBackPerformed'

/**
*!!!!!!!!!!!!!!!!!!! DANGER !!!!!!!!!!!!!!!!!!!!!!!!!!
* ********** USE WITH EXTEREME CAUTION! *************
*/
let mkDoHistoryBack = () => {
  let focusOnStart = () => {
    router.push(mixins.data().defaultRecord)
  }
  let doHistoryBack = (store) => {
    let popHistoryRecord = () => store.dispatch('history/popHistoryRecord')
    let getPoppedRecord = () => store.getters['history/getPoppedRecord']
    popHistoryRecord()
    let historyRecord = getPoppedRecord()
    if (historyRecord !== null) {
      router.push(historyRecord)
    } else {
      focusOnStart()
    }
  }
  return doHistoryBack
}
// ///////////////////////////////////////////////////
let historyBackPerforming = false

let mixins = {
  data: () => ({
    globalNavigationState: null,
    routeParams: {},
    defaultRecord: {
      name: 'Home',
      params: {
        'activeStripe': 0,
        'navigationHistoryParams': {
          'active': true,
          'hidden': false,
          'activeLane': 'main',
          'mainLaneSelectedItemIndex': 0,
          'subLaneSelectedItemsIndices': [0, 0, 0, 0, 0]
        },
        'historyBackPerformed': true
      }
    },
    recordTypes: {
      blueprints: {
        PlayerTv: {
          routeName: 'PlayerTv',
          paramMappings: {
            data: {
              // columnToFocus: 'channels', // Not used @ the moment.
              channelId: ['currentChannelId'],
              categoryId: ['currentTvCategoryId'],
              categoryType: ['currentTvCategoryType']
            },
            navigation: null
          }
        },
        Home: {
          routeName: 'Home',
          paramMappings: {
            data: {
              activeStripe: ['activeRow']
            }
          },
          navigation: {
            mainLaneSelectedItemIndex: 0,
            subLaneSelectedItemsIndices: [0, 0, 0, 0, 0]
          }
        },
        HomeDetail: {
          routeName: 'HomeDetail',
          paramMappings: {
            data: {
              activeStripe: {}
            }
          },
          navigation: {
            mainLaneSelectedItemIndex: 0,
            subLaneSelectedItemsIndices: [0, 0, 0, 0, 0]
          }
        },
        Guide: {
          routeName: 'Guide',
          paramMappings: {
            data: {
              columnToFocus: ['selectedColumnName']
              // detail: ['detailSelected'],
              // channelId: ['currentChannelId'],
              // eventId: ['selectedEventId']
            }
          },
          navigation: {
            mainLaneSelectedItemIndex: 1,
            subLaneSelectedItemsIndices: [0, 1, 0, 0, 0]
          }
        },
        GuideDetail: {
          routeName: 'Guide',
          paramMappings: {
            data: {
              columnToFocus: ['selectedColumnName']
              // detail: ['selectedColumnName']
              // channelId: selectedItem.channelId,
              // eventId: selectedItem.eventId,
            }
          },
          navigation: {
            mainLaneSelectedItemIndex: 1,
            subLaneSelectedItemsIndices: [0, 1, 0, 0, 0]
          }
        },
        EventDetail: {
          routeName: 'EventDetail',
          paramMappings: {
            data: {}
          },
          navigation: null
        },
        NowTv: {
          routeName: 'NowTv',
          paramMappings: {
            data: {
              activeStripe: ['focusSection'],
              channelId: ['channelFocused']
            }
          },
          navigation: {
            mainLaneSelectedItemIndex: 1,
            subLaneSelectedItemsIndices: [0, 0, 0, 0, 0]
          }
        },
        VodLanding: {
          routeName: 'VodLanding',
          paramMappings: {
            data: {
              activeStripe: ['focusSection']
            }
          },
          navigation: {
            mainLaneSelectedItemIndex: 2,
            subLaneSelectedItemsIndices: [0, 0, 0, 0, 0]
          }
        },
        VodSeeAll: {
          routeName: 'VodSeeAll',
          paramMappings: {
            data: {
              activeStripe: ['focusSection']
            }
          },
          navigation: {
            mainLaneSelectedItemIndex: 2,
            subLaneSelectedItemsIndices: [0, 0, 0, 0, 0]
          }
        },
        SeasonDetail: {
          routeName: 'SeasonDetail',
          paramMappings: {
            data: {}
          }
        },
        EpisodeDetail: {
          routeName: 'EpisodeDetail',
          paramMappings: {
            data: {
              episodeId: ['episodeId']
            }
          }
        },
        Favorites: {
          routeName: 'Favorites',
          paramMappings: {
            data: {
              activeStripe: ['focusSection']
            }
          },
          navigation: {
            mainLaneSelectedItemIndex: 3,
            subLaneSelectedItemsIndices: [0, 1, 0, 0, 0]
          }
        },
        FavoritesSeeAll: {
          routeName: 'FavoritesSeeAll',
          paramMappings: {
            data: {
              pageTitle: ['pageTitle'],
              cardType: ['cardType']
            }
          },
          navigation: {
            mainLaneSelectedItemIndex: 3,
            subLaneSelectedItemsIndices: [0, 1, 0, 0, 0]
          }
        },
        Reminders: {
          routeName: 'Reminders',
          paramMappings: {
            data: {}
          },
          navigation: {
            mainLaneSelectedItemIndex: 3,
            subLaneSelectedItemsIndices: [1, 0, 0, 0, 0]
          }
        },
        Settings: {
          routeName: 'Settings',
          paramMappings: {
            data: {
              selectedRow: ['selectedRow'],
              selectedCard: ['selectedCard']
            }
          },
          navigation: {
            mainLaneSelectedItemIndex: 4,
            subLaneSelectedItemsIndices: [0, 0, 0, 0, 0]
          }
        },
        SettingsOverlay: {
          routeName: 'SettingsOverlay',
          paramMappings: {
            data: {}
          },
          navigation: {
            mainLaneSelectedItemIndex: 4,
            subLaneSelectedItemsIndices: [0, 0, 0, 0, 0]
          }
        },
        ReminderSeeAll: {
          routeName: 'ReminderSeeAll',
          paramMappings: {
            data: {
              pageTitle: ['pageTitle'],
              cards: ['cards']
            }
          },
          navigation: {
            mainLaneSelectedItemIndex: 3,
            subLaneSelectedItemsIndices: [1, 0, 0, 0, 0]
          }
        },
        Radio: {
          routeName: 'Radio',
          paramMappings: {
            data: {
              focusSection: ['focusSection'],
              selectedRadio: ['selectedRadio'],
              channelId: ['channelFocused']
            }
          },
          navigation: {
            mainLaneSelectedItemIndex: 1,
            subLaneSelectedItemsIndices: [0, 2, 0, 0, 0]
          }
        },
        PlayerRadio: {
          routeName: 'PlayerRadio',
          paramMappings: {
            data: {}
          },
          navigation: null
        },
        Search: {
          routeName: 'Search',
          paramMappings: {
            data: {}
          },
          navigation: null
        },
        TwoSidedDialog_i: {
          routeName: 'SettingsTwoSidedOvelay',
          paramMappings: {
            data: {}
          },
          navigation: {
            mainLaneSelectedItemIndex: 4,
            subLaneSelectedItemsIndices: [0, 0, 0, 0, 0]
          }
        },
        ParentalRating: {
          routeName: 'PlayerTv',
          paramMappings: {
            data: {}
          },
          navigation: null
        },
        Pin: {
          routeName: 'Settings',
          paramMappings: {
            data: {}
          },
          navigation: null
        },
        InputScreen: {
          routeName: null,
          paramMappings: {
            data: {}
          },
          navigation: null
        },
        VodDetail: {
          routeName: 'VodDetail',
          paramMappings: {
            data: {}
          },
          navigation: null
        },
        VodPLayer: {
          routeName: 'VodPLayer',
          paramMappings: {
            data: {}
          },
          navigation: null
        }
      }
    }
  }),
  computed: {
    ...mapGetters({
      navigationState: 'navigation/getNavigationState',
      poppedRecord: 'history/getPoppedRecord',
      getHistoryLength: 'history/getHistoryLength',
      vodPolicy: 'vod/vodPolicy'
    }),
    vodInt: () => { return this.vodPolicy ? 1 : 0 }
  },
  methods: {
    ...mapActions({
      toggleNavigation: 'navigation/toggle',
      navigationSyncWithRoute: 'navigation/syncWithRoute',
      pushHistoryRecord: 'history/pushHistoryRecord',
      popHistoryRecord: 'history/popHistoryRecord',
      clearHistroy: 'history/clearHistroy',
      setWholeNavigation: 'navigation/setWholeNavigation'
    }),
    makeRecord (blueprint, navigationState, callParams, routeName) {
      let params = callParams
      Object.keys(blueprint.paramMappings.data).forEach((key) => {
        // params[key] = this[blueprint.paramMappings.data[key][0]]
        params[key] = typeof this[blueprint.paramMappings.data[key][0]] === 'function' ? this[blueprint.paramMappings.data[key][0]]() : this[blueprint.paramMappings.data[key][0]]
      })

      navigationState = blueprint.navigation ? {...navigationState, ...blueprint.navigation} : navigationState
      navigationState.mainLaneSelectedItemIndex += navigationState.mainLaneSelectedItemIndex > 2 && (this.vodPolicy === false) ? -1 : 0
      params[NAVIGATION_HISTORY_PARAMS] = navigationState
      params[BACK_FLAG] = true

      if (blueprint.routeName === null && routeName) {
        blueprint.routeName = routeName
      }

      return {
        name: blueprint.routeName,
        params: params
      }
    },
    focusOnStart () {
      if (this.$options.name === 'Home') {
        this.setWholeNavigation(this.defaultRecord.params.navigationHistoryParams)
      } else {
        this.$router.push(this.defaultRecord)
      }
    },
    saveHistoryRecord () {
      this.globalNavigationState = this.navigationState
      let navigationState = this.globalNavigationState
      let recordBlueprint = this.recordTypes.blueprints[this.$options.name]
      let callParams = this.routeParams
      let record = this.makeRecord(recordBlueprint, navigationState, callParams)
      this.pushHistoryRecord(record)
    },
    doHistoryBack () {
      historyBackPerforming = true
      let historyLength = this.getHistoryLength
      this.popHistoryRecord()
      let historyRecord = this.poppedRecord

      if (!this.navigationState.active && !this.navigationState.hidden && this.$route.path.search('/nav/') !== -1 && historyLength < 1) {
        this.toggleNavigation(true)
        this.navigationSyncWithRoute()
      } else {
        if (historyRecord !== null) {
          console.log('REDIRECT HISTORY', historyRecord)
          this.$router.push(historyRecord)
        } else {
          this.focusOnStart()
        }
      }
    },
    freeMem () {
      if (this.navigationState.active && !this.navigationState.hidden) {
        this.clearHistroy()
      }
    },
    doHistorySave () {
      if (!historyBackPerforming) {
        this.saveHistoryRecord()
      } else {
        historyBackPerforming = false
      }
    },
    beforeMountHistoryLogic () {
      this.routeParams = {...this.$route.params}
      // Line solves re-initalization problem which occurs when we re-use componen on back.
      // this.historyBackPerforming = false
      if (this.$route.params[BACK_FLAG]) {
        this.setWholeNavigation(this.$route.params[NAVIGATION_HISTORY_PARAMS])
      }
      this.freeMem()
    }
  },
  mounted () {
    window.route = this.$route
    console.log('%cHISTORY MANAGER ', 'font-size:14px', 'component ', this.$options.name)
    console.log('%cMOUNTED', 'color: BLUE', 'historyBackPerforming', historyBackPerforming)
    this.beforeMountHistoryLogic()
  },
  beforeDestroy () {
    console.log('%cHISTORY MANAGER ', 'font-size:14px', 'component ', this.$options.name)
    console.log('%cBEFORE_DESTROY', 'color: BLUE', 'historyBackPerforming', historyBackPerforming)
    this.doHistorySave()
    // historyBackPerforming = false
  }
}

export { mixins, mkDoHistoryBack, NAVIGATION_HISTORY_PARAMS, BACK_FLAG }
