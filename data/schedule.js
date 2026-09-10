/*
 * Food truck schedule data.
 *
 * To refresh: update `updated` and replace the entries in `schedule`.
 * Keys are ISO dates (YYYY-MM-DD). Each entry is [locationKey, emoji, truckName, hours].
 * Dates with no entry render as "no listing" automatically.
 */
window.FOOD_TRUCKS = {
  updated: '2026-09-07',

  locations: {
    stoup:  { tag: 'Stoup',       name: 'Stoup',                 url: 'https://www.stoupbrewing.com/ballard/' },
    urban:  { tag: 'Urban Fam',   name: 'Urban Family',          url: 'https://urbanfamilybrewing.com/home/calendar/' },
    bbyc:   { tag: 'Bale/Yonder', name: 'Bale Breaker / Yonder', url: 'https://www.bbycballard.com/food-trucks-1-1' },
    lucky:  { tag: 'Lucky',       name: 'Lucky Envelope',        url: 'https://www.luckyenvelopebrewing.com/events' },
    chucks: { tag: "Chuck's",     name: "Chuck's Greenwood",     url: 'https://www.chuckshopshop.com/foodtrucksgw' },
    salehs: { tag: "Saleh's",     name: "Saleh's Corner",        url: 'https://www.seattlefoodtruck.com/schedule/salehs' },
    broad:  { tag: 'Broadview',   name: 'Broadview Taphouse',    url: 'https://www.seattlefoodtruck.com/schedule/broadview-tap-house' }
  },

  schedule: {
    '2026-09-01': [
      ['stoup',  '🍔', "Max's Burgers & Wings", '5–8'],
      ['urban',  '🥙', "Georgia's Greek",       '4–8'],
      ['chucks', '🍖', 'Woodshop BBQ',          'eve'],
      ['salehs', '🌯', 'Plaza Garcia Express',  '5–9']
    ],
    '2026-09-02': [
      ['stoup',  '🌮', 'El Gran Taco',        '4:30–8:30'],
      ['urban',  '🍗', 'Impeccable Chicken',  '4–8'],
      ['chucks', '🍕', "Oskar's Pizza",       'eve'],
      ['salehs', '🥙', "Theo's Gyros",        '5–9']
    ],
    '2026-09-03': [
      ['stoup',  '🌮', 'Birrieria Pepe El Toro', '4–8'],
      ['urban',  '🌮', 'Alebrijes',              '4–8'],
      ['chucks', '🍗', 'Impeckable Chicken',     'eve'],
      ['salehs', '🍜', 'Pumpkin Thai',           '5–9']
    ],
    '2026-09-04': [
      ['stoup',  '🍤', 'El Sabor Boricua',   '5–9'],
      ['urban',  '🌮', 'Tacos and Beer',     '4–8'],
      ['chucks', '🦐', 'Where Ya At Matt',   'eve'],
      ['salehs', '🍗', 'Impeckable Chicken', '5–9']
    ],
    '2026-09-05': [
      ['stoup',  '🥪', "Tat's Truck",   '1–7'],
      ['urban',  '🍕', "Oskar's Pizza", '1–8'],
      ['chucks', '🌮', 'Tacos & Beer',  'eve'],
      ['salehs', '🍕', "Oskar's Pizza", '5–9']
    ],
    '2026-09-06': [
      ['stoup',  '🍜', 'Kaosamai Thai',          '1–7'],
      ['urban',  '🍩', '9th and Hennepin',       '8a–12'],
      ['urban',  '🥪', 'Now Make Me A Sandwich', '1–7'],
      ['chucks', '🌶️', 'Cocina Barelas',         'eve'],
      ['chucks', '🥟', 'Momo Express',           'eve'],
      ['salehs', '🥪', 'The Panini Truck',       '5–9']
    ],
    '2026-09-07': [
      ['stoup',  '🍕', 'Russo Pizzarium',        '5–8'],
      ['urban',  '🥟', 'Empanadas El Pachi',     '4–8'],
      ['chucks', '🌮', 'Birrieria Pepe El Toro', 'eve'],
      ['salehs', '🥙', 'Le Nomade',              '5–9']
    ],
    '2026-09-08': [
      ['stoup',  '🌮', 'Tacos & Beer',         '5–8'],
      ['urban',  '🍔', 'BurgerDOM',            '4–8'],
      ['chucks', '🍖', 'Woodshop BBQ',         'eve'],
      ['salehs', '🌯', 'Plaza Garcia Express', '5–9']
    ],
    '2026-09-09': [
      ['stoup',  '🍗', 'Impeccable Chicken', '5–8'],
      ['urban',  '🥟', 'Katmandu Momocha',   '4–8'],
      ['chucks', '🍕', "Oskar's Pizza",      'eve'],
      ['salehs', '🥙', "Theo's Gyros",       '5–9']
    ],
    '2026-09-10': [
      ['stoup',  '🍛', 'Kottu Seattle',      '5–8'],
      ['urban',  '🍔', 'Burger Planet',      '4–8'],
      ['chucks', '🍗', 'Impeckable Chicken', 'eve'],
      ['salehs', '🐟', 'Fish Basket NW',     '5–9']
    ],
    '2026-09-11': [
      ['stoup',  '🍔', "Max's Burgers & Wings",  '5–9'],
      ['urban',  '🌮', 'Birrieria Pepe El Toro', '4–8'],
      ['lucky',  '🍜', 'Kaosamai',               '4:30–8'],
      ['chucks', '🦐', 'Where Ya At Matt',       'eve'],
      ['salehs', '🍗', 'Impeckable Chicken',     '5–9']
    ],
    '2026-09-12': [
      ['stoup',  '🥙', "Georgia's Greek", '1–8'],
      ['urban',  '🥟', 'Momo Express',    '1–8'],
      ['salehs', '🍕', "Oskar's Pizza",   '5–9']
    ],
    '2026-09-13': [
      ['stoup', '🥪', 'El Pirata / Now Make Me A Sandwich', '1–7'],
      ['urban', '🍩', '9th and Hennepin',                   '8a–12'],
      ['urban', '🍜', 'Kaosamai',                           '1–7']
    ],
    '2026-09-14': [
      ['stoup', '🦐', 'Where Ya At Matt', '5–8'],
      ['urban', '🌮', 'La Riviera Maya',  '4–8']
    ],
    '2026-09-15': [
      ['stoup', '🍔', "Max's Burgers & Wings", '5–8'],
      ['urban', '🥙', "Georgia's Greek",       '4–8']
    ],
    '2026-09-16': [
      ['stoup', '🌮', 'El Gran Taco',       '4:30–8:30'],
      ['urban', '🍗', 'Impeccable Chicken', '4–8']
    ],
    '2026-09-17': [
      ['stoup', '🌮', 'Birrieria Pepe El Toro', '4–8'],
      ['urban', '🌮', 'Alebrijes',              '4–8']
    ],
    '2026-09-18': [
      ['stoup', '🍤', 'El Sabor Boricua', '5–9'],
      ['urban', '🌮', 'Tacos and Beer',   '4–8']
    ],
    '2026-09-19': [
      ['stoup', '🥪', "Tat's Truck",        '1–7'],
      ['urban', '🍕', "Oskar's Pizza",      '1–8'],
      ['lucky', '🌭', 'Sea Dawgs Hot Dogs', '4:30–7:30']
    ],
    '2026-09-20': [
      ['stoup', '🍜', 'Kaosamai Thai',          '1–7'],
      ['urban', '🍩', '9th and Hennepin',       '8a–12'],
      ['urban', '🥪', 'Now Make Me A Sandwich', '1–7']
    ],
    '2026-09-21': [
      ['stoup', '🍕', 'Russo Pizzarium',    '5–8'],
      ['urban', '🥟', 'Empanadas El Pachi', '4–8']
    ],
    '2026-09-22': [
      ['stoup', '🌮', 'Tacos & Beer', '5–8'],
      ['urban', '🍔', 'BurgerDOM',    '4–8']
    ],
    '2026-09-23': [
      ['stoup', '🍗', 'Impeccable Chicken', '5–8'],
      ['urban', '🥟', 'Katmandu Momocha',   '4–8']
    ],
    '2026-09-24': [
      ['stoup', '🍛', 'Kottu Seattle', '5–8'],
      ['urban', '🍔', 'Burger Planet', '4–8']
    ],
    '2026-09-25': [
      ['stoup', '🌮', 'Off the Rez',            '5–9'],
      ['urban', '🌮', 'Birrieria Pepe El Toro', '4–8'],
      ['lucky', '🍜', 'Kaosamai',               '4:30–8']
    ],
    '2026-09-26': [
      ['stoup', '🥙', "Georgia's Greek", '1–8'],
      ['urban', '🥟', 'Momo Express',    '1–8']
    ],
    '2026-09-27': [
      ['stoup', '🥪', 'El Pirata / Now Make Me A Sandwich', '1–7'],
      ['urban', '🍩', '9th and Hennepin',                   '8a–12'],
      ['urban', '🍜', 'Kaosamai',                           '1–7']
    ],
    '2026-09-28': [
      ['stoup', '🦐', 'Where Ya At Matt', '5–8'],
      ['urban', '🌮', 'La Riviera Maya',  '4–8']
    ],
    '2026-09-29': [
      ['stoup', '🍔', "Max's Burgers & Wings", '5–8'],
      ['urban', '🥙', "Georgia's Greek",       '4–8']
    ],
    '2026-09-30': [
      ['stoup', '🌮', 'El Gran Taco',       '4:30–8:30'],
      ['urban', '🍗', 'Impeccable Chicken', '4–8']
    ],
    '2026-10-01': [
      ['stoup', '🌮', 'Birrieria Pepe El Toro', '4–8'],
      ['urban', '🌮', 'Alebrijes',              '4–8']
    ],
    '2026-10-02': [
      ['stoup', '🍤', 'El Sabor Boricua', '5–9'],
      ['urban', '🌮', 'Tacos and Beer',   '4–8']
    ],
    '2026-10-03': [
      ['urban', '🍕', "Oskar's Pizza", '1–8']
    ]
  }
};
