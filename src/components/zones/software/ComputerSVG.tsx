'use client'

/**
 * ComputerSVG — Original futuristic monitor for the Software activation.
 *
 * Design language: wide ultrawide monitor on an angular stand, with a
 * visible bezel, status LED strip, ventilation slots, and a screen
 * divided into four quadrants by thin bezels — ready to "split" as
 * the four-piece puzzle panels in the activation sequence.
 *
 * Parts tagged with data-part="..." for GSAP targeting:
 *   screen         — the full screen area (illuminated by GSAP)
 *   screen-text    — "SOFTWARE ZONE" text overlay
 *   panel-tl/tr/bl/br — four screen quadrant panels (puzzle split)
 *   body           — outer monitor shell
 *   status-led     — power indicator strip
 *   energy-ring    — circular glow ring that expands on power-on
 *   stand          — monitor stand
 *
 * Scales via `size` prop (width in px; height is 0.68×).
 */

interface ComputerSVGProps {
  size?:      number
  className?: string
}

const C = {
  chassis:     '#0d1625',
  chassisMid:  '#111e35',
  chassisRim:  '#1a2e50',
  bezel:       '#070e1c',
  screenOff:   '#050a14',
  screenOn:    '#0a2240',
  rimBlue:     '#4d7fff',
  rimViolet:   '#7c5cfc',
  rimDim:      '#1a2e50',
  statusOff:   '#0d1625',
  highlight:   'rgba(77,127,255,0.12)',
}

export default function ComputerSVG({ size = 260, className }: ComputerSVGProps) {
  const w  = size
  const h  = Math.round(size * 0.72)
  const s  = size / 260   // scale factor

  // ── Key measurements ──────────────────────────────────────────────────
  const monW  = w * 0.92
  const monH  = h * 0.76
  const monX  = (w - monW) / 2
  const monY  = h * 0.03
  const monR  = monW * 0.028

  const scrPad = monW * 0.028
  const scrX   = monX + scrPad
  const scrY   = monY + scrPad
  const scrW   = monW - scrPad * 2
  const scrH   = monH - scrPad * 2.2
  const scrR   = monR * 0.55

  // Stand
  const neckW  = monW * 0.12
  const neckH  = h * 0.10
  const neckX  = (w - neckW) / 2
  const neckY  = monY + monH

  const baseW  = monW * 0.38
  const baseH  = h * 0.07
  const baseX  = (w - baseW) / 2
  const baseY  = neckY + neckH - 2 * s

  // Screen quadrant dividers
  const divX   = scrX + scrW / 2
  const divY   = scrY + scrH / 2

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Futuristic computer monitor"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="csChassisGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={C.chassisMid} />
          <stop offset="100%" stopColor={C.chassis}     />
        </linearGradient>
        <linearGradient id="csScreenGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor={C.screenOff} />
          <stop offset="100%" stopColor={C.screenOff} />
        </linearGradient>
        <radialGradient id="csEnergyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(77,127,255,0.5)" />
          <stop offset="100%" stopColor="rgba(77,127,255,0)"   />
        </radialGradient>
        <filter id="csGlow">
          <feGaussianBlur stdDeviation={3 * s} result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ── Stand base ──────────────────────────────────────────── */}
      <rect
        data-part="stand"
        x={baseX} y={baseY}
        width={baseW} height={baseH}
        rx={baseH * 0.4}
        fill="url(#csChassisGrad)"
        stroke={C.rimDim}
        strokeWidth={1 * s}
      />

      {/* ── Stand neck ──────────────────────────────────────────── */}
      <rect
        x={neckX} y={neckY}
        width={neckW} height={neckH + 2 * s}
        rx={neckW * 0.22}
        fill={C.chassis}
        stroke={C.rimDim}
        strokeWidth={1 * s}
      />
      {/* Neck detail lines */}
      {[0.3, 0.6].map((t) => (
        <rect key={t}
          x={neckX + neckW * 0.15} y={neckY + neckH * t}
          width={neckW * 0.7} height={1.5 * s}
          rx={0.75 * s}
          fill={C.rimDim} opacity={0.7}
        />
      ))}

      {/* ── Monitor chassis ─────────────────────────────────────── */}
      <rect
        data-part="body"
        x={monX} y={monY}
        width={monW} height={monH}
        rx={monR}
        fill="url(#csChassisGrad)"
        stroke={C.rimDim}
        strokeWidth={1.2 * s}
      />

      {/* Chassis highlight sheen (top edge) */}
      <rect
        x={monX} y={monY}
        width={monW} height={monH * 0.15}
        rx={monR}
        fill="rgba(255,255,255,0.04)"
      />

      {/* Side vent slots (left) */}
      {[0, 1, 2].map((i) => (
        <rect key={i}
          x={monX + monW * 0.015} y={monY + monH * (0.30 + i * 0.14)}
          width={monW * 0.018} height={monH * 0.08}
          rx={1 * s}
          fill={C.rimDim} opacity={0.5}
        />
      ))}

      {/* Side vent slots (right) */}
      {[0, 1, 2].map((i) => (
        <rect key={i}
          x={monX + monW * 0.967} y={monY + monH * (0.30 + i * 0.14)}
          width={monW * 0.018} height={monH * 0.08}
          rx={1 * s}
          fill={C.rimDim} opacity={0.5}
        />
      ))}

      {/* Bottom status bar */}
      <rect
        x={monX + monR} y={monY + monH - 8 * s}
        width={monW - monR * 2} height={6 * s}
        rx={3 * s}
        fill={C.chassis}
        stroke={C.rimDim}
        strokeWidth={0.8 * s}
      />

      {/* Status LED strip */}
      <rect
        data-part="status-led"
        x={monX + monW * 0.42} y={monY + monH - 6 * s}
        width={monW * 0.16} height={2.5 * s}
        rx={1.2 * s}
        fill={C.statusOff}
      />

      {/* ── Screen bezel ────────────────────────────────────────── */}
      <rect
        x={scrX - scrPad * 0.4} y={scrY - scrPad * 0.4}
        width={scrW + scrPad * 0.8} height={scrH + scrPad * 0.8}
        rx={scrR + 2 * s}
        fill={C.bezel}
      />

      {/* ── Screen — four quadrant panels ───────────────────────── */}
      {/* Top-left */}
      <rect
        data-part="panel-tl"
        x={scrX} y={scrY}
        width={scrW / 2 - 0.8 * s} height={scrH / 2 - 0.8 * s}
        rx={scrR}
        fill="url(#csScreenGrad)"
      />
      {/* Top-right */}
      <rect
        data-part="panel-tr"
        x={divX + 0.8 * s} y={scrY}
        width={scrW / 2 - 0.8 * s} height={scrH / 2 - 0.8 * s}
        rx={scrR}
        fill="url(#csScreenGrad)"
      />
      {/* Bottom-left */}
      <rect
        data-part="panel-bl"
        x={scrX} y={divY + 0.8 * s}
        width={scrW / 2 - 0.8 * s} height={scrH / 2 - 0.8 * s}
        rx={scrR}
        fill="url(#csScreenGrad)"
      />
      {/* Bottom-right */}
      <rect
        data-part="panel-br"
        x={divX + 0.8 * s} y={divY + 0.8 * s}
        width={scrW / 2 - 0.8 * s} height={scrH / 2 - 0.8 * s}
        rx={scrR}
        fill="url(#csScreenGrad)"
      />

      {/* Screen divider cross (thin lines between panels) */}
      <line
        x1={divX - 0.8 * s} y1={scrY}
        x2={divX - 0.8 * s} y2={scrY + scrH}
        stroke={C.bezel} strokeWidth={1.6 * s}
      />
      <line
        x1={scrX} y1={divY - 0.8 * s}
        x2={scrX + scrW} y2={divY - 0.8 * s}
        stroke={C.bezel} strokeWidth={1.6 * s}
      />

      {/* ── Screen text (hidden initially, GSAP reveals) ────────── */}
      <g data-part="screen-text" opacity={0}>
        {/* "SOFTWARE ZONE" */}
        <text
          x={scrX + scrW / 2}
          y={scrY + scrH / 2 - 4 * s}
          textAnchor="middle"
          fontFamily="var(--font-orbitron), system-ui"
          fontSize={10 * s}
          fontWeight="700"
          letterSpacing={2 * s}
          fill="rgba(77,127,255,0.9)"
        >
          SOFTWARE
        </text>
        <text
          x={scrX + scrW / 2}
          y={scrY + scrH / 2 + 10 * s}
          textAnchor="middle"
          fontFamily="var(--font-orbitron), system-ui"
          fontSize={10 * s}
          fontWeight="700"
          letterSpacing={2 * s}
          fill="rgba(124,92,252,0.9)"
        >
          ZONE
        </text>

        {/* Decorative scan lines */}
        {Array.from({ length: 5 }, (_, i) => (
          <line
            key={i}
            x1={scrX + 10 * s} y1={scrY + scrH * (0.28 + i * 0.1)}
            x2={scrX + scrW - 10 * s} y2={scrY + scrH * (0.28 + i * 0.1)}
            stroke="rgba(77,127,255,0.08)"
            strokeWidth={0.7 * s}
          />
        ))}
      </g>

      {/* ── Energy ring (expands on power-on) ───────────────────── */}
      <circle
        data-part="energy-ring"
        cx={scrX + scrW / 2}
        cy={scrY + scrH / 2}
        r={scrW * 0.15}
        fill="url(#csEnergyGlow)"
        opacity={0}
      />

      {/* Corner accent marks on chassis */}
      {[
        [monX + 8 * s,        monY + 8 * s,        'right', 'down'],
        [monX + monW - 8 * s, monY + 8 * s,        'left',  'down'],
        [monX + 8 * s,        monY + monH - 8 * s, 'right', 'up'  ],
        [monX + monW - 8 * s, monY + monH - 8 * s, 'left',  'up'  ],
      ].map(([cx, cy, hDir, vDir], i) => (
        <g key={i} opacity={0.5}>
          <line
            x1={cx as number} y1={cy as number}
            x2={(cx as number) + (hDir === 'right' ? 8 : -8) * s} y2={cy as number}
            stroke={C.rimBlue} strokeWidth={1.2 * s} strokeLinecap="round"
          />
          <line
            x1={cx as number} y1={cy as number}
            x2={cx as number} y2={(cy as number) + (vDir === 'down' ? 8 : -8) * s}
            stroke={C.rimBlue} strokeWidth={1.2 * s} strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  )
}
