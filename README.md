# NW Seattle Food Truck Schedule

A single-page schedule of rotating food trucks at taprooms across Ballard, Crown Hill,
Greenwood and Broadview.

**Live site:** https://alexpepperl.github.io/nw-seattle-food-trucks/

## How it works

The page is static — no build step, no dependencies. Open `index.html` in a browser to preview.

| File | Purpose |
| --- | --- |
| `index.html` | Page shell |
| `assets/styles.css` | Styling, including light/dark mode and the mobile stacked layout |
| `assets/app.js` | Renders the calendars, detects the current week, wires tabs and filters |
| `data/schedule.js` | The schedule data — the only file you edit weekly |

The week/month views are generated from the viewer's own clock, so "This Week" always means
the Monday–Sunday around today, and "This Month" / "Next Month" shift over automatically.
Dates with no data render as "no listing".

## Weekly refresh

GitHub Actions refreshes the current week every Monday at 18:17 UTC. The updater
checks each venue's published calendar, validates minimum coverage for every source
and replaces the week only after all checks pass. If a source is unavailable or
incomplete, it leaves the existing schedule untouched and opens a GitHub issue
linking to the failed run.

The workflow can also be started manually from the repository's **Actions** tab.

For a manual correction, edit `data/schedule.js`. Each date maps to a list of
`[locationKey, emoji, truckName, hours]` entries:

```js
'2026-09-14': [
  ['stoup', '🦐', 'Where Ya At Matt', '5–8'],
  ['urban', '🌮', 'La Riviera Maya',  '4–8']
],
```

`locationKey` must match a key in the `locations` object at the top of the same file.
Truck names are turned into a menu search link automatically, so no URL is needed.

Bump `updated` to the date you refreshed, then:

```
git add -A
git commit -m "Update schedule"
git push
```

GitHub Pages redeploys within a minute or so.

## Sources

Each taproom's published calendar, plus [ballardfoodtrucks.com](https://www.ballardfoodtrucks.com/)
and [seattlefoodtruck.com](https://www.seattlefoodtruck.com/). Trucks cancel or swap
occasionally — the brewery links on the page always show the real-time lineup.
