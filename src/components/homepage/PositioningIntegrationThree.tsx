'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Theme = 'light' | 'dark';

const NODES: readonly { title: string; sub: string }[] = [
  { title: 'Token fabric', sub: 'GPU capacity' },
  { title: 'Accelerator path', sub: 'Deterministic kernels' },
  { title: 'Risk controls', sub: 'Gate · audit' },
] as const;

function palette(theme: Theme) {
  if (theme === 'light') {
    return {
      clear: 0xf5f2eb,
      plinth: 0xffffff,
      stroke: 0x6b7c6e,
      accent: 0x2e5a3a,
      accent2: 0xd2b48c,
      ribbon: 0x2e5a3a,
    };
  }
  return {
    clear: 0x0c0c0c,
    plinth: 0x1a1a1a,
    stroke: 0x3d4d42,
    accent: 0x3d6b4a,
    accent2: 0xc4a574,
    ribbon: 0x4a7a58,
  };
}

export function PositioningIntegrationThree({ theme = 'light' }: { theme?: Theme }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const p = palette(theme);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(p.clear);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 2.4, 9.2);
    camera.lookAt(0, 0.35, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, theme === 'light' ? 0.72 : 0.35);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xffffff, theme === 'light' ? 0.95 : 0.55);
    key.position.set(4, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    scene.add(key);
    const fill = new THREE.DirectionalLight(p.accent2, theme === 'light' ? 0.25 : 0.2);
    fill.position.set(-5, 3, -2);
    scene.add(fill);

    const group = new THREE.Group();
    scene.add(group);

    const positions: THREE.Vector3[] = [];
    const spacing = 2.35;
    const mats: THREE.MeshStandardMaterial[] = [];

    NODES.forEach((_, i) => {
      const x = (i - 1) * spacing;
      const geo = new THREE.BoxGeometry(1.35, 0.95, 1.05);
      const mat = new THREE.MeshStandardMaterial({
        color: p.plinth,
        metalness: 0.12,
        roughness: 0.42,
        emissive: new THREE.Color(i === 1 ? p.accent : 0x000000),
        emissiveIntensity: i === 1 ? 0.06 : 0,
      });
      mats.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 0, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      positions.push(new THREE.Vector3(x, 0.2, 0));

      const edge = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(
        edge,
        new THREE.LineBasicMaterial({ color: p.stroke, transparent: true, opacity: 0.55 }),
      );
      line.position.copy(mesh.position);
      group.add(line);
    });

    const curve = new THREE.CatmullRomCurve3([
      positions[0].clone().add(new THREE.Vector3(0, 0.15, 0.2)),
      new THREE.Vector3(0, 0.55, 0.35),
      positions[2].clone().add(new THREE.Vector3(0, 0.15, 0.2)),
    ]);
    const tubeGeo = new THREE.TubeGeometry(curve, 48, 0.045, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: p.ribbon,
      metalness: 0.35,
      roughness: 0.35,
      transparent: true,
      opacity: 0.88,
    });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    tube.castShadow = true;
    group.add(tube);

    const groundGeo = new THREE.PlaneGeometry(14, 6);
    const groundMat = new THREE.MeshStandardMaterial({
      color: p.clear,
      metalness: 0,
      roughness: 1,
      transparent: true,
      opacity: 0.94,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.52;
    ground.receiveShadow = true;
    scene.add(ground);

    let raf = 0;
    const t0 = performance.now();

    const setSize = () => {
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(140, Math.round(w * 0.36));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const ro = new ResizeObserver(setSize);
    ro.observe(mount);
    setSize();

    const animate = (now: number) => {
      raf = requestAnimationFrame(animate);
      const t = (now - t0) * 0.001;
      group.children.forEach((child, idx) => {
        if (child instanceof THREE.Mesh && child.geometry instanceof THREE.BoxGeometry) {
          const phase = idx * 0.9;
          child.position.y = Math.sin(t * 0.9 + phase) * 0.07;
          child.rotation.y = Math.sin(t * 0.35 + phase) * 0.06;
        }
      });
      tubeMat.opacity = 0.78 + Math.sin(t * 1.2) * 0.08;
      if (mats[1]) {
        mats[1].emissiveIntensity = 0.05 + Math.sin(t * 1.4) * 0.025;
      }
      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.LineSegments) {
          obj.geometry?.dispose();
          const m = obj.material;
          if (Array.isArray(m)) m.forEach((x) => x.dispose());
          else m?.dispose();
        }
      });
    };
  }, [theme]);

  const border = theme === 'light' ? 'rgba(46, 90, 58, 0.14)' : 'rgba(255,255,255,0.1)';
  const title = theme === 'light' ? '#1A1A1A' : 'rgba(255,255,255,0.9)';
  const sub = theme === 'light' ? '#4a4a48' : 'rgba(255,255,255,0.45)';

  return (
    <div className="w-full">
      <div
        ref={mountRef}
        className="w-full overflow-hidden rounded-md border"
        style={{ borderColor: border, minHeight: 140 }}
        aria-hidden
      />
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-2">
        {NODES.map((n) => (
          <div key={n.title} className="text-center sm:px-1">
            <p className="text-[10px] font-semibold leading-tight tracking-tight" style={{ color: title }}>
              {n.title}
            </p>
            <p className="mt-0.5 font-mono text-[8.5px] font-normal leading-snug" style={{ color: sub }}>
              {n.sub}
            </p>
          </div>
        ))}
      </div>
      <p className="sr-only">
        Three-dimensional schematic: token fabric, accelerator path, and risk controls linked by a single curved execution
        ribbon.
      </p>
    </div>
  );
}
