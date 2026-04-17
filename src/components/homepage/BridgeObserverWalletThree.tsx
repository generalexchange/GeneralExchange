'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function BridgeObserverWalletThree() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x141412);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0.85, 0.55, 1.35);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(amb);
    const key = new THREE.DirectionalLight(0xfff4e8, 0.9);
    key.position.set(2.2, 4, 3);
    key.castShadow = true;
    key.shadow.mapSize.set(768, 768);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x2e5a3a, 0.35);
    rim.position.set(-3, 1, -1);
    scene.add(rim);

    const leather = new THREE.MeshStandardMaterial({
      color: 0x4a3528,
      roughness: 0.88,
      metalness: 0.08,
    });
    const leatherDark = new THREE.MeshStandardMaterial({
      color: 0x2e2118,
      roughness: 0.92,
      metalness: 0.05,
    });
    const stitch = new THREE.MeshStandardMaterial({
      color: 0xc4a882,
      roughness: 0.65,
      metalness: 0.15,
    });
    const inner = new THREE.MeshStandardMaterial({
      color: 0x1a1816,
      roughness: 0.75,
      metalness: 0.12,
    });
    const card = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8,
      roughness: 0.55,
      metalness: 0.02,
    });

    const wallet = new THREE.Group();
    scene.add(wallet);

    const bodyGeo = new THREE.BoxGeometry(1.15, 0.72, 0.09);
    const body = new THREE.Mesh(bodyGeo, leather);
    body.castShadow = true;
    body.receiveShadow = true;
    wallet.add(body);

    const flapGeo = new THREE.BoxGeometry(1.12, 0.68, 0.045);
    const flap = new THREE.Mesh(flapGeo, leatherDark);
    flap.position.set(0, 0.36, -0.04);
    flap.rotation.x = -0.42;
    flap.castShadow = true;
    wallet.add(flap);

    const pocketGeo = new THREE.BoxGeometry(0.95, 0.5, 0.02);
    const pocket = new THREE.Mesh(pocketGeo, inner);
    pocket.position.set(0, -0.02, 0.046);
    wallet.add(pocket);

    const cardGeo = new THREE.BoxGeometry(0.88, 0.52, 0.018);
    const cardMesh = new THREE.Mesh(cardGeo, card);
    cardMesh.position.set(0.04, 0.02, 0.055);
    cardMesh.rotation.z = -0.06;
    cardMesh.castShadow = true;
    wallet.add(cardMesh);

    const stitchGeo = new THREE.TorusGeometry(0.52, 0.008, 6, 48, Math.PI * 1.05);
    const stitchMesh = new THREE.Mesh(stitchGeo, stitch);
    stitchMesh.rotation.x = Math.PI / 2;
    stitchMesh.position.set(0, -0.34, 0.048);
    wallet.add(stitchMesh);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 4),
      new THREE.MeshStandardMaterial({ color: 0x141412, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.42;
    ground.receiveShadow = true;
    scene.add(ground);

    let raf = 0;
    const t0 = performance.now();

    const setSize = () => {
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(120, Math.round(w * 0.72));
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
      wallet.rotation.y = Math.sin(t * 0.55) * 0.22 - 0.12;
      wallet.rotation.x = Math.sin(t * 0.35) * 0.04;
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
  }, []);

  return (
    <div className="w-full max-w-[280px]">
      <p className="sr-only">Three-dimensional illustration of a folded leather wallet with a card slot</p>
      <div
        ref={mountRef}
        className="w-full overflow-hidden rounded-md border border-white/[0.08]"
        style={{ minHeight: 120 }}
        aria-hidden
      />
    </div>
  );
}
