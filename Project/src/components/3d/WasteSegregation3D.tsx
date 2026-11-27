import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface WasteSegregation3DProps {
  foodWasteKg?: number;
  plasticWasteKg?: number;
  paperWasteKg?: number;
  generalWasteKg?: number;
  disposalMethod?: string;
  interactive?: boolean;
  scale?: number;
}

export default function WasteSegregation3D({
  foodWasteKg = 450,
  plasticWasteKg = 280,
  paperWasteKg = 320,
  generalWasteKg = 1100,
  disposalMethod = 'landfill',
  interactive = true,
  scale = 1.0,
}: WasteSegregation3DProps) {
  const loopRef = useRef<THREE.Group>(null);
  const binsRef = useRef<THREE.Group>(null);

  // Circular loop animation
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (loopRef.current) {
      loopRef.current.rotation.y = t * 0.4;
    }

    if (binsRef.current) {
      binsRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(t * 1.5 + i * 1.2) * 0.04;
      });
    }
  });

  return (
    <group scale={scale}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 4]} intensity={1.2} />
      <pointLight position={[0, 1.5, 0]} color="#10b981" intensity={0.9} distance={5} />

      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.15}>
        {/* Base Pedestal */}
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[2.6, 2.8, 0.2, 32]} />
          <meshStandardMaterial color="#090d16" roughness={0.7} metalness={0.5} />
        </mesh>

        {/* Circular Materials Recovery Loop Halo */}
        <group ref={loopRef} position={[0, 0.65, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.7, 0.02, 16, 64]} />
            <meshStandardMaterial
              color="#059669"
              emissive="#10b981"
              emissiveIntensity={1.3}
            />
          </mesh>
          {/* Recycling node beads */}
          {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((rad, i) => (
            <mesh key={i} position={[Math.cos(rad) * 1.7, 0, Math.sin(rad) * 1.7]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color="#ecfdf5" emissive="#34d399" emissiveIntensity={2.0} />
            </mesh>
          ))}
        </group>

        {/* 4 Smart Segregated Bins */}
        <group ref={binsRef}>
          {/* 1. Organic Compost (Green) */}
          <group position={[-1.0, 0, 0.6]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.26, 0.22, 0.7, 16]} />
              <meshStandardMaterial color="#047857" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.52, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.06, 16]} />
              <meshStandardMaterial color="#10b981" emissive="#34d399" emissiveIntensity={0.8} />
            </mesh>
            {/* Status indicator ring */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.27, 0.27, 0.03, 16]} />
              <meshStandardMaterial color="#10b981" emissive="#34d399" emissiveIntensity={1.2} />
            </mesh>
          </group>

          {/* 2. Plastic & Polymers (Cyan) */}
          <group position={[1.0, 0, 0.6]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.26, 0.22, 0.7, 16]} />
              <meshStandardMaterial color="#0369a1" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.52, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.06, 16]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.27, 0.27, 0.03, 16]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.2} />
            </mesh>
          </group>

          {/* 3. Paper & Cellulose (Amber) */}
          <group position={[-1.0, 0, -0.6]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.26, 0.22, 0.7, 16]} />
              <meshStandardMaterial color="#b45309" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.52, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.06, 16]} />
              <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={0.8} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.27, 0.27, 0.03, 16]} />
              <meshStandardMaterial color="#fbbf24" emissive="#d97706" emissiveIntensity={1.2} />
            </mesh>
          </group>

          {/* 4. Residual / Landfill (Slate) */}
          <group position={[1.0, 0, -0.6]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.26, 0.22, 0.7, 16]} />
              <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.52, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.06, 16]} />
              <meshStandardMaterial color="#64748b" emissive="#475569" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.27, 0.27, 0.03, 16]} />
              <meshStandardMaterial color="#475569" emissive="#64748b" emissiveIntensity={0.5} />
            </mesh>
          </group>
        </group>

        {/* Central Sorting Nexus Hologram */}
        <group position={[0, 0.1, 0]}>
          <mesh>
            <octahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial
              color="#047857"
              emissive="#10b981"
              emissiveIntensity={1.4}
              wireframe={false}
            />
          </mesh>
          <mesh>
            <octahedronGeometry args={[0.32, 0]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#34d399"
              wireframe={true}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      </Float>

      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 3.0}
        />
      )}
    </group>
  );
}
