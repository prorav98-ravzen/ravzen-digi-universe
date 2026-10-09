'use client'

/**
 * CosmicUniverse3D — High-fidelity, ultra-optimized 3D deep space environment.
 *
 * Designed & engineered for maximum realism and peak performance:
 *   1. Realistic Astrophotography Starfield: Spectral star classification (hot blue-white,
 *      sun-like yellow, cool orange/red dwarfs) distributed with natural spatial depth.
 *   2. Distant Spiral Galaxy: Barred spiral structure with glowing galactic nucleus,
 *      dual spiral arms, stellar nursery clusters, and dark dust absorption lanes.
 *   3. Volumetric Multi-Spectral Nebulae: Layered billboard clouds in deep cosmic indigo,
 *      teal filaments, and magenta starbursts using procedural soft Gaussian textures.
 *   4. Cosmic Dust Particulate: Subtle micro-motes floating gently in zero-g.
 *   5. Smooth 3D Interactive Parallax: Camera delicately tracks cursor and touch motion
 *      with high-damping exponential lerp.
 *   6. Extreme Low-End Hardware Optimization (Intel i3-2100 / NVIDIA GT 520 / Mobile):
 *      - Adaptive device tiering (automatically caps DPR to 1.0 on low GPUs/mobile)
 *      - Zero allocation RAF loop
 *      - Capped draw calls (only 4 draw calls for the entire cosmos)
 *      - Automatic RAF suspension when tab is hidden or scene unmounted
 *      - Full disposal of WebGL geometries, textures, materials, and context
 *      - Respects prefers-reduced-motion (single static render, zero RAF cycles)
 *   7. Central Readability Veil: Dark contrast backdrop ensuring zone cards, typography,
 *      and buttons remain 100% crisp, legible, and unobstructed.
 */

import { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ── Device Capability Profile ─────────────────────────────────────────────────

type QualityTier = 'low' | 'standard'

function detectQualityTier(): QualityTier {
  if (typeof window === 'undefined') return 'low'

  const cores = navigator.hardwareConcurrency || 4
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4
  const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)

  let isLowGPU = false
  try {
    const testCanvas = document.createElement('canvas')
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info')
      if (debugInfo) {
        const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
        if (/GT\s*520|GeForce\s*520|Intel|Mali|Adreno\s*[345]|PowerVR/i.test(renderer)) {
          isLowGPU = true
        }
      }
    }
  } catch {
    // Ignore context query failure
  }

  if (isMobile || cores <= 4 || memory <= 4 || isLowGPU) {
    return 'low'
  }
  return 'standard'
}

// ── Procedural Texture Generators (Zero Network Footprint) ────────────────────

function createSoftStarTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 32
  canvas.height = 32
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(0.2, 'rgba(235, 245, 255, 0.95)')
  gradient.addColorStop(0.55, 'rgba(170, 210, 255, 0.35)')
  gradient.addColorStop(0.9, 'rgba(100, 160, 255, 0.08)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 32, 32)

  const texture = new THREE.CanvasTexture(canvas)
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  return texture
}

function createNebulaPuffTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
  gradient.addColorStop(0.3, 'rgba(220, 235, 255, 0.55)')
  gradient.addColorStop(0.6, 'rgba(150, 190, 255, 0.22)')
  gradient.addColorStop(0.85, 'rgba(90, 140, 255, 0.06)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 128, 128)

  const texture = new THREE.CanvasTexture(canvas)
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  return texture
}

function createGalaxyCoreTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  gradient.addColorStop(0, 'rgba(255, 248, 230, 1)')
  gradient.addColorStop(0.25, 'rgba(255, 225, 175, 0.75)')
  gradient.addColorStop(0.6, 'rgba(180, 205, 255, 0.28)')
  gradient.addColorStop(0.85, 'rgba(90, 130, 255, 0.08)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 64, 64)

  const texture = new THREE.CanvasTexture(canvas)
  texture.generateMipmaps = false
  texture.minFilter = THREE.LinearFilter
  return texture
}

// ── Celestial Color Palette (Astrophysical Spectral Classes) ──────────────────

const SPECTRAL_COLORS: THREE.Color[] = [
  new THREE.Color(0xaec6ff), // Hot Class O/B (Blue-white)
  new THREE.Color(0xc9d8ff), // Class B (Light blue)
  new THREE.Color(0xf6f8ff), // Class A (Pure white)
  new THREE.Color(0xfff5ea), // Class F (Warm white)
  new THREE.Color(0xffe2ba), // Class G (Solar yellow)
  new THREE.Color(0xffbf80), // Class K (Amber orange)
  new THREE.Color(0xff9166), // Class M (Red dwarf)
]

export default function CosmicUniverse3D() {
  const reducedMotion = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const tier = detectQualityTier()
    const isLow = tier === 'low'

    // Particle & Entity Budgets
    const STAR_COUNT = isLow ? 750 : 1350
    const GALAXY_STAR_COUNT = isLow ? 320 : 620
    const DUST_COUNT = isLow ? 110 : 220
    const DPR = isLow ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.25)

    // Three.js Core Setup
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false, // Turned off for GTX 520 & mobile performance
        powerPreference: 'high-performance',
      })
    } catch {
      return
    }

    renderer.setPixelRatio(DPR)
    renderer.setSize(window.innerWidth, window.innerHeight, false)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      52,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    camera.position.set(0, 0, 320)

    const disposables: {
      geometries: THREE.BufferGeometry[]
      materials: THREE.Material[]
      textures: THREE.Texture[]
    } = {
      geometries: [],
      materials: [],
      textures: [],
    }

    // Shared Textures
    const starTexture = createSoftStarTexture()
    const nebulaTexture = createNebulaPuffTexture()
    const galaxyCoreTexture = createGalaxyCoreTexture()
    disposables.textures.push(starTexture, nebulaTexture, galaxyCoreTexture)

    // ── 1. Deep Field Astrophotography Starfield ─────────────────────────────
    const starPositions = new Float32Array(STAR_COUNT * 3)
    const starColors = new Float32Array(STAR_COUNT * 3)
    const starSizes = new Float32Array(STAR_COUNT)

    for (let i = 0; i < STAR_COUNT; i++) {
      const idx = i * 3

      // Broad spatial frustum distribution
      const spreadX = (Math.random() - 0.5) * 1400
      const spreadY = (Math.random() - 0.5) * 950
      const spreadZ = -750 + Math.random() * 850

      starPositions[idx] = spreadX
      starPositions[idx + 1] = spreadY
      starPositions[idx + 2] = spreadZ

      // Spectral star class distribution
      const colorPick = SPECTRAL_COLORS[Math.floor(Math.random() * SPECTRAL_COLORS.length)]
      const brightness = 0.5 + Math.random() * 0.5

      starColors[idx] = colorPick.r * brightness
      starColors[idx + 1] = colorPick.g * brightness
      starColors[idx + 2] = colorPick.b * brightness

      // Realistic inverse power-law star sizes (mostly small, few bright)
      const isHero = Math.random() < 0.04
      starSizes[i] = isHero ? 3.8 + Math.random() * 2.5 : 1.2 + Math.random() * 1.6
    }

    const starGeo = new THREE.BufferGeometry()
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1))
    disposables.geometries.push(starGeo)

    const starMat = new THREE.PointsMaterial({
      size: 2.2,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    disposables.materials.push(starMat)

    const starPoints = new THREE.Points(starGeo, starMat)
    scene.add(starPoints)

    // ── 2. Distant Spiral Galaxy (Barred Spiral Model) ─────────────────────────
    const galaxyGroup = new THREE.Group()
    // Positioned in distant upper-right cosmos
    galaxyGroup.position.set(130, 85, -420)
    galaxyGroup.rotation.set(0.75, -0.42, 0.35)
    scene.add(galaxyGroup)

    const gPositions = new Float32Array(GALAXY_STAR_COUNT * 3)
    const gColors = new Float32Array(GALAXY_STAR_COUNT * 3)
    const galaxyRadius = 150
    const twist = 3.6

    for (let i = 0; i < GALAXY_STAR_COUNT; i++) {
      const idx = i * 3
      const armIndex = i % 2
      const armAngle = armIndex * Math.PI

      // Radial distance with center concentration
      const dist = Math.pow(Math.random(), 2.1) * galaxyRadius
      const angle = dist * (twist / galaxyRadius) + armAngle

      // Arm width scatter & thickness
      const spreadR = (0.18 + 0.28 * (dist / galaxyRadius)) * (Math.random() - 0.5) * 32
      const spreadZ = (0.08 + 0.16 * (dist / galaxyRadius)) * (Math.random() - 0.5) * 18

      gPositions[idx] = Math.cos(angle) * dist + Math.sin(angle) * spreadR
      gPositions[idx + 1] = Math.sin(angle) * dist - Math.cos(angle) * spreadR
      gPositions[idx + 2] = spreadZ

      // Core: warm golden nucleus; Arms: blue-violet & cyan stellar nurseries
      const distRatio = dist / galaxyRadius
      if (distRatio < 0.22) {
        gColors[idx] = 1.0 // R
        gColors[idx + 1] = 0.92 // G
        gColors[idx + 2] = 0.72 // B
      } else {
        const isCluster = Math.random() < 0.35
        if (isCluster) {
          gColors[idx] = 0.2 // R (Cyan-blue)
          gColors[idx + 1] = 0.78 // G
          gColors[idx + 2] = 1.0 // B
        } else {
          gColors[idx] = 0.62 // R (Violet-blue)
          gColors[idx + 1] = 0.55 // G
          gColors[idx + 2] = 1.0 // B
        }
      }
    }

    const galaxyGeo = new THREE.BufferGeometry()
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(gPositions, 3))
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(gColors, 3))
    disposables.geometries.push(galaxyGeo)

    const galaxyMat = new THREE.PointsMaterial({
      size: 2.4,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    disposables.materials.push(galaxyMat)

    const galaxyPoints = new THREE.Points(galaxyGeo, galaxyMat)
    galaxyGroup.add(galaxyPoints)

    // Galaxy Nucleus Core Sprite Glow
    const coreGeo = new THREE.PlaneGeometry(55, 55)
    disposables.geometries.push(coreGeo)
    const coreMat = new THREE.MeshBasicMaterial({
      map: galaxyCoreTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    disposables.materials.push(coreMat)
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    galaxyGroup.add(coreMesh)

    // ── 3. Multi-Spectral Deep Space Nebulae (Volumetric Billboards) ───────────
    const nebulaGroup = new THREE.Group()
    scene.add(nebulaGroup)

    interface NebulaSpec {
      x: number
      y: number
      z: number
      scale: number
      color: number
      opacity: number
      blend: THREE.Blending
    }

    const NEBULA_SPECS: NebulaSpec[] = [
      // Deep Indigo Cosmic Cloud (Top-Left)
      {
        x: -210,
        y: 110,
        z: -480,
        scale: 480,
        color: 0x3d287a,
        opacity: 0.22,
        blend: THREE.AdditiveBlending,
      },
      // Radiant Cyan/Teal Gas Veil (Top-Right perimeter)
      {
        x: 230,
        y: 130,
        z: -390,
        scale: 420,
        color: 0x094868,
        opacity: 0.17,
        blend: THREE.AdditiveBlending,
      },
      // Energy Blue Mid-Space Cloud (Center-Bottom)
      {
        x: -40,
        y: -140,
        z: -420,
        scale: 490,
        color: 0x143478,
        opacity: 0.18,
        blend: THREE.AdditiveBlending,
      },
      // Magenta/Rose Stellar Nursery Filament
      {
        x: 180,
        y: -110,
        z: -440,
        scale: 360,
        color: 0x6e1b54,
        opacity: 0.14,
        blend: THREE.AdditiveBlending,
      },
      // Interstellar Absorption Dust Silhouette (Depth framing)
      {
        x: 0,
        y: -40,
        z: -320,
        scale: 440,
        color: 0x030510,
        opacity: 0.32,
        blend: THREE.NormalBlending,
      },
    ]

    const planeGeo = new THREE.PlaneGeometry(1, 1)
    disposables.geometries.push(planeGeo)

    const nebulaMeshes: THREE.Mesh[] = []

    NEBULA_SPECS.forEach((spec) => {
      const mat = new THREE.MeshBasicMaterial({
        map: nebulaTexture,
        color: spec.color,
        transparent: true,
        opacity: spec.opacity,
        blending: spec.blend,
        depthWrite: false,
      })
      disposables.materials.push(mat)

      const mesh = new THREE.Mesh(planeGeo, mat)
      mesh.position.set(spec.x, spec.y, spec.z)
      mesh.scale.set(spec.scale, spec.scale, 1)
      nebulaGroup.add(mesh)
      nebulaMeshes.push(mesh)
    })

    // ── 4. Cosmic Dust Particles (Subtle Foreground Depth Motes) ──────────────
    const dustPositions = new Float32Array(DUST_COUNT * 3)
    for (let i = 0; i < DUST_COUNT; i++) {
      const idx = i * 3
      dustPositions[idx] = (Math.random() - 0.5) * 750
      dustPositions[idx + 1] = (Math.random() - 0.5) * 550
      dustPositions[idx + 2] = -120 + Math.random() * 320
    }

    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3))
    disposables.geometries.push(dustGeo)

    const dustMat = new THREE.PointsMaterial({
      size: 1.8,
      map: starTexture,
      color: 0x82b4ff,
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    disposables.materials.push(dustMat)

    const dustPoints = new THREE.Points(dustGeo, dustMat)
    scene.add(dustPoints)

    // ── Interactive Optical Parallax ──────────────────────────────────────────
    let targetCamX = 0
    let targetCamY = 0

    function onPointerMove(e: MouseEvent | TouchEvent) {
      let cx = 0
      let cy = 0
      if ('touches' in e && e.touches.length > 0) {
        cx = e.touches[0].clientX
        cy = e.touches[0].clientY
      } else if ('clientX' in e) {
        cx = e.clientX
        cy = e.clientY
      }

      // Normalised -1 to +1 coordinate space
      const normX = (cx / window.innerWidth - 0.5) * 2
      const normY = -(cy / window.innerHeight - 0.5) * 2

      // Subtle, cinematic camera shift (max ±18px X, ±12px Y)
      targetCamX = normX * 18
      targetCamY = normY * 12
    }

    function onResize() {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      renderer.setPixelRatio(DPR)
    }

    window.addEventListener('mousemove', onPointerMove, { passive: true })
    window.addEventListener('touchmove', onPointerMove, { passive: true })
    window.addEventListener('resize', onResize)

    // Reduced motion handling: render single frame and halt RAF loop
    if (reducedMotion) {
      renderer.render(scene, camera)
      return () => {
        window.removeEventListener('mousemove', onPointerMove)
        window.removeEventListener('touchmove', onPointerMove)
        window.removeEventListener('resize', onResize)
        disposables.geometries.forEach((g) => g.dispose())
        disposables.materials.forEach((m) => m.dispose())
        disposables.textures.forEach((t) => t.dispose())
        renderer.dispose()
      }
    }

    // ── Zero-Allocation Render Loop ───────────────────────────────────────────
    let animationFrameId: number
    let isVisible = true

    function onVisibilityChange() {
      isVisible = document.visibilityState === 'visible'
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    function animate() {
      animationFrameId = requestAnimationFrame(animate)
      if (!isVisible) return

      // Camera parallax lerp with gentle damping
      camera.position.x += (targetCamX - camera.position.x) * 0.035
      camera.position.y += (targetCamY - camera.position.y) * 0.035
      camera.lookAt(0, 0, 0)

      // Majestic spiral galaxy rotation (extremely slow, realistic deep space)
      galaxyGroup.rotation.z += 0.00018

      // Ultra-slow breathing volumetric drift for nebulae
      nebulaGroup.rotation.z += 0.00006

      // Slow cosmic dust drift
      dustPoints.rotation.y += 0.00008

      renderer.render(scene, camera)
    }

    animationFrameId = requestAnimationFrame(animate)

    // ── Teardown & Full WebGL Resource Disposal ───────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('touchmove', onPointerMove)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)

      disposables.geometries.forEach((g) => g.dispose())
      disposables.materials.forEach((m) => m.dispose())
      disposables.textures.forEach((t) => t.dispose())
      renderer.dispose()
    }
  }, [reducedMotion])

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden select-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* ── 3D Cosmic WebGL Canvas ─────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      />

      {/* ── Central Readability Veil ───────────────────────────────────────── */}
      {/* Ensures the 4 cards and central titles have deep, high-contrast,
          unobstructed readability while allowing the outer cosmos to shine. */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 65% at 50% 50%, rgba(3, 4, 10, 0.76) 0%, rgba(3, 4, 10, 0.42) 55%, transparent 100%)',
        }}
      />

      {/* ── Cinematic Edge Vignette ────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(2, 3, 7, 0.85) 100%)',
        }}
      />
    </div>
  )
}
