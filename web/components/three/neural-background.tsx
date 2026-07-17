"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCssColor } from "@/lib/hooks/use-css-color";
import { cn } from "@/lib/utils";

const CONNECTION_DISTANCE = 1.8;
const PARTICLE_COUNT_DESKTOP = 72;
const PARTICLE_COUNT_MOBILE = 40;

type SimulationState = {
  count: number;
  velocities: Float32Array;
  pointGeometry: THREE.BufferGeometry;
  lineGeometry: THREE.BufferGeometry;
};

function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function createSimulation(count: number): SimulationState {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const linePositions = new Float32Array(count * count * 6);

  for (let i = 0; i < count; i += 1) {
    const seed = i + 1;
    positions[i * 3] = (pseudoRandom(seed) - 0.5) * 10;
    positions[i * 3 + 1] = (pseudoRandom(seed + 0.1) - 0.5) * 6;
    positions[i * 3 + 2] = (pseudoRandom(seed + 0.2) - 0.5) * 4;

    velocities[i * 3] = (pseudoRandom(seed + 0.3) - 0.5) * 0.004;
    velocities[i * 3 + 1] = (pseudoRandom(seed + 0.4) - 0.5) * 0.004;
    velocities[i * 3 + 2] = (pseudoRandom(seed + 0.5) - 0.5) * 0.002;
  }

  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3),
  );

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(linePositions, 3),
  );

  return { count, velocities, pointGeometry, lineGeometry };
}

type NeuralParticlesProps = {
  count: number;
  cyan: string;
  violet: string;
  paused: boolean;
};

function NeuralParticles({ count, cyan, violet, paused }: NeuralParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const simulation = useMemo(() => createSimulation(count), [count]);
  const velocitiesRef = useRef(simulation.velocities);

  useFrame((state) => {
    if (paused || !pointsRef.current || !linesRef.current) {
      return;
    }

    const positionAttr = pointsRef.current.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    const lineAttr = linesRef.current.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;

    const pos = positionAttr.array as Float32Array;
    const lines = lineAttr.array as Float32Array;
    const velocities = velocitiesRef.current;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;
      pos[i3] += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += velocities[i3 + 2];

      pos[i3 + 1] += Math.sin(time * 0.5 + i) * 0.0008;

      if (Math.abs(pos[i3]) > 5) velocities[i3] *= -1;
      if (Math.abs(pos[i3 + 1]) > 3) velocities[i3 + 1] *= -1;
      if (Math.abs(pos[i3 + 2]) > 2) velocities[i3 + 2] *= -1;
    }

    let lineIndex = 0;
    for (let i = 0; i < count; i += 1) {
      for (let j = i + 1; j < count; j += 1) {
        const i3 = i * 3;
        const j3 = j * 3;
        const dx = pos[i3] - pos[j3];
        const dy = pos[i3 + 1] - pos[j3 + 1];
        const dz = pos[i3 + 2] - pos[j3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < CONNECTION_DISTANCE) {
          lines[lineIndex++] = pos[i3];
          lines[lineIndex++] = pos[i3 + 1];
          lines[lineIndex++] = pos[i3 + 2];
          lines[lineIndex++] = pos[j3];
          lines[lineIndex++] = pos[j3 + 1];
          lines[lineIndex++] = pos[j3 + 2];
        }
      }
    }

    while (lineIndex < lines.length) {
      lines[lineIndex++] = 0;
    }

    positionAttr.needsUpdate = true;
    lineAttr.needsUpdate = true;
    pointsRef.current.rotation.y = time * 0.02;
    linesRef.current.rotation.y = time * 0.02;
  });

  return (
    <group>
      <points ref={pointsRef} geometry={simulation.pointGeometry}>
        <pointsMaterial
          color={cyan}
          size={0.06}
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef} geometry={simulation.lineGeometry}>
        <lineBasicMaterial
          color={violet}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

function NeuralScene({ paused }: { paused: boolean }) {
  const cyan = useCssColor("--accent-cyan", "#3de8ff");
  const violet = useCssColor("--accent-violet", "#a78bfa");
  const [count, setCount] = useState(PARTICLE_COUNT_DESKTOP);

  useEffect(() => {
    const update = () => {
      setCount(
        window.innerWidth < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP,
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <NeuralParticles
        key={count}
        count={count}
        cyan={cyan}
        violet={violet}
        paused={paused}
      />
    </>
  );
}

type NeuralBackgroundProps = {
  className?: string;
};

export function NeuralBackground({ className }: NeuralBackgroundProps) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPaused(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
      aria-hidden
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ position: "absolute", inset: 0 }}
      >
        <NeuralScene paused={paused} />
      </Canvas>
      <div className="absolute inset-0 bg-linear-to-b from-bg-primary/30 via-transparent to-bg-primary" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--bg-primary)_75%)]" />
    </div>
  );
}
