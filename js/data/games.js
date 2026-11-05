export const BRAND = {
  "hashtag": "#HiddenGamesErmittler",
  "url": "ermittlertyp.hidden.games",
  "ig": {
    "de": "@hiddengames_original",
    "int": "@hiddengames_international"
  }
};

/* Sprachweiter Fallback, wenn kein fallspezifischer Produktlink hinterlegt ist.
   Die künftige schwedische Quiz-Locale verwendet den ISO-Sprachcode `sv`. */
export const PARTNER_WEBSITES = {
  "it": "https://www.msedizioni.it/hidden-games/",
  "fr": "https://tribuo.fr/",
  "es": "https://magicboxint.com/?s=hidden+games",
  "pl": "https://magicboxint.com/pl/?s=hidden+games",
  "pt": "https://pythagoras.pt/pt/2-categorias",
  "fi": "https://toyrock.fi/en/murder-a-mysterious-patient-or-a-missing-culprit-find-the-right-case-for-your-mystery-game-night/",
  "sv": "https://toyrock.fi/en/murder-a-mysterious-patient-or-a-missing-culprit-find-the-right-case-for-your-mystery-game-night/"
};

export const BUY = {
  "1": {
    "amazon": {
      "de": "https://www.amazon.de/dp/B0CHFFSQXD",
      "en": "",
      "it": "https://www.amazon.it/dp/B0F8BTZCKY",
      "fr": "https://www.amazon.fr/dp/B0FN4NGBMD",
      "es": "https://www.amazon.es/dp/B0FN4KM9D5"
    },
    "shopDe": "https://www.hidden.games/produkt/toedliche-ueberfahrt/"
  },
  "2": {
    "amazon": {
      "de": "https://www.amazon.de/dp/B0BGJ61D76",
      "en": "",
      "it": "https://www.amazon.it/dp/B0D14TQTVL",
      "fr": "https://www.amazon.fr/dp/B0DK3V83Q9",
      "es": "https://www.amazon.es/dp/B0DK3TZWB2"
    },
    "shopDe": "https://www.hidden.games/produkt/ein-perfekter-plan/"
  },
  "3": {
    "amazon": {
      "de": "https://www.amazon.de/dp/B09GR85FG9",
      "en": "",
      "it": "https://www.amazon.it/dp/B0DGV5Y7LT",
      "fr": "https://www.amazon.fr/dp/B0FN4P733D",
      "es": ""
    },
    "shopDe": "https://www.hidden.games/produkt/eiskaltes-verbrechen-krimispiel/"
  },
  "4": {
    "amazon": {
      "de": "https://www.amazon.de/dp/B08HJ1VK25",
      "en": "https://www.amazon.com/dp/B0DNZF7QYQ",
      "it": "https://www.amazon.it/dp/B0B7RN4XQH",
      "fr": "https://www.amazon.fr/dp/B0B7RN3GFL",
      "es": "https://www.amazon.es/dp/B0B7RN66FB"
    },
    "shopDe": "https://www.hidden.games/produkt/gruenes-gift/"
  },
  "5": {
    "amazon": {
      "de": "https://www.amazon.de/dp/B08C42MPV4",
      "en": "https://www.amazon.com/dp/B09FYLJYQM",
      "it": "https://www.amazon.it/dp/B09KXXF2RY",
      "fr": "https://www.amazon.fr/dp/B09KY1R61C",
      "es": "https://www.amazon.es/dp/B09KXZDBFS"
    },
    "shopDe": "https://www.hidden.games/produkt/das-diadem-der-madonna/"
  },
  "6": {
    "amazon": {
      "de": "https://www.amazon.de/dp/B0FNN7N576",
      "en": "",
      "it": "",
      "fr": "",
      "es": ""
    },
    "shopDe": "https://www.hidden.games/produkt/glutspur-krimispiel/"
  },
  "7": {
    "amazon": {
      "de": "https://www.amazon.de/dp/B0FNN85CDH",
      "en": "",
      "it": "",
      "fr": "",
      "es": ""
    },
    "shopDe": "https://www.hidden.games/produkt/schatten-der-zeit-krimispiel/"
  },
  "rex": {
    "amazon": {
      "de": "https://www.amazon.de/dp/B0BGJ8DD6V",
      "en": "",
      "it": "https://www.amazon.it/dp/B0DGV8M3KH",
      "fr": "https://www.amazon.fr/dp/B0DK3Q7MQB",
      "es": "https://www.amazon.es/dp/B0DNZPCQPH"
    },
    "shopDe": "https://www.hidden.games/produkt/reif-fuer-die-insel/"
  }
};

/* Sprachen, in denen lokalisierte Fallempfehlungen freigeschaltet sind.
   Kaufbuttons sind davon unabhängig und dürfen vollständig fehlen. */
export const RECOMMENDATION_LOCALES = [
  "de",
  "en",
  "it",
  "fr",
  "es",
  "fi",
  "sv",
  "pl",
  "pt"
];

export const REC = {
  "en": {
    "1": 4,
    "2": 5,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 4,
    "7": "rex",
    "rex": "rex"
  },
  "it": {
    "7": 1
  },
  "fr": {
    "6": 4,
    "7": 1
  },
  "es": {
    "3": 2,
    "6": 4,
    "7": 1
  },
  "fi": {
    "1": 4,
    "2": 2,
    "3": 5,
    "4": 4,
    "5": 5,
    "6": 2,
    "7": "rex",
    "rex": "rex"
  },
  "sv": {
    "1": 4,
    "2": 5,
    "3": "rex",
    "4": 4,
    "5": 5,
    "6": 4,
    "7": "rex",
    "rex": "rex"
  },
  "pl": {
    "1": 4,
    "2": 4,
    "3": "rex",
    "4": 4,
    "5": 4,
    "6": 4,
    "7": "rex",
    "rex": "rex"
  },
  "pt": {
    "1": 4,
    "2": 4,
    "3": "rex",
    "4": 4,
    "5": 4,
    "6": 4,
    "7": "rex",
    "rex": "rex"
  }
};

export const EXTRA_GAMES = {
  "f15": {
    "img": "img/spielf15.jpg",
    "isNew": true,
    "shopDe": "https://www.hidden.games/produkt/alarmstufe-rot/",
    "amazon": {
      "de": "https://www.amazon.de/dp/B0FNNBXVS6"
    }
  },
  "f1": {
    "img": "img/spielf1.jpg",
    "shopDe": "https://www.hidden.games/produkt/hidden-games-tatort-fall-1-der-fall-klein-borstelheim/",
    "amazon": {
      "de": "https://www.amazon.de/dp/B07XB8L63L",
      "it": "https://www.amazon.it/dp/B092497173",
      "fr": "https://www.amazon.fr/dp/B0924BSJ9Z",
      "es": "https://www.amazon.es/dp/B08KDM3PDK"
    }
  },
  "f4": {
    "img": "img/spielf4.jpg",
    "shopDe": "https://www.hidden.games/produkt/ein-drahtseilakt/",
    "amazon": {
      "de": "https://www.amazon.de/dp/B08KDMWHLV",
      "it": "https://www.amazon.it/dp/B0C4TXHL59",
      "fr": "https://www.amazon.fr/dp/B0CN34FNKP",
      "es": "https://www.amazon.es/dp/B0D14RL21M"
    }
  },
  "f5": {
    "img": "img/spielf5.jpg",
    "shopDe": "https://www.hidden.games/produkt/koenigsmord/",
    "amazon": {
      "de": "https://www.amazon.de/dp/B09GRRX6K3",
      "it": "https://www.amazon.it/dp/B0D14VBPHX",
      "fr": "https://www.amazon.fr/dp/B0D14VCNLR",
      "es": "https://www.amazon.es/dp/B0DK248ZCZ"
    }
  },
  "f12": {
    "img": "img/spielf12.jpg",
    "shopDe": "https://www.hidden.games/produkt/campingkiller/",
    "amazon": {
      "de": "https://www.amazon.de/dp/B0DCZV7PH6",
      "it": "https://www.amazon.it/dp/B0FN4JSM4H"
    }
  },
  "f13": {
    "img": "img/spielf13.jpg",
    "shopDe": "https://www.hidden.games/produkt/alle-unter-einem-dach/",
    "amazon": {
      "de": "https://www.amazon.de/dp/B0DCW8WVGK",
      "it": "https://www.amazon.it/dp/B0F1N529F1",
      "es": "https://www.amazon.es/dp/B0FBMGC2TB"
    }
  },
  "sek": {
    "img": "img/spielsek.jpg",
    "shopDe": "https://www.hidden.games/produkt/special-edition-krimispiel/",
    "amazon": {
      "de": "https://www.amazon.de/dp/B0FQCHZQY9"
    }
  }
};

export const EXTRA_ORDER = [
  "f15",
  "f1",
  "f4",
  "f5",
  "f12",
  "f13",
  "sek"
];
