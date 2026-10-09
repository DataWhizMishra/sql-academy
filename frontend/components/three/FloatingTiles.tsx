'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

const TILE_LETTERS = ['S', 'Q', 'L', 'A', 'C', 'E', 'D', 'B'];

interface TileSpec {
  letter: string;
  position: [number, number, number];
  speed: number;
  offset: number;
}

export function FloatingTiles({ count = 8, animate = true }: { count?: number; animate?: boolean }) {
  const groupRef = useRef<Group>(null);

  const tiles: TileSpec[] = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        letter: TILE_LETTERS[i % TILE_LETTERS.length],
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 4 - 2,
        ],
        speed: 0.4 + Math.random() * 0.4,
        offset: Math.random() * Math.PI * 2,
      })),
    [count]
  );

  useFrame(({ clock }) => {
    if (!animate || !groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((tile, i) => {
      const spec = tiles[i];
      tile.position.y = tiles[i].position[1] + Math.sin(t * spec.speed + spec.offset) * 0.3;
      tile.rotation.y = t * 0.2 + spec.offset;
    });
  });

  return (
    <group ref={groupRef}>
      {tiles.map((tile, i) => (
        <mesh key={i} position={tile.position}>
          <boxGeometry args={[0.6, 0.6, 0.12]} />
          <meshStandardMaterial color="#f8fafc" emissive="#22c55e" emissiveIntensity={0.08} />
        </mesh>
      ))}
    </group>
  );
}
