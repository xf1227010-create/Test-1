import { Canvas } from '@react-three/fiber';
import { Environment, GizmoHelper, GizmoViewport, Grid, OrbitControls } from '@react-three/drei';
import { BeamModel } from '@/components/BeamModel/BeamModel';
import { ClippingController } from './ClippingController';
import { CameraRig } from './CameraRig';

export function Scene() {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, preserveDrawingBuffer: true }}>
      <color attach="background" args={[0x0b1016]} />
      <fog attach="fog" args={[0x0b1016, 12, 30]} />

      <CameraRig />

      {/* 灯光 */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[6, 8, 4]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <directionalLight position={[-5, 3, -4]} intensity={0.5} />

      {/* 环境反射 (用预设 'warehouse' 提供金属反射) */}
      <Environment preset="warehouse" />

      {/* 地面网格 */}
      <Grid
        args={[30, 30]}
        position={[0, -1.2, 0]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#1f2a36"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#2d3f54"
        fadeDistance={25}
        fadeStrength={1.2}
        infiniteGrid
      />

      <ClippingController />
      <BeamModel />

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
      </GizmoHelper>
    </Canvas>
  );
}
