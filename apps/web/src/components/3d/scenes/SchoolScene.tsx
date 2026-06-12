import React from 'react';

interface SchoolSceneProps {
  playerPosition: [number, number, number];
  discoveredClues: string[];
  onInteract: (clueId: string, details: any) => void;
}

export default function SchoolScene({ playerPosition, discoveredClues, onInteract }: SchoolSceneProps) {
  // Check if player is close to an object (returns true if distance < 3 units)
  const isNear = (x: number, z: number) => {
    const dx = playerPosition[0] - x;
    const dz = playerPosition[2] - z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    return distance < 3.2;
  };

  const clues = [
    {
      id: 'canteen_queue',
      x: -6, z: -5,
      title: 'Canteen Counter',
      desc: 'Long queue! recess ends before half of the students are served hot samosas.',
      color: '#f97316'
    },
    {
      id: 'water_cooler',
      x: 6, z: -8,
      title: 'Water Cooler',
      desc: 'Water cooler is completely empty and dry during peak Delhi summer heat.',
      color: '#3b82f6'
    },
    {
      id: 'notice_board',
      x: -3, z: -10,
      title: 'Notice Board',
      desc: 'Important paper notices go completely unread because they look boring and get buried.',
      color: '#8b5a2b'
    },
    {
      id: 'lost_found',
      x: 5, z: 2,
      title: 'Lost & Found Box',
      desc: 'Box overflowing with unclaimed water bottles and text books that students lost.',
      color: '#a855f7'
    },
    {
      id: 'parking_pickup',
      x: 0, z: 8,
      title: 'School Gate Parking',
      desc: 'Chaotic vehicle layouts. Parents park randomly causing huge traffic during 2 PM pickup.',
      color: '#e11d48'
    }
  ];

  return (
    <group>
      {/* Ground Grass Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#22c55e" roughness={0.9} />
      </mesh>

      {/* Main School Building Facade */}
      <mesh position={[0, 4, -14]} castShadow receiveShadow>
        <boxGeometry args={[22, 8, 4]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.5} />
      </mesh>
      
      {/* School Entrance Portal */}
      <mesh position={[0, 2.5, -11.9]} castShadow>
        <boxGeometry args={[4, 5, 0.4]} />
        <meshStandardMaterial color="#1e3a8a" />
      </mesh>

      {/* Classroom Windows */}
      {[-8, -4, 4, 8].map((x, idx) => (
        <mesh key={idx} position={[x, 5, -11.9]}>
          <boxGeometry args={[2, 1.2, 0.1]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.1} />
        </mesh>
      ))}

      {/* Greenfield School Notice Banner */}
      <mesh position={[0, 6, -11.8]}>
        <boxGeometry args={[8, 1, 0.1]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>

      {/* Render Clue Objects */}
      {clues.map((clue) => {
        const discovered = discoveredClues.includes(clue.id);
        const playerIsNear = isNear(clue.x, clue.z);

        return (
          <group key={clue.id} position={[clue.x, 0, clue.z]}>
            {/* Clue Mesh */}
            <mesh
              castShadow
              onClick={() => onInteract(clue.id, { title: clue.title, desc: clue.desc })}
            >
              <cylinderGeometry args={[0.5, 0.5, 1.2, 8]} />
              <meshStandardMaterial
                color={clue.color}
                roughness={0.2}
                emissive={playerIsNear ? clue.color : '#000'}
                emissiveIntensity={playerIsNear ? 0.3 : 0}
              />
            </mesh>

            {/* Glowing Ring when player is near */}
            {playerIsNear && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <ringGeometry args={[0.7, 0.8, 16]} />
                <meshBasicMaterial color={clue.color} side={2} />
              </mesh>
            )}

            {/* Float Indicator above Clue */}
            <mesh position={[0, 1.5, 0]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshBasicMaterial color={discovered ? '#10b981' : '#f59e0b'} />
            </mesh>
          </group>
        );
      })}

      {/* Decorative Tree assets */}
      {[
        [-12, -8], [12, -8], [-14, 4], [14, 4], [-8, 10], [8, 10]
      ].map(([x, z], idx) => (
        <group key={idx} position={[x, 0, z]}>
          {/* Trunk */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 1.6, 6]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* Leaves */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <coneGeometry args={[1.2, 2.0, 5]} />
            <meshStandardMaterial color="#15803d" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
