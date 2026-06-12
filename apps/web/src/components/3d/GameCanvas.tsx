import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';

interface GameCanvasProps {
  children: React.ReactNode;
}

export default function GameCanvas({ children }: GameCanvasProps) {
  return (
    <div className="w-full h-full relative bg-slate-950">
      {/* 3D Canvas Context */}
      <Canvas
        shadows
        camera={{ position: [0, 8, 14], fov: 50 }}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            castShadow
            position={[10, 20, 10]}
            intensity={1.2}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <pointLight position={[-10, 10, -10]} intensity={0.3} />

          {/* Environment decoration */}
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

          {/* Scene elements */}
          {children}

          {/* Orbit controls allowed for camera adjustments */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2.1} // prevent going below ground
            minDistance={5}
            maxDistance={25}
          />
        </Suspense>
      </Canvas>

      {/* Interface Instructions Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none glass-panel p-3 rounded-lg border border-slate-800 text-[10px] text-slate-400 space-y-1 z-10">
        <span className="font-bold text-white uppercase block">Controls</span>
        <span>• WASD / Arrow Keys: Move Player</span>
        <span>• Click & Drag Mouse: Rotate Camera</span>
        <span>• Click on Objects / NPCs to inspect</span>
      </div>
    </div>
  );
}
