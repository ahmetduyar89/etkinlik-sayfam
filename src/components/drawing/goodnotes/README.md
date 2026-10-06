# Goodnotes-style writing

`DrawingToolbar.tsx` keeps the application's public component contract and delegates to `GoodnotesPenToolbar`. The original object library and all six dynamic laboratory launchers remain connected. The existing canvas owns document pages, collaboration, history, selection, pixel erasing, DPR transforms and rendering scheduling.

New browser pen strokes carry `inkVersion: 3`, captured nib/pressure settings and `inkComplete`. Older strokes retain their original renderer. Ballpoint width is constant; fountain uses pressure, velocity and elliptical nib orientation; brush uses a nonlinear pressure response and applies its taper only on completion. Actual/coalesced input is stored; predicted input is only a disposable preview. Centreline interpolation produces a filled ribbon. Completed paths use the existing weak cache.

Millimetres use 96 / 25.4 logical page pixels. They describe document coordinates, rather than a promise of physical millimetres on every monitor. Colour/width slots and per-pen tuning persist in local storage. The preview uses the same ribbon geometry as the canvas.

Shapes snap after 500 ms within a four-screen-pixel stationary tolerance. Short strokes and poor fits remain handwriting. Triangles and orthogonal rectangles preserve their orientation as polygon objects. Scribbles require fast repeated direction reversals and remove only intersecting ink, in one undoable collaboration operation.

Validation:

- `node scripts/test-goodnotes.mjs`
- `npm run type-check`
- `npm run build`
- `/ink-lab.html` is the existing disposable canvas harness, now using the production toolbar. It never saves to notebooks.

Hardware acceptance still requires an actual Apple Pencil/tablet: light and heavy pressure, tilt, slow loops, fast writing, palm rejection, coalesced sampling on 120 Hz displays and lift/cancel behaviour. The optional iOS native renderer continues using its own v2 payload; this module replaces the browser Canvas engine, not PencilKit/Metal.
