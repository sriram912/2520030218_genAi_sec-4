import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface ScenarioComparison3DProps {
  activeScenarioId?: string;
  reductionPercentage?: number;
  interactive?: boolean;
  scale?: number;
}

export default function ScenarioComparison3D({
  activeScenarioId = 'A',
  reductionPercentage = 28,
  interactive = true,
  scale = 1.0,
}: ScenarioComparison3DProps) {
  const solarRaysRef = useRef<THREE.Group>(null);
  const evRoadRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const campusRef = useRef<THREE.Group>(null);

  // Scenario flags
  const isSolar = activeScenarioId.includes('A') || activeScenarioId.includes('Solar') || activeScenarioId.includes('master');
  const isEV = activeScenarioId.includes('B') || activeScenarioId.includes('Fleet') || activeScenarioId.includes('master');
  const isWaste = activeScenarioId.includes('C') || activeScenarioId.includes('Waste') || activeScenarioId.includes('master');
  const isMaster = activeScenarioId.includes('D') || activeScenarioId.includes('master') || reductionPercentage >= 40;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Solar panels shimmer
    if (solarRaysRef.current) {
      solarRaysRef.current.children.forEach((ray, i) => {
        const mat = (ray as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.emissiveIntensity = 0.8 + Math.sin(t * 3 + i) * 0.4;
        }
      });
    }

    // EV Road current
    if (evRoadRef.current) {
      evRoadRef.current.rotation.y = -t * 0.5;
    }

    // Masterplan Aura
    if (auraRef.current) {
      const s = 1.0 + Math.sin(t * 1.8) * 0.05;
      auraRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group scale={scale}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 9, 6]} intensity={1.2} />
      <pointLight
        position={[0, 3, 0]}
        color={isMaster ? '#10b981' : isSolar ? '#38bdf8' : isEV ? '#34d399' : '#fbbf24'}
        intensity={1.2}
      />

      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.15}>
        {/* Base Platform */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[2.7, 3.0, 0.3, 32]} />
          <meshStandardMaterial color="#090d16" roughness={0.8} metalness={0.6} />
        </mesh>

        {/* Masterplan Decarbonization Aura Shield */}
        {isMaster && (
          <mesh ref={auraRef} position={[0, 0.6, 0]}>
            <sphereGeometry args={[2.4, 32, 32]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#34d399"
              emissiveIntensity={0.4}
              transparent
              opacity={0.15}
              wireframe={true}
            />
          </mesh>
        )}

        {/* Main Campus Buildings */}
        <group ref={campusRef}>
          {/* Main Science Hub */}
          <mesh position={[-0.9, 0.5, -0.6]}>
            <boxGeometry args={[1.0, 1.2, 1.0]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive={isSolar ? '#0284c7' : '#10b981'}
              emissiveIntensity={0.3}
              roughness={0.2}
            />
          </mesh>

          {/* Solar Rooftop Panels (Scenario A & Masterplan) */}
          {isSolar && (
            <group ref={solarRaysRef} position={[-0.9, 1.12, -0.6]}>
              <mesh>
                <boxGeometry args={[0.9, 0.04, 0.9]} />
                <meshStandardMaterial
                  color="#0284c7"
                  emissive="#38bdf8"
                  emissiveIntensity={1.4}
                  metalness={0.9}
                />
              </mesh>
              {/* Miniature Photovoltaic Array Lines */}
              {[-0.3, 0, 0.3].map((z, i) => (
                <mesh key={i} position={[0, 0.03, z]}>
                  <boxGeometry args={[0.85, 0.01, 0.06]} />
                  <meshStandardMaterial color="#ecfdf5" emissive="#67e8f9" emissiveIntensity={2.0} />
                </mesh>
              ))}
            </group>
          )}

          {/* Engineering Hall */}
          <mesh position={[0.9, 0.4, -0.5]}>
            <boxGeometry args={[0.9, 0.9, 1.1]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive={isWaste ? '#10b981' : '#334155'}
              emissiveIntensity={0.3}
              roughness={0.2}
            />
          </mesh>

          {/* Eco-Library */}
          <mesh position={[0, 0.3, 0.8]}>
            <boxGeometry args={[1.3, 0.7, 0.8]} />
            <meshStandardMaterial
              color="#1e293b"
              emissive="#10b981"
              emissiveIntensity={0.4}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Circular EV Track with Green Charging Flow (Scenario B) */}
        {isEV && (
          <group ref={evRoadRef} position={[0, -0.22, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.8, 2.2, 36]} />
              <meshStandardMaterial
                color="#059669"
                emissive="#10b981"
                emissiveIntensity={1.2}
                transparent
                opacity={0.8}
              />
            </mesh>
            {/* Small EV Capsule */}
            <mesh position={[2.0, 0.1, 0]}>
              <boxGeometry args={[0.15, 0.1, 0.25]} />
              <meshStandardMaterial color="#ecfdf5" emissive="#34d399" emissiveIntensity={2.0} />
            </mesh>
          </group>
        )}

        {/* Circular Zero Waste Materials Recovery Loop (Scenario C) */}
        {isWaste && (
          <group position={[0, 0.3, 0]}>
            <mesh rotation={[Math.PI / 3, 0, 0]}>
              <torusGeometry args={[1.9, 0.02, 16, 48]} />
              <meshStandardMaterial color="#10b981" emissive="#34d399" emissiveIntensity={1.5} />
            </mesh>
          </group>
        )}
      </Float>

      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 3.0}
          autoRotate
          autoRotateSpeed={0.6}
        />
      )}
    </group>
  );
}
