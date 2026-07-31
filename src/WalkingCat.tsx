/**
 * The MeowMeow wordmark cat, mid-stride.
 *
 * Drawn as a solid silhouette so it reads at 22px beside a serif wordmark,
 * where an outline mark would turn to mush. The walk is four legs on two
 * counter-phased keyframe pairs plus a tail sway — enough to read as walking
 * without the body bobbing, which at this size looks like a glitch rather than
 * a gait.
 *
 * Decorative: the accessible name comes from the wordmark text beside it, so
 * this is aria-hidden and contributes nothing to the accessibility tree.
 *
 * Motion is opt-out, not opt-in — see `prefers-reduced-motion` in styles.css,
 * which freezes every leg mid-stride rather than snapping them to rest, so the
 * static state is still a deliberate walking pose.
 */
export function WalkingCat({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className ? `walking-cat ${className}` : "walking-cat"}
      viewBox="0 0 64 40"
      role="presentation"
      focusable="false"
    >
      {/* Far-side legs first, so the body mass overlaps them. */}
      <g className="walking-cat__leg walking-cat__leg--fore-far">
        <rect x="24.5" y="21" width="3.6" height="14" rx="1.8" />
      </g>
      <g className="walking-cat__leg walking-cat__leg--hind-far">
        <rect x="40" y="21" width="3.6" height="14" rx="1.8" />
      </g>

      {/* Tail, swaying from its root at the haunch. */}
      <path
        className="walking-cat__tail"
        d="M47 18c6 0.5 9 -3.5 8 -9"
        fill="none"
        strokeWidth="3.2"
        strokeLinecap="round"
      />

      {/* Body: chest through haunch as one rounded mass. */}
      <ellipse cx="31" cy="19" rx="16" ry="6.6" />
      <circle cx="43" cy="18.2" r="7.4" />

      {/* Head, with both ear triangles rooted inside the skull circle so they
          read as ears rather than as detached horns. */}
      <circle cx="15.5" cy="13.5" r="6.4" />
      <path d="M8.8 10.2 8.2 2.8 14.2 7.2Z" />
      <path d="M22.2 10.2 22.8 2.8 16.8 7.2Z" />

      {/* Near-side legs, counter-phased against the far pair. */}
      <g className="walking-cat__leg walking-cat__leg--fore-near">
        <rect x="19.5" y="21" width="4" height="14.5" rx="2" />
      </g>
      <g className="walking-cat__leg walking-cat__leg--hind-near">
        <rect x="45" y="21" width="4" height="14.5" rx="2" />
      </g>
    </svg>
  );
}
