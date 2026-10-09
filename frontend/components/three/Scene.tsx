'use client';

import { Canvas } from '@react-three/fiber';
import { DatabaseCylinder } from './DatabaseCylinder';
import { FloatingTiles } from './FloatingTiles';
import { useReducedMotion } from './useReducedMotion';

// Decorative 3D background. Fixed, non-interactive (pointer-events: none),
// behind all page content (negative z-index) so it never competes with the
// editor, tables, or keyboard focus order.
export function Scene() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} color="#00f0ff" />
        <pointLight position={[-5, -3, 2]} intensity={0.6} color="#ff007f" />
        <DatabaseCylinder spinning={!reducedMotion} />
        <FloatingTiles animate={!reducedMotion} />
      </Canvas>
    </div>
  );
}
