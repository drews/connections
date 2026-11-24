# Design system (v0)

Mockup canvas: https://claude.ai/artifact/XTtebkHFcyZMPpnVY4x3BY (private to the owner).
This file is the text source the canvas was built from; it is the reference for tokens, glyphs and tiers until the visual-language spec is implemented.

Product: a local web app to fly through a personal "second brain" corpus across powers of ten
(Spore stages × Powers of Ten × Supreme Commander strategic zoom × Eagle Mode infinite ZUI).
First corpus: Claude Code conversations. Work ladder: All → Project → Session → Episode → Turn → Step (tool call).
Aesthetic: CARD CANVAS + CONTAINMENT. Cards on a spatial plane, nested inside soft containment regions.
Calm, ambient, game-like but not cartoony. No gradients washes, no emoji, no left-border cards, no glow overload.

## Tokens (dark is primary; light listed for reference)
| token | dark | light | use |
|---|---|---|---|
| ground | #0B0D13 | #F3F1EB | canvas background |
| surface-1 | #121621 | #FBFAF7 | HUD panels, bars |
| surface-2 | #1A1F2D | #FFFFFF | cards |
| surface-3 | #232A3B | #ECE9E1 | raised / hover / chips |
| line | #2C3447 | #D9D5CA | borders, dividers |
| ink | #EEF0F6 | #171A22 | primary text |
| ink-2 | #A9B0C3 | #4B5163 | secondary text |
| ink-3 | #737B91 | #7E8495 | decorative / ≥24px text only |
| focus | #8DB2FF | #2F5FD0 | current regime, focus ring, YOUR selection |
| beacon | #57E0C4 | #0D8A73 | beacons (your declared presence) |
| trace | #F4A95B | #B4610F | agent traces: sparkle, soapstone, strand |
| trace-dim | #8A6440 | #D9B48C | decayed / unengaged traces |
Region tints (projects/containment), fill at ~10% alpha + border at ~38% alpha:
violet #9C8CFF, teal #5BC8D9, rose #E58FB5, olive #B7C46A, sand #D8B98A.
e.g. violet region: background rgba(156,140,255,0.10); border 1px solid rgba(156,140,255,0.38).
Rule: YOU = cool (focus blue, beacon teal). AGENTS = warm (trace amber). Never swap.

Type: display = 'Space Grotesk' 600 (40/44, 28/34, 20/26); body = 'IBM Plex Sans' 15/22, small 13/18;
meta = 'IBM Plex Mono' 12/16 uppercase letter-spacing .08em; micro mono 11/14.
Spacing: 4 8 12 16 24 32 48. Radius: chip 999px, card 10px, panel 14px, lens 18px, region 28px (or full circle).
Powers notation: "10⁴ ALL", "10³ PROJECT", "10² SESSION", "10¹ TURN", "10⁰ STEP" (superscript digits).

## Glyph vocabulary (inline stroke SVG, 1.5px stroke, currentColor, 16–20px)
- project: hexagon outline · session: three stacked horizontal lines · episode: arc · turn: speech-bubble square ·
  step/tool call: small square with a dot (tool), or "{}" for code edits
- viewframe: four corner brackets ⌜ ⌝ ⌞ ⌟ (the frame motif; ALL viewframes share it)
  - portal: corner brackets + small filled dot in center ("you can go in")
  - magic lens: corner brackets with rounded 18px radius + a short handle at bottom-right
  - saved frame: corner brackets + a bookmark notch top-right; paths = saved frames joined by a dotted line
- sparkle: small 4-point star, trace color, shimmering (show as star + 2 tiny satellite dots)
- soapstone mark: small rounded tablet (12×16) with 2 short lines, trace color; FAR = just the tablet, NEAR = tablet + a
  short message in mono, e.g. "same idea as › sphere-of-influence demo"; appraise buttons: "worth it" / "not it"
- strand: curved line between two distant items, trace color, 1.5px; KEPT = solid; PROPOSED = dashed 6/6;
  DECAYING = trace-dim, dotted, 50% opacity. Label chip at midpoint: "why: both define a zoom ladder"
- beacon: 3 concentric rings, beacon color, with a small label "you are here · 'figuring out viewframes'"

## Representation tiers (strategic zoom) by on-screen width of an item
FULL ≥280px (readable card: title, meta, body excerpt, children as compact chips) ·
COMPACT 120–280px (title + 1 meta line + tiny child dots) ·
ICON 24–120px (glyph + maybe 2-word label) ·
GLOW <24px (soft dot; brightness = recency, size = mass). Hysteresis ±15% so tiers don't flicker.

## HUD chrome
- Regime bar (bottom center, Spore stage bar): power + regime name + one-line flavor + verbs as key chips.
  e.g. "10² SESSION · One conversation. Follow the turns." verbs: [Esc surface] [click dive] [← → hop] [f frame this] [. beacon] [l lens]
- Powers ladder (left edge, vertical): 5 rungs 10⁴…10⁰ with names; current rung in focus blue with a knob.
- Breadcrumbs (top left): All › connections › "Rebuild as scale navigator" › Turn 7
- Frame dock (top right): small viewframe chips you've saved: "Work ladder", "This week", "Idea: zoom", with frame glyphs.
- Where-was-I trail: faint dotted line with small numbered stops on the canvas; private to the browser.

## Sample content (use these; realistic, from the user's actual work)
Projects (cwd): connections, campus-quest-infra, themultiverse-school-site, dotfiles, [PROJECT].
Sessions in connections:
- "Rebuild as scale navigator" (today, 41 turns, branch claude/festive-edison-e9gsrd)
- "Sphere-of-influence TUI demo" (Dec 25, 18 turns)
- "Microscope lens navigation proposal" (Dec 27, 9 turns)
- "Batch bookmark import + benchmarks" (Nov 30, 12 turns)
- "Tree of Life dataset" (Dec 26, 7 turns)
Turns in "Rebuild as scale navigator":
- T1 "I want to navigate multiple scales of abstraction (powers of 10) over a second-brain corpus…"
- T4 "make sure you have the vision correct first, interview me with visual exemplars"
- T6 "Strategic-Infinite-ZUI hybrid with viewframe cards being a perspective — ie query"
- T7 "Make sure to spec it out before deciding on implementation. A mock up would be nice…"
Steps (tool calls) under a turn: Read openspec/AGENTS.md · WebSearch "Supreme Commander strategic zoom" · Write proposal.md · Bash git push.
Agents: "claude" (coding sidekick), "miner" (background insight miner), "curator".
Example traces:
- strand: "Sphere-of-influence TUI demo" ↔ "Rebuild as scale navigator" — why: "both are about zooming between system and component"
- soapstone on "Microscope lens navigation proposal": "lenses here = magic-lens viewframes now"
- sparkle on "Tree of Life dataset" (reveals: "taxonomy is a ready-made Idea ladder")
Example beacon: at session "Rebuild as scale navigator", message "figuring out viewframes".
