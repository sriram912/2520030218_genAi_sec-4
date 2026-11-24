import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';

interface SceneSetupProps {
  enableControls?: boolean;
  enableStars?: boolean;
  fog?: boolean;
  autoRotate?: boolean;
  minDistance?: number;
  maxDistance?: number;
}

export default function SceneSetup({
  enableControls = true,
  enableStars = true,
  fog = true,
  autoRotate = false,
  minDistance = 3,
  maxDistance = 35,
}: SceneSetupProps) {
  const pointLightRef = useRef<THREE.PointLight>(null);

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useFrame(({ clock }) => {
    if (prefersReducedMotion || !pointLightRef.current) return;
    const t = clock.getElapsedTime();
    pointLightRef.current.intensity = 0.4 + Math.sin(t * 0.8) * 0.1;
  });

  return (
    <>
      {/* Ambient fill light */}
      <ambientLight intensity={0.4} color="#ffffff" />

      {/* Main directional light with shadows */}
      <directionalLight
        position={[8, 12, 8]}
        intensity={0.9}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
        shadow-bias={-0.0001}
      />

      {/* Emerald accent point light */}
      <pointLight
        ref={pointLightRef}
        position={[0, 4, 0]}
        color="#10b981"
        intensity={0.5}
        distance={25}
        decay={2}
      />

      {/* Optional fog */}
      {fog && <fog attach="fog" args={['#030712', 18, 55]} />}

      {/* Optional star field */}
      {enableStars && (
        <Stars
          radius={100}
          depth={50}
          count={2500}
          factor={4}
          fade
          speed={prefersReducedMotion ? 0 : 0.8}
        />
      )}

      {/* Optional orbit controls */}
      {enableControls && (
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={minDistance}
          maxDistance={maxDistance}
          maxPolarAngle={Math.PI / 2.15}
          autoRotate={autoRotate}
          autoRotateSpeed={0.6}
        />
      )}
    </>
  );
}
