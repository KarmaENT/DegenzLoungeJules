import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Environment, Float, Text3D, Center } from '@react-three/drei';
import * as THREE from 'three';

// 3D Logo component that rotates
const Logo3D = ({ text = "DeGeNz", color = "#3b82f6" }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  
  // Animate the logo
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float 
      speed={1.5} 
      rotationIntensity={0.2} 
      floatIntensity={0.5}
    >
      <Center>
        <Text3D
          ref={mesh}
          font="/fonts/inter_bold.json"
          size={1.5}
          height={0.2}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          {text}
          <meshStandardMaterial 
            color={color} 
            metalness={0.8}
            roughness={0.2}
          />
        </Text3D>
      </Center>
    </Float>
  );
};

// Floating cube with reflection
const ReflectiveCube = ({ position = [0, 0, 0], color = "#3b82f6", size = 1 }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.2;
      mesh.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <mesh ref={mesh} position={position as [number, number, number]}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.9}
        roughness={0.1}
        envMapIntensity={1}
      />
    </mesh>
  );
};

// Animated sphere
const AnimatedSphere = ({ position = [0, 0, 0], color = "#ef4444", size = 0.7 }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
    }
  });

  return (
    <mesh ref={mesh} position={position as [number, number, number]}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.4}
        roughness={0.2}
      />
    </mesh>
  );
};

// Torus that rotates
const AnimatedTorus = ({ position = [0, 0, 0], color = "#10b981", size = 0.5 }) => {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.5;
      mesh.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh ref={mesh} position={position as [number, number, number]}>
      <torusGeometry args={[size, size/3, 16, 32]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.6}
        roughness={0.3}
      />
    </mesh>
  );
};

// Main 3D scene component
export const Scene3D: React.FC<{
  width?: string;
  height?: string;
  className?: string;
  logoText?: string;
  backgroundColor?: string;
}> = ({ 
  width = "100%", 
  height = "300px", 
  className = "", 
  logoText = "DeGeNz",
  backgroundColor = "#111827"
}) => {
  return (
    <div style={{ width, height }} className={`relative rounded-lg overflow-hidden ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ background: backgroundColor }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Logo3D text={logoText} />
        
        <ReflectiveCube position={[-2.5, -1, 0]} color="#3b82f6" size={0.8} />
        <AnimatedSphere position={[2.5, -1, 0]} color="#ef4444" />
        <AnimatedTorus position={[0, -1.5, 0]} color="#10b981" />
        
        <Environment preset="city" />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          rotateSpeed={0.5}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

// 3D Agent Avatar component
export const AgentAvatar3D: React.FC<{
  size?: string;
  className?: string;
  color?: string;
  letter?: string;
}> = ({ 
  size = "60px", 
  className = "", 
  color = "#3b82f6",
  letter = "A"
}) => {
  return (
    <div style={{ width: size, height: size }} className={`relative rounded-full overflow-hidden ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <Float 
          speed={2} 
          rotationIntensity={0.4} 
          floatIntensity={0.4}
        >
          <Center>
            <Text3D
              font="/fonts/inter_bold.json"
              size={1.5}
              height={0.2}
              curveSegments={12}
              bevelEnabled
              bevelThickness={0.02}
              bevelSize={0.02}
            >
              {letter}
              <meshStandardMaterial 
                color={color} 
                metalness={0.8}
                roughness={0.2}
              />
            </Text3D>
          </Center>
        </Float>
        
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
};

// 3D Button component
export const Button3D: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  color?: string;
  hoverColor?: string;
  disabled?: boolean;
}> = ({ 
  children, 
  onClick, 
  className = "", 
  color = "#3b82f6",
  hoverColor = "#2563eb",
  disabled = false
}) => {
  const [hovered, setHovered] = React.useState(false);
  
  return (
    <button
      className={`relative px-4 py-2 rounded-lg overflow-hidden ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => !disabled && setHovered(false)}
      disabled={disabled}
    >
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <mesh>
            <planeGeometry args={[4, 1.5]} />
            <meshStandardMaterial 
              color={hovered ? hoverColor : color} 
              metalness={0.5}
              roughness={0.4}
            />
          </mesh>
          
          <Environment preset="sunset" />
        </Canvas>
      </div>
      
      <div className="relative z-10 text-white font-medium">
        {children}
      </div>
    </button>
  );
};

// 3D Card component
export const Card3D: React.FC<{
  children: React.ReactNode;
  className?: string;
  color?: string;
  depth?: number;
}> = ({ 
  children, 
  className = "", 
  color = "#1f2937",
  depth = 0.2
}) => {
  const [hovered, setHovered] = React.useState(false);
  
  return (
    <div 
      className={`relative rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transform: hovered ? 'translateZ(10px)' : 'translateZ(0)',
        transition: 'transform 0.3s ease',
      }}
    >
      <div className="absolute inset-0 z-0" style={{ height: '100%' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          <mesh position={[0, 0, -depth/2]}>
            <boxGeometry args={[4, 2, depth]} />
            <meshStandardMaterial 
              color={color} 
              metalness={0.2}
              roughness={0.8}
            />
          </mesh>
          
          <Environment preset="apartment" />
        </Canvas>
      </div>
      
      <div className="relative z-10 p-4">
        {children}
      </div>
    </div>
  );
};

// 3D Loading Spinner
export const Spinner3D: React.FC<{
  size?: string;
  className?: string;
  color?: string;
}> = ({ 
  size = "60px", 
  className = "", 
  color = "#3b82f6"
}) => {
  return (
    <div style={{ width: size, height: size }} className={`relative ${className}`}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <AnimatedTorus position={[0, 0, 0]} color={color} size={1} />
        
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
};

export default {
  Scene3D,
  AgentAvatar3D,
  Button3D,
  Card3D,
  Spinner3D
};
