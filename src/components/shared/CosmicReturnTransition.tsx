'use client'

/**
 * CosmicReturnTransition — Shared cinematic return-to-hub transition.
 *
 * Used by all four zones (Design, Android, Software, System).
 * Stage: 'zone-exit' — calls returnToHub() on completion.
 *
 * ── Sequence (3.8 s total) ──────────────────────────────────────────────────
 *
 *  Phase 0 — Zone Collapse       (0.0 – 0.8 s)
 *    Zone energy implodes: particles from screen edges converge toward centre.
 *    Scene dims. A dimensional rift tears open — shimmering cyan-violet shard.
 *
 *  Phase 1 — Energy Core         (0.8 – 1.6 s)
 *    Core energy sphere forms at centre: luminous rings orbit it, swirling
 *    particles spiral inward. Cyan, blue, violet, magenta gradients.
 *
 *  Phase 2 — Warp Tunnel         (1.6 – 2.8 s)
 *    Camera launches through a dimensional tunnel of streaking star trails,
 *    concentric light rings, and deep cosmic depth. Real 3D geometry + movement.
 *
 *  Phase 3 — Universe Rebirth    (2.8 – 3.8 s)
 *    Tunnel mouth blooms open → brilliant white-cyan energy burst.
 *    returnToHub() fires. Hub fades in beneath the dissolving burst.
 *
 * ── Performance ─────────────────────────────────────────────────────────────
 *    DPR capped at 1.25. All geometry procedural. InstancedMesh for particles.
 *    Full disposables cleanup. Guards against double-fire of returnToHub().
 *    Reduced-motion: returnToHub() fires immediately (no canvas rendered).
 *
 * ── Integration ─────────────────────────────────────────────────────────────
 *    Each zone's *ReturnTransition.tsx re-exports this component — zero changes
 *    needed to UniverseExperience.tsx.
 */

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useExperience } from '@/store/experienceStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ── Texture helpers ───────────────────────────────────────────────────────────

function mkTex(
  w: number, h: number,
  fn: (ctx: CanvasRenderingContext2D) => void
): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = w; c.height = h
  fn(c.getContext('2d')!)
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t
}

/** Warp-ring concentric bands */
function mkRingTex(): THREE.CanvasTexture {
  return mkTex(256, 256, (ctx) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 256, 256)
    for (let r = 10; r < 128; r += 14) {
      const alpha = 0.9 - r / 140
      ctx.strokeStyle = `rgba(0,220,255,${alpha})`
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.arc(128, 128, r, 0, Math.PI * 2); ctx.stroke()
    }
  })
}

/** Star-streak texture for tunnel walls */
function mkStreakTex(): THREE.CanvasTexture {
  return mkTex(512, 512, (ctx) => {
    ctx.fillStyle = '#000409'; ctx.fillRect(0, 0, 512, 512)
    // Radial streaks from centre
    ctx.strokeStyle = 'rgba(180,210,255,0.7)'; ctx.lineWidth = 1
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2
      const r0 = 30 + Math.random() * 50; const r1 = 200 + Math.random() * 56
      ctx.globalAlpha = 0.3 + Math.random() * 0.5
      ctx.beginPath()
      ctx.moveTo(256 + Math.cos(a) * r0, 256 + Math.sin(a) * r0)
      ctx.lineTo(256 + Math.cos(a) * r1, 256 + Math.sin(a) * r1)
      ctx.stroke()
    }
    // Violet/cyan glow ring
    ctx.globalAlpha = 1
    const rg = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    rg.addColorStop(0, 'rgba(0,220,255,0.18)')
    rg.addColorStop(0.35, 'rgba(124,92,252,0.12)')
    rg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = rg; ctx.fillRect(0, 0, 512, 512)
  })
}

/** Core energy sphere texture */
function mkCoreTex(): THREE.CanvasTexture {
  return mkTex(256, 256, (ctx) => {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 256, 256)
    const rg = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    rg.addColorStop(0, 'rgba(255,255,255,1)')
    rg.addColorStop(0.08, 'rgba(0,240,255,0.95)')
    rg.addColorStop(0.22, 'rgba(100,80,255,0.75)')
    rg.addColorStop(0.45, 'rgba(200,50,255,0.4)')
    rg.addColorStop(0.75, 'rgba(255,50,150,0.18)')
    rg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = rg; ctx.fillRect(0, 0, 256, 256)
    // Swirl arms
    ctx.strokeStyle = 'rgba(0,220,255,0.5)'; ctx.lineWidth = 1.5
    for (let arm = 0; arm < 5; arm++) {
      const sa = (arm / 5) * Math.PI * 2; ctx.beginPath()
      for (let i = 0; i <= 60; i++) {
        const t = i / 60; const r = t * 100; const a = sa + t * Math.PI * 3.5
        const x = 128 + Math.cos(a) * r; const y = 128 + Math.sin(a) * r
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  })
}

// ── Particle state ────────────────────────────────────────────────────────────

const MAX_P = 160
interface PSt { active: boolean; x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; ml: number; sz: number }

// ── Component ─────────────────────────────────────────────────────────────────

interface CosmicReturnTransitionProps {
  /** Accent colour for the implosion veil — zone-specific tint (CSS colour string). */
  accentColor?: string
}

export default function CosmicReturnTransition({ accentColor: _accentColor = 'rgba(0,200,255,0.85)' }: CosmicReturnTransitionProps) {
  const { returnToHub } = useExperience()
  const reduced         = useReducedMotion()
  const canvasRef       = useRef<HTMLCanvasElement | null>(null)
  const doneRef         = useRef(false)

  // Reduced-motion fast path
  useEffect(() => { if (!reduced) return; returnToHub() }, [reduced, returnToHub])

  const handleSkip = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true; returnToHub()
  }, [returnToHub])

  useEffect(() => {
    if (reduced) return
    doneRef.current = false
    const canvas = canvasRef.current; if (!canvas) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: false, antialias: true, powerPreference: 'high-performance' })
    } catch { returnToHub(); return }

    const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
    renderer.setPixelRatio(dpr); renderer.setSize(window.innerWidth, window.innerHeight, false)
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.4

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x020510)

    const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.05, 200)
    camera.position.set(0, 0, 0.1); camera.lookAt(0, 0, -1)

    // ── Lights ────────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0x182440, 0.5); scene.add(ambient)
    const coreGlow = new THREE.PointLight(0x00d4ff, 0, 18); coreGlow.position.set(0, 0, -2); scene.add(coreGlow)
    const backBlast = new THREE.PointLight(0xffffff, 0, 30); backBlast.position.set(0, 0, -6); scene.add(backBlast)

    // ── Disposables ───────────────────────────────────────────────────────────
    const dis = { geometries: [] as THREE.BufferGeometry[], materials: [] as THREE.Material[], textures: [] as THREE.Texture[] }

    // ── Core energy sphere ────────────────────────────────────────────────────
    const coreTex = mkCoreTex(); dis.textures.push(coreTex)
    const coreGeo = new THREE.SphereGeometry(0.55, 20, 16); dis.geometries.push(coreGeo)
    const coreMat = new THREE.MeshBasicMaterial({ map: coreTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
    dis.materials.push(coreMat)
    const coreMesh = new THREE.Mesh(coreGeo, coreMat); coreMesh.position.set(0, 0, -3); scene.add(coreMesh)

    // ── Orbital rings around core ─────────────────────────────────────────────
    const ringTex = mkRingTex(); dis.textures.push(ringTex)
    const rings: THREE.Mesh[] = []
    for (let i = 0; i < 3; i++) {
      const rg = new THREE.TorusGeometry(0.7 + i * 0.22, 0.025, 8, 64)
      dis.geometries.push(rg)
      const rm = new THREE.MeshBasicMaterial({ color: [0x00ccff, 0x8844ff, 0xff44cc][i], transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
      dis.materials.push(rm)
      const r = new THREE.Mesh(rg, rm)
      r.position.copy(coreMesh.position)
      r.rotation.x = (i / 3) * Math.PI; r.rotation.y = (i / 3) * Math.PI * 0.7
      scene.add(r); rings.push(r)
    }

    // ── Warp tunnel (CylinderGeometry open-ended, camera flies through) ───────
    const streakTex = mkStreakTex(); dis.textures.push(streakTex)
    const tunnelGeo = new THREE.CylinderGeometry(5, 5, 80, 32, 8, true)
    dis.geometries.push(tunnelGeo)
    const tunnelMat = new THREE.MeshBasicMaterial({
      map: streakTex, side: THREE.BackSide, transparent: true, opacity: 0,
    })
    dis.materials.push(tunnelMat)
    const tunnel = new THREE.Mesh(tunnelGeo, tunnelMat)
    tunnel.rotation.x = Math.PI / 2; tunnel.position.set(0, 0, -40); scene.add(tunnel)

    // ── Tunnel ring gates (concentric circles rushing toward camera) ──────────
    const gateRings: THREE.Mesh[] = []
    for (let g = 0; g < 10; g++) {
      const gg = new THREE.TorusGeometry(3.5 + Math.random() * 0.5, 0.06, 8, 48)
      dis.geometries.push(gg)
      const colours = [0x00ccff, 0x6644ff, 0xcc44ff, 0xff44aa, 0x44ffcc]
      const gm = new THREE.MeshBasicMaterial({ color: colours[g % colours.length], transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
      dis.materials.push(gm)
      const gr = new THREE.Mesh(gg, gm); gr.position.set(0, 0, -8 - g * 7); scene.add(gr); gateRings.push(gr)
    }

    // ── Star field (background points) ───────────────────────────────────────
    const stGeo = new THREE.BufferGeometry(); dis.geometries.push(stGeo)
    const stPos = new Float32Array(350 * 3)
    for (let i = 0; i < 350; i++) {
      const θ = Math.random() * Math.PI * 2; const r = 2 + Math.random() * 4
      stPos[i*3] = Math.cos(θ) * r; stPos[i*3+1] = Math.sin(θ) * r; stPos[i*3+2] = -(Math.random() * 75 + 2)
    }
    stGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3))
    const stMat = new THREE.PointsMaterial({ color: 0xaaccff, size: 0.08, transparent: true, opacity: 0.7, depthWrite: false })
    dis.materials.push(stMat); scene.add(new THREE.Points(stGeo, stMat))

    // ── Implosion / rebirth burst plane ──────────────────────────────────────
    const burstGeo = new THREE.PlaneGeometry(20, 20); dis.geometries.push(burstGeo)
    const burstMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })
    dis.materials.push(burstMat)
    const burst = new THREE.Mesh(burstGeo, burstMat); burst.position.set(0, 0, -0.15); scene.add(burst)

    // ── Particle system ───────────────────────────────────────────────────────
    const pGeo = new THREE.SphereGeometry(1, 5, 4); dis.geometries.push(pGeo)
    const pMat = new THREE.MeshBasicMaterial({ color: 0x44ccff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false })
    dis.materials.push(pMat)
    const pMesh = new THREE.InstancedMesh(pGeo, pMat, MAX_P)
    pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(pMesh)
    const zero4 = new THREE.Matrix4().makeScale(0, 0, 0)
    for (let i = 0; i < MAX_P; i++) pMesh.setMatrixAt(i, zero4); pMesh.instanceMatrix.needsUpdate = true
    const pArr: PSt[] = Array.from({ length: MAX_P }, () => ({ active: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, ml: 1, sz: 0.06 }))
    let nextP = 0; const pm4 = new THREE.Matrix4()

    function spawnP(x: number, y: number, z: number, spd = 1.0, toward = false) {
      const p = pArr[nextP]; nextP = (nextP + 1) % MAX_P
      p.active = true; p.x = x; p.y = y; p.z = z
      if (toward) {
        // Spiral inward toward core at (0,0,-3)
        const dx = -x; const dy = -y; const dz = (-3) - z
        const len = Math.sqrt(dx*dx+dy*dy+dz*dz)+0.001
        p.vx = (dx/len)*spd; p.vy = (dy/len)*spd; p.vz = (dz/len)*spd
      } else {
        const θ = Math.random() * Math.PI * 2; const φ = Math.random() * Math.PI
        p.vx = Math.sin(φ)*Math.cos(θ)*spd; p.vy = Math.sin(φ)*Math.sin(θ)*spd; p.vz = Math.cos(φ)*spd
      }
      p.life = 0; p.ml = 0.6 + Math.random() * 0.9; p.sz = 0.03 + Math.random() * 0.07
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    function L(a: number, b: number, t: number) { return a + (b - a) * t }
    function C(t: number) { return Math.max(0, Math.min(1, t)) }
    function SS(t: number) { return t * t * (3 - 2 * t) }
    function EO(t: number, p = 2) { return 1 - Math.pow(1 - t, p) }
    function EIO(t: number) { return t < 0.5 ? 2*t*t : 1 - (-2*t+2)**2/2 }

    // ── Animation ─────────────────────────────────────────────────────────────
    let animId: number; let t0 = performance.now(); let lastT = t0; let vis = true
    function onVis() { vis = document.visibilityState === 'visible'; if (vis) { t0 += performance.now() - lastT; lastT = performance.now() } }
    document.addEventListener('visibilitychange', onVis)

    function animate(now: number) {
      animId = requestAnimationFrame(animate)
      if (!vis || doneRef.current) return
      const el = (now - t0) / 1000
      const dt = Math.min((now - lastT) / 1000, 0.04); lastT = now

      // Particle tick
      let pDirty = false
      for (let i = 0; i < MAX_P; i++) {
        const p = pArr[i]; if (!p.active) continue; p.life += dt
        if (p.life >= p.ml) { p.active = false; pMesh.setMatrixAt(i, zero4); pDirty = true; continue }
        p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt
        const f = 1 - p.life / p.ml
        pm4.makeScale(p.sz * f, p.sz * f, p.sz * f); pm4.setPosition(p.x, p.y, p.z)
        pMesh.setMatrixAt(i, pm4); pDirty = true
      }
      if (pDirty) pMesh.instanceMatrix.needsUpdate = true

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 0 — Zone Collapse   0.0 – 0.8 s
      // ═══════════════════════════════════════════════════════════════════════
      if (el < 0.8) {
        const t = C(el / 0.8); const te = SS(t)
        // Background dims
        scene.background = new THREE.Color().setRGB(L(0.008, 0.002, te), L(0.020, 0.005, te), L(0.063, 0.025, te))
        // Collapse particles stream inward from edges toward core position
        if (t > 0.05 && Math.random() < 0.65) {
          const θ = Math.random() * Math.PI * 2; const r = 2.5 + Math.random() * 4
          const z = -1 - Math.random() * 3
          spawnP(Math.cos(θ) * r, Math.sin(θ) * r, z, 1.4, true)
        }
        ambient.intensity = L(0.5, 0.2, te)
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 1 — Energy Core     0.8 – 1.6 s
      // ═══════════════════════════════════════════════════════════════════════
      else if (el < 1.6) {
        const t = C((el - 0.8) / 0.8); const te = SS(t)

        // Core sphere materialises
        coreMat.opacity = L(0, 0.92, te)
        coreMesh.scale.setScalar(L(0.2, 1, EO(t, 3)))
        coreMesh.rotation.y = el * 1.5; coreMesh.rotation.z = el * 0.8
        coreGlow.intensity = L(0, 6, te)

        // Orbital rings spin in
        rings.forEach((r, i) => {
          const rm = r.material as THREE.MeshBasicMaterial
          rm.opacity = L(0, 0.75, SS(C((t - i * 0.12) / 0.5)))
          r.rotation.x += dt * (0.8 + i * 0.4); r.rotation.z += dt * (0.5 + i * 0.3)
        })

        // Spiral inward particles keep flowing
        if (Math.random() < 0.55) {
          const θ = Math.random() * Math.PI * 2; const r = 1.5 + Math.random() * 3
          spawnP(Math.cos(θ) * r, Math.sin(θ) * r, -1 - Math.random() * 2, 1.8, true)
        }

        // Tiny outward burst from core surface
        if (t > 0.4 && Math.random() < 0.4) {
          const θ = Math.random() * Math.PI * 2; const φ = Math.random() * Math.PI
          spawnP(Math.cos(θ) * Math.sin(φ) * 0.6, Math.sin(θ) * Math.sin(φ) * 0.6, -3 + Math.cos(φ) * 0.6, 0.8)
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 2 — Warp Tunnel     1.6 – 2.8 s
      // ═══════════════════════════════════════════════════════════════════════
      else if (el < 2.8) {
        const t = C((el - 1.6) / 1.2)

        // Camera launches forward through tunnel
        camera.position.z = L(0.1, -62, EO(t, 3))
        camera.fov = L(72, 100, SS(t)); camera.updateProjectionMatrix()

        // Tunnel materialises and we fly into it
        tunnelMat.opacity = L(0, 0.82, SS(C(t * 3)))
        tunnel.position.z = camera.position.z - 40

        // Gate rings rush toward camera (recycled)
        gateRings.forEach((gr, i) => {
          const gm = gr.material as THREE.MeshBasicMaterial
          gm.opacity = L(0, 0.65, SS(C((t - i * 0.06) / 0.5)))
          // Each ring moves toward camera
          gr.position.z += dt * (18 + i * 2.5)
          if (gr.position.z > camera.position.z + 2) gr.position.z = camera.position.z - 70
          gr.rotation.z += dt * 0.4
        })

        // Core and rings fade out as camera pulls away
        const coreFade = 1 - SS(C(t * 2))
        coreMat.opacity = coreFade * 0.92
        coreGlow.intensity = coreFade * 6
        rings.forEach(r => { (r.material as THREE.MeshBasicMaterial).opacity = coreFade * 0.75 })

        // Backblast starts building
        backBlast.intensity = L(0, 8, SS(C((t - 0.7) / 0.3)))

        // Warp particles — streak forward
        if (Math.random() < 0.5) {
          const θ = Math.random() * Math.PI * 2; const r = 0.3 + Math.random() * 3.5
          spawnP(Math.cos(θ) * r, Math.sin(θ) * r, camera.position.z - 1, 4)
        }
      }

      // ═══════════════════════════════════════════════════════════════════════
      // PHASE 3 — Universe Rebirth   2.8 – 3.8 s
      // ═══════════════════════════════════════════════════════════════════════
      else {
        const t = C((el - 2.8) / 1.0); const te = EO(t)

        // Tunnel rushes past
        tunnel.position.z = camera.position.z - 40
        gateRings.forEach(gr => { gr.position.z += dt * 28; if (gr.position.z > camera.position.z + 2) gr.position.z = camera.position.z - 70 })

        // Tunnel fades
        tunnelMat.opacity = L(0.82, 0, te)

        // Camera decelerates (already deep in tunnel, we stop and reveal)
        camera.position.z = L(-62, -65, SS(t))

        // Rebirth burst blooms
        burstMat.opacity = L(0, 1.0, SS(C(t * 2.5)))
        backBlast.intensity = L(8, 30, te)

        // Completion — fire once
        if (el >= 3.8 && !doneRef.current) {
          doneRef.current = true; returnToHub(); return
        }
      }

      renderer.render(scene, camera)
    }

    animId = requestAnimationFrame(animate)

    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight, false)
    }
    window.addEventListener('resize', onResize)

    return () => {
      doneRef.current = true; cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      dis.geometries.forEach(g => g.dispose())
      dis.materials.forEach(m => m.dispose())
      dis.textures.forEach(t => t.dispose())
      renderer.dispose()
    }
  }, [reduced, returnToHub])

  if (reduced) return null

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{ zIndex: 'var(--z-overlay)' as unknown as number }}
      role="presentation"
      aria-label="Returning to RAVZEN DiGi Universe"
    >
      {/* WebGL canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
        style={{ transform: 'translateZ(0)', willChange: 'transform' }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(2,5,16,0.65) 100%)' }}
        aria-hidden="true"
      />

      {/* Skip */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 px-4 py-2 font-mono text-[11px] tracking-[0.25em] uppercase rounded-full cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-white"
        style={{
          color:          'rgba(200,230,255,0.82)',
          background:     'rgba(0,100,200,0.10)',
          border:         '1px solid rgba(100,180,255,0.28)',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Skip return transition"
      >
        SKIP &#10140;
      </button>

      <span className="sr-only" aria-live="polite">
        Returning to RAVZEN DiGi Universe through cosmic warp...
      </span>
    </div>
  )
}
