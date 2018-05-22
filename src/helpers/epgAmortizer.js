import { fetchEPG, fetchEPGn } from 'helpers/api'
import moment from 'moment'

const TIME_LIMIT_PAST = 7
const TIME_LIMIT_FUTURE = 3

const STASH_LIMIT_LOW = 300
const STASH_LIMIT_HI = 400

const PROXIMITY_OFFSET = 20

let PAGE_FETCH_IN_PROGRESS = false

let eventStash = (() => {
  let self = {}

  let _stash = []
  let _stashMap = {}
  let _channelId = null
  let _eventDensity = null

  let mapStash = (stash) => {
    let map = {}
    stash.forEach((e, i) => {
      map[e.id] = i
    })
    return map
  }

  let filterChunk = (chunk, eventMap) => {
    return chunk.filter((e) => eventMap[e.id] === undefined)
  }

  let calcDensity = (chunk) => {
    let startTime = moment(chunk[0].startTime).valueOf()
    let endTime = moment(chunk[chunk.length - 1].endTime).valueOf()
    return Math.round((endTime - startTime) / chunk.length)
  }

  let adjustDensity = (chunk, density) => {
    return ((chunk.length > 0 && calcDensity(chunk)) + density) / 2
  }

  let limitChunk = (chunk, limitLow, limitHi, sideToSlice) => {
    if (chunk.length >= limitHi) {
      if (sideToSlice > 0) {
        return chunk.slice(0, limitLow)
      } else {
        return chunk.slice(-limitLow)
      }
    } else {
      return chunk
    }
  }

  self.initChunk = (cId, events) => {
    _channelId = cId
    _stash = events
    _stashMap = mapStash(_stash)
    _eventDensity = calcDensity(events)
  }

  self.appendChunk = (chunk, side) => {
    console.log('EPG_AMORT, appending stash', _stash)
    chunk = filterChunk(chunk, _stashMap)
    _eventDensity = adjustDensity(chunk, _eventDensity)
    if (side < 0) {
      _stash = chunk.concat(_stash)
    } else {
      _stash = _stash.concat(chunk)
    }
    console.log('EPG_AMORT, stash before limitation', _stash)
    _stash = limitChunk(_stash, STASH_LIMIT_LOW, STASH_LIMIT_HI, -side)
    console.log('EPG_AMORT, stash after limitation', _stash)
    _stashMap = mapStash(_stash)
  }

  self.getChunk = (anchorEventId, offset, force) => {
    if (anchorEventId !== undefined) {
      let lim1 = _stashMap[anchorEventId]
      let lim2 = lim1 + offset
      if (!force && (lim2 < 0 || lim2 > _stash.length)) {
        return lim2 < 0 ? Math.abs(lim2) : lim2 - _stash.length - 1
      } else {
        lim2 = lim2 < 0 ? 0 : (lim2 >= _stash.length ? _stash.length - 1 : lim2)
        if (lim1 === 0 && lim2 === 0) {
          return []
        } else {
          return lim1 < lim2 ? _stash.slice(lim1 + 1, lim2) : _stash.slice(lim2, lim1 - 1)
        }
      }
    } else {
      return _stash
    }
  }

  self.getEvent = (eventId) => _stash[_stashMap[eventId]]
  self.getOldestEvent = () => _stash[0]
  self.getNewestEvent = () => _stash[_stash.length - 1]
  self.getEvenDensity = () => _eventDensity
  self.getChannelId = () => _channelId
  return self
})()

export const pullEpgNInital = (channelId, nBefore, nAfter) => {
  return new Promise((resolve, reject) => {
    fetchEPGn(channelId, nBefore, nAfter)
      .then((result) => {
        eventStash.initChunk(channelId, result.data[channelId])
        resolve(eventStash.getChunk())
      })
      .catch((error) => reject(error))
  })
}

export const pullEpgInital = ({ channelId, startTime, endTime }) => {
  console.log('EPG_PLAYER, INITALIZING CHANNEL ', channelId)

  let startTimeTimestamp = startTime
  let endTimeTimestamp = endTime
  let density = endTimeTimestamp - startTimeTimestamp
  let t1 = startTimeTimestamp - density * PROXIMITY_OFFSET
  let t2 = endTimeTimestamp + density * PROXIMITY_OFFSET

  let m1 = moment(t1)
  let m2 = moment(t2)

  m1 = m1 <= moment().subtract(TIME_LIMIT_PAST, 'days') ? moment().subtract(TIME_LIMIT_PAST, 'days') : m1
  m2 = m2 >= moment().add(TIME_LIMIT_FUTURE, 'days') ? moment().add(TIME_LIMIT_FUTURE, 'days') : m2

  return new Promise((resolve, reject) => {
    fetchEPG(channelId, m1.valueOf(), m2.valueOf())
      .then((result) => {
        eventStash.initChunk(channelId, result.data[channelId])
        resolve(eventStash.getChunk())
      })
      .catch((error) => reject(error))
  })
}

export const pullEpgN = (channelId, eventId, offset) => {
  return new Promise((resolve, reject) => {
    if (PAGE_FETCH_IN_PROGRESS === true && channelId === eventStash.getChannelId()) {
      resolve([])
    }

    let chunk = eventStash.getChunk(eventId, offset)
    if (typeof chunk === 'number') {
      let t1 = 0
      let t2 = 0
      let side = Math.sign(offset)
      let dt = eventStash.getEvenDensity() * offset * 3
      let m1 = 0
      let m2 = 0

      if (side === 1) {
        t1 = moment(eventStash.getNewestEvent().endTime).valueOf()
        t2 = t1 + dt - 1
      } else {
        t2 = moment(eventStash.getOldestEvent().startTime).valueOf()
        t1 = t2 + dt + 1
      }

      m1 = moment(t1)
      m2 = moment(t2)

      m1 = m1 <= moment().subtract(TIME_LIMIT_PAST, 'days') ? moment().subtract(TIME_LIMIT_PAST, 'days') : m1
      m2 = m2 >= moment().add(TIME_LIMIT_FUTURE, 'days') ? moment().add(TIME_LIMIT_FUTURE, 'days') : m2

      if (m2 < m1) {
        let chunk = eventStash.getChunk(eventId, offset, true)
        resolve(chunk)
      } else {
        PAGE_FETCH_IN_PROGRESS = true
        fetchEPG(channelId, m1.valueOf(), m2.valueOf())
          .then((result) => {
            PAGE_FETCH_IN_PROGRESS = false
            eventStash.appendChunk(result.data[channelId], side)
            let chunk = eventStash.getChunk(eventId, offset, true)
            resolve(chunk)
          })
          .catch((error) => {
            PAGE_FETCH_IN_PROGRESS = false
            reject(error)
          })
      }
    } else {
      resolve(chunk)
    }
  })
}
