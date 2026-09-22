"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function RobotHead({ isSpeaking }: { isSpeaking: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Smoothly follow the mouse
    const targetX = (state.mouse.x * Math.PI) / 4;
    const targetY = (state.mouse.y * Math.PI) / 4;
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetX, 0.1);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -targetY, 0.1);

    // Animate mouth when speaking
    if (mouthRef.current) {
      if (isSpeaking) {
        // Fast sine wave for flapping
        const flap = Math.sin(state.clock.elapsedTime * 20) * 0.5 + 0.5; 
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.2 + flap * 0.8, 0.2);
      } else {
        // Return to idle closed mouth
        mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, 0.1, 0.2);
      }
    }

    // Blink occasionally
    const time = state.clock.elapsedTime;
    const isBlinking = Math.sin(time * 3) > 0.95 || Math.sin(time * 10) > 0.98;
    const eyeScaleY = isBlinking ? 0.1 : 1;
    
    if (leftEyeRef.current) leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, eyeScaleY, 0.3);
    if (rightEyeRef.current) rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, eyeScaleY, 0.3);
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Main Head - Glassy/Tech look */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 2.5, 2]} />
          <meshPhysicalMaterial 
            color="#111111" 
            metalness={0.8}
            roughness={0.2}
            clearcoat={1}
          />
        </mesh>

        {/* Screen / Face Plate */}
        <mesh position={[0, 0, 1.01]}>
          <planeGeometry args={[1.6, 2]} />
          <meshStandardMaterial color="#000000" />
        </mesh>

        {/* Left Eye */}
        <mesh ref={leftEyeRef} position={[-0.4, 0.3, 1.02]}>
          <capsuleGeometry args={[0.15, 0.2, 4, 8]} />
          <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} />
        </mesh>

        {/* Right Eye */}
        <mesh ref={rightEyeRef} position={[0.4, 0.3, 1.02]}>
          <capsuleGeometry args={[0.15, 0.2, 4, 8]} />
          <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} />
        </mesh>

        {/* Mouth (Voice visualizer) */}
        <mesh ref={mouthRef} position={[0, -0.4, 1.02]}>
          <boxGeometry args={[0.8, 0.4, 0.1]} />
          <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={1.5} />
        </mesh>
        
        {/* Energy Core inside head (optional cool effect) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <MeshDistortMaterial color="#00ffcc" speed={5} distort={0.4} emissive="#00ffcc" emissiveIntensity={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

export default function AIAvatar({ isSpeaking }: { isSpeaking: boolean }) {
  return (
    <div className="w-full h-full min-h-[300px] bg-gray-900 rounded-xl overflow-hidden shadow-inner relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <Environment preset="city" />
        
        <RobotHead isSpeaking={isSpeaking} />
      </Canvas>
      
      {/* Decorative UI overlay */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
          {isSpeaking ? 'AI is speaking...' : 'AI is listening'}
        </span>
      </div>
    </div>
  );
}
