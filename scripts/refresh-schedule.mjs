import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const LOCATIONS = ["stoup", "urban", "bbyc", "lucky", "chucks", "salehs", "broad"];
const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = {
  Jan: 0, January: 0, Feb: 1, February: 1, Mar: 2, March: 2,
  Apr: 3, April: 3, May: 4, Jun: 5, June: 5, Jul: 6, July: 6,
  Aug: 7, August: 7, Sep: 8, September: 8, Oct: 9, October: 9,
  Nov: 10, November: 10, Dec: 11, December: 11
};

const SOURCES = {
  stoup: "https://www.stoupbrewing.com/ballard/",
  urban: "https://urbanfamilybrewing.com/home/calendar/",
  bbyc: "https://www.bbycballard.com/food-trucks-1-1",
  lucky: "https://www.luckyenvelopebrewing.com/events",
  chucks: "https://www.chuckshopshop.com/foodtrucksgw",
  salehs: "https://www.seattlefoodtruck.com/schedule/salehs",
  broad: "https://www.seattlefoodtruck.com/schedule/broadview-tap-house"
};

function pad(value) {
  return String(value).padStart(2, "0");
}

export function isoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function startOfWeek(date) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  result.setDate(result.getDate() - ((result.getDay() + 6) % 7));
  return result;
}

function parseMonthDate(month, day, year) {
  const monthIndex = MONTHS[month];
  if (monthIndex == null) throw new Error(`Unknown month: ${month}`);
  return isoDate(new Date(Number(year), monthIndex, Number(day)));
}

export function normalizeHours(value) {
  return value
    .replace(/\u202f|\u00a0/g, " ")
    .replace(/\s*(?:—|–|-)\s*/g, "–")
    .replace(/:00/g, "")
    .replace(/\s*(am|pm)/gi, (_, suffix) => suffix.toLowerCase())
    .replace(/(am|pm)(?=–)/i, "")
    .replace(/\s+/g, "");
}

function emojiFor(name) {
  const value = name.toLowerCase();
  if (/pizza/.test(value)) return "🍕";
  if (/taco|birrieria|rez/.test(value)) return "🌮";
  if (/momo|empanada/.test(value)) return "🥟";
  if (/thai|kaosamai|kottu/.test(value)) return "🍜";
  if (/chicken/.test(value)) return "🍗";
  if (/burger/.test(value)) return "🍔";
  if (/gyro|greek/.test(value)) return "🥙";
  if (/bbq/.test(value)) return "🍖";
  if (/hot dog|dawg/.test(value)) return "🌭";
  if (/sandwich|panini|wich/.test(value)) return "🥪";
  if (/sabor|boricua|matt/.test(value)) return "🍤";
  if (/cocina/.test(value)) return "🌶️";
  if (/donut|hennepin/.test(value)) return "🍩";
  return "🚚";
}

function event(location, date, name, hours) {
  return { location, date, name: name.trim(), hours: normalizeHours(hours), emoji: emojiFor(name) };
}

function inWeek(date, weekDates) {
  return weekDates.has(date);
}

export function parseStoup(text, year, weekDates) {
  const section = text.split("FOOD TRUCK SCHEDULE")[1]?.split("What Else")[0];
  if (!section) throw new Error("Stoup food truck section was not found");
  const pattern = /(?:MON|TUE|WED|THU|FRI|SAT|SUN)\s+(\d{2})\.(\d{2})\s+(\d{1,2}(?::\d{2})?)\s*(?:—|–|-)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s+([^\n]+)/gi;
  return [...section.matchAll(pattern)]
    .map((match) => event("stoup", `${year}-${match[1]}-${match[2]}`, match[5], `${match[3]}–${match[4]}`))
    .filter((item) => inWeek(item.date, weekDates));
}

export function parseGoogleAgenda(text, year, weekDates) {
  const chunks = text.split(/Calendar:\s*Food Trucks-GW,\s*Accepted/i);
  let activeDate = null;
  const events = [];
  for (const chunk of chunks) {
    const shortDate = chunk.match(/(?:^|\n)(\d{1,2})\n([A-Z]{3}),\s*[A-Z]{2,3}\n/);
    const longDate = chunk.match(/(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+)\s+(\d{1,2})/);
    if (shortDate) activeDate = parseMonthDate(shortDate[2][0] + shortDate[2].slice(1).toLowerCase(), shortDate[1], year);
    if (longDate) activeDate = parseMonthDate(longDate[1], longDate[2], year);
    if (!activeDate || !inWeek(activeDate, weekDates)) continue;

    const details = chunk.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)\s*(?:—|–|-)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*\n\d{1,2}(?::\d{2})?(?:am|pm)\s*\n(?:Dinner:\s*|Brunch:\s*)?([^\n]+)/i);
    if (details) events.push(event("chucks", activeDate, details[3], `${details[1]}–${details[2]}`));
  }
  return events;
}

export function parseSeattleFoodTruckCards(cards, location, year, weekDates) {
  return cards.map((text) => {
    const name = text.split("\n")[0].trim();
    const dateMatch = text.match(/Event Date\s+(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)/i);
    const timeMatch = text.match(/Event Time\s+(\d{1,2}(?::\d{2})?(?:am|pm))\s*(?:—|–|-)\s*(\d{1,2}(?::\d{2})?(?:am|pm))/i);
    if (!dateMatch || !timeMatch) throw new Error(`Could not parse ${location} card: ${text}`);
    return event(location, parseMonthDate(dateMatch[1], dateMatch[2], year), name, `${timeMatch[1]}–${timeMatch[2]}`);
  }).filter((item) => inWeek(item.date, weekDates));
}

export function parseSeattleFoodTruckSchedule(text, location, year, weekDates) {
  const schedule = text.split(/(?:^|\n)Schedule\n/i)[1]?.split(/\nPrevious week\n/i)[0];
  if (!schedule) throw new Error(`${location} schedule section was not found`);

  const pattern = /(?:^|\n)([^\n]+)\n[^\n]+\n[^\n]+\n(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)\n(\d{1,2}(?::\d{2})?(?:am|pm))\s*(?:—|–|-)\s*(\d{1,2}(?::\d{2})?(?:am|pm))\nFood Truck\b/gi;
  return [...schedule.matchAll(pattern)]
    .map((match) => event(
      location,
      parseMonthDate(match[2], match[3], year),
      match[1],
      `${match[4]}–${match[5]}`
    ))
    .filter((item) => inWeek(item.date, weekDates));
}

export function parseLucky(text, year, weekDates) {
  const events = [];
  const schedule = text.split("Food Truck Schedule")[1]?.split("Lucky Envelope Brewing")[0] ?? "";
  const cardPattern = /([^\n]+)\n+(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+(\d{1,2})\/(\d{1,2})\/(\d{2})\n+(\d{1,2}(?::\d{2})?(?:am|pm)\s*(?:—|–|-)\s*\d{1,2}(?::\d{2})?(?:am|pm))/gi;
  for (const match of schedule.matchAll(cardPattern)) {
    const date = `${2000 + Number(match[4])}-${pad(match[2])}-${pad(match[3])}`;
    if (inWeek(date, weekDates)) events.push(event("lucky", date, match[1], match[5]));
  }

  const upcoming = text.split("Food Truck Schedule")[0];
  const eventPattern = /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+([A-Za-z]+)\s+(\d{1,2}),\s+(20\d{2})([\s\S]*?)(?=View Event|$)/gi;
  for (const match of upcoming.matchAll(eventPattern)) {
    const date = parseMonthDate(match[1], match[2], match[3]);
    if (!inWeek(date, weekDates)) continue;
    const sentence = match[4].match(/((?:[A-Z][A-Za-z0-9'’.-]*\s+){0,4}[A-Z][A-Za-z0-9'’.-]*)\s+(?:will be\s+)?(?:on-site\s+)?serving(?:\s+up)?(?:\s+[^.\n]+?)?\s+from\s+(\d{1,2}(?::\d{2})?)\s*(?:—|–|-)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i);
    if (sentence) events.push(event("lucky", date, sentence[1], `${sentence[2]}–${sentence[3]}`));
  }
  return dedupe(events);
}

function dedupe(events) {
  const found = new Map();
  for (const item of events) found.set(`${item.location}|${item.date}|${item.name}`, item);
  return [...found.values()];
}

async function loadPage(browser, url, readyText) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const page = await browser.newPage();
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      if (readyText) {
        await page.getByText(readyText, { exact: false }).first().waitFor({ timeout: 30_000 });
      }
      await page.waitForTimeout(2_000);
      return page;
    } catch (error) {
      lastError = error;
      await page.close();
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 5_000));
    }
  }
  throw new Error(`Could not load ${url} after 3 attempts: ${lastError.message}`);
}

async function scrapeAll(browser, weekDates, monday) {
  const year = monday.getFullYear();
  const results = {};

  let page = await loadPage(browser, SOURCES.stoup, "FOOD TRUCK SCHEDULE");
  results.stoup = parseStoup(await page.locator("body").innerText(), year, weekDates);
  await page.close();

  page = await loadPage(browser, SOURCES.urban, "Food Truck and Events Calendar");
  results.urban = await page.locator(".sugar-calendar-block__event-cell").evaluateAll((nodes) =>
    nodes.filter((node) => node.dataset.calendarsinfo?.includes("Food Truck Calendar")).map((node) => {
      const metadata = JSON.parse(node.dataset.daydate);
      return {
        date: metadata.start_date.datetime.slice(0, 10),
        name: node.getAttribute("title"),
        hours: node.innerText.split("\n")[0]
      };
    })
  );
  results.urban = results.urban.filter((item) => inWeek(item.date, weekDates))
    .map((item) => event("urban", item.date, item.name, item.hours));
  await page.close();

  const targetMonth = monday.toLocaleString("en-US", { month: "long" });
  page = await loadPage(browser, SOURCES.bbyc, targetMonth);
  const bbycRaw = await page.locator('[role="gridcell"]').evaluateAll((cells) => cells.flatMap((cell) => {
    const day = cell.innerText.match(/^\d{1,2}/)?.[0];
    return [...cell.querySelectorAll(".flyoutitem")].map((item) => ({
      day,
      name: item.querySelector(".flyoutitem-title")?.textContent.trim(),
      hours: item.querySelector(".flyoutitem-datetime--12hr")?.textContent.trim()
    }));
  }));
  const monthYear = await page.locator('[role="grid"]').getAttribute("aria-label");
  const [monthName, displayedYear] = monthYear.split(" ");
  results.bbyc = bbycRaw.map((item) =>
    event("bbyc", parseMonthDate(monthName, item.day, displayedYear), item.name, item.hours)
  ).filter((item) => inWeek(item.date, weekDates));
  await page.close();

  page = await loadPage(browser, SOURCES.lucky, "Food Truck Schedule");
  results.lucky = parseLucky(await page.locator("body").innerText(), year, weekDates);
  await page.close();

  page = await loadPage(browser, SOURCES.chucks);
  const calendarFrame = page.frames().find((frame) => frame.url().includes("calendar.google.com/calendar/embed"));
  if (!calendarFrame) throw new Error("Chuck's Google Calendar iframe was not found");
  await calendarFrame.locator("body").waitFor({ state: "visible", timeout: 30_000 });
  results.chucks = parseGoogleAgenda(await calendarFrame.locator("body").innerText(), year, weekDates);
  await page.close();

  for (const location of ["salehs", "broad"]) {
    page = await loadPage(browser, SOURCES[location], "Viewing week");
    await page.waitForFunction(() =>
      /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+[A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)\s+\d{1,2}(?::\d{2})?(?:am|pm)\s*(?:—|–|-)\s*\d{1,2}(?::\d{2})?(?:am|pm)\s+Food Truck/i.test(document.body.innerText),
      null,
      { timeout: 30_000 }
    );
    results[location] = parseSeattleFoodTruckSchedule(
      await page.locator("body").innerText(),
      location,
      year,
      weekDates
    );
    await page.close();
  }

  return results;
}

export function validateResults(results) {
  const minimums = { stoup: 7, urban: 7, bbyc: 6, lucky: 0, chucks: 6, salehs: 5, broad: 5 };
  const failures = LOCATIONS.filter((key) => !Array.isArray(results[key]) || results[key].length < minimums[key])
    .map((key) => `${key}: found ${results[key]?.length ?? 0}, expected at least ${minimums[key]}`);
  if (failures.length) throw new Error(`Incomplete weekly schedule:\n${failures.join("\n")}`);
}

function quote(value) {
  return `'${value.replaceAll("\\", "\\\\").replaceAll("'", "\\'")}'`;
}

export function updateScheduleFile(source, results, monday) {
  const order = new Map(LOCATIONS.map((key, index) => [key, index]));
  const byDate = new Map();
  for (let offset = 0; offset < 7; offset++) {
    const date = new Date(monday.getTime() + offset * DAY_MS);
    byDate.set(isoDate(date), []);
  }
  for (const items of Object.values(results)) {
    for (const item of items) byDate.get(item.date)?.push(item);
  }

  let updated = source.replace(/updated: '\d{4}-\d{2}-\d{2}'/, `updated: '${isoDate(new Date())}'`);
  for (const [date, items] of byDate) {
    items.sort((a, b) => order.get(a.location) - order.get(b.location) || a.hours.localeCompare(b.hours));
    const lines = items.map((item) =>
      `      [${quote(item.location)}, ${quote(item.emoji)}, ${quote(item.name)}, ${quote(item.hours)}]`
    );
    const block = `    '${date}': [\n${lines.join(",\n")}\n    ]`;
    const pattern = new RegExp(`^    '${date}': \\[\\r?\\n[\\s\\S]*?^    \\](,?)`, "m");
    if (pattern.test(updated)) {
      updated = updated.replace(pattern, `${block}$1`);
    } else {
      updated = updated.replace(/\n  }\n};\s*$/, `,\n${block}\n  }\n};\n`);
    }
  }
  return updated;
}

async function main() {
  const now = process.env.REFRESH_DATE ? new Date(`${process.env.REFRESH_DATE}T12:00:00`) : new Date();
  const monday = startOfWeek(now);
  const weekDates = new Set(Array.from({ length: 7 }, (_, index) =>
    isoDate(new Date(monday.getTime() + index * DAY_MS))
  ));
  const browser = await chromium.launch({ headless: true });
  try {
    const results = await scrapeAll(browser, weekDates, monday);
    validateResults(results);
    const source = await readFile("data/schedule.js", "utf8");
    const updated = updateScheduleFile(source, results, monday);
    await writeFile("data/schedule.js", updated, "utf8");
    console.log(Object.fromEntries(LOCATIONS.map((key) => [key, results[key].length])));
  } finally {
    await browser.close();
  }
}

if (process.argv[1]?.endsWith("refresh-schedule.mjs")) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
