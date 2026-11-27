import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface ReportBinder3DProps {
  certified?: boolean;
  auditsCount?: number;
  interactive?: boolean;
  scale?: number;
}

export default function ReportBinder3D({
  certified = true,
  auditsCount = 12,
  interactive = true,
  scale = 1.0,
}: ReportBinder3DProps) {
  const dossierRef = useRef<THREE.Group>(null);
  const sealRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Gentle dossier tilt
    if (dossierRef.current) {
      dossierRef.current.rotation.y = Math.sin(t * 0.5) * 0.15;
      dossierRef.current.rotation.x = 0.15 + Math.cos(t * 0.4) * 0.05;
    }

    // Spinning gold compliance seal
    if (sealRef.current) {
      sealRef.current.rotation.z = t * 0.4;
    }

    // Floating audit verification rings
    if (ringsRef.current) {
      ringsRef.current.rotation.y = -t * 0.3;
      ringsRef.current.rotation.z = t * 0.2;
    }
  });

  return (
    <group scale={scale}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 7, 5]} intensity={1.2} />
      <pointLight position={[0, 1.5, 2]} color="#10b981" intensity={1.5} distance={6} />
      <pointLight position={[-2, -1, -2]} color="#38bdf8" intensity={0.8} distance={5} />

      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.25}>
        {/* Holographic Audit Dossier Binder */}
        <group ref={dossierRef}>
          {/* Back Cover (Dark Titanium Carbon) */}
          <mesh position={[0, 0, -0.06]}>
            <boxGeometry args={[1.7, 2.3, 0.06]} />
            <meshStandardMaterial
              color="#090d16"
              roughness={0.4}
              metalness={0.8}
            />
          </mesh>

          {/* Bound Spine Ring Clips */}
          {[-0.8, -0.4, 0, 0.4, 0.8].map((y, i) => (
            <mesh key={i} position={[-0.86, y, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.07, 0.015, 8, 24]} />
              <meshStandardMaterial
                color="#047857"
                emissive="#10b981"
                emissiveIntensity={0.8}
                metalness={0.9}
              />
            </mesh>
          ))}

          {/* Internal Document Pages (Multi-layer holographic parchment) */}
          <mesh position={[0.03, 0, -0.01]}>
            <boxGeometry args={[1.62, 2.22, 0.04]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.6}
              metalness={0.3}
            />
          </mesh>

          {/* Front Holographic Display Face */}
          <mesh position={[0.04, 0, 0.03]}>
            <boxGeometry args={[1.6, 2.2, 0.02]} />
            <meshStandardMaterial
              color="#042f2e"
              emissive="#0d9488"
              emissiveIntensity={0.3}
              roughness={0.2}
              metalness={0.6}
            />
          </mesh>

          {/* Digital Telemetry Header Bar */}
          <mesh position={[0.04, 0.85, 0.045]}>
            <boxGeometry args={[1.35, 0.2, 0.01]} />
            <meshStandardMaterial
              color="#059669"
              emissive="#10b981"
              emissiveIntensity={0.9}
            />
          </mesh>

          {/* Content Line Wireframes */}
          {[-0.4, -0.2, 0, 0.2, 0.4, 0.6].map((y, i) => (
            <mesh key={i} position={[0.04, y, 0.045]}>
              <boxGeometry args={[i % 2 === 0 ? 1.25 : 0.95, 0.025, 0.01]} />
              <meshStandardMaterial
                color="#38bdf8"
                emissive="#38bdf8"
                emissiveIntensity={0.5}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}

          {/* Official Verification Stamp Seal */}
          <group ref={sealRef} position={[0.42, -0.65, 0.055]}>
            {/* Outer golden rim */}
            <mesh>
              <ringGeometry args={[0.22, 0.27, 32]} />
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#fbbf24"
                emissiveIntensity={1.2}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Inner emblem */}
            <mesh position={[0, 0, 0.005]}>
              <circleGeometry args={[0.21, 32]} />
              <meshStandardMaterial
                color="#047857"
                emissive="#10b981"
                emissiveIntensity={0.8}
              />
            </mesh>
            <mesh position={[0, 0, 0.015]}>
              <octahedronGeometry args={[0.1, 0]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#6ee7b7"
                emissiveIntensity={2.0}
              />
            </mesh>
          </group>
        </group>

        {/* Orbiting Verification Particle Rings */}
        <group ref={ringsRef} position={[0, 0, 0]}>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[1.65, 0.015, 12, 64]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#34d399"
              emissiveIntensity={1.2}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
            <torusGeometry args={[1.85, 0.012, 12, 64]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#38bdf8"
              emissiveIntensity={1.0}
            />
          </mesh>
        </group>
      </Float>

      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.9}
          minPolarAngle={Math.PI / 2.3}
        />
      )}
    </group>
  );
}
