import React from 'react';

interface HomeSceneProps {
  playerPosition: [number, number, number];
  onInteract?: (clueId: string, details: any) => void;
}

export default function HomeScene({ playerPosition, onInteract }: HomeSceneProps) {
  return (
    <group>
      {/* Wooden Floor Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#8B5A2B" roughness={0.7} />
      </mesh>

      {/* House Exterior Walls */}
      <mesh position={[0, 3, -10]} castShadow receiveShadow>
        <boxGeometry args={[16, 6, 1]} />
        <meshStandardMaterial color="#F3E5AB" />
      </mesh>

      {/* Navigable Rooms Divider */}
      <mesh position={[-4, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 6, 8]} />
        <meshStandardMaterial color="#EAEAEA" />
      </mesh>
      <mesh position={[4, 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 6, 8]} />
        <meshStandardMaterial color="#EAEAEA" />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 6.5, -5]} castShadow rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[12, 3, 4]} />
        <meshStandardMaterial color="#B22222" />
      </mesh>

      {/* Furniture Meshes */}
      <mesh position={[-6, 0.5, -4]} castShadow>
        <boxGeometry args={[2, 1, 3]} />
        <meshStandardMaterial color="#4A6B82" /> {/* Bed */}
      </mesh>
      <mesh position={[6, 0.5, -4]} castShadow>
        <boxGeometry args={[3, 1, 1.5]} />
        <meshStandardMaterial color="#5C4033" /> {/* Study Desk */}
      </mesh>
    </group>
  );
}
