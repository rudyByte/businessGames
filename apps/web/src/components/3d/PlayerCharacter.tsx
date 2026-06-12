import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerCharacterProps {
  position: [number, number, number];
  onPositionChange: (pos: [number, number, number]) => void;
}

export default function PlayerCharacter({ position, onPositionChange }: PlayerCharacterProps) {
  const meshRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  // Keyboard state
  const keys = useRef({ w: false, a: false, s: false, d: false });
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') keys.current.w = true;
      if (k === 'a' || e.key === 'ArrowLeft') keys.current.a = true;
      if (k === 's' || e.key === 'ArrowDown') keys.current.s = true;
      if (k === 'd' || e.key === 'ArrowRight') keys.current.d = true;
      
      const moving = keys.current.w || keys.current.a || keys.current.s || keys.current.d;
      setIsMoving(moving);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') keys.current.w = false;
      if (k === 'a' || e.key === 'ArrowLeft') keys.current.a = false;
      if (k === 's' || e.key === 'ArrowDown') keys.current.s = false;
      if (k === 'd' || e.key === 'ArrowRight') keys.current.d = false;

      const moving = keys.current.w || keys.current.a || keys.current.s || keys.current.d;
      setIsMoving(moving);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const speed = 6 * delta;
    let dx = 0;
    let dz = 0;

    if (keys.current.w) dz = -speed;
    if (keys.current.s) dz = speed;
    if (keys.current.a) dx = -speed;
    if (keys.current.d) dx = speed;

    // Apply translation
    if (dx !== 0 || dz !== 0) {
      const currentPos = meshRef.current.position;
      const nextX = THREE.MathUtils.clamp(currentPos.x + dx, -15, 15);
      const nextZ = THREE.MathUtils.clamp(currentPos.z + dz, -15, 15);

      meshRef.current.position.set(nextX, currentPos.y, nextZ);

      // Rotate player in movement direction
      const angle = Math.atan2(dx, dz);
      meshRef.current.rotation.y = angle;

      // Animate legs (walking motion)
      const walkCycle = Math.sin(state.clock.getElapsedTime() * 12);
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = walkCycle * 0.5;
        rightLegRef.current.rotation.x = -walkCycle * 0.5;
      }
      
      onPositionChange([nextX, currentPos.y, nextZ]);
    } else {
      // Return legs to neutral standing position
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Head */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#E8B490" roughness={0.4} />
      </mesh>

      {/* Hair (procedural cap style) */}
      <mesh position={[0, 2.4, 0.05]} castShadow>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#1e1e24" roughness={0.9} />
      </mesh>

      {/* Body / School Uniform Shirt */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[0.6, 1.0, 0.4]} />
        <meshStandardMaterial color="#E0F2FE" roughness={0.6} /> {/* sky blue shirt */}
      </mesh>

      {/* Uniform Shorts */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.62, 0.3, 0.42]} />
        <meshStandardMaterial color="#1E3A8A" roughness={0.6} /> {/* dark blue shorts */}
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.18, 0.3, 0]} castShadow>
        <boxGeometry args={[0.16, 0.6, 0.16]} />
        <meshStandardMaterial color="#E8B490" />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.18, 0.3, 0]} castShadow>
        <boxGeometry args={[0.16, 0.6, 0.16]} />
        <meshStandardMaterial color="#E8B490" />
      </mesh>
    </group>
  );
}
