import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface ServerNode3DProps {
  dbConnected?: boolean;
  aiConnected?: boolean;
  latencyMs?: number;
  interactive?: boolean;
  scale?: number;
}

export default function ServerNode3D({
  dbConnected = true,
  aiConnected = true,
  latencyMs = 18,
  interactive = true,
  scale = 1.0,
}: ServerNode3DProps) {
  const rackRef = useRef<THREE.Group>(null);
  const dataBusRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.PointLight>(null);

  const statusColor = dbConnected ? '#10b981' : '#ef4444';
  const statusEmissive = dbConnected ? '#34d399' : '#f87171';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Rotate optical data bus ring
    if (dataBusRef.current) {
      dataBusRef.current.rotation.y = t * 0.45;
    }

    // Activity LEDs pulse on server blades
    if (rackRef.current) {
      rackRef.current.children.forEach((child, i) => {
        if (child.type === 'Mesh' && child.name === 'led') {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat) {
            mat.emissiveIntensity = 0.5 + Math.sin(t * 5 + i * 2) * 0.5;
          }
        }
      });
    }

    // Ping beacon
    if (beaconRef.current) {
      beaconRef.current.intensity = 1.0 + Math.sin(t * 3) * 0.5;
    }
  });

  return (
    <group scale={scale}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 6]} intensity={1.2} />
      <pointLight
        ref={beaconRef}
        position={[0, 1.8, 0]}
        color={statusColor}
        intensity={1.2}
        distance={6}
      />
      <pointLight position={[0, -1, 0]} color="#38bdf8" intensity={0.8} distance={5} />

      <Float speed={1.2} rotationIntensity={0.08} floatIntensity={0.15}>
        {/* Foundation Base Hexagon */}
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[2.5, 2.7, 0.25, 6]} />
          <meshStandardMaterial color="#090d16" roughness={0.7} metalness={0.6} />
        </mesh>

        {/* Server Rack Core Group */}
        <group ref={rackRef}>
          {/* Main 3 High-Density Blade Towers in Hex Array */}
          {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, i) => {
            const x = Math.cos(angle) * 0.95;
            const z = Math.sin(angle) * 0.95;
            return (
              <group key={i} position={[x, 0.45, z]} rotation={[0, -angle + Math.PI / 2, 0]}>
                {/* Tower Frame */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.55, 1.5, 0.45]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
                </mesh>

                {/* Server Blade Slots */}
                {[-0.5, -0.25, 0, 0.25, 0.5].map((y, slotIdx) => (
                  <mesh key={slotIdx} position={[0, y, 0.23]}>
                    <boxGeometry args={[0.48, 0.18, 0.02]} />
                    <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
                  </mesh>
                ))}

                {/* Activity LED arrays */}
                {[-0.5, -0.25, 0, 0.25, 0.5].map((y, slotIdx) => (
                  <mesh
                    key={`led-${slotIdx}`}
                    name="led"
                    position={[-0.18, y, 0.245]}
                  >
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshStandardMaterial
                      color={statusColor}
                      emissive={statusEmissive}
                      emissiveIntensity={1.2}
                    />
                  </mesh>
                ))}
              </group>
            );
          })}

          {/* Central Holographic Database Core */}
          <group position={[0, 0.45, 0]}>
            <mesh>
              <cylinderGeometry args={[0.28, 0.28, 1.2, 16]} />
              <meshStandardMaterial
                color="#047857"
                emissive="#10b981"
                emissiveIntensity={0.6}
                transparent
                opacity={0.4}
                wireframe={true}
              />
            </mesh>
            {/* Spinning data crystal */}
            <mesh>
              <octahedronGeometry args={[0.2, 0]} />
              <meshStandardMaterial
                color="#ecfdf5"
                emissive={aiConnected ? '#38bdf8' : '#10b981'}
                emissiveIntensity={2.0}
              />
            </mesh>
          </group>
        </group>

        {/* Optical Data Bus Ring */}
        <group ref={dataBusRef} position={[0, 0.45, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.8, 0.015, 12, 48]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#38bdf8"
              emissiveIntensity={1.4}
            />
          </mesh>
          {/* Fiber optical packets */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((ang, idx) => (
            <mesh key={idx} position={[Math.cos(ang) * 1.8, 0, Math.sin(ang) * 1.8]}>
              <sphereGeometry args={[0.045, 10, 10]} />
              <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={2.5} />
            </mesh>
          ))}
        </group>

        {/* Top Antenna Beacon (Latency telemetry) */}
        <group position={[0, 1.3, 0]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.03, 0.05, 0.4, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial
              color={statusColor}
              emissive={statusEmissive}
              emissiveIntensity={2.2}
            />
          </mesh>
        </group>
      </Float>

      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.15}
          minPolarAngle={Math.PI / 3.0}
          autoRotate
          autoRotateSpeed={0.5}
        />
      )}
    </group>
  );
}
