import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Building } from '../../types';

interface CampusModel3DProps {
  onBuildingClick?: (id: number) => void;
  selectedBuildingId?: number | null;
  buildingData?: Building[];
  isSimulationMode?: boolean;
  simulationImprovements?: {
    electricity_reduction?: number;
    solar_increase?: number;
    greening_factor?: number;
  };
  miniature?: boolean;
  overlayMode?: 'default' | 'emissions' | 'score' | 'stale';
}

// Building architectural specs
interface BuildingSpec {
  id: number;
  name: string;
  type: string;
  pos: [number, number, number];
  size: [number, number, number];
  floors: number;
  hasSolar: boolean;
  baseColor: string;
  roofColor: string;
}

const BUILDING_SPECS: BuildingSpec[] = [
  { id: 1, name: 'Science Building', type: 'laboratory', pos: [-7, 0, -5], size: [3.4, 2.6, 2.8], floors: 4, hasSolar: true, baseColor: '#0f3a40', roofColor: '#134e4a' },
  { id: 2, name: 'Engineering Block', type: 'academic', pos: [-2, 0, -7], size: [4.2, 3.2, 3.2], floors: 5, hasSolar: true, baseColor: '#113e38', roofColor: '#064e3b' },
  { id: 3, name: 'Library', type: 'academic', pos: [3.5, 0, -5], size: [3.2, 2.0, 3.0], floors: 3, hasSolar: true, baseColor: '#134e4a', roofColor: '#047857' },
  { id: 4, name: 'Student Center', type: 'recreational', pos: [7.5, 0, -2], size: [3.0, 1.6, 2.6], floors: 2, hasSolar: true, baseColor: '#1e3a5f', roofColor: '#0f766e' },
  { id: 5, name: 'Administration', type: 'administrative', pos: [-7.5, 0, 2], size: [2.8, 2.2, 2.4], floors: 3, hasSolar: false, baseColor: '#1e293b', roofColor: '#334155' },
  { id: 6, name: 'Sports Complex', type: 'recreational', pos: [-2.5, 0, 5], size: [4.6, 1.5, 3.4], floors: 2, hasSolar: true, baseColor: '#164e63', roofColor: '#0e7490' },
  { id: 7, name: 'Dormitory A', type: 'residential', pos: [3, 0, 6.5], size: [3.2, 3.8, 2.6], floors: 6, hasSolar: true, baseColor: '#14532d', roofColor: '#166534' },
  { id: 8, name: 'Cafeteria', type: 'dining', pos: [7.5, 0, 4.5], size: [2.6, 1.2, 2.4], floors: 1, hasSolar: false, baseColor: '#312e81', roofColor: '#059669' },
  { id: 9, name: 'Research Lab', type: 'laboratory', pos: [0, 0, -0.5], size: [3.6, 2.8, 3.0], floors: 4, hasSolar: true, baseColor: '#064e3b', roofColor: '#10b981' },
  { id: 10, name: 'Auditorium', type: 'academic', pos: [5, 0, -8], size: [3.0, 1.8, 3.2], floors: 2, hasSolar: false, baseColor: '#1f2937', roofColor: '#047857' },
];

// Single interactive building with procedural windows, roof details, solar panels & hover effects
function BuildingMesh({
  spec,
  isSelected,
  onClick,
  liveData,
  isSimulationMode,
  electricityReduction = 0,
  overlayMode = 'default',
}: {
  spec: BuildingSpec;
  isSelected: boolean;
  onClick: () => void;
  liveData?: Building;
  isSimulationMode?: boolean;
  electricityReduction?: number;
  overlayMode?: 'default' | 'emissions' | 'score' | 'stale';
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  const [w, h, d] = spec.size;

  // Compute sustainability visual score
  const score = liveData?.sustainability_score ?? 70;
  const isHighPerformer = score >= 75;

  // Simulation glow color
  const simulatedGlow = electricityReduction > 15;

  // Smooth bounce / hover lift
  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const targetY = isSelected ? 0.35 : hovered ? 0.18 : 0;
    meshRef.current.position.y = THREE.MathUtils.damp(meshRef.current.position.y, targetY, 8, delta);
  });

  // Calculate overlay material color
  let bodyColor = spec.baseColor;
  let emissiveColor = new THREE.Color(spec.baseColor);

  if (overlayMode === 'emissions') {
    const elec = Number(liveData?.latest_electricity || 12000);
    if (elec > 13000) {
      bodyColor = '#dc2626';
      emissiveColor = new THREE.Color('#991b1b');
    } else if (elec > 9000) {
      bodyColor = '#d97706';
      emissiveColor = new THREE.Color('#b45309');
    } else {
      bodyColor = '#10b981';
      emissiveColor = new THREE.Color('#059669');
    }
  } else if (overlayMode === 'score') {
    if (score >= 75) {
      bodyColor = '#10b981';
      emissiveColor = new THREE.Color('#059669');
    } else if (score >= 68) {
      bodyColor = '#0ea5e9';
      emissiveColor = new THREE.Color('#0284c7');
    } else {
      bodyColor = '#f59e0b';
      emissiveColor = new THREE.Color('#d97706');
    }
  } else if (overlayMode === 'stale') {
    const hasData = Boolean(liveData?.latest_electricity);
    bodyColor = hasData ? '#334155' : '#e11d48';
    emissiveColor = hasData ? new THREE.Color('#1e293b') : new THREE.Color('#be123c');
  } else {
    if (isSelected) {
      bodyColor = '#10b981';
      emissiveColor = new THREE.Color('#059669');
    } else if (hovered) {
      bodyColor = '#34d399';
      emissiveColor = new THREE.Color('#047857');
    } else if (simulatedGlow) {
      bodyColor = '#059669';
      emissiveColor = new THREE.Color('#10b981');
    }
  }

  return (
    <group
      ref={meshRef}
      position={[spec.pos[0], 0, spec.pos[2]]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Main Building Body */}
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={emissiveColor}
          emissiveIntensity={isSelected ? 0.6 : hovered ? 0.4 : simulatedGlow ? 0.3 : 0.2}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Building Edges Glow Highlight when Selected */}
      {isSelected && (
        <lineSegments position={[0, h / 2, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(w + 0.05, h + 0.05, d + 0.05)]} />
          <lineBasicMaterial color="#6ee7b7" linewidth={2} />
        </lineSegments>
      )}

      {/* Glass Windows Strips */}
      {Array.from({ length: spec.floors }).map((_, fIdx) => {
        const floorY = ((fIdx + 0.5) / spec.floors) * h;
        return (
          <group key={fIdx} position={[0, floorY, 0]}>
            {/* Front & Back windows */}
            <mesh position={[0, 0, d / 2 + 0.02]}>
              <planeGeometry args={[w * 0.85, 0.22]} />
              <meshStandardMaterial
                color="#6ee7b7"
                emissive="#34d399"
                emissiveIntensity={hovered || isSelected ? 0.9 : 0.4}
                roughness={0.1}
              />
            </mesh>
            <mesh position={[0, 0, -d / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[w * 0.85, 0.22]} />
              <meshStandardMaterial
                color="#6ee7b7"
                emissive="#34d399"
                emissiveIntensity={hovered || isSelected ? 0.9 : 0.4}
                roughness={0.1}
              />
            </mesh>
          </group>
        );
      })}

      {/* Roof cap */}
      <mesh position={[0, h + 0.08, 0]} castShadow>
        <boxGeometry args={[w * 1.04, 0.16, d * 1.04]} />
        <meshStandardMaterial color={spec.roofColor} roughness={0.6} />
      </mesh>

      {/* Rooftop Solar Panels */}
      {(spec.hasSolar || (isSimulationMode && (liveData?.solar_panels ?? 0) > 0)) && (
        <group position={[0, h + 0.2, 0]}>
          {[-w * 0.25, 0, w * 0.25].map((xOffset, idx) => (
            <mesh key={idx} position={[xOffset, 0, 0]} rotation={[-Math.PI / 8, 0, 0]}>
              <boxGeometry args={[w * 0.22, 0.04, d * 0.45]} />
              <meshStandardMaterial
                color="#1e3a8a"
                emissive="#2563eb"
                emissiveIntensity={0.3}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Hover Floating Pin / Status */}
      {(hovered || isSelected) && (
        <Html position={[0, h + 1.2, 0]} center distanceFactor={16}>
          <div className="pointer-events-none px-3 py-1.5 rounded-lg bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs shadow-xl backdrop-blur-md whitespace-nowrap flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isHighPerformer ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span className="font-semibold text-slate-100">{spec.name}</span>
            <span className="text-emerald-400 font-mono text-[10px]">
              {score}/100
            </span>
          </div>
        </Html>
      )}

      {/* Building Base Label */}
      <Text
        position={[0, 0.05, d / 2 + 0.6]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.28}
        color={isSelected ? '#34d399' : '#94a3b8'}
        anchorX="center"
        anchorY="middle"
      >
        {spec.name}
      </Text>
    </group>
  );
}

// Wind Turbine with spinning blades
function WindTurbine({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const bladesRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (bladesRef.current) {
      bladesRef.current.rotation.z += 1.8 * delta;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Tower pole */}
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.16, 5, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Nacelle hub */}
      <mesh position={[0, 5, 0]} castShadow>
        <boxGeometry args={[0.4, 0.35, 0.6]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* Spinning Blades */}
      <group ref={bladesRef} position={[0, 5, 0.35]}>
        {[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3].map((angle, idx) => (
          <group key={idx} rotation={[0, 0, angle]}>
            <mesh position={[0, 1.2, 0]}>
              <boxGeometry args={[0.1, 2.3, 0.03]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// Procedural Tree
function CampusTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.14, 0.8, 8]} />
        <meshStandardMaterial color="#573824" roughness={0.9} />
      </mesh>
      {/* Foliage Cones / Spheres */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <coneGeometry args={[0.65, 1.2, 8]} />
        <meshStandardMaterial color="#065f46" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.8, 0]} castShadow>
        <coneGeometry args={[0.48, 1.0, 8]} />
        <meshStandardMaterial color="#047857" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Procedural Road Network
function RoadNetwork() {
  return (
    <group position={[0, 0.015, 0]}>
      {/* East-West Main Avenue */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 1.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* North-South Boulevard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.4, 22]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Secondary Ring Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5.5]} receiveShadow>
        <planeGeometry args={[22, 0.9]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 5.5]} receiveShadow>
        <planeGeometry args={[22, 0.9]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      {/* Pedestrian Pathways */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.5, 0, 0]} receiveShadow>
        <planeGeometry args={[0.6, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.5, 0, 0]} receiveShadow>
        <planeGeometry args={[0.6, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
    </group>
  );
}

export default function CampusModel3D({
  onBuildingClick,
  selectedBuildingId,
  buildingData = [],
  isSimulationMode = false,
  simulationImprovements = {},
  miniature = false,
  overlayMode = 'default',
}: CampusModel3DProps) {
  // Map building data by ID
  const dataMap = useMemo(() => {
    const map = new Map<number, Building>();
    buildingData.forEach((b) => map.set(b.id, b));
    return map;
  }, [buildingData]);

  // Tree coordinates spread naturally around walkways and open plazas
  const trees = useMemo(() => {
    return [
      [-10, 0, -8], [-9, 0, -2], [-10, 0, 4], [-9, 0, 7],
      [-5, 0, -8], [-4.5, 0, -2.5], [-4.8, 0, 2.5], [-5, 0, 8],
      [0, 0, -7], [0, 0, 7],
      [5, 0, -2.5], [4.8, 0, 2.5], [5, 0, 8],
      [9.5, 0, -7], [10, 0, -3], [10, 0, 2], [9.5, 0, 7],
      [-1.5, 0, -2.5], [1.5, 0, -2.5], [-1.5, 0, 2.5], [1.5, 0, 2.5],
      [-11, 0, 0], [11, 0, 0]
    ] as [number, number, number][];
  }, []);

  return (
    <group scale={miniature ? 0.45 : 1}>
      {/* Campus Ground Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[30, 26]} />
        <meshStandardMaterial
          color="#031518"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>

      {/* Subtle Tech Grid overlay */}
      <gridHelper
        args={[28, 28, '#059669', '#064e3b']}
        position={[0, 0.005, 0]}
      />

      {/* Roads and pedestrian avenues */}
      <RoadNetwork />

      {/* 10 Interactive Campus Buildings */}
      {BUILDING_SPECS.map((spec) => (
        <BuildingMesh
          key={spec.id}
          spec={spec}
          isSelected={selectedBuildingId === spec.id}
          onClick={() => onBuildingClick?.(spec.id)}
          liveData={dataMap.get(spec.id)}
          isSimulationMode={isSimulationMode}
          overlayMode={overlayMode}
          electricityReduction={
            selectedBuildingId === spec.id || !selectedBuildingId
              ? simulationImprovements.electricity_reduction
              : 0
          }
        />
      ))}

      {/* Wind Turbines on Campus Perimeter */}
      <WindTurbine position={[-11, 0, -9]} scale={0.95} />
      <WindTurbine position={[11, 0, -9]} scale={0.95} />
      <WindTurbine position={[11, 0, 9]} scale={0.85} />

      {/* Trees & Landscaping */}
      {trees.map((pos, idx) => (
        <CampusTree
          key={idx}
          position={pos}
          scale={0.75 + (idx % 4) * 0.15}
        />
      ))}

      {/* Central Solar Canopy installation */}
      <group position={[0, 0.8, 3]}>
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 10, 0, 0]}>
          <boxGeometry args={[3.2, 0.08, 1.8]} />
          <meshStandardMaterial
            color="#1e3a8a"
            emissive="#2563eb"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
        <mesh position={[-1.4, -0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <mesh position={[1.4, -0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
      </group>
    </group>
  );
}
