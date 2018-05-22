export default {
  zapBannerTimeout: [
    { id: 3000, label: '3s' },
    { id: 5000, label: '5s' },
    { id: 7000, label: '7s' },
    { id: 10000, label: '10s' },
    { id: 86400000, label: 'stb_settings_systempreferences_miscellaneous_zapbanner_timeout_until' } // quick fix
  ],
  zapBannerOnNewEvent: [
    { id: 'no', label: 'stb_settings_systempreferences_miscellaneous_zapbanner_onnewevent_no' },
    { id: 'yes', label: 'stb_settings_systempreferences_miscellaneous_zapbanner_onnewevent_yes' }
  ],
  rememberThePincode: [
    { id: 'noTimeout', label: 'stb_settings_miscellaneous_rememberpincode_notimeout' },
    { id: '5min', label: '5 min' },
    { id: '1h', label: '1 h' },
    { id: '2h', label: '2 h' },
    { id: 'until6am', label: 'stb_settings_systempreferences_miscellaneous_zapbanner_rememberpin_untilh' },
    { id: 'untilReboot', label: 'stb_settings_systempreferences_miscellaneous_zapbanner_rememberpin_untilreboot' }
  ],
  audioType: [
    { id: 'stereo', label: 'Stereo' },
    { id: 'dolby', label: 'Dolby' }
  ],
  reminders: [
    { id: 0, label: 'settings_reminder_remindersection_onevettime' },
    { id: 5, label: '5', locReplace: 'settings_reminder_remindersection_timebefore' },
    { id: 10, label: '10', locReplace: 'settings_reminder_remindersection_timebefore' },
    { id: 15, label: '15', locReplace: 'settings_reminder_remindersection_timebefore' }
  ],
  videoEncoding: [
    { id: 'ABR', label: 'ABR' },
    { id: 'CBR', label: 'CBR' }
  ],
  videoType: [
    { id: 'm3u8', label: 'HLS-TS' },
    { id: 'dash', label: 'DASH' },
    { id: 'http', label: 'TS' },
    { id: 'dvb', label: 'DVB' }
  ],
  operationMode: [
    { id: 'hybrid', label: 'Hybrid (DVB)' },
    { id: 'ott', label: 'OTT' }
  ],
  accountInfo: [
    { id: 0, label: 'settings_summary_contactnumber', type: 'contractNumber' },
    { id: 1, label: 'settings_summary_buyerid', type: 'buyerId' },
    { id: 2, label: 'settings_summary_subscriptionpackage', type: 'packageName' }
  ],
  signOut: [
    { id: 0, label: 'settings_signout_change_message_button_yes' },
    { id: 1, label: 'settings_signout_change_message_button_no' }
  ],
  restartApp: [
    { id: 0, label: 'settings_signout_change_message_button_yes' },
    { id: 1, label: 'settings_signout_change_message_button_no' }
  ],
  networkStatus: [
    { id: 0, label: 'stb_settings_systempreferences_network_networkstatus_ipaddresssetting', subLabel: 'Auto' },
    { id: 1, label: 'stb_settings_systempreferences_network_networkstatus_ipadress', subLabel: '192.168.88.88' },
    { id: 2, label: 'stb_settings_systempreferences_network_networkstatus_subnetmask', subLabel: '255.255.255.125' },
    { id: 3, label: 'stb_settings_systempreferences_network_networkstatus_defaultgateway', subLabel: '192.168.35.1' },
    { id: 4, label: 'stb_settings_systempreferences_network_networkstatus_primarydns', subLabel: '192.168.1.254' },
    { id: 5, label: 'stb_settings_systempreferences_network_networkstatus_secondarydns', subLabel: 'off' },
    { id: 6, label: 'stb_settings_systempreferences_network_networkstatus_macaddress', subLabel: 'getMac' }
  ],
  checkConnection: [
    { id: 0, label: 'stb_settings_systempreferences_network_checkconnection_localaccess', subLabel: 'OK' },
    { id: 1, label: 'stb_settings_systempreferences_network_checkconnection_internetaccess', subLabel: 'OK' }
  ],
  speedTest: [
    { id: 0, label: 'stb_settings_systempreferences_network_speedtest_ping', subLabel: '0 MS' },
    { id: 1, label: 'stb_settings_systempreferences_network_speedtest_min', subLabel: '0 MS' },
    { id: 2, label: 'stb_settings_systempreferences_network_speedtest_max', subLabel: '0 MS' },
    { id: 3, label: 'stb_settings_systempreferences_network_speedtest_current speed', subLabel: '' },
    { id: 4, label: 'stb_settings_systempreferences_network_speedtest_server', subLabel: '' }
  ],
  uiMode: [
    { id: 'ADVANCED', label: 'smtv_miscellaneous_ux_option_advanced', subLabel: 'advanced' },
    { id: 'BASIC', label: 'smtv_miscellaneous_ux_option_basic', subLabel: 'basic' }
  ],
  translateMode: [
    { id: 'TRANSLATE2D', label: 'smtv_miscellaneous_setanimation_option_software_acceleration', subLabel: '2D' },
    { id: 'TRANSLATE3D', label: 'smtv_miscellaneous_setanimation_option_hardware_acceleration', subLabel: '3D' }
  ],
  debuging: [
    { id: 0, label: 'stb_settings_systempreferences_demomode_on' },
    { id: 1, label: 'stb_settings_systempreferences_demomode_off' }
  ]
}
