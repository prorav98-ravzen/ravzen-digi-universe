'use client'

/**
 * SystemCoreSVG — Original futuristic System Core architecture visual.
 *
 * Design: A central hexagonal core connected by data-lines to four
 * technology block nodes arranged in a cross pattern (top, left, right, bottom).
 * Each block shows a tech label (HTML / CSS / JAVASCRIPT / NODE.JS).
 *
 * Parts tagged with data-part="..." for GSAP targeting:
 *   core            — central hexagon shell
 *   core-fill       — inner core fill (illuminates on power-on)
 *   core-pulse      — radial glow ring
 *   block-html      — HTML tech block
 *   block-css       — CSS tech block
 *   block-js        — JavaScript tech block
 *   block-node      — Node.js tech block
 *   line-html       — connection line to HTML
 *   line-css        — connection line to CSS
 *   line-js         — connection line to JS
 *   line-node       — connection line to Node
 *   energy-html/css/js/node — energy particle travelling along each line
 *
 * Scales via `size` prop (viewport-relative square, default 280px).
 */

interface SystemCoreSVGProps {
  size?:      number
  className?: string
}

const GOLD   = '#ffb800'
const DIM    = 'rgba(255,184,0,0.15)'
const RIM    = 'rgba(255,184,0,0.35)'
const BG     = '#0d0800'
const PANEL  = '#1a0e00'

// ── Tech block helper ─────────────────────────────────────────────────────────
interface BlockProps {
  cx: number; cy: number
  label: string
  subLabel?: string
  dataPart: string
  size: number
}

function TechBlock({ cx, cy, label, subLabel, dataPart, size: s }: BlockProps) {
  const bw = s * 0.22
  const bh = s * 0.14
  return (
    <g data-part={dataPart}>
      {/* Block background */}
      <rect
        x={cx - bw / 2} y={cy - bh / 2}
        width={bw} height={bh}
        rx={bw * 0.12}
        fill={PANEL}
        stroke={RIM}
        strokeWidth={s * 0.008}
      />
      {/* Top accent bar */}
      <rect
        x={cx - bw / 2} y={cy - bh / 2}
        width={bw} height={bh * 0.18}
        rx={bw * 0.12}
        fill={DIM}
      />
      {/* Label */}
      <text
        x={cx} y={cy + s * 0.005}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize={s * 0.038}
        fontWeight="700"
        letterSpacing={s * 0.004}
        fill={GOLD}
      >
        {label}
      </text>
      {subLabel && (
        <text
          x={cx} y={cy + bh * 0.28}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="var(--font-jetbrains-mono), monospace"
          fontSize={s * 0.026}
          fill={`rgba(255,184,0,0.5)`}
        >
          {subLabel}
        </text>
      )}
      {/* Corner ticks */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
        <g key={i}>
          <line
            x1={cx + (sx * bw) / 2}          y1={cy + (sy * bh) / 2}
            x2={cx + (sx * bw) / 2 - sx * bw * 0.18} y2={cy + (sy * bh) / 2}
            stroke={GOLD} strokeWidth={s * 0.007} strokeLinecap="round" opacity={0.6}
          />
          <line
            x1={cx + (sx * bw) / 2}          y1={cy + (sy * bh) / 2}
            x2={cx + (sx * bw) / 2}          y2={cy + (sy * bh) / 2 - sy * bh * 0.28}
            stroke={GOLD} strokeWidth={s * 0.007} strokeLinecap="round" opacity={0.6}
          />
        </g>
      ))}
    </g>
  )
}

// ── Hexagon path ──────────────────────────────────────────────────────────────
function hexPath(cx: number, cy: number, r: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6
    return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`
  }).join(' ')
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SystemCoreSVG({ size = 280, className }: SystemCoreSVGProps) {
  const s  = size
  const cx = s / 2
  const cy = s / 2

  const coreR     = s * 0.12
  const blockDist = s * 0.36          // distance from centre to block centre

  // Block positions: top, right, bottom, left
  const blocks = [
    { id: 'html',  label: 'HTML',       sub: '5',   x: cx,             y: cy - blockDist },
    { id: 'css',   label: 'CSS',        sub: '3',   x: cx + blockDist, y: cy             },
    { id: 'js',    label: 'JS',         sub: 'ES6', x: cx,             y: cy + blockDist },
    { id: 'node',  label: 'NODE',       sub: '.JS', x: cx - blockDist, y: cy             },
  ]

  // Connection line endpoint — just outside the core hex
  const lineEnd   = coreR + s * 0.015
  const lineStart = blockDist - s * 0.07   // just outside the block

  return (
    <svg
      width={s} height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="System Core architecture"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="scCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(255,184,0,0.55)" />
          <stop offset="100%" stopColor="rgba(255,184,0,0)"    />
        </radialGradient>
        <radialGradient id="scCoreFill" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#1a0e00" />
          <stop offset="100%" stopColor="#0d0800" />
        </radialGradient>
      </defs>

      {/* ── Background faint hex grid ──────────────────────────── */}
      {Array.from({ length: 5 }, (_, i) => (
        <polygon
          key={i}
          points={hexPath(cx, cy, coreR * (2.2 + i * 0.9))}
          stroke="rgba(255,184,0,0.05)"
          strokeWidth={0.8}
          fill="none"
        />
      ))}

      {/* ── Connection lines (drawn before core so core sits on top) */}
      {blocks.map((b) => {
        const dx = b.x - cx
        const dy = b.y - cy
        const len = Math.sqrt(dx * dx + dy * dy)
        const ux = dx / len
        const uy = dy / len
        return (
          <line
            key={`line-${b.id}`}
            data-part={`line-${b.id}`}
            x1={cx + ux * lineEnd}
            y1={cy + uy * lineEnd}
            x2={cx + ux * lineStart}
            y2={cy + uy * lineStart}
            stroke="rgba(255,184,0,0.18)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        )
      })}

      {/* ── Energy particles on lines (hidden initially, GSAP moves them) */}
      {blocks.map((b) => {
        const dx = b.x - cx
        const dy = b.y - cy
        const len = Math.sqrt(dx * dx + dy * dy)
        const ux = dx / len
        const uy = dy / len
        return (
          <circle
            key={`energy-${b.id}`}
            data-part={`energy-${b.id}`}
            cx={cx + ux * lineEnd}
            cy={cy + uy * lineEnd}
            r={3.5}
            fill={GOLD}
            style={{ filter: `drop-shadow(0 0 4px ${GOLD})` }}
            opacity={0}
          />
        )
      })}

      {/* ── Tech blocks ───────────────────────────────────────── */}
      {blocks.map((b) => (
        <TechBlock
          key={b.id}
          cx={b.x} cy={b.y}
          label={b.label}
          subLabel={b.sub}
          dataPart={`block-${b.id}`}
          size={s}
        />
      ))}

      {/* ── Core pulse ring ───────────────────────────────────── */}
      <circle
        data-part="core-pulse"
        cx={cx} cy={cy}
        r={coreR * 1.8}
        fill="url(#scCoreGlow)"
        opacity={0}
      />

      {/* ── Core hexagon ─────────────────────────────────────── */}
      <polygon
        data-part="core"
        points={hexPath(cx, cy, coreR)}
        fill="url(#scCoreFill)"
        stroke="rgba(255,184,0,0.3)"
        strokeWidth={1.5}
      />

      {/* Core inner fill (illuminated by GSAP) */}
      <polygon
        data-part="core-fill"
        points={hexPath(cx, cy, coreR * 0.7)}
        fill="rgba(255,184,0,0.04)"
        stroke="rgba(255,184,0,0.18)"
        strokeWidth={1}
      />

      {/* Core centre dot */}
      <circle
        cx={cx} cy={cy}
        r={s * 0.022}
        fill="rgba(255,184,0,0.4)"
        data-part="core-dot"
      />

      {/* Core label */}
      <text
        x={cx} y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-orbitron), system-ui"
        fontSize={s * 0.028}
        fontWeight="700"
        letterSpacing={s * 0.003}
        fill="rgba(255,184,0,0.6)"
        data-part="core-text"
      >
        CORE
      </text>

      {/* ── Outer architectural rings ─────────────────────────── */}
      <circle
        cx={cx} cy={cy}
        r={s * 0.44}
        stroke="rgba(255,184,0,0.06)"
        strokeWidth={0.8}
        strokeDasharray="6 4"
        fill="none"
      />
      <circle
        cx={cx} cy={cy}
        r={s * 0.48}
        stroke="rgba(255,184,0,0.04)"
        strokeWidth={0.6}
        fill="none"
      />

      {/* Background dark overlay so text is readable */}
      <rect x="0" y="0" width={s} height={s} fill={BG} opacity={0.01} />
    </svg>
  )
}
