import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface DashboardTwin3DProps {
  totalEmissions?: number;
  totalEnergy?: number;
  interactive?: boolean;
  scale?: number;
  onBuildingSelect?: (buildingName: string) => void;
}

export default function DashboardTwin3D({
  totalEmissions = 45200,
  totalEnergy = 108400,
  interactive = true,
  scale = 1.0,
  onBuildingSelect,
}: DashboardTwin3DProps) {
  const nexusRef = useRef<THREE.Group>(null);
  const metricNodesRef = useRef<THREE.Group>(null);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);

  // Buildings layout on the digital twin platform
  const buildings = [
    { name: 'Science Complex', pos: [-1.4, 0.45, -0.9], size: [0.9, 0.9, 0.9], color: '#38bdf8', score: 78, kwh: 34200 },
    { name: 'Engineering Hall', pos: [1.3, 0.6, -0.8], size: [0.8, 1.2, 0.8], color: '#10b981', score: 86, kwh: 28400 },
    { name: 'Main Library', pos: [-1.2, 0.35, 1.1], size: [1.1, 0.7, 0.8], color: '#34d399', score: 92, kwh: 14100 },
    { name: 'Student Union', pos: [1.2, 0.4, 1.0], size: [0.9, 0.8, 0.9], color: '#fbbf24', score: 81, kwh: 18900 },
    { name: 'Administration', pos: [0, 0.5, 0], size: [0.75, 1.0, 0.75], color: '#a855f7', score: 89, kwh: 12800 },
  ];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Pulse nexus core
    if (nexusRef.current) {
      nexusRef.current.rotation.y = t * 0.15;
    }

    // Orbit floating metric nodes
    if (metricNodesRef.current) {
      metricNodesRef.current.rotation.y = -t * 0.25;
    }
  });

  return (
    <group scale={scale}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 10, 6]} intensity={1.1} />
      <pointLight position={[0, 3, 0]} color="#10b981" intensity={1.2} distance={8} />
      <pointLight position={[0, -2, 0]} color="#38bdf8" intensity={0.6} distance={6} />

      <Float speed={1.0} rotationIntensity={0.08} floatIntensity={0.15}>
        {/* Hexagonal Base Pedestal */}
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[2.8, 3.1, 0.35, 6]} />
          <meshStandardMaterial color="#090d16" roughness={0.7} metalness={0.6} />
        </mesh>

        {/* Holographic Campus Grid Floor */}
        <mesh position={[0, -0.11, 0]}>
          <cylinderGeometry args={[2.7, 2.7, 0.02, 6]} />
          <meshStandardMaterial
            color="#047857"
            emissive="#10b981"
            emissiveIntensity={0.5}
            wireframe={true}
          />
        </mesh>

        {/* Telemetry Nexus Pedestal Ring */}
        <mesh position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 2.4, 32]} />
          <meshStandardMaterial
            color="#0284c7"
            emissive="#38bdf8"
            emissiveIntensity={0.3}
            transparent
            opacity={0.3}
          />
        </mesh>

        {/* Central Data Tower */}
        <group ref={nexusRef}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 0.5, 8]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.6, 0]}>
            <octahedronGeometry args={[0.22, 0]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#34d399"
              emissiveIntensity={1.8}
            />
          </mesh>
        </group>

        {/* Campus Buildings */}
        {buildings.map((b) => {
          const isHov = hoveredBuilding === b.name;
          return (
            <group
              key={b.name}
              position={b.pos as [number, number, number]}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredBuilding(b.name);
              }}
              onPointerOut={() => setHoveredBuilding(null)}
              onClick={() => onBuildingSelect?.(b.name)}
            >
              {/* Building structure */}
              <mesh position={[0, isHov ? 0.15 : 0, 0]}>
                <boxGeometry args={b.size as [number, number, number]} />
                <meshStandardMaterial
                  color={isHov ? '#10b981' : '#1e293b'}
                  emissive={isHov ? '#34d399' : b.color}
                  emissiveIntensity={isHov ? 1.0 : 0.35}
                  roughness={0.3}
                  metalness={0.7}
                />
              </mesh>

              {/* Rooftop Solar Grid */}
              <mesh position={[0, (b.size[1] / 2) + (isHov ? 0.16 : 0.01), 0]}>
                <boxGeometry args={[b.size[0] * 0.85, 0.02, b.size[2] * 0.85]} />
                <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.6} />
              </mesh>

              {/* Data stream laser line to nexus */}
              <mesh position={[-b.pos[0] / 2, 0.2, -b.pos[2] / 2]}>
                <cylinderGeometry args={[0.008, 0.008, 1.2, 4]} />
                <meshStandardMaterial
                  color="#10b981"
                  emissive="#34d399"
                  emissiveIntensity={isHov ? 2.0 : 0.8}
                  transparent
                  opacity={0.6}
                />
              </mesh>
            </group>
          );
        })}

        {/* Floating 4-Metric Holographic Orbits */}
        <group ref={metricNodesRef}>
          {/* Node 1: Energy (Cyan) */}
          <mesh position={[2.6, 0.9, 0]}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={1.8} />
          </mesh>

          {/* Node 2: Carbon (Emerald) */}
          <mesh position={[-2.6, 0.9, 0]}>
            <dodecahedronGeometry args={[0.15, 0]} />
            <meshStandardMaterial color="#059669" emissive="#10b981" emissiveIntensity={1.8} />
          </mesh>

          {/* Node 3: Water (Blue) */}
          <mesh position={[0, 1.1, 2.6]}>
            <icosahedronGeometry args={[0.14, 0]} />
            <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={1.8} />
          </mesh>

          {/* Node 4: Waste (Amber) */}
          <mesh position={[0, 1.1, -2.6]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial color="#d97706" emissive="#fbbf24" emissiveIntensity={1.8} />
          </mesh>
        </group>
      </Float>

      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 3.2}
          autoRotate={!hoveredBuilding}
          autoRotateSpeed={0.4}
        />
      )}
    </group>
  );
}
