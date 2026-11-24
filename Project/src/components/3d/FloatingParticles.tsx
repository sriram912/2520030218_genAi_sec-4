import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingParticlesProps {
  count?: number;
  color?: string;
  area?: number;
  speed?: number;
}

function createCircleTexture(): THREE.CanvasTexture {
  const size = 16;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const center = size / 2;
  const radius = size / 2 - 1;

  const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function FloatingParticles({
  count = 200,
  color = '#10b981',
  area = 20,
  speed = 1,
}: FloatingParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const { positions, colors, phases, basePositions } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const pha = new Float32Array(count);
    const base = new Float32Array(count * 3);

    const baseColor = new THREE.Color(color);

    const emeraldShades = [
      new THREE.Color('#10b981'),
      new THREE.Color('#059669'),
      new THREE.Color('#047857'),
      new THREE.Color('#6ee7b7'),
      new THREE.Color('#34d399'),
      new THREE.Color('#a7f3d0'),
    ];

    const halfArea = area / 2;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Distribute in a spherical volume
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random()) * halfArea;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos[i3] = x;
      pos[i3 + 1] = y;
      pos[i3 + 2] = z;

      base[i3] = x;
      base[i3 + 1] = y;
      base[i3 + 2] = z;

      // Random phase offset for animation variety
      pha[i] = Math.random() * Math.PI * 2;

      // Pick a random emerald shade with varying brightness
      const shade = emeraldShades[Math.floor(Math.random() * emeraldShades.length)];
      const mixed = baseColor.clone().lerp(shade, Math.random());
      const brightness = 0.5 + Math.random() * 0.5;

      col[i3] = mixed.r * brightness;
      col[i3 + 1] = mixed.g * brightness;
      col[i3 + 2] = mixed.b * brightness;
    }

    return { positions: pos, colors: col, phases: pha, basePositions: base };
  }, [count, color, area]);

  const texture = useMemo(() => createCircleTexture(), []);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  useFrame((_, delta) => {
    if (reducedMotion.current) return;
    if (!pointsRef.current) return;

    const geometry = pointsRef.current.geometry;
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const posArray = posAttr.array as Float32Array;

    const clampedDelta = Math.min(delta, 0.05);
    const halfArea = area / 2;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const phase = phases[i];

      // Gentle upward drift
      posArray[i3 + 1] += clampedDelta * 0.15 * speed;

      // Sinusoidal sway on X and Z
      const time = performance.now() * 0.001 * speed;
      const swayX = Math.sin(time * 0.3 + phase) * clampedDelta * 0.3;
      const swayZ = Math.cos(time * 0.25 + phase * 1.3) * clampedDelta * 0.25;

      posArray[i3] += swayX;
      posArray[i3 + 2] += swayZ;

      // Wrap particles that drift too far on Y back to the bottom
      if (posArray[i3 + 1] > halfArea) {
        posArray[i3 + 1] = -halfArea;
        posArray[i3] = basePositions[i3];
        posArray[i3 + 2] = basePositions[i3 + 2];
      }

      // Soft boundary clamp for X/Z
      if (Math.abs(posArray[i3]) > halfArea) {
        posArray[i3] = basePositions[i3];
      }
      if (Math.abs(posArray[i3 + 2]) > halfArea) {
        posArray[i3 + 2] = basePositions[i3 + 2];
      }
    }

    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.85}
        vertexColors
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
