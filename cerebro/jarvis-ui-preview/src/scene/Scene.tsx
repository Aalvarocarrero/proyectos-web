import { useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Core } from './Core'
import { Particles } from './Particles'

export type Drive = {
  color: THREE.Color
  level: number
  spin: number
  amp: number
  open: number
  reactor: {
    color: THREE.Color
    scale: number
    intensity: number
    spin: number
    style: number
    visible: boolean
  }
}

function IdleReactor({phase,level}:{phase:string,level:number}) {
  const drive = useMemo<Drive>(() => ({
    color: new THREE.Color('#27d8ec'),
    level: 0.018,
    spin: 0.08,
    amp: 0.035,
    open: 1.6,
    reactor: {
      color: new THREE.Color('#27d8ec'),
      scale: 1,
      intensity: 1.05,
      spin: 0.08,
      style: 0,
      visible: true,
    },
  }), [])
  const reducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useFrame((state) => {
    // Ambient motion only. No model, voice, tools, or task activity is inferred.
    drive.level = Math.max(level, reducedMotion ? 0.018 : 0.018 + (Math.sin(state.clock.elapsedTime * 0.55) + 1) * 0.003)
    drive.spin = reducedMotion ? 0 : (phase === 'thinking' ? 1.8 : phase === 'speaking' ? 1.2 : .2)
    drive.reactor.spin = drive.spin
    drive.reactor.style = 1
    drive.color.set(phase === 'thinking' ? '#a9d6ff' : '#00e5ff')
    drive.reactor.color.copy(drive.color)
  })

  return <><Core drive={drive} /><Particles drive={drive} /></>
}

export function Scene({phase='idle',level=0}:{phase?:string,level?:number}) {
  const reducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return (
    <Canvas
      className="jarvis-scene"
      aria-hidden="true"
      camera={{ position: [0, 0, 6.2], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      dpr={[1, 1.5]}
      frameloop={reducedMotion ? 'demand' : 'always'}
    >
      <IdleReactor phase={phase} level={level} />
    </Canvas>
  )
}
