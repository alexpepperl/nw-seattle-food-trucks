import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeHours,
  parseBbycGrid,
  parseGoogleAgenda,
  parseLucky,
  parseSeattleFoodTruckCards,
  parseSeattleFoodTruckEvents,
  parseSeattleFoodTruckSchedule,
  parseStoup,
  updateScheduleFile,
  validateResults
} from "../scripts/refresh-schedule.mjs";

const week = new Set([
  "2026-09-14", "2026-09-15", "2026-09-16", "2026-09-17",
  "2026-09-18", "2026-09-19", "2026-09-20"
]);

test("normalizes venue time formats", () => {
  assert.equal(normalizeHours("4:00 pm - 8:00 pm"), "4–8pm");
  assert.equal(normalizeHours("4:30pm-8pm"), "4:30–8pm");
});

test("parses Stoup schedule text", () => {
  const text = "FOOD TRUCK SCHEDULE\nTUE 09.15\n5 — 8pm\nMax's Burgers & Wings\nWhat Else";
  assert.deepEqual(parseStoup(text, 2026, week)[0], {
    location: "stoup", date: "2026-09-15", name: "Max's Burgers & Wings",
    hours: "5–8pm", emoji: "🍔"
  });
});

test("combines Bale/Yonder events across calendar months", () => {
  const crossMonthWeek = new Set([
    "2026-09-28", "2026-09-29", "2026-09-30", "2026-10-01",
    "2026-10-02", "2026-10-03", "2026-10-04"
  ]);
  const september = parseBbycGrid([
    { day: "29", name: "Tummy Yummy Thai", hours: "4:00 PM - 8:00 PM" }
  ], "September 2026", crossMonthWeek);
  const october = parseBbycGrid([
    { day: "1", name: "Impeckable Chicken", hours: "5:00 PM - 8:00 PM" }
  ], "October 2026", crossMonthWeek);

  assert.deepEqual([...september, ...october].map((item) => item.date), [
    "2026-09-29", "2026-10-01"
  ]);
});

test("parses Chuck's Google Calendar agenda", () => {
  const text = "15\nSEP, TUE\n5 – 9pm\n5pm\nDinner: Woodshop BBQ\nChuck's 85th\nCalendar: Food Trucks-GW, Accepted";
  assert.equal(parseGoogleAgenda(text, 2026, week)[0].name, "Woodshop BBQ");
});

test("parses Chuck's direct Google Calendar agenda", () => {
  const text = "15\nSEP, TUE\n5 – 9pm\nDinner: Woodshop BBQ\nChuck's 85th\nCalendar: Food Trucks-GW, Accepted";
  assert.equal(parseGoogleAgenda(text, 2026, week)[0].name, "Woodshop BBQ");
});

test("parses SeattleFoodTruck cards", () => {
  const card = "Pumpkin Thai\nBroadview Tap House\nEvent Date Tuesday, September 15th\nEvent Time 4:00pm - 8:00pm\nFood truck";
  assert.equal(parseSeattleFoodTruckCards([card], "broad", 2026, week)[0].date, "2026-09-15");
});

test("parses the current SeattleFoodTruck schedule layout", () => {
  const text = `Schedule
Plaza Garcia Express
Saleh's
2401 NW 80th St, Seattle
Tuesday, September 15th
5:00pm - 9:00pm
Food Truck
View Menu
Previous week
Viewing week of September 14th`;
  assert.deepEqual(parseSeattleFoodTruckSchedule(text, "salehs", 2026, week)[0], {
    location: "salehs", date: "2026-09-15", name: "Plaza Garcia Express",
    hours: "5–9pm", emoji: "🚚"
  });
});

test("parses SeattleFoodTruck API events", () => {
  const payload = {
    events: [{
      start_time: "2026-09-15T17:00:00.000-07:00",
      end_time: "2026-09-15T21:00:00.000-07:00",
      bookings: [{
        status: "approved",
        truck: { name: "Plaza Garcia Express" }
      }]
    }]
  };
  assert.deepEqual(parseSeattleFoodTruckEvents(payload, "salehs", week)[0], {
    location: "salehs", date: "2026-09-15", name: "Plaza Garcia Express",
    hours: "5–9pm", emoji: "🚚"
  });
});

test("parses Lucky special-event food trucks", () => {
  const text = "Freshtoberfest\nSaturday, September 19, 2026\nSea Dawgs Hot Dogs serving up the goods from 4:30–7:30 PM.\nView Event →\nFood Truck Schedule\nLucky Envelope Brewing";
  assert.equal(parseLucky(text, 2026, week)[0].name, "Sea Dawgs Hot Dogs");
});

test("deduplicates Lucky trucks listed in both schedule sections", () => {
  const text = `Special Event
Friday, September 18, 2026
Kaosamai Thai will be serving from 4:30–8:00 PM.
View Event
Food Truck Schedule
Kaosamai
Fri 9/18/26
4:30pm–8:00pm
Lucky Envelope Brewing`;
  const results = parseLucky(text, 2026, week);
  assert.equal(results.length, 1);
  assert.equal(results[0].name, "Kaosamai Thai");
});

test("rejects partial source results", () => {
  assert.throws(() => validateResults({
    stoup: [], urban: [], bbyc: [], lucky: [], chucks: [], salehs: [], broad: []
  }), /Incomplete weekly schedule/);
});

test("accepts a refreshed source with fewer published bookings", () => {
  const item = { location: "venue", date: "2026-09-15", name: "Truck", hours: "5–8pm", emoji: "🚚" };
  assert.doesNotThrow(() => validateResults({
    stoup: Array(6).fill(item),
    urban: [item],
    bbyc: [item],
    lucky: [],
    chucks: [item],
    salehs: [item],
    broad: [item]
  }));
});

test("replaces the target week atomically", () => {
  const source = `window.FOOD_TRUCKS = {
  updated: '2026-09-07',
  schedule: {
    '2026-09-15': [
      ['stoup', '🚚', 'Old Truck', '5–8']
    ]
  }
};
`;
  const results = {
    stoup: [{ location: "stoup", date: "2026-09-15", name: "New Truck", hours: "5–8pm", emoji: "🚚" }],
    urban: [], bbyc: [], lucky: [], chucks: [], salehs: [], broad: []
  };
  const updated = updateScheduleFile(source, results, new Date("2026-09-14T12:00:00"));
  assert.match(updated, /New Truck/);
  assert.doesNotMatch(updated, /Old Truck/);
});
