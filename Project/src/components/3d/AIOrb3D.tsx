import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface AIOrb3DProps {
  isProcessing?: boolean;
  intensity?: number;
  scale?: number;
  interactive?: boolean;
}

export default function AIOrb3D({
  isProcessing = false,
  intensity = 1.0,
  scale = 1.0,
  interactive = true,
}: AIOrb3DProps) {
  const outerRingRef = useRef<THREE.Group>(null);
  const midRingRef = useRef<THREE.Group>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const particleFieldRef = useRef<THREE.Points>(null);
  const synapticLinesRef = useRef<THREE.LineSegments>(null);

  // Generate neural synaptic nodes and connections
  const { nodePositions, linePositions, particles } = useMemo(() => {
    const nodeCount = 28;
    const nodes: THREE.Vector3[] = [];
    const radius = 1.55;

    // Golden spiral sphere distribution
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);
      nodes.push(new THREE.Vector3(x, y, z));
    }

    // Connect close neighbors
    const lineCoords: number[] = [];
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < 1.35) {
          lineCoords.push(nodes[i].x, nodes[i].y, nodes[i].z);
          lineCoords.push(nodes[j].x, nodes[j].y, nodes[j].z);
        }
      }
    }

    // Ambient floating neural particles
    const particleCount = 220;
    const pCoords = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const r = 1.4 + Math.random() * 1.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pCoords[i] = r * Math.sin(phi) * Math.cos(theta);
      pCoords[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      pCoords[i + 2] = r * Math.cos(phi);
    }

    return {
      nodePositions: nodes,
      linePositions: new Float32Array(lineCoords),
      particles: pCoords,
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const speedMult = isProcessing ? 2.4 : 1.0;

    // Rings rotation
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = t * 0.35 * speedMult;
      outerRingRef.current.rotation.y = t * 0.25 * speedMult;
    }
    if (midRingRef.current) {
      midRingRef.current.rotation.y = -t * 0.45 * speedMult;
      midRingRef.current.rotation.z = t * 0.3 * speedMult;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = t * 0.55 * speedMult;
      innerRingRef.current.rotation.x = -t * 0.4 * speedMult;
    }

    // Core pulsing
    if (coreRef.current) {
      const pulseRate = isProcessing ? 6.0 : 2.5;
      const pulse = 1.0 + Math.sin(t * pulseRate) * (isProcessing ? 0.12 : 0.05);
      coreRef.current.scale.set(pulse, pulse, pulse);
      const mat = coreRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity = isProcessing
          ? 1.5 + Math.sin(t * 8) * 0.6
          : 0.6 + Math.sin(t * 2) * 0.2;
      }
    }

    // Particle swirl
    if (particleFieldRef.current) {
      particleFieldRef.current.rotation.y = t * 0.15 * speedMult;
      particleFieldRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
    }

    // Synaptic web flex
    if (synapticLinesRef.current) {
      synapticLinesRef.current.rotation.y = -t * 0.2 * speedMult;
    }
  });

  return (
    <group scale={scale}>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 5, 4]} intensity={1.5 * intensity} color="#34d399" />
      <pointLight position={[-4, -3, -3]} intensity={1.0 * intensity} color="#38bdf8" />
      <pointLight position={[0, 0, 0]} intensity={isProcessing ? 3.0 : 1.2} color="#10b981" distance={6} />

      <Float speed={isProcessing ? 3.5 : 1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        {/* Core Neural Nucleus */}
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[0.95, 2]} />
          <meshStandardMaterial
            color={isProcessing ? '#10b981' : '#047857'}
            emissive={isProcessing ? '#34d399' : '#059669'}
            emissiveIntensity={0.8}
            roughness={0.2}
            metalness={0.8}
            wireframe={false}
          />
        </mesh>

        {/* Crystalline inner shell */}
        <mesh>
          <dodecahedronGeometry args={[1.25, 0]} />
          <meshStandardMaterial
            color="#064e3b"
            emissive="#10b981"
            emissiveIntensity={0.4}
            wireframe={true}
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* Synaptic Node Network */}
        <group ref={synapticLinesRef}>
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[linePositions, 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={isProcessing ? '#6ee7b7' : '#10b981'}
              transparent
              opacity={isProcessing ? 0.75 : 0.45}
              linewidth={1}
            />
          </lineSegments>

          {nodePositions.map((pos, idx) => (
            <mesh key={idx} position={[pos.x, pos.y, pos.z]}>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshStandardMaterial
                color="#6ee7b7"
                emissive="#34d399"
                emissiveIntensity={isProcessing ? 2.0 : 1.0}
              />
            </mesh>
          ))}
        </group>

        {/* Orbit Ring 1 - Quantum Emerald */}
        <group ref={outerRingRef}>
          <mesh>
            <torusGeometry args={[1.85, 0.022, 16, 100]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#34d399"
              emissiveIntensity={1.2}
              roughness={0.1}
            />
          </mesh>
          {/* Small orbital beacon */}
          <mesh position={[1.85, 0, 0]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshStandardMaterial color="#ecfdf5" emissive="#34d399" emissiveIntensity={2.5} />
          </mesh>
        </group>

        {/* Orbit Ring 2 - Cyan Intelligence */}
        <group ref={midRingRef} rotation={[Math.PI / 4, 0, 0]}>
          <mesh>
            <torusGeometry args={[2.1, 0.018, 16, 100]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#38bdf8"
              emissiveIntensity={1.1}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[-2.1, 0, 0]}>
            <sphereGeometry args={[0.065, 12, 12]} />
            <meshStandardMaterial color="#e0f2fe" emissive="#38bdf8" emissiveIntensity={2.2} />
          </mesh>
        </group>

        {/* Orbit Ring 3 - Violet Synthesis */}
        <group ref={innerRingRef} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
          <mesh>
            <torusGeometry args={[2.35, 0.015, 16, 100]} />
            <meshStandardMaterial
              color="#7c3aed"
              emissive="#a855f7"
              emissiveIntensity={0.9}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Neural Particle Cloud */}
        <points ref={particleFieldRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[particles, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.045}
            color={isProcessing ? '#6ee7b7' : '#34d399'}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </Float>

      {interactive && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          rotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      )}
    </group>
  );
}
