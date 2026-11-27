import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface CarbonSphere3DProps {
  totalKgCo2e?: number;
  grossKg?: number;
  avoidedKg?: number;
  scope1Ratio?: number;
  scope2Ratio?: number;
  scope3Ratio?: number;
  scale?: number;
  interactive?: boolean;
}

export default function CarbonSphere3D({
  totalKgCo2e = 6500,
  grossKg = 7200,
  avoidedKg = 700,
  scope1Ratio = 0.25,
  scope2Ratio = 0.55,
  scope3Ratio = 0.20,
  scale = 1.0,
  interactive = true,
}: CarbonSphere3DProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const scope1RingRef = useRef<THREE.Group>(null);
  const scope2RingRef = useRef<THREE.Group>(null);
  const scope3RingRef = useRef<THREE.Group>(null);
  const offsetShieldRef = useRef<THREE.Mesh>(null);
  const vortexParticlesRef = useRef<THREE.Points>(null);

  // Normalize sphere dimensions based on emissions scale
  const normalizedRadius = useMemo(() => {
    // 1000 kg -> 0.85, 20000 kg -> 1.45
    const clamped = Math.max(500, Math.min(30000, totalKgCo2e));
    return 0.85 + (clamped / 30000) * 0.6;
  }, [totalKgCo2e]);

  // Carbon particles around the sphere
  const { particlePositions, particleColors } = useMemo(() => {
    const count = 350;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cScope1 = new THREE.Color('#38bdf8'); // Sky blue - Scope 1 transport/mobile
    const cScope2 = new THREE.Color('#10b981'); // Emerald - Scope 2 electricity
    const cScope3 = new THREE.Color('#fbbf24'); // Amber - Scope 3 waste/supply

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const r = normalizedRadius * (1.15 + Math.random() * 0.95);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[idx] = r * Math.sin(phi) * Math.cos(theta);
      positions[idx + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[idx + 2] = r * Math.cos(phi);

      const rand = Math.random();
      let chosenColor = cScope2;
      if (rand < scope1Ratio) {
        chosenColor = cScope1;
      } else if (rand > 1 - scope3Ratio) {
        chosenColor = cScope3;
      }

      colors[idx] = chosenColor.r;
      colors[idx + 1] = chosenColor.g;
      colors[idx + 2] = chosenColor.b;
    }

    return { particlePositions: positions, particleColors: colors };
  }, [normalizedRadius, scope1Ratio, scope3Ratio]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Pulse core
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.2;
      coreRef.current.rotation.x = Math.sin(t * 0.15) * 0.1;
    }

    // Spin vortex
    if (vortexParticlesRef.current) {
      vortexParticlesRef.current.rotation.y = t * 0.35;
      vortexParticlesRef.current.rotation.z = Math.sin(t * 0.2) * 0.15;
    }

    // Rings rotation
    if (scope1RingRef.current) {
      scope1RingRef.current.rotation.x = t * 0.4;
      scope1RingRef.current.rotation.y = t * 0.25;
    }
    if (scope2RingRef.current) {
      scope2RingRef.current.rotation.y = -t * 0.5;
      scope2RingRef.current.rotation.z = t * 0.3;
    }
    if (scope3RingRef.current) {
      scope3RingRef.current.rotation.z = t * 0.45;
      scope3RingRef.current.rotation.x = -t * 0.35;
    }

    // Avoided emission green shield pulsation
    if (offsetShieldRef.current) {
      const shieldScale = 1.0 + Math.sin(t * 2.0) * 0.04;
      offsetShieldRef.current.scale.set(shieldScale, shieldScale, shieldScale);
    }
  });

  return (
    <group scale={scale}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <pointLight position={[-4, -2, -3]} intensity={0.8} color="#10b981" />

      <Float speed={1.8} rotationIntensity={0.2} floatIntensity={0.4}>
        {/* Central Carbon Core - dense carbon allotrope structure */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[normalizedRadius, 3]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.4}
            metalness={0.9}
            emissive="#022c22"
            emissiveIntensity={0.4}
            wireframe={false}
          />
        </mesh>

        {/* Carbon Molecular Cage Lattice */}
        <mesh>
          <icosahedronGeometry args={[normalizedRadius * 1.08, 1]} />
          <meshStandardMaterial
            color="#334155"
            emissive="#10b981"
            emissiveIntensity={0.3}
            wireframe={true}
            transparent
            opacity={0.45}
          />
        </mesh>

        {/* Avoided Emissions Protective Halo Shield */}
        {avoidedKg > 0 && (
          <mesh ref={offsetShieldRef}>
            <sphereGeometry args={[normalizedRadius * 1.35, 32, 32]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#34d399"
              emissiveIntensity={0.4}
              transparent
              opacity={0.16}
              side={THREE.DoubleSide}
              wireframe={false}
            />
          </mesh>
        )}

        {/* Scope 1 Orbital Ring (Sky Blue - Fleet & Stationary) */}
        <group ref={scope1RingRef}>
          <mesh>
            <torusGeometry args={[normalizedRadius * 1.45, 0.02, 16, 80]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#38bdf8"
              emissiveIntensity={1.2}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[normalizedRadius * 1.45, 0, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={2.0} />
          </mesh>
        </group>

        {/* Scope 2 Orbital Ring (Emerald - Grid Electricity) */}
        <group ref={scope2RingRef} rotation={[Math.PI / 3, 0, 0]}>
          <mesh>
            <torusGeometry args={[normalizedRadius * 1.7, 0.025, 16, 90]} />
            <meshStandardMaterial
              color="#059669"
              emissive="#10b981"
              emissiveIntensity={1.4}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[-normalizedRadius * 1.7, 0, 0]}>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial color="#ecfdf5" emissive="#10b981" emissiveIntensity={2.5} />
          </mesh>
        </group>

        {/* Scope 3 Orbital Ring (Amber - Solid Waste & Upstream) */}
        <group ref={scope3RingRef} rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
          <mesh>
            <torusGeometry args={[normalizedRadius * 1.95, 0.018, 16, 80]} />
            <meshStandardMaterial
              color="#d97706"
              emissive="#fbbf24"
              emissiveIntensity={1.0}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, normalizedRadius * 1.95, 0]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color="#fef3c7" emissive="#fbbf24" emissiveIntensity={2.0} />
          </mesh>
        </group>

        {/* Carbon Particle Cloud */}
        <points ref={vortexParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particlePositions, 3]}
            />
            <bufferAttribute
              attach="attributes-color"
              args={[particleColors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.04}
            vertexColors
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </Float>

      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.9}
          minPolarAngle={Math.PI / 2.4}
        />
      )}
    </group>
  );
}
