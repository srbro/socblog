import {
  summary, favorites, account, reminders, pin, language,
  quality, network, miscellaneous, software, faq, system, debuggerMode
  // faq, tv, cutv, ondemand, problem, system, hdmiyuv, demomode, timezone
} from './allSettings.js'

export default {
  personal: [summary, favorites, account, reminders, pin, language],
  systemPreferences: [quality, network, miscellaneous, software, faq, system],
  dev: [debuggerMode]
  // help: [faq, tv, cutv, ondemand, problem, system]
}
