import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface EnergyGrid3DProps {
  kwh?: number;
  interactive?: boolean;
  scale?: number;
}

export default function EnergyGrid3D({
  kwh = 12500,
  interactive = true,
  scale = 1.0,
}: EnergyGrid3DProps) {
  const pylonRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const coilRef = useRef<THREE.Group>(null);
  const surgeLightRef = useRef<THREE.PointLight>(null);

  // Speed and particle glow scales with consumption
  const flowSpeed = useMemo(() => {
    return Math.max(0.6, Math.min(3.5, 0.6 + (kwh / 25000) * 2.0));
  }, [kwh]);

  // Cable paths and electrical spark particles
  const { cableCurves, sparkPositions } = useMemo(() => {
    // 3 catenary cables between two towers
    const p1 = new THREE.Vector3(-2.2, 1.8, -0.6);
    const p2 = new THREE.Vector3(-2.2, 1.8, 0.6);
    const p3 = new THREE.Vector3(-2.2, 2.3, 0.0);

    const q1 = new THREE.Vector3(2.2, 1.8, -0.6);
    const q2 = new THREE.Vector3(2.2, 1.8, 0.6);
    const q3 = new THREE.Vector3(2.2, 2.3, 0.0);

    const c1 = new THREE.QuadraticBezierCurve3(p1, new THREE.Vector3(0, 1.35, -0.6), q1);
    const c2 = new THREE.QuadraticBezierCurve3(p2, new THREE.Vector3(0, 1.35, 0.6), q2);
    const c3 = new THREE.QuadraticBezierCurve3(p3, new THREE.Vector3(0, 1.85, 0.0), q3);

    const sparkCount = 180;
    const positions = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      const curve = i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3;
      const point = curve.getPoint(Math.random());
      positions[i * 3] = point.x + (Math.random() - 0.5) * 0.06;
      positions[i * 3 + 1] = point.y + (Math.random() - 0.5) * 0.06;
      positions[i * 3 + 2] = point.z + (Math.random() - 0.5) * 0.06;
    }

    return {
      cableCurves: [c1, c2, c3],
      sparkPositions: positions,
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * flowSpeed;

    // Pulse transformer coils
    if (coilRef.current) {
      coilRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.emissiveIntensity = 0.8 + Math.sin(t * 3 + i * 1.5) * 0.5;
        }
      });
    }

    // Surge pulse on electrical lines
    if (surgeLightRef.current) {
      surgeLightRef.current.intensity = 1.0 + Math.sin(t * 4) * 0.6;
    }

    // Advance electrical spark particles along cables
    if (particlesRef.current) {
      const posAttr = particlesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      const array = posAttr.array as Float32Array;

      for (let i = 0; i < array.length / 3; i++) {
        // Shift along x
        array[i * 3] += 0.04 * flowSpeed;
        if (array[i * 3] > 2.2) {
          array[i * 3] = -2.2;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group scale={scale}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 4]} intensity={1.0} />
      <pointLight
        ref={surgeLightRef}
        position={[0, 1.6, 0]}
        color="#38bdf8"
        intensity={1.2}
        distance={6}
      />
      <pointLight position={[0, -0.5, 0]} color="#10b981" intensity={0.8} distance={4} />

      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Ground Platform Podium */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[2.8, 3.0, 0.25, 32]} />
          <meshStandardMaterial color="#090d16" roughness={0.7} metalness={0.4} />
        </mesh>
        <mesh position={[0, -0.47, 0]}>
          <cylinderGeometry args={[2.7, 2.7, 0.02, 32]} />
          <meshStandardMaterial
            color="#047857"
            emissive="#10b981"
            emissiveIntensity={0.6}
            wireframe={true}
          />
        </mesh>

        {/* Transmission Tower Left */}
        <group position={[-2.2, 0.6, 0]} ref={pylonRef}>
          {/* Main vertical strut */}
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.07, 0.14, 2.4, 6]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Crossbars */}
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.1, 0.08, 1.4]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.7, 0]}>
            <boxGeometry args={[0.08, 0.06, 0.9]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {/* Insulators */}
          {[-0.6, 0.6].map((z, idx) => (
            <mesh key={idx} position={[0, 1.1, z]}>
              <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
              <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.8} />
            </mesh>
          ))}
        </group>

        {/* Transmission Tower Right */}
        <group position={[2.2, 0.6, 0]}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.07, 0.14, 2.4, 6]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <boxGeometry args={[0.1, 0.08, 1.4]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          <mesh position={[0, 1.7, 0]}>
            <boxGeometry args={[0.08, 0.06, 0.9]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          {[-0.6, 0.6].map((z, idx) => (
            <mesh key={idx} position={[0, 1.1, z]}>
              <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
              <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.8} />
            </mesh>
          ))}
        </group>

        {/* Central Transformer Substation Station */}
        <group position={[0, 0, 0]} ref={coilRef}>
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[1.2, 0.7, 0.9]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
          </mesh>
          {/* Cooling fins */}
          {[-0.35, -0.12, 0.12, 0.35].map((x, i) => (
            <mesh key={i} position={[x, -0.1, 0.47]}>
              <boxGeometry args={[0.04, 0.5, 0.08]} />
              <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.7} />
            </mesh>
          ))}
          {/* Step-up Coils */}
          {[-0.3, 0, 0.3].map((x, i) => (
            <mesh key={i} position={[x, 0.42, 0]}>
              <cylinderGeometry args={[0.14, 0.14, 0.35, 16]} />
              <meshStandardMaterial
                color="#065f46"
                emissive="#10b981"
                emissiveIntensity={1.2}
                metalness={0.7}
              />
            </mesh>
          ))}
        </group>

        {/* Flowing High Voltage Cables */}
        {cableCurves.map((curve, idx) => (
          <mesh key={idx}>
            <tubeGeometry args={[curve, 40, 0.018, 8, false]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#38bdf8"
              emissiveIntensity={0.7}
              metalness={0.9}
            />
          </mesh>
        ))}

        {/* Electrical Current Particles */}
        <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[sparkPositions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.065}
            color="#38bdf8"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
          />
        </points>
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
