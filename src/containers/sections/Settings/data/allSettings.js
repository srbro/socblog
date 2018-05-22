export const summary = {
  id: 'summary',
  label: 'settings_summary',
  type: 'Summary',
  values: {
    items: [
      // { id: 'contractNumber', label: 'stb_settings_personal_account_contractnumber', subLabel: '' },
      // { id: 'buyerId', label: 'settings_summary_buyerid', subLabel: '', selected: true },
      // { id: 'subscriptionPackage', label: 'settings_summary_subscriptionpackage', subLabel: '' },
      // { id: 'deviceId', label: 'settings_summary_deviceid', subLabel: '' },
      { id: 'deviceModel', label: 'settings_summary_devicemodel', subLabel: '' },
      { id: 'networkStatus', label: 'settings_summary_networkstatus', subLabel: '' },
      { id: 'videoQuality', label: 'settings_summary_videoquality', subLabel: '' },
      { id: 'language', label: 'settings_summary_language', subLabel: '' },
      { id: 'serialNumber', label: 'stb_settings_systempreferences_about_serialnumber', subLabel: '' },
      { id: 'macAddress', label: 'stb_settings_systempreferences_about_macaddress', subLabel: '' }
    ],
    description: {
      title: 'settings_summary',
      titleAbove: 'general_navigation_settings',
      titleBelow: 'stb_settings_personal_summary_description',
      svgId: `settings-summary`
    }
  }
}

export const favorites = {
  id: 'favorites',
  label: 'stb_settings_personal_favorites',
  type: 'favorites',
  values: {
    items: [
      { id: 0, label: 'stb_settings_personal_favorites_tvlists', selected: true },
      { id: 1, label: 'stb_settings_personal_favorites_radiostationlists' }
    ],
    description: {
      title: 'Favorites',
      titleAbove: 'general_navigation_settings',
      titleBelow: 'stb_settings_personal_favorites_tvlists_categories_description',
      svgId: `settings-favorites`
    }
  }
}

export const account = {
  id: 'account',
  label: 'settings_account',
  type: 'Account',
  values: {
    items: [
      {
        id: 'accountInfo',
        label: 'stb_settings_personal_account_accountinfo',
        subLabel: '',
        selected: true,
        listType: 'info',
        description: {
          titleBelow: 'stb_settings_personal_account_description'
        }
      },
      {
        id: 'signOut',
        label: 'settings_account_signout',
        subLabel: '',
        listType: 'question',
        description: {
          titleBelow: 'settings_signout_change_message_description'
        }
      }
    ],
    description: {
      title: 'settings_account',
      titleAbove: 'general_navigation_settings',
      titleBelow: 'stb_settings_personal_account_description',
      svgId: `settings-account`
    }
  }
}

export const reminders = {
  id: 'reminders',
  label: 'stb_settings_personal_reminders',
  type: 'Reminders',
  values: {
    items: [],
    description: {
      title: 'stb_settings_personal_reminders',
      titleAbove: 'general_navigation_settings',
      titleBelow: 'stb_settings_personal_reminders_description',
      svgId: `settings-reminders`
    }
  }
}

export const pin = {
  id: 'pin',
  label: 'settings_changepin',
  type: 'pin'
}

export const language = {
  id: 'language',
  label: 'settings_language',
  type: 'Language',
  values: {
    items: [{
      id: 'interfaceLanguage',
      label: 'stb_settings_personal_language_interface',
      sublabel: '',
      description: {
        titleBelow: 'stb_settings_personal_language_interface_description'
      }
    },
    {
      id: 'keyboardLanguage',
      label: 'stb_settings_personal_language_keyboard',
      sublabel: '',
      description: {
        titleBelow: 'stb_settings_personal_language_keyboard_description'
      }
    }
    ],
    description: {
      title: 'stb_settings_personal_language',
      titleAbove: 'general_navigation_settings',
      titleBelow: 'stb_settings_personal_language_interface_description',
      svgId: `settings-language`
    }
  }
}

export const timezone = {
  id: 'timezone',
  label: 'stb_settings_personal_timezone',
  type: 'selection'
}

export const about = {
  id: 'about',
  label: 'stb_settings_systempreferences_about',
  type: 'About',
  values: {
    items: [
      {
        id: 0,
        label: 'stb_settings_systempreferences_about_id',
        subLabel: ''
      },
      {
        id: 1,
        label: 'stb_settings_systempreferences_about_serialnumber',
        subLabel: '',
        selected: true
      },
      {
        id: 2,
        label: 'stb_settings_systempreferences_about_macaddress',
        subLabel: ''
      }
    ],
    description: {
      title: 'settings_about',
      titleAbove: 'general_navigation_settings',
      titleBelow: 'stb_settings_systempreferences_about_description',
      svgId: `settings-about`
    }
  }
}

export const quality = {
  id: 'quality',
  label: 'stb_settings_systempreferences_quality',
  type: 'Quality',
  values: {
    items: [
      {
        id: 'videoEncoding',
        label: 'stb_settings_quality_video_encoding',
        sublabel: '',
        description: {
          titleBelow: 'stb_settings_systempreferences_quality_description'
        }
      },
      {
        id: 'videoQuality',
        label: 'settings_videoquality',
        sublabel: '',
        description: {
          titleBelow: 'stb_settings_systempreferences_quality_description'
        }
      }
    ],
    description: {
      title: 'stb_settings_systempreferences_quality',
      titleAbove: 'general_navigation_settings',
      titleBelow: 'stb_settings_systempreferences_quality_description',
      svgId: `settings-quality`
    }
  }
}

export const network = {
  id: 'network',
  label: 'stb_settings_systempreferences_network',
  type: 'Network',
  listType: 'info',
  values: {
    items: [
      {
        id: 'networkStatus',
        label: 'stb_settings_systempreferences_network_networkstatus',
        description: {
          titleBelow: 'stb_settings_systempreferences_network_networkstatus_description'
        }
      },
      {
        id: 'checkConnection',
        label: 'stb_settings_systempreferences_network_checkconnection',
        description: {
          titleBelow: 'stb_settings_systempreferences_network_checkconnection'
        }
      },
      {
        id: 'speedTest',
        label: 'stb_settings_systempreferences_network_speedtest',
        description: {
          titleBelow: 'stb_settings_systempreferences_network_speedtest'
        }
      }],
    description: {
      title: 'stb_settings_systempreferences_network',
      titleAbove: 'general_navigation_settings',
      titleBelow: 'stb_settings_systempreferences_network_networkstatus_description',
      svgId: `settings-network`
    }
  }
}

export const miscellaneous = {
  id: 'miscellaneous',
  label: 'stb_settings_systempreferences_miscellaneous',
  type: 'Miscellaneous',
  values: {
    items: [{
      id: 'zapBannerTimeout',
      label: 'stb_settings_systempreferences_miscellaneous_zapbanner_timeout',
      subLabel: '',
      description: {
        titleBelow: 'stb_settings_systempreferences_miscellaneous_zapbanner_timeout_description'
      }
    },
    {
      id: 'zapBannerOnNewEvent',
      label: 'stb_settings_systempreferences_miscellaneous_zapbanner_onnewevent',
      subLabel: '',
      description: {
        titleBelow: 'stb_settings_systempreferences_miscellaneous_zapbanner_onnewevent_description'
      }
    },
    {
      id: 'rememberThePincode',
      label: 'stb_settings_systempreferences_miscellaneous_zapbanner_rememberpin',
      subLabel: '',
      description: {
        titleBelow: 'stb_settings_systempreferences_miscellaneous_zapbanner_rememberpin_description'
      }
    },
    {
      id: 'uiMode',
      label: 'smtv_miscellaneous_ux_title',
      subLabel: '',
      description: {
        titleBelow: 'smtv_miscellaneous_ux_description'
      }
    },
    {
      id: 'translateMode',
      label: 'smtv_miscellaneous_setanimation_title',
      subLabel: '',
      description: {
        titleBelow: 'smtv_miscellaneous_setanimation_description'
      }
    }
    ],
    description: {
      title: 'stb_settings_systempreferences_miscellaneous',
      titleAbove: 'general_navigation_settings',
      titleBelow: 'stb_settings_systempreferences_miscellaneous_zapbanner_timeout_description',
      svgId: `settings-miscellaneous`
    }
  }
}

export const hdmiyuv = {
  id: 'hdmiyuv',
  label: 'stb_settings_systempreferences_hdmiyuv',
  type: 'selection'
}

export const demomode = {
  id: 'demomode',
  label: 'stb_settings_systempreferences_demomode',
  type: 'selection'
}

export const software = {
  id: 'software',
  label: 'stb_settings_systempreferences_software',
  type: 'Software',
  values: {
    items: [
      { id: 0, label: 'stb_settings_systempreferences_software_application_version', subLabel: 'JS verzija / wrapper version' },
      { id: 1, label: 'stb_settings_systempreferences_os_version', subLabel: 'Platforma (Android TV) verzija platforme (6.0.1) / verzija SDK (23)' },
      { id: 2, label: 'stb_settings_systempreferences_software_platform', subLabel: 'Koja je platforma' },
      { id: 3, label: 'stb_settings_systempreferences_software_tv_model', subLabel: 'model tv-a ili boksa...' },
      { id: 4, label: 'smtv_settings_systempreferences_software_build_version', subLabel: 'build version...' }
    ],
    description: {
      title: 'settings_account',
      titleAbove: 'general_navigation_settings',
      titleBelow: 'stb_settings_personal_account_description',
      svgId: `settings-software`
    }
  }
}

export const faq = {
  id: 'faq',
  label: 'stb_settings_help',
  type: 'FAQ',
  values: {
    items: [
      { id: 0, label: 'settings_help_callcenternumber', subLabel: '+123456789' },
      { id: 1, label: 'settings_help_website', subLabel: 'www.d3go.tv' }
    ],
    description: {
      title: 'settings_help',
      titleAbove: 'general_navigation_settings',
      titleBelow: '',
      svgId: `settings-faq`
    }
  }
}

export const tv = {
  id: 'tv',
  label: 'stb_settings_help_tv',
  type: 'selection'
}

export const cutv = {
  id: 'cutv',
  label: 'stb_settings_help_cutv',
  type: 'selection'
}

export const ondemand = {
  id: 'ondemand',
  label: 'stb_settings_help_ondemand',
  type: 'selection'
}

export const problem = {
  id: 'problem',
  label: 'stb_settings_help_problem',
  type: 'selection'
}

export const system = {
  id: 'system',
  label: 'stb_settings_help_system',
  type: 'System',
  values: {
    items: [
      {
        id: 'restartApp',
        label: 'stb_settings_restart',
        subLabel: '',
        selected: true,
        listType: 'question',
        description: {
          titleBelow: 'stb_settings_restart_description'
        }
      }
    ],
    description: {
      title: 'stb_settings_help_system',
      titleAbove: 'general_navigation_settings',
      titleBelow: 'stb_settings_systempreferences',
      svgId: `settings-system`
    }
  }
}

export const debuggerMode = {
  id: 'debug',
  label: 'stb_settings_help_problem_debug',
  type: 'Debug',
  values: {
    items: [{
      id: 'debuging',
      label: 'stb_settings_help_problem_debug',
      sublabel: '',
      description: {
        titleBelow: 'stb_settings_help_problem_debug_description'
      }
    },
    {
      id: 'sendLog',
      label: 'stb_settings_help_problem_debug_sendlog',
      description: {
        titleBelow: 'Send log'
      }
    },
    {
      id: 'videoType',
      label: 'Stream type',
      sublabel: '',
      description: {
        titleBelow: 'Change stream type'
      }
    },
    {
      id: 'operationMode',
      label: 'Operation Mode',
      sublabel: '',
      description: {
        titleBelow: 'Change Operation Mode'
      }
    }
    ],
    description: {
      title: 'stb_settings_help_problem_debug',
      titleAbove: 'general_navigation_settings',
      titleBelow: 'Set Debugger Mode',
      svgId: `settings-debug`
    }
  }
}
