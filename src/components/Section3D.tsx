import { useRef, useMemo, forwardRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/contexts/ThemeContext';

const themeColors: Record<string, { primary: string; secondary: string; accent: string }> = {
  basic: { primary: '#a855f7', secondary: '#c084fc', accent: '#e9d5ff' },
  snow: { primary: '#7ecbeb', secondary: '#c5e8f7', accent: '#e0f2fe' },
  fire: { primary: '#ff6b1c', secondary: '#ff9e54', accent: '#fde68a' },
  rain: { primary: '#3da8cc', secondary: '#5dc0de', accent: '#a5f3fc' },
  desert: { primary: '#cc9b4a', secondary: '#d4b978', accent: '#fef3c7' },
  electro: { primary: '#00ffff', secondary: '#a855f7', accent: '#c4b5fd' },
  ocean: { primary: '#14b8a6', secondary: '#22d3ee', accent: '#99f6e4' },
};

// ========== INDIVIDUAL 3D SHAPES ==========

const DistortedSphere = ({ color, position, scale = 1 }: { color: string; position: [number, number, number]; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.3;
    ref.current.rotation.y += delta * 0.2;
    ref.current.position.x = position[0] + pointer.x * 0.4;
    ref.current.position.y = position[1] + pointer.y * 0.3;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref} position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial color={color} speed={2} distort={0.4} roughness={0.2} metalness={0.8} transparent opacity={0.7} />
      </mesh>
    </Float>
  );
};

const WobblyBox = ({ color, position, scale = 1 }: { color: string; position: [number, number, number]; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.15;
    ref.current.rotation.z += delta * 0.25;
    ref.current.position.x = position[0] + pointer.x * 0.3;
    ref.current.position.y = position[1] + pointer.y * 0.2;
  });

  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={0.4}>
      <mesh ref={ref} position={position} scale={scale}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <MeshWobbleMaterial color={color} speed={1} factor={0.6} roughness={0.3} metalness={0.6} transparent opacity={0.6} />
      </mesh>
    </Float>
  );
};

const GlassOctahedron = ({ color, position, scale = 1 }: { color: string; position: [number, number, number]; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * 0.4;
    ref.current.rotation.z += delta * 0.15;
    ref.current.position.x = position[0] + pointer.x * 0.5;
    ref.current.position.y = position[1] + pointer.y * 0.4;
  });

  return (
    <Float speed={1.8} rotationIntensity={0.8} floatIntensity={0.5}>
      <mesh ref={ref} position={position} scale={scale}>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial color={color} transmission={0.6} thickness={0.5} roughness={0.1} metalness={0.1} transparent opacity={0.5} ior={1.5} />
      </mesh>
    </Float>
  );
};

const TorusKnot = ({ color, position, scale = 1 }: { color: string; position: [number, number, number]; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.2;
    ref.current.rotation.y += delta * 0.3;
    ref.current.position.x = position[0] + pointer.x * 0.35;
    ref.current.position.y = position[1] + pointer.y * 0.25;
  });

  return (
    <Float speed={1.2} rotationIntensity={0.5} floatIntensity={0.3}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusKnotGeometry args={[0.8, 0.3, 128, 32]} />
        <MeshDistortMaterial color={color} speed={1.5} distort={0.2} roughness={0.15} metalness={0.9} transparent opacity={0.65} />
      </mesh>
    </Float>
  );
};

const WireframeSphere = ({ color, position, scale = 1 }: { color: string; position: [number, number, number]; scale?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.1;
    ref.current.rotation.y += delta * 0.15;
    ref.current.position.x = position[0] + pointer.x * 0.2;
    ref.current.position.y = position[1] + pointer.y * 0.15;
  });

  return (
    <Float speed={1} rotationIntensity={0.3} floatIntensity={0.2}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1.2, 1]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.35} />
      </mesh>
    </Float>
  );
};

const RingSpin = ({ color, position, scale = 1 }: { color: string; position: [number, number, number]; scale?: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.x += delta * 0.3;
    groupRef.current.rotation.z += delta * 0.2;
    groupRef.current.position.x = position[0] + pointer.x * 0.3;
    groupRef.current.position.y = position[1] + pointer.y * 0.2;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.4}>
      <group ref={groupRef} position={position} scale={scale}>
        {[0, 1, 2].map(i => (
          <mesh key={i} rotation={[i * Math.PI / 3, i * Math.PI / 4, 0]}>
            <torusGeometry args={[1, 0.04, 16, 64]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} transparent opacity={0.5 - i * 0.1} />
          </mesh>
        ))}
      </group>
    </Float>
  );
};

// ========== SECTION SCENE CONFIGS ==========

type SectionType = 'hero' | 'about' | 'portfolio' | 'work' | 'resume' | 'skills' | 'contact';

interface Section3DCanvasProps {
  section: SectionType;
  className?: string;
}

const SectionSceneContent = ({ section }: { section: SectionType }) => {
  const { theme } = useTheme();
  const c = themeColors[theme] || themeColors.basic;

  switch (section) {
    case 'hero':
      return (
        <>
          <DistortedSphere color={c.primary} position={[-3, 1.5, -4]} scale={1.2} />
          <GlassOctahedron color={c.secondary} position={[3.5, -1, -5]} scale={0.9} />
          <WireframeSphere color={c.accent} position={[0, -2.5, -6]} scale={0.7} />
          <RingSpin color={c.primary} position={[4, 2.5, -7]} scale={0.6} />
        </>
      );
    case 'about':
      return (
        <>
          <TorusKnot color={c.primary} position={[3, 0, -4]} scale={0.8} />
          <WobblyBox color={c.secondary} position={[-3, 1.5, -5]} scale={0.6} />
          <WireframeSphere color={c.accent} position={[-1, -2, -6]} scale={0.5} />
        </>
      );
    case 'portfolio':
      return (
        <>
          <DistortedSphere color={c.secondary} position={[-4, 2, -5]} scale={0.7} />
          <RingSpin color={c.primary} position={[4, -1, -4]} scale={0.8} />
          <GlassOctahedron color={c.accent} position={[0, 2, -7]} scale={0.5} />
        </>
      );
    case 'work':
      return (
        <>
          <WobblyBox color={c.primary} position={[3.5, 1.5, -4]} scale={0.7} />
          <TorusKnot color={c.secondary} position={[-3, -1, -5]} scale={0.6} />
          <WireframeSphere color={c.accent} position={[1, -2, -6]} scale={0.6} />
        </>
      );
    case 'resume':
      return (
        <>
          <GlassOctahedron color={c.primary} position={[-3, 1, -4]} scale={0.9} />
          <RingSpin color={c.secondary} position={[3, 0, -5]} scale={0.7} />
        </>
      );
    case 'skills':
      return (
        <>
          <DistortedSphere color={c.primary} position={[3, 1, -4]} scale={0.6} />
          <TorusKnot color={c.secondary} position={[-3, -1, -5]} scale={0.5} />
          <WobblyBox color={c.accent} position={[0, 2, -6]} scale={0.4} />
        </>
      );
    case 'contact':
      return (
        <>
          <RingSpin color={c.primary} position={[0, 0, -4]} scale={1} />
          <DistortedSphere color={c.secondary} position={[-3.5, 1.5, -6]} scale={0.6} />
          <GlassOctahedron color={c.accent} position={[3.5, -1, -5]} scale={0.5} />
        </>
      );
    default:
      return null;
  }
};

const Section3D = ({ section, className = '' }: Section3DCanvasProps) => {
  return (
    <div className={`absolute inset-0 pointer-events-none z-0 ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
        frameloop="always"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.6} />
        <pointLight position={[-10, -5, -5]} intensity={0.3} />
        <SectionSceneContent section={section} />
      </Canvas>
    </div>
  );
};

export default Section3D;
