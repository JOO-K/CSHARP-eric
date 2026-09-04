/* ══════════════════════════════════════════════════════════════════════════
   SD_BELT — belt geometry over a set of pulleys
   ══════════════════════════════════════════════════════════════════════════
   The logo is a belt drive, so this is the one place that knows how a belt
   actually lies on a set of wheels. Three solvers, in the order you should
   reach for them:

     taut(wheels, gap)     A RUBBER BAND. It encircles the wheels you mark as
                           inside and treats EVERY wheel as something it cannot
                           pass through, so a wheel sitting outside the loop
                           just leans on it. Works out the order, the wrap side
                           and who is touching at all, on its own. This is the
                           one the lab runs on.

     hull(circles, gap)    every wheel wrapped from the OUTSIDE, order worked
                           out for you. Always valid, never has an idler —
                           `taut` with nothing marked outside, and quite a bit
                           cheaper. This is what the mix dial draws.

     route(wheels, gap)    an ORDERED loop where each wheel carries a side, and
                           an outside wheel is joined by the CROSSED tangent —
                           a belt with a real twist in it, which is a real
                           machine (a crossed V-belt) but NOT what a backside
                           idler is. Kept because it is the honest primitive;
                           see the warning on `taut` before reaching for it.

   Loaded standalone by belt-lab.html and by index.html (before app.js, whose
   `beltPath` is `hull` with the dial's gap).
   ⚠ Screen coordinates: y is DOWN, so "clockwise" means the atan2 angle
     INCREASES. Every sign in here depends on that.
   ══════════════════════════════════════════════════════════════════════════ */
window.SD_BELT = (function () {
  const TAU = Math.PI * 2;
  const f = n => Math.round(n * 100) / 100;

  /* How far a wheel must be clear of a run before the belt lets go of it, and
     how far into a run it must reach before the belt notices. ⚠ The SAME
     number for both, and it must be > 0: that dead band is the only thing
     stopping `taut` from removing and re-inserting one contact for ever. */
  const EPS = 0.05;

  // A lone wheel: the belt is the circle itself.
  function loop(c) {
    return `M ${f(c.x)} ${f(c.y - c.r)} A ${f(c.r)} ${f(c.r)} 0 1 1 ${f(c.x)} ${f(c.y + c.r)}` +
           ` A ${f(c.r)} ${f(c.r)} 0 1 1 ${f(c.x)} ${f(c.y - c.r)} Z`;
  }

  // Where p falls along the segment ab (0…1), and how far off it lies.
  function segT(p, a, b) {
    const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy;
    if (!L2) return 0;
    return Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / L2));
  }
  function segDist(p, a, b) {
    const t = segT(p, a, b);
    return Math.hypot(p.x - (a.x + (b.x - a.x) * t), p.y - (a.y + (b.y - a.y) * t));
  }

  /* ── how far a wheel is from a run, and on which side ───────────────────
     Plain distance, EXCEPT for an idler in GREEDY mode, where it is SIGNED:
     positive on the outward side, negative once the wheel has been pushed PAST
     the run. Distance alone lets go of an idler the moment it crosses — the
     wheel falls through the belt and stops affecting it, or grows big enough to
     touch both runs at once and gets wrapped instead. Signed, the belt keeps
     hold and is DRAGGED along, so pushing an idler deeper keeps deepening the
     notch. That is the belt of unlimited length.
     ⚠ Only alongside the run (0 ≤ t ≤ 1). Off either end there is nothing to
       drag, and holding on there would reach across the whole rig. */
  function reach(c, run, greedy) {
    if (!greedy || !c.out) return segDist(c, run.from, run.to);
    const dx = run.to.x - run.from.x, dy = run.to.y - run.from.y, L = Math.hypot(dx, dy);
    if (!L) return segDist(c, run.from, run.to);
    const t = ((c.x - run.from.x) * dx + (c.y - run.from.y) * dy) / (L * L);
    if (t < 0 || t > 1) return segDist(c, run.from, run.to);
    return ((c.x - run.from.x) * dy - (c.y - run.from.y) * dx) / L;
  }

  // Do the two open segments properly cross? (Touching at an end does not count.)
  const side = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
  function segCross(p1, p2, p3, p4) {
    const E = 1e-7;
    const d1 = side(p3, p4, p1), d2 = side(p3, p4, p2), d3 = side(p1, p2, p3), d4 = side(p1, p2, p4);
    return ((d1 > E && d2 < -E) || (d1 < -E && d2 > E)) && ((d3 > E && d4 < -E) || (d3 < -E && d4 > E));
  }

  /* ── wrapOrder ───────────────────────────────────────────────────────────
     Gift-wrapping: the order a belt takes round a set of CIRCLES, always the
     least left turn, plus the outward-normal angle at which it leaves each one
     for the next. This is the convex hull of the circles — which is what a belt
     over wheels that are all inside the loop physically is.
     ⚠ Not the hull of the CENTRES offset outward: that cuts through the big
       wheels' hubs and floats off the small ones.
     Shared by `hull` (which draws it) and `taut` (which starts from it). */
  function wrapOrder(cs) {
    /* ⚠ `out.closed` says the walk came back to where it started. It does NOT
       always: a wheel wholly inside another is skipped by the swallow guard
       below, and the wrap can then ping-pong between two circles until the
       guard cap stops it. There is no belt over such a rig, and both callers
       have to know they were handed a walk rather than a loop. */
    const out = [];
    out.closed = false;
    if (cs.length < 2) { out.closed = cs.length === 1; return Object.assign(cs.map((_, k) => ({ k, ang: -Math.PI / 2, turn: 0 })), { closed: out.closed }); }

    let start = 0;                                    // topmost wheel top
    for (let i = 1; i < cs.length; i++) if (cs[i].y - cs[i].r < cs[start].y - cs[start].r) start = i;

    let cur = start, ang = -Math.PI / 2;              // outward normal, pointing up
    for (let guard = 0; guard < cs.length * 2 + 4; guard++) {
      let best = -1, bestTurn = Infinity, bestAng = 0;
      for (let j = 0; j < cs.length; j++) {
        if (j === cur) continue;
        const dx = cs[j].x - cs[cur].x, dy = cs[j].y - cs[cur].y;
        const dist = Math.hypot(dx, dy);
        if (!dist) continue;
        const t = (cs[cur].r - cs[j].r) / dist;
        if (t < -1 || t > 1) continue;                // one wheel swallows the other
        const phi = Math.atan2(dy, dx) - Math.acos(t);
        const turn = ((phi - ang) % TAU + TAU) % TAU;
        if (turn < bestTurn) { bestTurn = turn; best = j; bestAng = phi; }
      }
      if (best < 0) break;
      out.push({ k: cur, next: best, ang: bestAng, turn: bestTurn });
      cur = best; ang = bestAng;
      if (cur === start) { out.closed = true; break; }
    }
    return out;
  }

  /* ── hull ────────────────────────────────────────────────────────────────
     The wrap order, drawn: an arc across each wheel, then the straight run to
     the next. Always closes. */
  function hull(circles, gap = 0) {
    const cs = circles.map(c => ({ x: c.x, y: c.y, r: c.r + gap }));
    if (!cs.length) return '';
    if (cs.length === 1) return loop(cs[0]);

    const at = (i, a) => ({ x: cs[i].x + Math.cos(a) * cs[i].r, y: cs[i].y + Math.sin(a) * cs[i].r });
    const order = wrapOrder(cs);
    const startAng = -Math.PI / 2;

    // Nowhere to wrap to — every centre is the same point. A move and a close,
    // which draws nothing; kept exactly as it was so the dial cannot notice.
    if (!order.length) {
      let s0 = 0;
      for (let i = 1; i < cs.length; i++) if (cs[i].y - cs[i].r < cs[s0].y - cs[s0].r) s0 = i;
      return `M ${f(at(s0, startAng).x)} ${f(at(s0, startAng).y)} Z`;
    }

    const start = order[0].k;
    let d = `M ${f(at(start, startAng).x)} ${f(at(start, startAng).y)}`;
    for (let i = 0; i < order.length; i++) {
      const st = order[i];
      const wrapEnd = at(st.k, st.ang);               // arc this wheel wraps …
      d += ` A ${f(cs[st.k].r)} ${f(cs[st.k].r)} 0 ${st.turn > Math.PI ? 1 : 0} 1 ${f(wrapEnd.x)} ${f(wrapEnd.y)}`;
      /* ⚠ Where the walk was HEADING, not order[i+1]. On a closed loop they
         are the same; on a rig the wrap could not close they are not, and the
         difference is the last run flying back to the start. */
      const land = at(st.next, st.ang);               // … then the straight run
      d += ` L ${f(land.x)} ${f(land.y)}`;
    }
    if (order.closed) {                               // the last arc home
      const lastAng = order[order.length - 1].ang;
      const close = ((startAng - lastAng) % TAU + TAU) % TAU;
      const pe = at(start, startAng);
      d += ` A ${f(cs[start].r)} ${f(cs[start].r)} 0 ${close > Math.PI ? 1 : 0} 1 ${f(pe.x)} ${f(pe.y)}`;
    }
    return d + ' Z';
  }

  /* ── the one piece of maths ──────────────────────────────────────────────
     A straight run leaving contact a and landing on contact b. Let m be the
     unit normal from each centre out to its tangent point. Screen-space
     rotation R(x,y) = (y, -x) takes the travel direction u to the OUTWARD
     radial of a clockwise-wrapped wheel, so for either side:

         P = C + s·r·m,   m = R(u) = (sin a, -cos a)

     Both points lie on one line perpendicular to m, so m·(Pb - Pa) = 0, which
     collapses to  sin(a - phi) = -delta/d  with delta = s_b·r_b - s_a·r_a.

         a = phi - asin(delta / d)

     Same-side contacts give a small delta — an external tangent, the belt
     staying on one face. Opposite sides give delta = ±(ra + rb), the tangent
     that passes BETWEEN the two circles: correct where the belt really does
     swap which face it presents (a wheel wrapped the other way), and the
     reason |delta| > d is a real failure — the circles overlap and no belt
     can thread between them. */
  function span(a, b) {
    const dx = b.c.x - a.c.x, dy = b.c.y - a.c.y, d = Math.hypot(dx, dy);
    const delta = b.s * b.c.r - a.s * a.c.r;
    if (!d || Math.abs(delta) > d) return null;
    const al = Math.atan2(dy, dx) - Math.asin(delta / d);
    const m = { x: Math.sin(al), y: -Math.cos(al) };
    return {
      from: { x: a.c.x + a.s * a.c.r * m.x, y: a.c.y + a.s * a.c.r * m.y },
      to:   { x: b.c.x + b.s * b.c.r * m.x, y: b.c.y + b.s * b.c.r * m.y },
    };
  }

  // The path for a solved contact ring: run, arc, run, arc …
  function draw(seq, runs) {
    let d = `M ${f(runs[0].from.x)} ${f(runs[0].from.y)}`;
    for (let i = 0; i < seq.length; i++) {
      const r1 = runs[i], r2 = runs[(i + 1) % seq.length], t = seq[(i + 1) % seq.length];
      d += ` L ${f(r1.to.x)} ${f(r1.to.y)}`;
      const a0 = Math.atan2(r1.to.y   - t.c.y, r1.to.x   - t.c.x);
      const a1 = Math.atan2(r2.from.y - t.c.y, r2.from.x - t.c.x);
      let sw = t.s > 0 ? a1 - a0 : a0 - a1;            // wrap angle, always forward
      sw = ((sw % TAU) + TAU) % TAU;
      d += ` A ${f(t.c.r)} ${f(t.c.r)} 0 ${sw > Math.PI ? 1 : 0} ${t.s > 0 ? 1 : 0} ${f(r2.from.x)} ${f(r2.from.y)}`;
    }
    return d + ' Z';
  }

  /* ── route ───────────────────────────────────────────────────────────────
     Wheels in the given order, each wrapped on the side it asks for, joined by
     whatever tangent that implies.

     ⚠ THIS IS NOT A BACKSIDE IDLER, and mistaking it for one is what sent the
     lab wrong. `side: -1` here means "the belt reaches this wheel by the
     crossed tangent" — a belt with a TWIST in it. That happens to draw the
     right picture while the wheel sits square across the run between its two
     list neighbours, and draws a figure-eight the moment it doesn't, because
     nothing in here knows where the belt would actually go. A real idler
     leaning on the outside of a belt does not flip it over. Use `taut`. */
  function route(wheels, gap = 0) {
    const n = wheels.length;
    if (!n) return { d: '', bad: [] };
    const w = wheels.map(k => ({ c: { x: k.x, y: k.y, r: k.r + gap }, s: k.side === -1 ? -1 : 1 }));
    if (n === 1) return { d: loop(w[0].c), bad: [] };

    const bad = [], runs = [];
    for (let i = 0; i < n; i++) {
      const r = span(w[i], w[(i + 1) % n]);
      if (!r) bad.push(i);
      runs.push(r);
    }
    if (bad.length) return { d: '', bad };
    return { d: draw(w, runs), bad: [] };
  }

  /* ══════════════════════════════════════════════════════════════════════════
     taut — the belt as a RUBBER BAND
     ══════════════════════════════════════════════════════════════════════════
     Every other solver here draws the belt you describe. This one finds the
     belt that would actually be there: the shortest closed curve that goes
     round the wheels you marked inside, in a plane where EVERY wheel is solid
     and it cannot pass through any of them.

     That one change answers all of it at once, because a shortest closed curve
     cannot cross itself:

       · a wheel outside the loop LEANS on the belt — it dents. It cannot twist
         it, because a twist is longer than not twisting.
       · a wheel out of reach does NOTHING, and needs no special case: the band
         simply never touches it.
       · the ORDER and the WRAP SIDE fall out of the solve. Nothing has to be
         seated between the right pair of list neighbours, which is the whole
         class of bug `route` has.

     `side` still means something, and it is the one thing position cannot tell
     you: +1 the belt goes ROUND this wheel, -1 it only presses against it.
     Everything else is derived.

     Method — relaxation, which is what a band settling actually is:
       1. start from the hull of the wheels the belt must enclose;
       2. any wheel standing in a straight run gets inserted into the ring
          there, wrapped the way that pushes the belt aside;
       3. any contact the belt has stopped touching is dropped;
       4. repeat until nothing moves.
     ⚠ (2) and (3) are opposite tests on the same quantity, so they need the
       EPS dead band between them or a wheel sitting exactly on a run is
       inserted and dropped for ever.

     Returns { d, on: [{i, side, wrap}], off: [i], bad: [i] } — the path, who
     the belt is touching and which way round, who it is missing, and any wheel
     jammed so close to its neighbour that no belt can thread between them.
     ══════════════════════════════════════════════════════════════════════════ */
  function taut(wheels, gap = 0) {
    /* ⚠ `lock` is "a person set this side by hand" (the lab's pin), and it is
       BINDING. A locked idler is always on the belt, is never let go of, and is
       never re-wrapped the other way — even when the result crosses itself.
       That is the deal the Aphex string-and-pulley tool makes and it is the
       right one: a guess that quietly overrules you is worse than a tangle you
       can see and fix, because the tangle has a control attached to it and the
       guess does not. Unlocked wheels still get the full taut treatment. */
    const cs = wheels.map((w, i) => ({ x: w.x, y: w.y, r: w.r + gap, i,
                                       out: w.side === -1, lock: w.pin === true }));
    const allOff = () => cs.map(c => c.i);
    if (!cs.length) return { d: '', on: [], off: [], bad: [], tangle: [] };

    /* ⚠ THE BELT NEVER PASSES THROUGH A WHEEL. That is the one thing a rubber
       band round some pegs cannot do, so it is the one thing this must not do
       either — and it is what `flip` is for. A wheel asked to be OUTSIDE that
       the band cannot fold around gets wrapped from the inside instead, which
       is what would really happen: the wheel is in the way, so the belt goes
       round it. Earlier drafts banned such a wheel from the solve and the belt
       sailed straight through it, which looks far more broken than a notch
       that turned into a bulge (measured: 962 rigs in 40k, none now).
       `bad` is what the lab says about them. */
    const flip = new Set(), bad = [], tangle = [];

    /* ⚠ A wheel wholly inside another is INTERIOR — the belt goes round the big
       one and never touches it — so it must not be a candidate contact.
       `wrapOrder` cannot use one either (its swallow guard skips it, and the
       wrap then ping-pongs), and the seed fell through to "just take the first
       two circles", which is not a hull at all: the belt sailed through
       everything else. Every wheel that got cut in a 120k-rig sweep came from
       that one fallback. Ties broken by radius then index so two identical
       circles cannot swallow each other and both vanish. */
    const swallowed = (c, arr) => arr.some(o => o !== c &&
      Math.hypot(c.x - o.x, c.y - o.y) + c.r <= o.r + EPS &&
      (o.r > c.r || (o.r === c.r && o.i < c.i)));
    const inside = () => {
      const k = cs.filter(c => !c.out || flip.has(c));
      return k.filter(c => !swallowed(c, k));
    };

    if (!inside().length) return { d: '', on: [], off: allOff(), bad: [], tangle: [] };
    if (inside().length === 1) {
      const c = inside()[0];
      return { d: loop(c), on: [{ i: c.i, side: 1, wrap: TAU }],
               off: cs.filter(k => k !== c).map(k => k.i), bad: [], tangle: [] };
    }
    const mark = (c, force) => {
      if (c.lock && !force) { if (!bad.includes(c.i)) bad.push(c.i); return false; }  // yours; say so, change nothing
      if (!flip.has(c)) { flip.add(c); if (!bad.includes(c.i)) bad.push(c.i); }
      return true;
    };

    /* ── one relaxation ──────────────────────────────────────────────────
       Start from the hull of the wheels the belt must enclose, then let it
       settle: anything standing in a run gets wrapped, anything the belt has
       let go of gets dropped. Returns null if it could not settle, having
       flipped whatever was in the way. */
    function settle(greedy) {
      /* ⚠ Locked idlers that turned out to be unplaceable THIS settle. Without
         this the overlap branch drops one and the force-seat pass immediately
         puts it back, round and round until the pass cap — which returned no
         belt at all for 29% of randomly locked rigs. */
      const refused = new Set();
      const enc = inside();
      if (enc.length < 2) return null;
      /* ⚠ A wheel may legitimately appear TWICE in the ring, and it must not be
         deduped. Three near-collinear wheels make a long thin hull whose middle
         circle carries an arc on the top edge AND one on the bottom — the belt
         really does touch it twice. Dropping the second contact left a ring
         that was not the hull, the soundness check threw it out, and the lab
         showed no belt at all for an ordinary flat rig.
         The walk cannot produce two of the same wheel ADJACENT (it always moves
         on), so no run is ever zero length. */
      const seq0 = wrapOrder(enc);
      if (!seq0.closed) return null;                  // no loop over this rig
      let seq = seq0.map(st => ({ c: enc[st.k], s: 1 }));
      if (seq.length < 2) return null;

      for (let pass = 0; pass < 80; pass++) {
        const runs = seq.map((a, k) => span(a, seq[(k + 1) % seq.length]));

        /* No tangent between these two: with one of them wrapped the other way
           that means the wheels physically overlap, and there is nothing to
           thread between them. Wrap it the same way as its neighbour instead. */
        const iBad = runs.indexOf(null);
        if (iBad >= 0) {
          const a = seq[iBad], b = seq[(iBad + 1) % seq.length];
          const victim = a.s < 0 ? a : (b.s < 0 ? b : null);
          if (!victim) return null;                    // two inside wheels, one swallowing the other
          if (mark(victim.c)) return null;             // flipped inside — start again
          // Locked, so it keeps its side; but these two overlap and no belt
          // threads between them, so it cannot be on the ring this time round.
          refused.add(victim.c);
          seq = seq.filter(t => t !== victim);
          if (seq.length < 2) return null;
          continue;
        }

        /* ── the belt has let go of an idler ───────────────────────────────
           ⚠ IDLERS ONLY (s < 0), and that restriction is load-bearing. The
           test asks "would the run between its neighbours still touch it?",
           which is the right question for something LEANING on the belt and
           the wrong one for something the belt goes ROUND: the shortcut across
           a hull contact never touches it — that is what being a hull contact
           MEANS — so applying this to an inside wheel deletes it and the band
           stops enclosing it. It did, and a plain trio came out as a
           two-pulley belt with a wheel floating beside it.
           Nothing else is needed: the seed is the hull of the inside wheels,
           every one of which is taut, and pushing the band INWARD with an
           idler can only make it hug them harder. */
        let dropped = false;
        if (seq.length > 2) {
          for (let k = 0; k < seq.length; k++) {
            const t = seq[k];
            if (t.s > 0 || t.c.lock) continue;         // yours: the belt keeps hold
            const a = seq[(k - 1 + seq.length) % seq.length], b = seq[(k + 1) % seq.length];
            const r = span(a, b);
            if (!r) continue;                          // it is what keeps them apart
            if (reach(t.c, r, greedy) > t.c.r + EPS) { seq.splice(k, 1); dropped = true; break; }
          }
        }
        if (dropped) continue;

        // ── a wheel is standing in a run ───────────────────────────────────
        const on = new Set(seq.map(t => t.c));
        let ins = null;
        for (let k = 0; k < seq.length && !ins; k++) {
          let best = null;
          for (const c of cs) {
            if (on.has(c)) continue;
            if (reach(c, runs[k], greedy) < c.r - EPS) {
              const t = segT(c, runs[k].from, runs[k].to);
              if (!best || t < best.t) best = { c, t };  // nearest along the run first
            }
          }
          if (best) ins = { k, c: best.c };
        }
        if (!ins) {
          /* ⚠ A LOCKED IDLER IS ALWAYS ON THE BELT. The relaxation only picks up
             wheels that are in the way, so one you have set to Out and then
             moved clear would simply be let go of — "it stops affecting the
             belt". Here the belt goes and gets it: seated on the run it is
             nearest, and never dropped again (the let-go pass skips locked
             wheels). Reaching a long way out means crossed tangents and a
             tangle, which is yours to see and resolve — that is the trade the
             lock makes. */
          let take = null;
          for (const c of cs) {
            if (!c.lock || !c.out || on.has(c) || refused.has(c)) continue;
            for (let k = 0; k < seq.length; k++) {
              const d = segDist(c, runs[k].from, runs[k].to);
              if (!take || d < take.d) take = { c, k, d };
            }
          }
          if (!take) return { seq, runs };              // settled
          seq.splice(take.k + 1, 0, { c: take.c, s: -1 });
          continue;
        }
        // Wrapped the way that pushes the belt aside: round an inside wheel,
        // against an idler.
        seq.splice(ins.k + 1, 0, { c: ins.c, s: (ins.c.out && !flip.has(ins.c)) ? -1 : 1 });
      }
      return null;                                      // never settled
    }

    /* ── the check that makes a twist impossible ──────────────────────────
       A simple closed curve traversed once turns through exactly 2π. A belt
       that has crossed itself does not. So solve, ADD THE TURNING UP, and if it
       has not come to 2π the loop has folded over: take the idler doing the
       most bending, wrap it from the inside instead, and solve again.
       ⚠ This is the whole reason `taut` cannot draw the figure-eight `route`
         draws. Local tangents can always be made to look plausible one run at
         a time; only a global invariant catches a loop that has folded over.
       ⚠ It terminates because flipping every idler leaves the plain hull,
         whose turning is 2π by construction. */
    function turning(g) {
      return g.seq.map((t, k) => {
        const r1 = g.runs[(k - 1 + g.seq.length) % g.seq.length], r2 = g.runs[k];
        const a0 = Math.atan2(r1.to.y   - t.c.y, r1.to.x   - t.c.x);
        const a1 = Math.atan2(r2.from.y - t.c.y, r2.from.x - t.c.x);
        const sw = t.s > 0 ? a1 - a0 : a0 - a1;
        return { t, wrap: ((sw % TAU) + TAU) % TAU };
      });
    }

    /* ── and the two things a real belt simply cannot do ──────────────────
       The turning sum catches a loop that has folded over, but it is not on
       its own enough — a curve can cross itself and still turn through 2π
       (measured: 88 rigs in 40k got past the sum alone). So ALSO check the
       picture: no run may cross another, and no run may pass through a wheel.
       Both are cheap — a handful of runs — and between them there is nothing
       left for a bad solve to look like. */
    function sound(g) {
      for (let i = 0; i < g.runs.length; i++) {
        for (let j = i + 1; j < g.runs.length; j++) {
          const a = g.runs[i], b = g.runs[j];
          if (segCross(a.from, a.to, b.from, b.to)) return false;
        }
        for (const c of cs) if (segDist(c, g.runs[i].from, g.runs[i].to) < c.r - EPS) return false;
      }
      return true;
    }

    const closes = g => Math.abs(g.turn.reduce((s, x) => s + x.t.s * x.wrap, 0) - TAU) < 1e-6;

    let got = null;
    for (let attempt = 0; attempt <= cs.length + 2 && !got; attempt++) {
      const before = flip.size;
      let last = null;
      /* ⚠ GREEDY FIRST, then plain. Greedy is what drags the belt along with an
         idler pushed past its run, and it is right nearly everywhere — but push
         one far enough and the dragged run would cross the far side of the loop,
         which is not a belt at any length. So the ordinary reach is the second
         try, and only if THAT fails does a wheel get wrapped from the inside.
         Trying them in this order is what keeps the idler you asked for. */
      for (const greedy of [true, false]) {
        const g = settle(greedy);
        if (!g) continue;
        g.turn = turning(g);
        if (closes(g) && sound(g)) { got = g; break; }
        if (!last) last = g;
      }
      if (got) break;
      if (!last) { if (flip.size > before) continue; break; }

      /* Not a belt either way. Wrap the idler doing the most bending from the
         inside instead — that is the wheel the band most likely cannot fold
         around. ⚠ The lab SAYS SO: it comes back in `bad`, because silently
         reinterpreting a side someone set by hand is worse than not honouring
         it. */
      let worst = null, locked = null;
      for (const x of last.turn) {
        if (x.t.s >= 0) continue;
        if (x.t.c.lock) { if (!locked || x.wrap > locked.wrap) locked = x; }
        else if (!worst || x.wrap > worst.wrap) worst = x;
      }
      /* ⚠ Nothing left that we are ALLOWED to change: every idler still in the
         way is one you set by hand. Draw it exactly as asked — tangle and all —
         and name it. Silently re-wrapping it is the behaviour that made this
         feel like it had a mind of its own. */
      if (!worst) {
        /* ⚠ Only when a LOCKED wheel is the reason. With nothing locked there
           is still the floor to fall back on, and taking an unsound belt
           instead of it put twists back into rigs the solver was free to fix. */
        if (locked) { if (!tangle.includes(locked.t.c.i)) tangle.push(locked.t.c.i); got = last; }
        break;
      }
      mark(worst.t.c);
    }

    /* ⚠ THE FLOOR. With every wheel wrapped from the inside this is the plain
       hull, which cannot cross itself or cut a wheel, so there is always an
       answer and the lab can never be left with nothing on screen. Anything
       that got here is a rig no belt fits, and `bad` names the wheels. */
    /* ⚠ THE FLOOR overrules even a lock, and it is the ONE place that may.
       Getting here means no belt fits the rig as asked at all — in practice the
       wheels physically overlap (measured: 13,674 of 13,674 such rigs). A blank
       stage answers nothing; the hull with every wheel wrapped from the inside
       at least shows what DOES fit, and the wheels come back in `bad` so the
       lab can say which ones it could not do and why. */
    if (!got) {
      cs.forEach(c => { if (c.out) mark(c, true); });
      const g = settle(false);
      if (g && sound(g)) { g.turn = turning(g); got = g; }
    }
    if (!got) return { d: '', on: [], off: allOff(), bad: bad, tangle: tangle };

    const touching = new Set(got.seq.map(t => t.c));
    return {
      d: draw(got.seq, got.runs),
      on: got.turn.map(x => ({ i: x.t.c.i, side: x.t.s, wrap: x.wrap })),
      off: cs.filter(c => !touching.has(c)).map(c => c.i),
      bad: bad,                 // could not be honoured — re-wrapped, or dropped
      tangle: tangle,           // honoured exactly, and the belt crosses itself
    };
  }

  return { taut, hull, route, loop, wrapOrder };
})();
