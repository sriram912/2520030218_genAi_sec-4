import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── Atmosphere Shader (Fresnel rim glow) ────────────────────────
const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    // Fresnel-like rim glow: brighter at edges, transparent at center
    float intensity = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
    // Emerald color: rgb(16, 185, 129) normalized
    vec3 emerald = vec3(0.063, 0.725, 0.506);
    gl_FragColor = vec4(emerald, intensity * 0.6);
  }
`;

// ── Orbiting Data Points ────────────────────────────────────────
function OrbitingPoints({ count, radius }: { count: number; radius: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, speeds, offsets } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const off = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Random spherical distribution for orbit paths
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius + (Math.random() - 0.5) * 0.3;

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Each dot has a unique orbit speed and axis offset
      spd[i] = 0.0003 + Math.random() * 0.001;
      off[i * 3] = (Math.random() - 0.5) * 0.1;
      off[i * 3 + 1] = (Math.random() - 0.5) * 0.1;
      off[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    }

    return { positions: pos, speeds: spd, offsets: off };
  }, [count, radius]);

  useFrame((_state, delta) => {
    if (!pointsRef.current) return;

    const posArray = pointsRef.current.geometry.attributes.position
      .array as Float32Array;
    const clampedDelta = Math.min(delta, 0.1);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const x = posArray[idx];
      const y = posArray[idx + 1];
      const z = posArray[idx + 2];

      // Rotate each point around Y axis at its own speed
      const speed = speeds[i] * clampedDelta * 60;
      const cosS = Math.cos(speed);
      const sinS = Math.sin(speed);

      posArray[idx] = x * cosS - z * sinS + offsets[idx] * 0.001;
      posArray[idx + 1] = y + offsets[idx + 1] * 0.001;
      posArray[idx + 2] = x * sinS + z * cosS + offsets[idx + 2] * 0.001;

      // Keep points at roughly the same distance from center
      const dist = Math.sqrt(
        posArray[idx] ** 2 + posArray[idx + 1] ** 2 + posArray[idx + 2] ** 2
      );
      const targetR = radius + (Math.random() - 0.5) * 0.02;
      const correction = targetR / Math.max(dist, 0.001);
      const lerpFactor = 0.01;
      posArray[idx] *= 1 + (correction - 1) * lerpFactor;
      posArray[idx + 1] *= 1 + (correction - 1) * lerpFactor;
      posArray[idx + 2] *= 1 + (correction - 1) * lerpFactor;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const pointTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(110, 231, 183, 1)');
    gradient.addColorStop(0.4, 'rgba(110, 231, 183, 0.6)');
    gradient.addColorStop(1, 'rgba(110, 231, 183, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }, []);

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        map={pointTexture}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
}

// ── Main Earth3D Component ──────────────────────────────────────
export default function Earth3D({
  scale = 1,
  rotationSpeed = 0.001,
  showAtmosphere = true,
}: {
  scale?: number;
  rotationSpeed?: number;
  showAtmosphere?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const wireframeRef = useRef<THREE.Mesh>(null);

  // Check for reduced motion preference
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const effectiveSpeed = prefersReducedMotion ? 0 : rotationSpeed;

  // Shared sphere geometries (memoized to avoid re-creation)
  const baseSphereGeo = useMemo(() => new THREE.SphereGeometry(1, 64, 64), []);
  const wireframeSphereGeo = useMemo(
    () => new THREE.SphereGeometry(1.005, 32, 32),
    []
  );
  const atmosphereSphereGeo = useMemo(
    () => new THREE.SphereGeometry(1.12, 64, 64),
    []
  );

  // Atmosphere shader material (memoized)
  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        side: THREE.BackSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  // Auto-rotation
  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const clampedDelta = Math.min(delta, 0.1);
    groupRef.current.rotation.y += effectiveSpeed * clampedDelta * 60;

    // Subtle counter-rotation on wireframe for parallax depth
    if (wireframeRef.current) {
      wireframeRef.current.rotation.y -= effectiveSpeed * 0.3 * clampedDelta * 60;
    }
  });

  return (
    <group ref={groupRef} scale={scale}>
      {/* Base Ocean Sphere — dark blue-green */}
      <mesh geometry={baseSphereGeo}>
        <meshStandardMaterial
          color="#0a1628"
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {/* Wireframe Overlay — emerald continent feel */}
      <mesh ref={wireframeRef} geometry={wireframeSphereGeo}>
        <meshBasicMaterial
          color="#10b981"
          wireframe
          transparent
          opacity={0.12}
          depthWrite={false}
        />
      </mesh>

      {/* Second wireframe layer — denser grid for more detail */}
      <mesh geometry={wireframeSphereGeo} rotation={[0.3, 0.7, 0.1]}>
        <meshBasicMaterial
          color="#059669"
          wireframe
          transparent
          opacity={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere Fresnel Glow */}
      {showAtmosphere && (
        <mesh geometry={atmosphereSphereGeo} material={atmosphereMaterial} />
      )}

      {/* Inner subtle glow (front-face Fresnel for depth) */}
      {showAtmosphere && (
        <mesh>
          <sphereGeometry args={[1.04, 64, 64]} />
          <shaderMaterial
            vertexShader={atmosphereVertexShader}
            fragmentShader={`
              varying vec3 vNormal;
              varying vec3 vPosition;
              void main() {
                float intensity = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
                vec3 emerald = vec3(0.063, 0.725, 0.506);
                gl_FragColor = vec4(emerald, intensity * 0.25);
              }
            `}
            side={THREE.FrontSide}
            transparent
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Orbiting Data Points */}
      <OrbitingPoints count={40} radius={1.5} />
    </group>
  );
}
