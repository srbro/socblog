import store from 'src/vuex/store'
import filter from 'lodash/fp/find'

export const getPPByAudio = (availablePPList, audioLanguage) => {
  let publishingPointList = filter({'audioLanguage': audioLanguage})(availablePPList)
  return publishingPointList
}

export const getPPBySubtitle = (availablePPList, subtitleLanguage) => {
  let publishingPointList = filter({'subtitleLanguage': subtitleLanguage})(availablePPList)
  return publishingPointList
}

export const getPP = (availablePPList) => {
  let firstAudioLanguage = store.state.settings.firstAudioLanguage
  let secondAudioLanguage = store.state.settings.secondAudioLanguage
  let subtitleLanguage = store.state.settings.secondAudioLanguage
  let interfaceLanguage = store.state.settings.interfaceLanguage

  if (availablePPList.length === 1) return availablePPList[0]

  let selectedByLanguage = getPPByAudio(availablePPList, firstAudioLanguage)
  if (selectedByLanguage.length === 1) return selectedByLanguage[0]
  if (selectedByLanguage.length === 0) {
    selectedByLanguage = getPPByAudio(availablePPList, secondAudioLanguage)
  }

  if (selectedByLanguage.length === 1) return selectedByLanguage[0]
  if (selectedByLanguage.length === 0) {
    selectedByLanguage = getPPByAudio(availablePPList, interfaceLanguage)
  }

  if (selectedByLanguage.length === 1) return selectedByLanguage[0]
  if (selectedByLanguage.length === 0) return availablePPList[0]

  let selectedbySubtitle = getPPBySubtitle(selectedByLanguage, subtitleLanguage)
  if (selectedbySubtitle.length === 1) return selectedbySubtitle[0]
  if (selectedbySubtitle.length === 0) return selectedByLanguage[0]
  return selectedbySubtitle[0]
}
