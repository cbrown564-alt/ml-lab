# What the front-door set demands of our homepage

A cross-cutting read of the nine homepage captures in this directory, captured
2026-06-25. Companion to `../SYNTHESIS.md` (which reads the *article*-level set
and governs a single exhibit). This one governs the **front door**: the page that
fronts the whole collection. Same discipline — compare against stored pixels, not
memory — applied to a problem the article set is silent on.

Direction is already chosen (2026-06-25): **the atlas.** The homepage's job is to
be a place you return to and *wander* — the knowledge graph and the full
collection are the point, exploration over a single conversion funnel. This
synthesis is read with that lens: what do the front doors that navigate a
*collection* (and especially a *graph*) get right, and where is our current page.

## The one-sentence finding

**The current homepage is competent editorial at a single calm weight, top to
bottom; every front door worth stealing from opens with one composed,
differentiated, often *living* moment and gives every item its own visual
identity.** Our `src/app/page.tsx` does the opposite twice over: the hero is a
*static* SVG of the one product whose entire pitch is "you can grab it," and
"Now showing" is a wall of 15 monochrome text cards, each stamped an identical
`· FLAGSHIP`, differentiated only by title text. None of the per-exhibit craft —
the hero visuals, the semantic colour grammar — reaches the front door.

## The set, and what each front door is

| Slug | What its front door *is* | Steal for the atlas |
| --- | --- | --- |
| `roadmap-sh-graph` | A node-graph **is** the navigation surface: a coloured spine of topic nodes, branching subtopics, per-node progress checkboxes (`02-scroll-40pct.png`) | Graph-as-navigation mechanics: a clear backbone/reading order, node states, colour-by-type |
| `roadmap-sh-index` | A directory of roadmaps as **plain bordered text cards** on dark (`00-viewport.png`) | **Cautionary mirror** — even the graph-native site's browse view is a text-card wall, and it's its weakest surface. We can beat it. |
| `seeing-theory-home` | One composed atmospheric peak: an animated ring of coloured data-points (the site's own grammar) around a single `Start` (`00-viewport.png`) | Atmosphere from our *own* primitives; one action; motion as invitation |
| `neal-fun` | A grid where **every tile is its own art-directed poster** — variety is the delight (`00-viewport.png`) | Per-item visual identity; the catalog as a gallery of distinct objects |
| `explorables` | Warm manifesto voice + curated entry ("check out these **3 random** Explorables"), giant condensed type (`00-viewport.png`) | Voice and curation; don't dump the whole catalog at equal weight |
| `pudding-home` | Editorial magazine grid: each story a large **custom thumbnail** + issue number + date + bold title (`00-viewport.png`) | Card = real representative visual, not a label; browse-first |
| `distill-home` | Restrained journal index; every row carries a **representative figure** drawn in the article's own grammar (`00-viewport.png`) | Credibility through restraint — but *never a bare text row*; each item shows its face |
| `3b1b-home` | One **cinematic featured piece**, full-bleed, with a carousel beneath (`00-viewport.png`) | Feature one thing big; make the rest a gallery you page through |
| `brilliant-home` | Split hero: copy + CTA left, a **live interactive demo** right; a social-proof row below (`00-viewport.png`) | Prove the interactivity *in the hero*; conversion scaffolding (register to borrow sparingly) |

## The recurring patterns → requirements for our front door

| # | Pattern (seen in) | Requirement | Where we are |
| --- | --- | --- | --- |
| 1 | **Every item has a distinct visual identity** (neal.fun, Pudding, Distill, Seeing Theory) | Each exhibit card carries its real hero visual or a signature mini-drawn-in-its-grammar — never a label-only card | 15 monochrome text cards, all stamped `FLAGSHIP` |
| 2 | **Prove the interactivity on the homepage** (Brilliant, Seeing Theory, TF Playground) | The hero is *touchable* — a live mini-exhibit, not a still | Static SVG of a regression line |
| 3 | **One composed atmospheric peak** (Seeing Theory, 3b1b) | The front door opens with one deliberate, slightly cinematic moment before settling into editorial calm | Opens at "calm," stays there |
| 4 | **Curate; feature; don't flatten** (3b1b, explorabl.es, Distill) | Hierarchy — feature 1–few, organize the rest — instead of a flat equal grid | 15 equal-weight cards, no "start here" |
| 5 | **Graph-as-navigation needs a backbone** (roadmap.sh) | If the graph leads, give it a readable spine + node states + colour-by-type, and make it interactive, not a clipped static SVG | Static SVG, ~60% down, clipped on the right edge |
| 6 | **Warm voice + curation** (explorabl.es, Nicky Case) | A front-door voice with warmth and a curated way in ("3 random", "start here") | Reserved editorial throughout |

## What stays ours (do not regress)

The front-door set is weaker than us on exactly what the atlas is built from:

- **A real knowledge graph with state.** roadmap.sh fakes the atlas with a static
  curriculum tree and checkboxes; ours is a typed graph with mastery. None of the
  others even attempt structure across pieces. This is the moat — lead with it.
- **Hands-on manipulation as the thesis.** Brilliant's hero demo is the closest,
  and it's a single canned puzzle. Our exhibits are all live. The hero should be
  the proof, not a picture of the proof.
- **Calm editorial system.** Distill's restraint is the register we already have;
  the fix is not to abandon it but to add one atmospheric peak and per-item
  identity on top of it.

## Toward ML Lab's atlas front door (the proposal)

A composed page, in priority order — wander-first, but legible to a newcomer:

1. **A living atmospheric hero built from the graph itself.** Not a separate
   illustration: the knowledge graph, rendered as a calm constellation (Seeing
   Theory's ring, but it's *our* nodes), gently in motion, with the lab's name and
   one line of what it is. The single peak (pattern 3) and the moat (the graph) are
   the same object. Open nodes glow; everything else is faint territory.
2. **The atlas, interactive and full-bleed** — promote `GraphExplorer` from a
   buried clipped figure to the centerpiece: pan/zoom, hover a node to preview its
   hero visual + one-liner, click to enter. Backbone reads left→right as a learning
   direction; node colour by domain; mastery state on each node (pattern 5).
3. **A gallery, not a card wall** — re-cut "Now showing" so each exhibit tile
   carries its real hero visual and its semantic colour; drop the redundant
   `FLAGSHIP` stamp; feature 1–3 (pattern 1, 4).
4. **Returning-learner thread** — `NextStep`/mastery surfaced as a quiet
   re-entry line for people mid-journey, since the atlas is a place you *return* to.
5. **Keep the four-pass method + journey** as editorial calm below the fold.

## Open decisions (for the build)

- **Hero = graph-constellation vs live mini-exhibit.** The proposal fuses peak +
  moat into the graph. The alternative (a draggable regression in the hero) proves
  manipulation harder but buries the graph. The atlas direction argues for the
  graph-as-hero; worth confirming before building.
- **Motion budget.** Seeing Theory's ring animates continuously; our perf red line
  is <100ms to manipulation and 60fps. A constantly-animating SVG graph at the
  homepage needs a cost check (and `prefers-reduced-motion`).
- **Graph interactivity is currently server-rendered static.** Pan/zoom/hover-
  preview means a client island — watch the shared-bundle budget (the LazyNonlinearity
  / DataLeakageLabLazy pattern applies).

## Refreshing these captures

```
npm run capture:homepages                  # all
npm run capture:homepages -- roadmap-sh-graph seeing-theory-home
```

Captures are dated in each `meta.json`; this synthesis is the durable artifact —
re-capture when a source redesigns, but the analysis is what we compare against.
