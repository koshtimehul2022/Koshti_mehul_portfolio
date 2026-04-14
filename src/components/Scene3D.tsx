import { useRef, useMemo, forwardRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '@/contexts/ThemeContext';

const themeColors = {
  basic: { primary: '#a855f7', secondary: '#c084fc', accent: '#1a1028' },
  snow: { primary: '#7ecbeb', secondary: '#c5e8f7', accent: '#1a3a4a' },
  fire: { primary: '#ff6b1c', secondary: '#ff9e54', accent: '#3d1a0a' },
  rain: { primary: '#3da8cc', secondary: '#5dc0de', accent: '#0f2f3d' },
  desert: { primary: '#cc9b4a', secondary: '#d4b978', accent: '#3d2f1a' },
  electro: { primary: '#00ffff', secondary: '#a855f7', accent: '#0a0a2e' },
  ocean: { primary: '#14b8a6', secondary: '#22d3ee', accent: '#0c2d33' },
};

interface FloatingShapeProps {
  position: [number, number, number];
  geometry: 'sphere' | 'box' | 'octahedron' | 'torus';
  scale: number;
  rotationSpeed: number;
  floatIntensity: number;
}

const FloatingShape = forwardRef<THREE.Group, FloatingShapeProps>(({ position, geometry, scale, rotationSpeed, floatIntensity }, _ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { theme } = useTheme();
  const { viewport, pointer } = useThree();
  
  const colors = themeColors[theme];
  
  const material = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: colors.primary,
      metalness: 0.3,
      roughness: 0.4,
      transparent: true,
      opacity: 0.6,
    });
  }, [colors.primary]);

  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += 0.002 * rotationSpeed;
    meshRef.current.rotation.y += 0.003 * rotationSpeed;
    
    const mouseX = pointer.x * viewport.width * 0.1;
    const mouseY = pointer.y * viewport.height * 0.1;
    
    meshRef.current.position.x = position[0] + mouseX * 0.15;
    meshRef.current.position.y = position[1] + mouseY * 0.15;
    
    (meshRef.current.material as THREE.MeshStandardMaterial).color.setStyle(colors.primary);
  });

  const renderGeometry = () => {
    switch (geometry) {
      case 'sphere': return <sphereGeometry args={[1, 32, 32]} />;
      case 'box': return <boxGeometry args={[1.5, 1.5, 1.5]} />;
      case 'octahedron': return <octahedronGeometry args={[1.2]} />;
      case 'torus': return <torusGeometry args={[1, 0.4, 16, 32]} />;
      default: return <sphereGeometry args={[1, 32, 32]} />;
    }
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={floatIntensity}>
      <mesh ref={meshRef} position={position} scale={scale} material={material}>
        {renderGeometry()}
      </mesh>
    </Float>
  );
});

const SceneContent = () => {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const shapes: FloatingShapeProps[] = useMemo(() => [
    { position: [-4, 2, -5], geometry: 'sphere', scale: 0.8, rotationSpeed: 1, floatIntensity: 0.5 },
    { position: [4, -1, -6], geometry: 'box', scale: 0.6, rotationSpeed: 0.8, floatIntensity: 0.3 },
    { position: [-2, -2, -4], geometry: 'octahedron', scale: 0.5, rotationSpeed: 1.2, floatIntensity: 0.6 },
    { position: [3, 3, -7], geometry: 'torus', scale: 0.7, rotationSpeed: 0.6, floatIntensity: 0.4 },
    { position: [0, 1, -8], geometry: 'sphere', scale: 1.2, rotationSpeed: 0.4, floatIntensity: 0.2 },
    { position: [-5, 0, -9], geometry: 'box', scale: 0.4, rotationSpeed: 1.5, floatIntensity: 0.7 },
    { position: [5, 2, -5], geometry: 'octahedron', scale: 0.6, rotationSpeed: 1, floatIntensity: 0.5 },
  ], []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color={colors.primary} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color={colors.secondary} />
      {shapes.map((shape, index) => (
        <FloatingShape key={index} {...shape} />
      ))}
    </>
  );
};

const Scene3D = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
};

export default Scene3D;
