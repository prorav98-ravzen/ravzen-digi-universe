'use client'

/**
 * DesignActivation — 3D Cinematic Magical Portal Sequence for Design Zone.
 *
 * Sequence:
 *   1. 3D DESIGN Cube & Dispersed 3D Letters (0.0s – 0.6s):
 *      Dimensional metallic letter blocks tumble freely in irregular 3D space
 *      surrounded by a glowing runic cube chassis.
 *   2. Magical Letter Assembly (0.6s – 1.8s):
 *      Neon energy trails guide the 6 letters (D - E - S - I - G - N) along curved
 *      trajectories, snapping into alignment with magical energy bursts.
 *   3. Transmutation into Ancient Magical Portal (1.8s – 2.8s):
 *      The assembled word transforms into the keystone of a massive ancient stone portal
 *      flanked by heavy carved megalith pillars and glowing mystical symbols.
 *   4. Ancient Portal Opening (2.8s – 4.3s):
 *      The ancient interlocking seal unlocks and the heavy runic doors swing open
 *      with realistic 3D depth, revealing the luminous Design Lab beyond.
 *   5. Forward Camera Dolly & Transition (4.0s – 4.4s):
 *      Camera pushes through the portal into blinding atmospheric dawn → zoneReady().
 *
 * Performance Optimized:
 *   - Procedurally generated textures (zero download latency)
 *   - Under 450 vertices for doors and pillars
 *   - Zero-allocation RAF loop, DPR capped at 1.0 on low-end hardware
 *   - Complete resource cleanup on unmount / skip
 */

import { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import { useExperience } from '@/store/experienceStore'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// ── Procedural Textures ───────────────────────────────────────────────────────

function createLetterBlockTexture(char: string): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  // Brushed dark titanium base
  ctx.fillStyle = '#0a0a14'
  ctx.fillRect(0, 0, 256, 256)

  // Neon bevel frame
  ctx.strokeStyle = '#b44dff'
  ctx.lineWidth = 10
  ctx.strokeRect(8, 8, 240, 240)

  // Cyber corner nodes
  ctx.fillStyle = '#00f0ff'
  ctx.fillRect(16, 16, 12, 12)
  ctx.fillRect(228, 16, 12, 12)
  ctx.fillRect(16, 228, 12, 12)
  ctx.fillRect(228, 228, 12, 12)

  // Glowing letter glyph
  ctx.font = 'bold 150px Orbitron, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Outer magenta glow
  ctx.shadowColor = '#ff4d9d'
  ctx.shadowBlur = 28
  ctx.fillStyle = '#ffffff'
  ctx.fillText(char, 128, 134)

  // Core sharp highlight
  ctx.shadowBlur = 10
  ctx.fillStyle = '#f8f9ff'
  ctx.fillText(char, 128, 134)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  return texture
}

function createRunicStoneTexture(isLeft: boolean): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!

  // Weathered ancient stone base
  ctx.fillStyle = '#100e1c'
  ctx.fillRect(0, 0, 512, 1024)

  // Procedural stone grain
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 1024
    const v = Math.floor(22 + Math.random() * 26)
    ctx.fillStyle = `rgb(${v}, ${v - 3}, ${v + 8})`
    ctx.fillRect(x, y, 2 + Math.random() * 3, 2 + Math.random() * 3)
  }

  // Heavy bronze border banding
  ctx.fillStyle = '#1e182e'
  ctx.fillRect(0, 0, 512, 44)
  ctx.fillRect(0, 980, 512, 44)
  ctx.fillRect(isLeft ? 0 : 468, 0, 44, 1024)

  // Stud rivets along the bands
  ctx.fillStyle = '#5c4d7d'
  for (let py = 60; py < 960; py += 70) {
    ctx.beginPath()
    ctx.arc(isLeft ? 22 : 490, py, 6, 0, Math.PI * 2)
    ctx.fill()
  }

  // Ancient Mystical Carvings & Runic Symbols
  const cx = isLeft ? 512 : 0
  const cy = 512

  ctx.shadowColor = '#b44dff'
  ctx.shadowBlur = 20
  ctx.strokeStyle = 'rgba(180, 77, 255, 0.9)'
  ctx.lineWidth = 6

  // Central Runic Arc
  ctx.beginPath()
  ctx.arc(cx, cy, 230, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, 150, 0, Math.PI * 2)
  ctx.stroke()

  // Geometric Runic Rays
  ctx.beginPath()
  ctx.moveTo(cx, cy - 380)
  ctx.lineTo(isLeft ? 90 : 422, cy - 120)
  ctx.lineTo(cx, cy + 380)
  ctx.stroke()

  // Glowing Cyan Magical Energy Channels
  ctx.shadowColor = '#00f0ff'
  ctx.shadowBlur = 14
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)'
  ctx.lineWidth = 3.5

  ctx.beginPath()
  ctx.moveTo(isLeft ? 90 : 422, 90)
  ctx.lineTo(isLeft ? 90 : 422, 934)
  ctx.stroke()

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  return texture
}

function createRunicRingTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, 512, 512)

  ctx.shadowColor = '#00f0ff'
  ctx.shadowBlur = 18
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)'
  ctx.lineWidth = 4

  ctx.beginPath()
  ctx.arc(256, 256, 235, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(256, 256, 185, 0, Math.PI * 2)
  ctx.stroke()

  // Radiating runic spokes
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
    const x1 = 256 + Math.cos(a) * 185
    const y1 = 256 + Math.sin(a) * 185
    const x2 = 256 + Math.cos(a) * 235
    const y2 = 256 + Math.sin(a) * 235
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  return texture
}

function createMagicPortalVortexTexture(): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')!

  const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
  gradient.addColorStop(0, '#ffffff')
  gradient.addColorStop(0.25, '#ff4d9d')
  gradient.addColorStop(0.6, '#7c2fff')
  gradient.addColorStop(0.85, '#00d4ff')
  gradient.addColorStop(1, 'transparent')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 256, 256)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  return texture
}

export default function DesignActivation() {
  const { zoneReady } = useExperience()
  const reduced = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const isTerminatedRef = useRef(false)

  const handleSkip = useCallback(() => {
    if (isTerminatedRef.current) return
    isTerminatedRef.current = true
    zoneReady()
  }, [zoneReady])

  useEffect(() => {
    if (reduced) {
      zoneReady()
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return

    // ── Three.js Scene Setup ──────────────────────────────────────────────────
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      })
    } catch {
      zoneReady()
      return
    }

    renderer.setPixelRatio(dpr)
    renderer.setSize(window.innerWidth, window.innerHeight, false)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 15)

    const disposables: {
      geometries: THREE.BufferGeometry[]
      materials: THREE.Material[]
      textures: THREE.Texture[]
    } = { geometries: [], materials: [], textures: [] }

    // ── Lighting ──────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x705c99, 1.2)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
    keyLight.position.set(6, 10, 12)
    scene.add(keyLight)

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 2.0)
    rimLight.position.set(-8, -4, -4)
    scene.add(rimLight)

    const portalCoreLight = new THREE.PointLight(0xff4d9d, 3.0, 30)
    portalCoreLight.position.set(0, 0, 2)
    scene.add(portalCoreLight)

    // ── Shared Materials ──────────────────────────────────────────────────────
    const darkMetalSideMat = new THREE.MeshStandardMaterial({
      color: 0x141624,
      metalness: 0.92,
      roughness: 0.22,
    })
    disposables.materials.push(darkMetalSideMat)

    const stonePillarMat = new THREE.MeshStandardMaterial({
      color: 0x1b182b,
      metalness: 0.45,
      roughness: 0.65,
    })
    disposables.materials.push(stonePillarMat)

    // ── 1. 3D DESIGN Cube & Dispersed Letters ─────────────────────────────────
    const cubeGroup = new THREE.Group()
    scene.add(cubeGroup)

    // Glowing Neon Chassis Wireframe Box
    const chassisGeo = new THREE.BoxGeometry(9.6, 3.2, 2.4)
    disposables.geometries.push(chassisGeo)
    const chassisEdges = new THREE.EdgesGeometry(chassisGeo)
    disposables.geometries.push(chassisEdges)
    const chassisMat = new THREE.LineBasicMaterial({
      color: 0xb44dff,
      linewidth: 2,
      transparent: true,
      opacity: 0.7,
    })
    disposables.materials.push(chassisMat)
    const chassisLine = new THREE.LineSegments(chassisEdges, chassisMat)
    cubeGroup.add(chassisLine)

    // 6 Dimensional Letter Slabs: D - E - S - I - G - N
    const LETTERS = ['D', 'E', 'S', 'I', 'G', 'N']
    const letterMeshes: THREE.Mesh[] = []

    // Initial scattered 3D coordinates & rotations
    const INITIAL_SCATTERS = [
      { x: -5.4, y: 3.2, z: 2.8, rx: 0.5, ry: -0.7, rz: 0.4 },
      { x: -2.4, y: -4.0, z: -2.2, rx: -0.6, ry: 0.9, rz: -0.5 },
      { x: 4.2, y: 3.5, z: 3.5, rx: 0.9, ry: -0.4, rz: 0.6 },
      { x: -3.8, y: -2.2, z: 4.8, rx: -0.4, ry: 0.8, rz: -0.7 },
      { x: 2.6, y: -3.6, z: -3.0, rx: 0.7, ry: -0.9, rz: 0.3 },
      { x: 5.2, y: 2.2, z: 2.0, rx: -0.5, ry: 0.6, rz: -0.8 },
    ]

    // Target linear slot positions (D E S I G N)
    const TARGET_X_OFFSETS = [-3.5, -2.1, -0.7, 0.7, 2.1, 3.5]

    const slabGeo = new THREE.BoxGeometry(1.28, 1.28, 0.38)
    disposables.geometries.push(slabGeo)

    LETTERS.forEach((char, i) => {
      const letterTex = createLetterBlockTexture(char)
      disposables.textures.push(letterTex)

      const frontFaceMat = new THREE.MeshBasicMaterial({
        map: letterTex,
        transparent: true,
      })
      disposables.materials.push(frontFaceMat)

      // Box materials: [right, left, top, bottom, front, back]
      const slabMaterials = [
        darkMetalSideMat,
        darkMetalSideMat,
        darkMetalSideMat,
        darkMetalSideMat,
        frontFaceMat,
        darkMetalSideMat,
      ]

      const slabMesh = new THREE.Mesh(slabGeo, slabMaterials)
      const init = INITIAL_SCATTERS[i]
      slabMesh.position.set(init.x, init.y, init.z)
      slabMesh.rotation.set(init.rx, init.ry, init.rz)
      cubeGroup.add(slabMesh)
      letterMeshes.push(slabMesh)
    })

    // ── 2. Ancient Magical Portal Structure ──────────────────────────────────
    const portalGroup = new THREE.Group()
    portalGroup.position.set(0, 0, -2)
    portalGroup.scale.set(0.001, 0.001, 0.001) // initially hidden
    scene.add(portalGroup)

    // Left and Right Megalith Stone Pillars
    const pillarGeo = new THREE.BoxGeometry(1.4, 9.6, 1.6)
    disposables.geometries.push(pillarGeo)

    const leftPillar = new THREE.Mesh(pillarGeo, stonePillarMat)
    leftPillar.position.set(-4.2, 0, 0)
    portalGroup.add(leftPillar)

    const rightPillar = new THREE.Mesh(pillarGeo, stonePillarMat)
    rightPillar.position.set(4.2, 0, 0)
    portalGroup.add(rightPillar)

    // Heavy Stone Lintel (Archway Header)
    const lintelGeo = new THREE.BoxGeometry(9.8, 1.6, 1.8)
    disposables.geometries.push(lintelGeo)
    const lintel = new THREE.Mesh(lintelGeo, stonePillarMat)
    lintel.position.set(0, 4.8, 0)
    portalGroup.add(lintel)

    // Threshold Step Base
    const thresholdGeo = new THREE.BoxGeometry(9.8, 1.2, 2.0)
    disposables.geometries.push(thresholdGeo)
    const threshold = new THREE.Mesh(thresholdGeo, stonePillarMat)
    threshold.position.set(0, -4.8, 0)
    portalGroup.add(threshold)

    // Massive Dual Runic Doors (Pivot groups for smooth opening)
    const doorGeo = new THREE.BoxGeometry(3.5, 8.4, 0.45)
    disposables.geometries.push(doorGeo)

    const leftDoorTex = createRunicStoneTexture(true)
    const rightDoorTex = createRunicStoneTexture(false)
    disposables.textures.push(leftDoorTex, rightDoorTex)

    const leftDoorMat = new THREE.MeshStandardMaterial({
      map: leftDoorTex,
      metalness: 0.35,
      roughness: 0.45,
    })
    const rightDoorMat = new THREE.MeshStandardMaterial({
      map: rightDoorTex,
      metalness: 0.35,
      roughness: 0.45,
    })
    disposables.materials.push(leftDoorMat, rightDoorMat)

    // Left Door Pivot Group
    const leftPivot = new THREE.Group()
    leftPivot.position.set(-3.5, 0, 0)
    portalGroup.add(leftPivot)

    const leftDoorMesh = new THREE.Mesh(doorGeo, leftDoorMat)
    leftDoorMesh.position.set(1.75, 0, 0)
    leftPivot.add(leftDoorMesh)

    // Right Door Pivot Group
    const rightPivot = new THREE.Group()
    rightPivot.position.set(3.5, 0, 0)
    portalGroup.add(rightPivot)

    const rightDoorMesh = new THREE.Mesh(doorGeo, rightDoorMat)
    rightDoorMesh.position.set(-1.75, 0, 0)
    rightPivot.add(rightDoorMesh)

    // Rotating Ancient Runic Ring
    const runicRingTex = createRunicRingTexture()
    disposables.textures.push(runicRingTex)
    const ringGeo = new THREE.PlaneGeometry(7.2, 7.2)
    disposables.geometries.push(ringGeo)
    const ringMat = new THREE.MeshBasicMaterial({
      map: runicRingTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
    disposables.materials.push(ringMat)
    const runicRing = new THREE.Mesh(ringGeo, ringMat)
    runicRing.position.set(0, 0, -0.2)
    portalGroup.add(runicRing)

    // Luminous Portal Vortex Veil (Revealed when doors swing open)
    const vortexTex = createMagicPortalVortexTexture()
    disposables.textures.push(vortexTex)
    const vortexGeo = new THREE.PlaneGeometry(7.5, 8.8)
    disposables.geometries.push(vortexGeo)
    const vortexMat = new THREE.MeshBasicMaterial({
      map: vortexTex,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    disposables.materials.push(vortexMat)
    const vortexMesh = new THREE.Mesh(vortexGeo, vortexMat)
    vortexMesh.position.set(0, 0, -0.6)
    portalGroup.add(vortexMesh)

    // ── 3. Magical Spark & Dust Particles ─────────────────────────────────────
    const PARTICLE_COUNT = 90
    const pPositions = new Float32Array(PARTICLE_COUNT * 3)
    const pColors = new Float32Array(PARTICLE_COUNT * 3)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3
      pPositions[idx] = (Math.random() - 0.5) * 12
      pPositions[idx + 1] = (Math.random() - 0.5) * 10
      pPositions[idx + 2] = (Math.random() - 0.5) * 8

      const isCyan = Math.random() > 0.45
      pColors[idx] = isCyan ? 0.0 : 1.0
      pColors[idx + 1] = isCyan ? 0.94 : 0.3
      pColors[idx + 2] = 1.0
    }

    const particleGeo = new THREE.BufferGeometry()
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3))
    particleGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3))
    disposables.geometries.push(particleGeo)

    const particleMat = new THREE.PointsMaterial({
      size: 0.28,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
    disposables.materials.push(particleMat)

    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // ── Animation Timeline State Machine ──────────────────────────────────────
    const startTime = performance.now()
    let animationFrameId: number

    function animate(now: number) {
      if (isTerminatedRef.current) return
      animationFrameId = requestAnimationFrame(animate)

      const elapsed = (now - startTime) / 1000

      // Continuous particles gentle floating
      particles.rotation.y = elapsed * 0.15
      runicRing.rotation.z = -elapsed * 0.25

      // ── Phase 1: Dispersed Floating & Tumble (0.0s – 0.6s) ───────────────────
      if (elapsed < 0.6) {
        cubeGroup.rotation.y = elapsed * 0.25

        letterMeshes.forEach((mesh, i) => {
          const init = INITIAL_SCATTERS[i]
          mesh.position.y = init.y + Math.sin(elapsed * 3 + i) * 0.15
          mesh.rotation.x = init.rx + elapsed * 0.2
        })
      }

      // ── Phase 2: Magical Assembly into DESIGN (0.6s – 1.8s) ─────────────────
      else if (elapsed >= 0.6 && elapsed < 1.8) {
        const t = Math.min(1, (elapsed - 0.6) / 1.0)
        // Ease cubic out
        const ease = 1 - Math.pow(1 - t, 3)

        cubeGroup.rotation.y = (1 - ease) * 0.25

        letterMeshes.forEach((mesh, i) => {
          const init = INITIAL_SCATTERS[i]
          const targetX = TARGET_X_OFFSETS[i]

          mesh.position.x = init.x + (targetX - init.x) * ease
          mesh.position.y = init.y + (0 - init.y) * ease
          mesh.position.z = init.z + (0 - init.z) * ease

          mesh.rotation.x = init.rx + (0 - init.rx) * ease
          mesh.rotation.y = init.ry + (0 - init.ry) * ease
          mesh.rotation.z = init.rz + (0 - init.rz) * ease
        })

        // Pulse light when assembling
        portalCoreLight.intensity = 2.5 + Math.sin(t * Math.PI) * 5.0
      }

      // ── Phase 3: Transmutation to Ancient Portal (1.8s – 2.8s) ──────────────
      else if (elapsed >= 1.8 && elapsed < 2.8) {
        const t = (elapsed - 1.8) / 1.0
        const ease = t * t * (3 - 2 * t)

        // Cube & letters scale down / ascend to portal keystone
        const cubeScale = Math.max(0.001, 1 - ease)
        cubeGroup.scale.set(cubeScale, cubeScale, cubeScale)
        cubeGroup.position.y = ease * 3.5

        // Portal emerges from rift
        const portalScale = ease
        portalGroup.scale.set(portalScale, portalScale, portalScale)

        portalCoreLight.intensity = 3.0 + Math.sin(t * Math.PI * 2) * 2.5
      }

      // ── Phase 4: Ancient Portal Door Opening & Camera Dolly (2.8s – 4.3s) ───
      else if (elapsed >= 2.8) {
        cubeGroup.visible = false
        portalGroup.scale.set(1, 1, 1)

        const openT = Math.min(1, (elapsed - 2.8) / 1.3)
        // Smooth heavy stone door swing
        const doorEase = openT * openT * (3 - 2 * openT)

        // Doors swing slowly backward on stone hinges (~80 degrees)
        leftPivot.rotation.y = -doorEase * 1.42
        rightPivot.rotation.y = doorEase * 1.42

        // Radiant vortex swells in brightness
        vortexMesh.scale.set(1 + openT * 0.35, 1 + openT * 0.35, 1)

        // Camera smoothly dollys forward through the open threshold
        if (elapsed > 3.2) {
          const dollyT = Math.min(1, (elapsed - 3.2) / 1.1)
          const dollyEase = Math.pow(dollyT, 2)
          camera.position.z = 15 - dollyEase * 11.5 // from 15 down to 3.5
        }

        // Completion transition
        if (elapsed >= 4.35) {
          isTerminatedRef.current = true
          zoneReady()
          return
        }
      }

      renderer.render(scene, camera)
    }

    animationFrameId = requestAnimationFrame(animate)

    // Resize handler
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight, false)
      renderer.setPixelRatio(dpr)
    }
    window.addEventListener('resize', onResize)

    // Teardown
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', onResize)
      disposables.geometries.forEach((g) => g.dispose())
      disposables.materials.forEach((m) => m.dispose())
      disposables.textures.forEach((t) => t.dispose())
      renderer.dispose()
    }
  }, [reduced, zoneReady])

  if (reduced) return null

  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{
        zIndex: 'var(--z-zone)' as unknown as number,
        background: 'radial-gradient(ellipse at 50% 50%, #0c081e 0%, #03040a 100%)',
      }}
      role="presentation"
      aria-label="Entering Design Zone — Magical 3D Portal"
    >
      {/* ── 3D WebGL Canvas ────────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full"
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      />

      {/* ── Ambient Radial Edge Glow ───────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, transparent 60%, rgba(3, 4, 10, 0.75) 100%)',
        }}
        aria-hidden="true"
      />

      {/* ── Skip Button ────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 z-20 px-4 py-2 font-mono text-[11px] tracking-[0.25em] uppercase rounded-full cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[var(--color-energy-blue)]"
        style={{
          color: 'rgba(248, 250, 255, 0.7)',
          background: 'rgba(180, 77, 255, 0.12)',
          border: '1px solid rgba(180, 77, 255, 0.35)',
          backdropFilter: 'blur(8px)',
        }}
        aria-label="Skip cinematic portal sequence"
      >
        SKIP &#10140;
      </button>

      {/* ── Screen Reader Status ───────────────────────────────────────── */}
      <span className="sr-only" aria-live="polite">
        Assembling Design portal and entering Design Lab...
      </span>
    </div>
  )
}
