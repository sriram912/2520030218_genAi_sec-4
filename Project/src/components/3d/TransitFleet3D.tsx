import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface TransitFleet3DProps {
  vehicleCategory?: 'passenger_car' | 'campus_shuttle' | 'motorcycle' | 'utility_van';
  fuelType?: 'petrol' | 'diesel' | 'electric' | 'cng';
  distanceKm?: number;
  vehicleCount?: number;
  interactive?: boolean;
  scale?: number;
}

export default function TransitFleet3D({
  vehicleCategory = 'campus_shuttle',
  fuelType = 'diesel',
  distanceKm = 4200,
  vehicleCount = 4,
  interactive = true,
  scale = 1.0,
}: TransitFleet3DProps) {
  const roadTrackRef = useRef<THREE.Group>(null);
  const busGroupRef = useRef<THREE.Group>(null);
  const exhaustPlumeRef = useRef<THREE.Points>(null);

  const isElectric = fuelType === 'electric';
  const isDiesel = fuelType === 'diesel';

  // Roadway radius
  const trackRadius = 1.9;

  // Particle emission characteristics
  const emissionColor = isElectric ? '#10b981' : isDiesel ? '#64748b' : '#f59e0b';
  const emissionIntensity = isElectric ? 0.3 : isDiesel ? 0.9 : 0.6;

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.85;

    // Rotate bus along track
    if (busGroupRef.current) {
      const angle = t;
      const x = Math.cos(angle) * trackRadius;
      const z = Math.sin(angle) * trackRadius;
      busGroupRef.current.position.set(x, 0.05, z);
      // Tangent orientation
      busGroupRef.current.rotation.y = -angle + Math.PI / 2;
    }

    // Exhaust particle dissipation
    if (exhaustPlumeRef.current) {
      exhaustPlumeRef.current.rotation.y = -t * 0.9;
    }
  });

  return (
    <group scale={scale}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 7, 4]} intensity={1.2} />
      <pointLight position={[0, 2, 0]} color={isElectric ? '#10b981' : '#38bdf8'} intensity={0.8} />

      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.15}>
        {/* Tech Foundation Pedestal */}
        <mesh position={[0, -0.35, 0]}>
          <cylinderGeometry args={[2.7, 2.9, 0.25, 36]} />
          <meshStandardMaterial color="#090d16" roughness={0.8} metalness={0.5} />
        </mesh>

        {/* Circular Asphalt Roadway */}
        <group ref={roadTrackRef} position={[0, -0.2, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[trackRadius - 0.45, trackRadius + 0.45, 48]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>

          {/* Glowing Center Line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <ringGeometry args={[trackRadius - 0.02, trackRadius + 0.02, 48]} />
            <meshStandardMaterial
              color={isElectric ? '#10b981' : '#38bdf8'}
              emissive={isElectric ? '#34d399' : '#0284c7'}
              emissiveIntensity={1.2}
            />
          </mesh>

          {/* Road Curb Rings */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[trackRadius + 0.44, trackRadius + 0.48, 48]} />
            <meshStandardMaterial color="#059669" emissive="#10b981" emissiveIntensity={0.4} />
          </mesh>
        </group>

        {/* Smart Campus Shuttle Vehicle */}
        <group ref={busGroupRef}>
          {/* Main Chassis */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.55, 0.42, 1.1]} />
            <meshStandardMaterial
              color={isElectric ? '#059669' : '#0284c7'}
              roughness={0.2}
              metalness={0.7}
            />
          </mesh>

          {/* Roof Aerodynamic Cap */}
          <mesh position={[0, 0.58, 0]}>
            <boxGeometry args={[0.5, 0.06, 0.95]} />
            <meshStandardMaterial
              color={isElectric ? '#10b981' : '#38bdf8'}
              emissive={isElectric ? '#34d399' : '#0284c7'}
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* Solar Panel on EV Roof */}
          {isElectric && (
            <mesh position={[0, 0.62, 0]}>
              <boxGeometry args={[0.42, 0.02, 0.7]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.1} />
            </mesh>
          )}

          {/* Glass Windshield & Windows */}
          <mesh position={[0, 0.42, 0.48]}>
            <boxGeometry args={[0.51, 0.22, 0.16]} />
            <meshStandardMaterial
              color="#e0f2fe"
              emissive="#38bdf8"
              emissiveIntensity={0.5}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, 0.42, -0.1]}>
            <boxGeometry args={[0.56, 0.2, 0.8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.1} metalness={0.9} />
          </mesh>

          {/* Headlights (Cyan/White) */}
          <mesh position={[0.2, 0.25, 0.56]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={2.5} />
          </mesh>
          <mesh position={[-0.2, 0.25, 0.56]}>
            <sphereGeometry args={[0.045, 12, 12]} />
            <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={2.5} />
          </mesh>

          {/* Taillights (Red) */}
          <mesh position={[0.2, 0.28, -0.56]}>
            <boxGeometry args={[0.08, 0.04, 0.02]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.0} />
          </mesh>
          <mesh position={[-0.2, 0.28, -0.56]}>
            <boxGeometry args={[0.08, 0.04, 0.02]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2.0} />
          </mesh>

          {/* Wheels (4x) */}
          {[
            [-0.28, 0.12, 0.35],
            [0.28, 0.12, 0.35],
            [-0.28, 0.12, -0.35],
            [0.28, 0.12, -0.35],
          ].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.13, 0.13, 0.08, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.8} />
            </mesh>
          ))}
        </group>

        {/* Central Fleet Telemetry Beacon */}
        <group position={[0, 0.2, 0]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 0.6, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial
              color={isElectric ? '#10b981' : '#38bdf8'}
              emissive={isElectric ? '#34d399' : '#0284c7'}
              emissiveIntensity={1.8}
            />
          </mesh>
          {/* Orbital Radar Ring */}
          <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.35, 0.015, 12, 32]} />
            <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.2} />
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
