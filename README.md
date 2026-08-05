# 108 Card Game

A React Native card game played with **one standard deck** — only **Ace, King, Queen, Jack, 10, 9, 8, and 7** (32 unique cards).

## Quick start

```bash
npm install
npm start
```

## Rules

- **4 players** (you + 3 automated opponents)
- **32-card deck** — every card is unique
- **5 cards** dealt to each player at the start of every round
- Match the discard pile by **rank or suit**
- **Stack** multiple cards of the same rank in one play
- If you have **no playable card**, you must draw
- **Declare** when one card is left (includes multiple cards of the same rank)
- **Lowest cumulative score wins** — play until someone exceeds 108
- Score exactly **108 → resets to 54**

### Rank effects

| Rank | Points | Special |
|------|--------|---------|
| 7 | 0 | 7-chain: play 7s or draw 3×(total 7s played) |
| 8 | 8 | — |
| 9 | 9 | — |
| 10 | 10 | — |
| Jack | 2 | — |
| Queen | 30 | Wild — play on any card; pick a suit (note shown below) |
| King | 4 | — |
| Ace | 11 | Skip players equal to aces in the ace chain |

After each round, a **score summary** shows round points and cumulative totals.

## Project structure

```
src/
  game/          Deck, rules, scoring, engine
  components/    Card UI, table seats, animations, score overlay
  screens/       Game screen
```
