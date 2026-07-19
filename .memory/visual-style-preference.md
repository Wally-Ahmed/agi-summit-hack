---
name: visual-style-preference
description: Wally wants generated visuals diagram-like/schematic (flat vector, boxes, connectors, grids) — never ethereal glow-orb art; visuals must complement what's being narrated/explained at that moment
metadata:
  type: feedback
  originSessionId: 8303b583-605f-4ccc-adbd-6955dbdbb55a
---

Wally's visual-direction feedback (2026-07-19, on the [[project-definition]] walkthrough):
"i dont like that you are generating weird visuals, it should be diagram like not etherial"
and "the visuals are supposed to compliment the walkthrough."

**Why:** abstract glowing-orb/mesh art reads as decorative filler; he wants visuals that carry
technical meaning and reinforce the exact concept being narrated on screen at that moment.

**How to apply:** prompt image/video models for "flat vector technical diagram, dark navy
background, thin teal/indigo line work, rounded-rectangle nodes, orthogonal connectors with
arrowheads, faint grid, engineering schematic, no glow, no orbs, no text." Map each visual
1:1 to the narration beat (isolation → unconnected boxes; mesh → boxes wired to a bus;
planner → org-chart; benchmarks → bar-chart schematics). Also: OpenRouter DOES have video
models — query `/api/v1/models?output_modalities=video` (the unfiltered list hides them);
generate via async `POST /api/v1/videos` with `frame_images` first-frame anchoring.
