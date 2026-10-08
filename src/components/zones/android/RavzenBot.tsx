'use client'

/**
 * RavzenBot — Original RAVZEN mascot character.
 *
 * This is a completely original SVG character inspired by the concept of a
 * friendly, futuristic robot. It is NOT based on the Android mascot or any
 * other proprietary character — no green blob, no distinctive Android ears,
 * no trademarked silhouette.
 *
 * Design language: cylindrical head, circular visor eyes, hexagonal chest panel,
 * round-tipped antennae, stocky proportions — readable at small sizes.
 *
 * State machine (driven externally by AndroidActivation via refs):
 *   'idle'     — default static pose
 *   'power-on' — body brightens, charge line sweeps up
 *   'eyes'     — eye lenses illuminate (cyan glow)
 *   'wave'     — right arm raises and waves twice
 *   'walk'     — legs alternate, body shifts toward door
 *
 * All state transitions are handled by GSAP in the parent component.
 * This component is purely declarative SVG — no animation logic inside.
 *
 * Parts are assigned data-part="..." attributes so AndroidActivation can
 * query them from containerRef without coupling to CSS class names.
 */

interface RavzenBotProps {
  size?:      number    // width in px; height is computed at 1.4× ratio
  className?: string
}

// ── Colour palette ────────────────────────────────────────────────────────────

const C = {
  body:        '#0d2235',   // dark teal-navy hull
  bodyMid:     '#0f2a40',
  bodyLight:   '#164060',
  rim:         '#00d4ff',   // cyan energy trim
  rimDim:      '#004455',   // unlit trim
  eyeLens:     '#001a22',   // unlit eye fill
  eyeGlow:     '#00d4ff',   // powered-on eye fill
  panel:       '#0a1c2e',
  panelAccent: '#00ff87',   // green indicator
  highlight:   'rgba(0,212,255,0.18)',
  shadow:      'rgba(0,0,0,0.55)',
} as const

export default function RavzenBot({ size = 120, className }: RavzenBotProps) {
  const w = size
  const h = Math.round(size * 1.42)
  const cx = w / 2

  // All measurements scale with `size` as the reference width
  const s = size / 120   // scale factor

  // ── Structural measurements ───────────────────────────────────────────
  const headW   = w * 0.52
  const headH   = w * 0.38
  const headX   = (w - headW) / 2
  const headY   = w * 0.06
  const headR   = headW * 0.22       // corner radius

  const neckH   = w * 0.05
  const neckW   = headW * 0.42
  const neckX   = (w - neckW) / 2
  const neckY   = headY + headH

  const bodyW   = w * 0.70
  const bodyH   = w * 0.38
  const bodyX   = (w - bodyW) / 2
  const bodyY   = neckY + neckH
  const bodyR   = bodyW * 0.12

  const armW    = w * 0.14
  const armH    = bodyH * 0.80
  const armLX   = bodyX - armW - w * 0.01
  const armRX   = bodyX + bodyW + w * 0.01
  const armY    = bodyY + w * 0.04

  const legW    = bodyW * 0.28
  const legH    = w * 0.20
  const legLX   = bodyX + bodyW * 0.14
  const legRX   = bodyX + bodyW * 0.58
  const legY    = bodyY + bodyH - 2 * s

  const footW   = legW * 1.25
  const footH   = legH * 0.32

  const eyeR    = headW * 0.14
  const eyeY    = headY + headH * 0.44
  const eyeLX   = headX + headW * 0.28
  const eyeRX   = headX + headW * 0.72

  const antH    = w * 0.12
  const antX    = cx
  const antY    = headY - antH + 2 * s

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RAVZEN Bot character"
      aria-hidden="true"
    >
      {/* ── Defs: gradients & filters ──────────────────────────── */}
      <defs>
        {/* Body gradient */}
        <linearGradient id="rbBodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={C.bodyLight} />
          <stop offset="100%" stopColor={C.body}       />
        </linearGradient>

        {/* Highlight sheen */}
        <linearGradient id="rbSheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.14)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)"    />
        </linearGradient>

        {/* Eye glow radial */}
        <radialGradient id="rbEyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={C.eyeGlow} stopOpacity="1"   />
          <stop offset="100%" stopColor={C.eyeGlow} stopOpacity="0.2" />
        </radialGradient>

        {/* Soft drop shadow filter */}
        <filter id="rbShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy={3 * s} stdDeviation={4 * s}
            floodColor="rgba(0,0,0,0.55)" />
        </filter>

        {/* Glow filter for powered-on state */}
        <filter id="rbGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation={3 * s} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── Antenna ────────────────────────────────────────────── */}
      {/* Antenna stem */}
      <rect
        data-part="antenna"
        x={antX - 1.5 * s} y={antY}
        width={3 * s} height={antH}
        rx={1.5 * s}
        fill={C.rimDim}
      />
      {/* Antenna tip orb */}
      <circle
        data-part="antenna-orb"
        cx={antX} cy={antY}
        r={5 * s}
        fill={C.rimDim}
        stroke={C.rimDim}
        strokeWidth={1 * s}
      />

      {/* ── Head ───────────────────────────────────────────────── */}
      <rect
        data-part="head"
        x={headX} y={headY}
        width={headW} height={headH}
        rx={headR}
        fill="url(#rbBodyGrad)"
        stroke={C.rimDim}
        strokeWidth={1.2 * s}
        filter="url(#rbShadow)"
      />

      {/* Head sheen */}
      <rect
        x={headX} y={headY}
        width={headW} height={headH * 0.5}
        rx={headR}
        fill="url(#rbSheen)"
      />

      {/* ── Eyes ───────────────────────────────────────────────── */}
      {/* Eye sockets */}
      <circle cx={eyeLX} cy={eyeY} r={eyeR + 2 * s}
        fill={C.panel} />
      <circle cx={eyeRX} cy={eyeY} r={eyeR + 2 * s}
        fill={C.panel} />

      {/* Eye lenses — start unlit, illuminated by GSAP */}
      <circle
        data-part="eye-left"
        cx={eyeLX} cy={eyeY} r={eyeR}
        fill={C.eyeLens}
        stroke={C.rimDim}
        strokeWidth={1.2 * s}
      />
      <circle
        data-part="eye-right"
        cx={eyeRX} cy={eyeY} r={eyeR}
        fill={C.eyeLens}
        stroke={C.rimDim}
        strokeWidth={1.2 * s}
      />

      {/* Eye pupil dots (always present) */}
      <circle cx={eyeLX} cy={eyeY} r={2.5 * s} fill="rgba(255,255,255,0.15)" />
      <circle cx={eyeRX} cy={eyeY} r={2.5 * s} fill="rgba(255,255,255,0.15)" />

      {/* Visor bar below eyes */}
      <rect
        x={headX + headW * 0.12} y={eyeY + eyeR + 3 * s}
        width={headW * 0.76} height={2 * s}
        rx={1 * s}
        fill={C.rimDim}
      />

      {/* ── Neck ───────────────────────────────────────────────── */}
      <rect
        x={neckX} y={neckY}
        width={neckW} height={neckH}
        fill={C.bodyMid}
        stroke={C.rimDim}
        strokeWidth={0.8 * s}
      />
      {/* Neck pipe details */}
      {[0.25, 0.5, 0.75].map((t) => (
        <rect key={t}
          x={neckX + neckW * t - 1 * s} y={neckY}
          width={2 * s} height={neckH}
          fill={C.rimDim} opacity={0.5}
        />
      ))}

      {/* ── Body ───────────────────────────────────────────────── */}
      <rect
        data-part="body"
        x={bodyX} y={bodyY}
        width={bodyW} height={bodyH}
        rx={bodyR}
        fill="url(#rbBodyGrad)"
        stroke={C.rimDim}
        strokeWidth={1.2 * s}
        filter="url(#rbShadow)"
      />

      {/* Body sheen */}
      <rect
        x={bodyX} y={bodyY}
        width={bodyW} height={bodyH * 0.45}
        rx={bodyR}
        fill="url(#rbSheen)"
      />

      {/* Chest hexagon panel */}
      <path
        data-part="chest-panel"
        d={hexPath(cx, bodyY + bodyH * 0.44, bodyW * 0.22 * s * (120 / size))}
        fill={C.panel}
        stroke={C.rimDim}
        strokeWidth={1 * s}
      />

      {/* Chest indicator dot */}
      <circle
        data-part="chest-indicator"
        cx={cx} cy={bodyY + bodyH * 0.44}
        r={4 * s}
        fill={C.panelAccent}
        opacity={0.4}
      />

      {/* Side vent slits */}
      {[0, 1, 2].map((i) => (
        <rect key={i}
          x={bodyX + bodyW * 0.08} y={bodyY + bodyH * (0.25 + i * 0.18)}
          width={bodyW * 0.16} height={2.5 * s}
          rx={1.2 * s}
          fill={C.rimDim} opacity={0.6}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <rect key={i}
          x={bodyX + bodyW * 0.76} y={bodyY + bodyH * (0.25 + i * 0.18)}
          width={bodyW * 0.16} height={2.5 * s}
          rx={1.2 * s}
          fill={C.rimDim} opacity={0.6}
        />
      ))}

      {/* ── Left arm ───────────────────────────────────────────── */}
      <rect
        data-part="arm-left"
        x={armLX} y={armY}
        width={armW} height={armH}
        rx={armW * 0.45}
        fill="url(#rbBodyGrad)"
        stroke={C.rimDim}
        strokeWidth={1 * s}
      />
      {/* Left hand orb */}
      <circle
        cx={armLX + armW / 2} cy={armY + armH + 4 * s}
        r={armW * 0.42}
        fill={C.bodyMid}
        stroke={C.rimDim}
        strokeWidth={1 * s}
      />

      {/* ── Right arm — this one waves ──────────────────────────── */}
      <g
        data-part="arm-right"
        style={{ transformOrigin: `${armRX + armW / 2}px ${armY}px` }}
      >
        <rect
          x={armRX} y={armY}
          width={armW} height={armH}
          rx={armW * 0.45}
          fill="url(#rbBodyGrad)"
          stroke={C.rimDim}
          strokeWidth={1 * s}
        />
        {/* Right hand orb */}
        <circle
          cx={armRX + armW / 2} cy={armY + armH + 4 * s}
          r={armW * 0.42}
          fill={C.bodyMid}
          stroke={C.rimDim}
          strokeWidth={1 * s}
        />
      </g>

      {/* ── Left leg ───────────────────────────────────────────── */}
      <g data-part="leg-left">
        <rect
          x={legLX} y={legY}
          width={legW} height={legH}
          rx={legW * 0.3}
          fill="url(#rbBodyGrad)"
          stroke={C.rimDim}
          strokeWidth={1 * s}
        />
        {/* Left foot */}
        <rect
          x={legLX - (footW - legW) / 2} y={legY + legH - 2 * s}
          width={footW} height={footH}
          rx={footH * 0.45}
          fill={C.bodyMid}
          stroke={C.rimDim}
          strokeWidth={1 * s}
        />
      </g>

      {/* ── Right leg ──────────────────────────────────────────── */}
      <g data-part="leg-right">
        <rect
          x={legRX} y={legY}
          width={legW} height={legH}
          rx={legW * 0.3}
          fill="url(#rbBodyGrad)"
          stroke={C.rimDim}
          strokeWidth={1 * s}
        />
        {/* Right foot */}
        <rect
          x={legRX - (footW - legW) / 2} y={legY + legH - 2 * s}
          width={footW} height={footH}
          rx={footH * 0.45}
          fill={C.bodyMid}
          stroke={C.rimDim}
          strokeWidth={1 * s}
        />
      </g>

      {/* ── Power-on charge line (hidden initially, revealed by GSAP) ── */}
      <rect
        data-part="charge-line"
        x={bodyX + bodyW * 0.1} y={bodyY + bodyH}
        width={bodyW * 0.8} height={2 * s}
        rx={1 * s}
        fill={C.rim}
        opacity={0}
      />

      {/* ── Body energy trim (bottom, lit on power-on) ─────────── */}
      <rect
        data-part="body-trim"
        x={bodyX} y={bodyY + bodyH - 3 * s}
        width={bodyW} height={3 * s}
        rx={bodyR}
        fill={C.rimDim}
        opacity={0.5}
      />
    </svg>
  )
}

// ── Hex path helper ───────────────────────────────────────────────────────────

function hexPath(cx: number, cy: number, r: number): string {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  })
  return `M${pts.join('L')}Z`
}
