import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { palette, typography } from '../lib/theme';
import { useEventState } from '../context/EventStateContext';
import {
  Pause,
  Play,
  Sliders,
  Compass,
} from 'lucide-react';
import { MagneticButton } from './animated/LivingData';

interface Room3DData {
  id: string;
  name: string;
  code: string;
  floor: 1 | 2;
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  capacity: number;
  currentOccupancy: number;
  colorHex: string;
  queueCount: number;
  queueTime: string;
}

const VENUE_ROOMS_3D: Room3DData[] = [
  // Floor 1: Ground Concourse & Reading Halls
  { id: 'f1-reg', name: 'GUKC Main Portico & Turnstiles', code: 'GUKC-L1-01', floor: 1, x: -7, z: 0, width: 6, depth: 8, height: 2, capacity: 800, currentOccupancy: 645, colorHex: '#D6DFB5', queueCount: 14, queueTime: '3 min' },
  { id: 'f1-expo', name: 'Dr. APJ Abdul Kalam Reading Hall', code: 'GUKC-L1-02', floor: 1, x: 2, z: -4, width: 8, depth: 6, height: 2.2, capacity: 350, currentOccupancy: 280, colorHex: '#E9D8CB', queueCount: 22, queueTime: '5 min' },
  { id: 'f1-cafe', name: 'Scholarly Networking Atrium & Cafe', code: 'GUKC-L1-03', floor: 1, x: 2, z: 4, width: 8, depth: 6, height: 2, capacity: 200, currentOccupancy: 134, colorHex: '#F7F4EC', queueCount: 8, queueTime: '2 min' },

  // Floor 2: Auditoriums, AI & Data Science Block
  { id: 'f2-keynote', name: 'GUKC Central Auditorium (Block C)', code: 'GUKC-L2-01', floor: 2, x: -5, z: -3, width: 7, depth: 9, height: 3, capacity: 800, currentOccupancy: 645, colorHex: '#E66B45', queueCount: 45, queueTime: '8 min' },
  { id: 'f2-hallb', name: 'Block A Multimedia Seminar Hall', code: 'GUKC-L2-02', floor: 2, x: 4, z: -3, width: 6, depth: 7, height: 2.8, capacity: 250, currentOccupancy: 195, colorHex: '#3457A4', queueCount: 12, queueTime: '3 min' },
  { id: 'f2-workshop', name: 'AI & Data Science Block Hub', code: 'GUKC-L2-03', floor: 2, x: 4, z: 5, width: 6, depth: 5, height: 2.5, capacity: 80, currentOccupancy: 72, colorHex: '#EBCB73', queueCount: 5, queueTime: '1 min' },
  { id: 'f2-vip', name: 'Faculty Research & Executive Lounge', code: 'GUKC-L2-04', floor: 2, x: -5, z: 5, width: 5, depth: 5, height: 2.2, capacity: 45, currentOccupancy: 18, colorHex: '#D6DFB5', queueCount: 0, queueTime: '0 min' },
];

export default function IsometricVenue3D() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { isFrozen, toggleFreeze, simulatedTime, setSimulatedTime, butterfly } = useEventState();

  const [activeFloor, setActiveFloor] = useState<1 | 2 | 'all'>('all');
  const [hoveredRoom, setHoveredRoom] = useState<Room3DData | null>(null);
  const [isPlayingTime, setIsPlayingTime] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 5>(1);
  const [whatIfOpen, setWhatIfOpen] = useState(false);

  // What-if simulation parameters
  const [whatIfSurge, setWhatIfSurge] = useState(0); // 0% to +50%
  const [whatIfDelay, setWhatIfDelay] = useState(0); // 0 to 45 min

  // Three.js instances ref
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const roomMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const attendeeParticlesRef = useRef<THREE.InstancedMesh | null>(null);
  const attendeePositionsRef = useRef<{ x: number; y: number; z: number; vx: number; vz: number; floor: number }[]>([]);

  // Camera Orbit state
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const sphericalRef = useRef({ radius: 36, theta: Math.PI / 4, phi: Math.PI / 3.2 });

  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = sphericalRef.current;
    cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
    cameraRef.current.position.y = radius * Math.cos(phi);
    cameraRef.current.position.z = radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.lookAt(0, activeFloor === 2 ? 4 : activeFloor === 1 ? 0 : 2, 0);
  }, [activeFloor]);

  // Setup Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#F7F4EC'); // Riviera warm sand background
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff8ee, 1.6);
    dirLight.position.set(24, 38, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const softFill = new THREE.DirectionalLight(0x3457a4, 0.4);
    softFill.position.set(-20, 15, -20);
    scene.add(softFill);

    // 5. Floor 1 & Floor 2 Base Slabs
    const floorGeo = new THREE.BoxGeometry(26, 0.4, 22);

    // Level 1 Floor Mesh
    const floor1Mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.6,
      metalness: 0.1,
    });
    const floor1Mesh = new THREE.Mesh(floorGeo, floor1Mat);
    floor1Mesh.position.y = -0.2;
    floor1Mesh.receiveShadow = true;
    scene.add(floor1Mesh);

    // Level 2 Floor Mesh (Elevated 6 units)
    const floor2Mat = new THREE.MeshStandardMaterial({
      color: 0xfaf8f4,
      roughness: 0.6,
      metalness: 0.1,
      transparent: true,
      opacity: 0.92,
    });
    const floor2Mesh = new THREE.Mesh(floorGeo, floor2Mat);
    floor2Mesh.position.y = 5.8;
    floor2Mesh.receiveShadow = true;
    scene.add(floor2Mesh);

    // Coordinate Grid Helper
    const grid1 = new THREE.GridHelper(26, 26, 0xe9e4da, 0xf0ece2);
    grid1.position.y = 0.01;
    scene.add(grid1);

    const grid2 = new THREE.GridHelper(26, 26, 0xe9e4da, 0xf0ece2);
    grid2.position.y = 6.01;
    scene.add(grid2);

    // 6. Build 3D Room Structures
    const roomMeshes = new Map<string, THREE.Mesh>();

    VENUE_ROOMS_3D.forEach((rm) => {
      const geo = new THREE.BoxGeometry(rm.width, rm.height, rm.depth);
      const isHallA = rm.id === 'f2-keynote';
      const isDisrupted = isHallA && butterfly.active;

      const mat = new THREE.MeshStandardMaterial({
        color: isDisrupted ? new THREE.Color('#E66B45') : new THREE.Color(rm.colorHex),
        roughness: 0.5,
        metalness: 0.15,
        transparent: true,
        opacity: isDisrupted ? 0.95 : 0.88,
      });

      const mesh = new THREE.Mesh(geo, mat);
      const baseY = rm.floor === 1 ? 0 : 6;
      mesh.position.set(rm.x, baseY + rm.height / 2, rm.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = { roomId: rm.id };

      // Fine architectural outline edges
      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({
        color: isDisrupted ? 0xe66b45 : 0x777b78,
        linewidth: 1.5,
      });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      mesh.add(wireframe);

      scene.add(mesh);
      roomMeshes.set(rm.id, mesh);
    });
    roomMeshesRef.current = roomMeshes;

    // 7. Attendee 3D Instanced Particles
    const particleCount = 140;
    const particleGeo = new THREE.SphereGeometry(0.16, 8, 8);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0x3457a4,
      roughness: 0.3,
      metalness: 0.1,
    });
    const instancedParticles = new THREE.InstancedMesh(particleGeo, particleMat, particleCount);
    scene.add(instancedParticles);
    attendeeParticlesRef.current = instancedParticles;

    // Initialize random attendee positions across floors
    const dummy = new THREE.Object3D();
    const positions: { x: number; y: number; z: number; vx: number; vz: number; floor: number }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const fl = i % 2 === 0 ? 1 : 2;
      const x = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 16;
      const y = fl === 1 ? 0.2 : 6.2;
      const vx = (Math.random() - 0.5) * 0.04;
      const vz = (Math.random() - 0.5) * 0.04;

      positions.push({ x, y, z, vx, vz, floor: fl });
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      instancedParticles.setMatrixAt(i, dummy.matrix);
    }
    instancedParticles.instanceMatrix.needsUpdate = true;
    attendeePositionsRef.current = positions;

    // 8. Animation & Raycasting Loop
    let animId: number;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(roomMeshes.values());
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitId = intersects[0].object.userData.roomId;
        const matched = VENUE_ROOMS_3D.find(r => r.id === hitId);
        setHoveredRoom(matched || null);
      } else {
        setHoveredRoom(null);
      }
    };

    container.addEventListener('mousemove', handlePointerMove);

    // 9. Render Frame Loop
    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);

      // Animate attendee movement unless frozen
      if (!isFrozen && instancedParticles && positions.length > 0) {
        for (let i = 0; i < particleCount; i++) {
          const p = positions[i];
          p.x += p.vx;
          p.z += p.vz;

          // Boundary bounce
          if (p.x < -11 || p.x > 11) p.vx *= -1;
          if (p.z < -9 || p.z > 9) p.vz *= -1;

          dummy.position.set(p.x, p.y, p.z);
          dummy.updateMatrix();
          instancedParticles.setMatrixAt(i, dummy.matrix);
        }
        instancedParticles.instanceMatrix.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, [updateCameraPosition, isFrozen, butterfly.active]);

  // Handle Drag Orbit
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    sphericalRef.current.theta -= deltaX * 0.008;
    sphericalRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.05, sphericalRef.current.phi - deltaY * 0.008));
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    sphericalRef.current.radius = Math.max(16, Math.min(65, sphericalRef.current.radius + e.deltaY * 0.04));
    updateCameraPosition();
  };

  // Time scrubber tick
  useEffect(() => {
    if (!isPlayingTime || isFrozen) return;
    const interval = setInterval(() => {
      setSimulatedTime((prev: string) => {
        const [hh, mm] = prev.split(':').map(Number);
        let nextM = mm + playbackSpeed;
        let nextH = hh;
        if (nextM >= 60) {
          nextH = (nextH + 1) % 24;
          nextM = 0;
        }
        return `${String(nextH).padStart(2, '0')}:${String(nextM).padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlayingTime, isFrozen, playbackSpeed, setSimulatedTime]);

  return (
    <div style={{
      background: palette.bgSecondary,
      borderRadius: 14,
      border: `1px solid ${palette.border}`,
      boxShadow: palette.shadowSoft,
      overflow: 'hidden',
      fontFamily: typography.fontBody,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Controls Toolbar */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${palette.border}`,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: palette.bgSecondary,
      }}>
        {/* Left: Floor Selector & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            borderRadius: 6,
            background: palette.bgParchment,
            border: `1px solid ${palette.borderDark}`,
            fontFamily: typography.fontMono,
            fontSize: 11,
            fontWeight: 700,
            color: palette.secondary,
          }}>
            <Compass size={14} />
            <span>3D ISOMETRIC TWIN • GUKC LIBRARY</span>
          </div>

          <div style={{ display: 'flex', background: palette.bgMain, borderRadius: 6, padding: 3, border: `1px solid ${palette.border}` }}>
            {(['all', 1, 2] as const).map((fl) => (
              <button
                key={fl}
                onClick={() => setActiveFloor(fl)}
                style={{
                  background: activeFloor === fl ? palette.bgSecondary : 'transparent',
                  color: activeFloor === fl ? palette.primary : palette.textMuted,
                  border: 'none',
                  borderRadius: 4,
                  padding: '5px 12px',
                  fontFamily: typography.fontMono,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: activeFloor === fl ? palette.shadowSoft : 'none',
                }}
              >
                {fl === 'all' ? 'EXPLODED VIEW' : `LEVEL 0${fl}`}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Freeze Mode & What-If Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MagneticButton
            variant={isFrozen ? 'primary' : 'outline'}
            onClick={toggleFreeze}
            style={{
              padding: '6px 14px',
              fontSize: 11,
              fontFamily: typography.fontMono,
              background: isFrozen ? palette.warning : undefined,
              color: isFrozen ? '#252D35' : undefined,
            }}
          >
            {isFrozen ? <Play size={13} /> : <Pause size={13} />}
            <span>{isFrozen ? 'RESUME EVENT PHYSICS' : 'FREEZE EVENT (INSPECT)'}</span>
          </MagneticButton>

          <MagneticButton
            variant="outline"
            onClick={() => setWhatIfOpen(!whatIfOpen)}
            style={{ padding: '6px 14px', fontSize: 11, fontFamily: typography.fontMono }}
          >
            <Sliders size={13} color={palette.secondary} />
            <span>SIMULATE WHAT-IF</span>
          </MagneticButton>
        </div>
      </div>

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          position: 'relative',
          width: '100%',
          height: 520,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
        }}
      >
        {/* Floating Room Inspector Stamp */}
        {hoveredRoom && (
          <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderRadius: 10,
            border: `1.5px solid ${palette.primary}`,
            padding: '12px 16px',
            boxShadow: palette.shadowElevated,
            pointerEvents: 'none',
            minWidth: 240,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: typography.fontMono, fontSize: 10, fontWeight: 700, color: palette.secondary }}>
                {hoveredRoom.code} • LEVEL {hoveredRoom.floor}
              </span>
              <span style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.primary, fontWeight: 700 }}>
                {hoveredRoom.queueTime} QUEUE
              </span>
            </div>

            <div style={{ fontFamily: typography.fontHeading, fontSize: 15, fontWeight: 700, color: palette.textMain, marginBottom: 8 }}>
              {hoveredRoom.name}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontFamily: typography.fontMono }}>
              <span style={{ color: palette.textMuted }}>Occupancy</span>
              <span style={{ fontWeight: 700, color: palette.textMain }}>
                {hoveredRoom.currentOccupancy} / {hoveredRoom.capacity} ({Math.round((hoveredRoom.currentOccupancy / hoveredRoom.capacity) * 100)}%)
              </span>
            </div>

            {/* Occupancy Bar */}
            <div style={{ height: 4, background: '#E6E1D5', borderRadius: 2, marginTop: 6, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min((hoveredRoom.currentOccupancy / hoveredRoom.capacity) * 100, 100)}%`,
                background: palette.primary,
              }} />
            </div>
          </div>
        )}

        {/* Orbit Helper Tip */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 20,
          fontFamily: typography.fontMono,
          fontSize: 10,
          color: palette.textMuted,
          background: 'rgba(247, 244, 236, 0.85)',
          padding: '4px 10px',
          borderRadius: 4,
          border: `1px solid ${palette.border}`,
          pointerEvents: 'none',
        }}>
          DRAG TO ORBIT • SCROLL TO ZOOM • HOVER ROOMS FOR TELEMETRY
        </div>
      </div>

      {/* Simulated Time & Scrubber Bar */}
      <div style={{
        padding: '14px 20px',
        borderTop: `1px solid ${palette.border}`,
        background: palette.bgSecondary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        {/* Playback Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setIsPlayingTime(!isPlayingTime)}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: palette.primary,
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isPlayingTime ? <Pause size={14} /> : <Play size={14} />}
          </button>

          <span style={{ fontFamily: typography.fontMono, fontSize: 16, fontWeight: 700, color: palette.textMain }}>
            {simulatedTime}
          </span>

          <button
            onClick={() => setPlaybackSpeed(playbackSpeed === 1 ? 5 : 1)}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              background: palette.bgMain,
              border: `1px solid ${palette.border}`,
              fontFamily: typography.fontMono,
              fontSize: 11,
              fontWeight: 700,
              color: palette.secondary,
              cursor: 'pointer',
            }}
          >
            {playbackSpeed}X SPEED
          </button>
        </div>

        {/* Interactive Timeline Range Scrubber */}
        <div style={{ flex: 1, maxWidth: 500, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>08:00</span>
          <input
            type="range"
            min="480"
            max="1080"
            value={parseInt(simulatedTime.split(':')[0]) * 60 + parseInt(simulatedTime.split(':')[1])}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              const h = Math.floor(val / 60);
              const m = val % 60;
              setSimulatedTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
            }}
            style={{ flex: 1, accentColor: palette.primary, cursor: 'pointer' }}
          />
          <span style={{ fontFamily: typography.fontMono, fontSize: 10, color: palette.textMuted }}>18:00</span>
        </div>
      </div>

      {/* What-If Simulation Drawer */}
      {whatIfOpen && (
        <div style={{
          padding: 20,
          background: palette.bgMain,
          borderTop: `1px solid ${palette.border}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) 1.2fr',
          gap: 20,
          alignItems: 'center',
        }}>
          {/* Sliders */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: typography.fontMono, marginBottom: 4 }}>
              <span>ATTENDEE SURGE</span>
              <strong>+{whatIfSurge}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={whatIfSurge}
              onChange={e => setWhatIfSurge(Number(e.target.value))}
              style={{ width: '100%', accentColor: palette.primary }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: typography.fontMono, marginBottom: 4 }}>
              <span>KEYNOTE DELAY</span>
              <strong>+{whatIfDelay} MIN</strong>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="5"
              value={whatIfDelay}
              onChange={e => setWhatIfDelay(Number(e.target.value))}
              style={{ width: '100%', accentColor: palette.secondary }}
            />
          </div>

          {/* Delta Radar Telemetry */}
          <div style={{
            background: palette.bgSecondary,
            padding: 14,
            borderRadius: 8,
            border: `1px solid ${palette.border}`,
            display: 'flex',
            justifyContent: 'space-around',
            fontFamily: typography.fontMono,
            fontSize: 11,
          }}>
            <div>
              <div style={{ color: palette.textMuted }}>HALLWAY CHOKE</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: whatIfSurge > 20 ? palette.primary : palette.successText, marginTop: 2 }}>
                +{Math.round(whatIfSurge * 1.4)}%
              </div>
            </div>
            <div>
              <div style={{ color: palette.textMuted }}>AVG QUEUE</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: palette.secondary, marginTop: 2 }}>
                +{Math.round(whatIfDelay * 0.4 + whatIfSurge * 0.2)} MIN
              </div>
            </div>
            <div>
              <div style={{ color: palette.textMuted }}>CP-SAT FEASIBILITY</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: palette.successText, marginTop: 2 }}>
                98.2%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
