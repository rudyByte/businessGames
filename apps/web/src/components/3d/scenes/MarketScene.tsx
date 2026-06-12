import React from 'react';

interface MarketSceneProps {
  playerPosition: [number, number, number];
  discoveredClues: string[];
  onInteract: (clueId: string, details: any) => void;
}

export default function MarketScene({ playerPosition, discoveredClues, onInteract }: MarketSceneProps) {
  // Check if player is close to an object (returns true if distance < 3 units)
  const isNear = (x: number, z: number) => {
    const dx = playerPosition[0] - x;
    const dz = playerPosition[2] - z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance < 3.2;
  };

  const stalls = [
    {
      id: 'vegetable_vendor',
      x: -6, z: -4,
      title: 'Vegetable Vendor',
      desc: 'High wastage! Fresh green vegetables spoil rapidly in the afternoon sun.',
      color: '#22c55e'
    },
    {
      id: 'tea_stall',
      x: 6, z: -5,
      title: 'Chai Stall',
      desc: 'Huge queues at peak hours. Customers wait 15 minutes for a single cup of tea.',
      color: '#eab308'
    },
    {
      id: 'rickshaw_stand',
      x: -5, z: 6,
      title: 'Auto-Rickshaw Stand',
      desc: 'Chaos. Drivers wait hours for passenger fares while passengers walk looking for autos.',
      color: '#3b82f6'
    },
    {
      id: 'pharmacy_stock',
      x: 5, z: 5,
      title: 'Local Pharmacy',
      desc: 'Stockouts. Regularly needed diabetic and blood pressure medicines are often out of stock.',
      color: '#ef4444'
    },
    {
      id: 'repair_shop',
      x: 0, z: -10,
      title: 'Mobile Repair Stall',
      desc: 'Customers wait 3-5 days for simple screen replacements because parts are ordered slowly.',
      color: '#a855f7'
    }
  ];

  return (
    <group>
      {/* Ground Street Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#334155" roughness={0.9} /> {/* dark asphalt street */}
      </mesh>

      {/* Background Bazaar Buildings */}
      <mesh position={[-12, 3.5, -14]} castShadow receiveShadow>
        <boxGeometry args={[12, 7, 3]} />
        <meshStandardMaterial color="#fca5a5" />
      </mesh>
      <mesh position={[12, 3.5, -14]} castShadow receiveShadow>
        <boxGeometry args={[12, 7, 3]} />
        <meshStandardMaterial color="#93c5fd" />
      </mesh>

      {/* Central Market Fountain/Statue (Decorative) */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[2, 2.2, 0.8, 12]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.1} />
      </mesh>

      {/* Render Stall Objects */}
      {stalls.map((stall) => {
        const discovered = discoveredClues.includes(stall.id);
        const playerIsNear = isNear(stall.x, stall.z);

        return (
          <group key={stall.id} position={[stall.x, 0, stall.z]}>
            {/* Stall Canopy */}
            <mesh position={[0, 2.4, 0]} castShadow>
              <coneGeometry args={[1.5, 0.8, 4]} />
              <meshStandardMaterial color={stall.color} roughness={0.5} />
            </mesh>

            {/* Stall Base Table */}
            <mesh
              position={[0, 0.6, 0]}
              castShadow
              onClick={() => onInteract(stall.id, { title: stall.title, desc: stall.desc })}
            >
              <boxGeometry args={[1.6, 1.2, 1.2]} />
              <meshStandardMaterial
                color="#b45309"
                roughness={0.6}
                emissive={playerIsNear ? stall.color : '#000'}
                emissiveIntensity={playerIsNear ? 0.3 : 0}
              />
            </mesh>

            {/* Glowing Ring when player is near */}
            {playerIsNear && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[1.2, 1.3, 16]} />
                <meshBasicMaterial color={stall.color} side={2} />
              </mesh>
            )}

            {/* Float Indicator above Stall */}
            <mesh position={[0, 3.2, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color={discovered ? '#10b981' : '#f59e0b'} />
            </mesh>
          </group>
        );
      })}

      {/* Street Lamps (Decorative) */}
      {[
        [-8, -8], [8, -8], [-8, 8], [8, 8]
      ].map(([x, z], idx) => (
        <group key={idx} position={[x, 0, z]}>
          {/* Post */}
          <mesh position={[0, 2.0, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 4.0, 6]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          {/* Bulb */}
          <mesh position={[0, 4.0, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}
