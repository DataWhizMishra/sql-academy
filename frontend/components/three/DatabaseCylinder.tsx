'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, type Mesh } from 'three';

export function DatabaseCylinder({ spinning = true }: { spinning?: boolean }) {
  const ref = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (spinning && ref.current) {
      ref.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group position={[2.2, 0, -1]}>
      <mesh ref={ref}>
        <cylinderGeometry args={[1, 1, 2.4, 32, 1, true]} />
        <meshStandardMaterial
          color="#1e293b"
          emissive="#22c55e"
          emissiveIntensity={0.35}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.75}
          side={DoubleSide}
        />
      </mesh>
      {/* Stacked rings to read as a "database" cylinder stack */}
      {[-1.1, -0.4, 0.3, 1.0].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <torusGeometry args={[1, 0.04, 8, 32]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}
