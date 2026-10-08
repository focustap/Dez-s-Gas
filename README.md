# ⛽ Dez's Gas

A playable, original pixel-art gas station management game set on fictional Route 6, developed for the **BenGames** collection.

**[▶ Play Dez's Gas in BenGames](https://focustap.github.io/BenGames/dezs-gas/)**

## What you do

- **Store:** Drag candy, chips, energy drinks, soda and other convenience-store items from the shelves over the checkout scanner. Bag and charge the correct order.
- **Pumps:** Drag the gas nozzle onto a car's fuel port. Hold to pump the requested amount and collect payment.
- **Backroom:** Make decisions about fictional restricted-package requests. Crews, rivals and undercover officers affect your heat, money and reputation. Refusing a request is always an option.
- **Office:** Compare fictional police portrait files, track gang relationships, reorder supplies, check earnings, and purchase twelve station upgrades.

Complete each night shift to unlock a new day. Save data lives in your browser's localStorage. Officers, crews, fictional products and all events are imaginary game content, not real-world advice.

## Mechanics

The game includes a pixel-art scene renderer, responsive UI, custom generated pixel portraits, legal store inventory, gas supply and pricing, underworld risk, police heat, arrests, random inspections, faction reputations, night/weather variants, day-end accounting, and expandable station equipment.

### Controls

On desktop: **drag-and-drop** items and equipment with your mouse; **hold** to pump gas. On touchscreens: drag objects or tap one and then tap its target. Use the office menu for upgrades and stock.

## Development

No backend or account is required. Source files:

- `index.html` — browser UI and stations
- `style.css` — 8-bit UI layout
- `data.js` — characters, fictional gangs/officers, products and upgrades
- `pixel.js` — procedurally drawn pixel art and scene hitboxes
- `game.js` — the simulation, event handlers and saves
- `tests/game.spec.js` — Chromium end-to-end gameplay tests

Use `npm install` and `npm test` to run the Playwright tests. The project has automated GitHub Actions checks.

The playable release is hosted in the BenGames repository at `dezs-gas/` because standalone GitHub Pages on this new repository must be enabled separately. Enabling it under **Settings → Pages** would allow a second standalone deployment.
