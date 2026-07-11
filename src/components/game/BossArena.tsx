import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { BossVariant } from "../../lib/bosses";

/* ================================================================== *
 *  BOSS ARENA — procedural three.js boss, lazy-loaded so the 3-D
 *  bundle only downloads when a fight starts. Everything is built
 *  from primitives (no model files): each course variant gets its own
 *  silhouette, idle animation, hit/crit reactions, an attack lunge
 *  and a defeat collapse. Driven by props:
 *    hp      0..1 → glow, jitter and rage speed
 *    signal  {kind, nonce} → one-shot animations
 * ================================================================== */

export interface ArenaSignal {
  kind: "hit" | "crit" | "attack" | "defeat" | "enrage" | null;
  nonce: number;
}

interface ArenaProps {
  variant: BossVariant;
  colors: { primary: number; secondary: number; glow: number };
  hp: number;
  signal: ArenaSignal;
  /** mini-bosses render smaller */
  mini?: boolean;
}

interface FxState {
  shake: number;
  flash: number;
  attackP: number; // -1 idle, else 0..1
  defeatP: number; // -1 alive, else 0..1
}

const MAX_PARTICLES = 220;

export default function BossArena({ variant, colors, hp, signal, mini = false }: ArenaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hpRef = useRef(hp);
  const fxRef = useRef<FxState>({ shake: 0, flash: 0, attackP: -1, defeatP: -1 });
  const burstRef = useRef<(n: number, speed?: number) => void>(() => {});

  useEffect(() => {
    hpRef.current = hp;
  }, [hp]);

  // one-shot animation triggers
  useEffect(() => {
    const fx = fxRef.current;
    switch (signal.kind) {
      case "hit":
        fx.shake = Math.max(fx.shake, 0.3);
        fx.flash = 1;
        burstRef.current(36, 4);
        break;
      case "crit":
        fx.shake = Math.max(fx.shake, 0.65);
        fx.flash = 1.8;
        burstRef.current(90, 6);
        break;
      case "attack":
        fx.attackP = 0;
        fx.shake = Math.max(fx.shake, 0.25);
        break;
      case "defeat":
        fx.defeatP = 0;
        fx.flash = 2;
        burstRef.current(160, 7);
        break;
      case "enrage":
        fx.shake = Math.max(fx.shake, 0.8);
        fx.flash = 2.4;
        burstRef.current(120, 8);
        break;
    }
  }, [signal.nonce, signal.kind]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ---------- renderer / scene / camera ---------- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05070f, 0.04);

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / Math.max(1, container.clientHeight),
      0.1,
      100
    );
    // frame the boss in the upper part of the view — the question HUD
    // floats over the lower third in full-screen fights
    const BOSS_Y = 1.7;
    const camBase = new THREE.Vector3(0, 2.0, 7.8);
    camera.position.copy(camBase);
    camera.lookAt(0, BOSS_Y - 0.2, 0);

    scene.add(new THREE.AmbientLight(0x334, 1.6));
    const key = new THREE.PointLight(colors.glow, 260, 40);
    key.position.set(3, 5, 4);
    scene.add(key);
    const rim = new THREE.PointLight(colors.secondary, 140, 30);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    /* ---------- arena floor ---------- */
    const grid = new THREE.PolarGridHelper(9, 12, 6, 48, colors.glow, 0x223055);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.35;
    grid.position.y = -0.6;
    scene.add(grid);

    /* ---------- starfield ---------- */
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(360 * 3);
    for (let k = 0; k < 360; k++) {
      const r = 18 + Math.random() * 28;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPos[k * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[k * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.6 - 2;
      starPos[k * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x8fa4d9,
      size: 0.07,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ---------- boss ---------- */
    const baseScale = mini ? 0.72 : 1;
    const boss = new THREE.Group();
    boss.position.y = BOSS_Y;
    boss.scale.setScalar(baseScale);
    scene.add(boss);

    const pulseMats: THREE.MeshStandardMaterial[] = [];
    const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

    const std = (opts: THREE.MeshStandardMaterialParameters) => {
      const m = new THREE.MeshStandardMaterial(opts);
      disposables.push(m);
      return m;
    };
    const geo = <G extends THREE.BufferGeometry>(g: G): G => {
      disposables.push(g);
      return g;
    };

    // per-variant orbiters animated in the loop
    const orbiters: { mesh: THREE.Mesh; r: number; speed: number; y: number; phase: number }[] = [];
    const spinners: { obj: THREE.Object3D; axis: "x" | "y" | "z"; speed: number }[] = [];

    const coreMat = std({
      color: colors.primary,
      emissive: colors.glow,
      emissiveIntensity: 0.5,
      metalness: 0.35,
      roughness: 0.4,
      flatShading: true,
    });
    pulseMats.push(coreMat);

    function addOrbiters(count: number, geometry: THREE.BufferGeometry, radius: number) {
      for (let k = 0; k < count; k++) {
        const m = new THREE.Mesh(
          geometry,
          std({
            color: colors.secondary,
            emissive: colors.glow,
            emissiveIntensity: 0.7,
            flatShading: true,
          })
        );
        boss.add(m);
        orbiters.push({
          mesh: m,
          r: radius + Math.random() * 0.5,
          speed: 0.6 + Math.random() * 0.8,
          y: (Math.random() - 0.5) * 1.6,
          phase: (k / count) * Math.PI * 2,
        });
      }
    }

    if (variant === "entropy") {
      const core = new THREE.Mesh(geo(new THREE.IcosahedronGeometry(1.05, 1)), coreMat);
      boss.add(core);
      spinners.push({ obj: core, axis: "y", speed: 0.4 });

      const ringMat = std({ color: colors.secondary, metalness: 0.8, roughness: 0.25, emissive: colors.primary, emissiveIntensity: 0.25 });
      const ring1 = new THREE.Mesh(geo(new THREE.TorusGeometry(1.8, 0.09, 12, 64)), ringMat);
      ring1.rotation.x = Math.PI / 2.4;
      boss.add(ring1);
      spinners.push({ obj: ring1, axis: "z", speed: 0.8 });
      // gear teeth riding the ring
      const toothGeo = geo(new THREE.BoxGeometry(0.16, 0.28, 0.16));
      for (let k = 0; k < 10; k++) {
        const tooth = new THREE.Mesh(toothGeo, ringMat);
        const a = (k / 10) * Math.PI * 2;
        tooth.position.set(Math.cos(a) * 1.8, Math.sin(a) * 1.8, 0);
        tooth.rotation.z = a;
        ring1.add(tooth);
      }
      const ring2 = new THREE.Mesh(geo(new THREE.TorusGeometry(2.25, 0.05, 10, 64)), ringMat);
      ring2.rotation.x = Math.PI / 1.7;
      ring2.rotation.y = 0.5;
      boss.add(ring2);
      spinners.push({ obj: ring2, axis: "z", speed: -0.5 });

      addOrbiters(8, geo(new THREE.TetrahedronGeometry(0.17)), 2.6);
    } else if (variant === "wraith") {
      const core = new THREE.Mesh(
        geo(new THREE.TorusKnotGeometry(0.8, 0.26, 128, 16)),
        std({ color: colors.primary, emissive: colors.glow, emissiveIntensity: 0.6, wireframe: true })
      );
      pulseMats.push(core.material as THREE.MeshStandardMaterial);
      boss.add(core);
      spinners.push({ obj: core, axis: "y", speed: 0.5 });

      const heart = new THREE.Mesh(geo(new THREE.OctahedronGeometry(0.42)), coreMat);
      boss.add(heart);
      spinners.push({ obj: heart, axis: "x", speed: 1.4 });

      // the saddle z = k(x² − y²) it guards
      const saddleGeo = geo(new THREE.PlaneGeometry(5, 5, 26, 26));
      const posAttr = saddleGeo.attributes.position;
      for (let k = 0; k < posAttr.count; k++) {
        const x = posAttr.getX(k);
        const y = posAttr.getY(k);
        posAttr.setZ(k, 0.16 * (x * x - y * y));
      }
      saddleGeo.computeVertexNormals();
      const saddle = new THREE.Mesh(
        saddleGeo,
        std({ color: colors.secondary, emissive: colors.primary, emissiveIntensity: 0.2, wireframe: true, transparent: true, opacity: 0.5 })
      );
      saddle.rotation.x = -Math.PI / 2;
      saddle.position.y = -1.75;
      boss.add(saddle);

      addOrbiters(7, geo(new THREE.OctahedronGeometry(0.14)), 2.2);
    } else if (variant === "sigma") {
      // gaussian bell ribbon
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 40; k++) {
        const x = -2.3 + (k / 40) * 4.6;
        pts.push(new THREE.Vector3(x, 2.0 * Math.exp(-x * x) - 0.8, 0));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const bell = new THREE.Mesh(geo(new THREE.TubeGeometry(curve, 80, 0.1, 10, false)), coreMat);
      boss.add(bell);
      spinners.push({ obj: bell, axis: "y", speed: 0.6 });

      const core = new THREE.Mesh(
        geo(new THREE.SphereGeometry(0.55, 24, 18)),
        std({ color: colors.primary, emissive: colors.glow, emissiveIntensity: 0.7, metalness: 0.2, roughness: 0.3 })
      );
      pulseMats.push(core.material as THREE.MeshStandardMaterial);
      core.position.y = 0.2;
      boss.add(core);

      // jittering error bars
      const barGeo = geo(new THREE.CylinderGeometry(0.035, 0.035, 1, 8));
      for (let k = 0; k < 6; k++) {
        const bar = new THREE.Mesh(
          barGeo,
          std({ color: colors.secondary, emissive: colors.glow, emissiveIntensity: 0.6 })
        );
        boss.add(bar);
        orbiters.push({
          mesh: bar,
          r: 1.7 + Math.random() * 0.4,
          speed: 0.5 + Math.random() * 0.6,
          y: (Math.random() - 0.5) * 1.2,
          phase: (k / 6) * Math.PI * 2,
        });
      }
    } else {
      const core = new THREE.Mesh(geo(new THREE.DodecahedronGeometry(1.0, 0)), coreMat);
      boss.add(core);
      spinners.push({ obj: core, axis: "y", speed: 0.5 });
      const ring = new THREE.Mesh(
        geo(new THREE.TorusGeometry(1.9, 0.07, 10, 64)),
        std({ color: colors.secondary, metalness: 0.7, roughness: 0.3, emissive: colors.primary, emissiveIntensity: 0.25 })
      );
      ring.rotation.x = Math.PI / 2.2;
      boss.add(ring);
      spinners.push({ obj: ring, axis: "z", speed: 0.7 });
      addOrbiters(6, geo(new THREE.TetrahedronGeometry(0.16)), 2.4);
    }

    /* ---------- hit particles ---------- */
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(MAX_PARTICLES * 3);
    const velocities = new Float32Array(MAX_PARTICLES * 3);
    const life = new Float32Array(MAX_PARTICLES);
    positions.fill(9999);
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: colors.glow,
      size: 0.09,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);
    disposables.push(pGeo, pMat);

    burstRef.current = (n: number, speed = 4) => {
      let seeded = 0;
      for (let k = 0; k < MAX_PARTICLES && seeded < n; k++) {
        if (life[k] > 0) continue;
        life[k] = 0.7 + Math.random() * 0.5;
        positions[k * 3] = boss.position.x + (Math.random() - 0.5) * 0.6;
        positions[k * 3 + 1] = boss.position.y + (Math.random() - 0.5) * 0.6;
        positions[k * 3 + 2] = boss.position.z + (Math.random() - 0.5) * 0.6;
        const dir = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.3,
          Math.random() - 0.5
        ).normalize();
        const v = speed * (0.5 + Math.random());
        velocities[k * 3] = dir.x * v;
        velocities[k * 3 + 1] = dir.y * v;
        velocities[k * 3 + 2] = dir.z * v;
        seeded += 1;
      }
    };

    /* ---------- loop ---------- */
    let raf = 0;
    let last = performance.now();
    let t = 0;

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const fx = fxRef.current;
      const hpNow = hpRef.current;
      const rage = 1 + (1 - hpNow) * 1.3;

      if (fx.defeatP < 0) {
        // idle motion
        boss.rotation.y += dt * 0.35 * rage;
        boss.position.y = BOSS_Y + Math.sin(t * 1.3) * 0.12;
        if (hpNow < 0.4) {
          boss.position.x = (Math.random() - 0.5) * 0.05 * (1 - hpNow);
        }
        // attack lunge
        if (fx.attackP >= 0) {
          fx.attackP += dt * 1.5;
          if (fx.attackP >= 1) {
            fx.attackP = -1;
            boss.position.z = 0;
          } else {
            boss.position.z = Math.sin(fx.attackP * Math.PI) * 3.4;
          }
        }
      } else if (fx.defeatP < 1) {
        // collapse
        fx.defeatP = Math.min(1, fx.defeatP + dt * 0.55);
        const p = fx.defeatP;
        boss.rotation.y += dt * (2 + p * 9);
        const s = Math.max(0.02, 1 - p) * baseScale;
        boss.scale.set(s, s, s);
        boss.position.y = BOSS_Y - p * 0.9;
      }
      stars.rotation.y += dt * 0.012;

      for (const sp of spinners) sp.obj.rotation[sp.axis] += dt * sp.speed * rage;
      for (const o of orbiters) {
        const a = t * o.speed * rage + o.phase;
        o.mesh.position.set(Math.cos(a) * o.r, o.y + Math.sin(t * 1.7 + o.phase) * 0.25, Math.sin(a) * o.r);
        o.mesh.rotation.x += dt * 2;
        o.mesh.rotation.y += dt * 1.4;
      }

      // emissive pulse + hit flash
      const base = 0.45 + 0.25 * Math.sin(t * 2.2) + (1 - hpNow) * 0.5;
      for (const m of pulseMats) m.emissiveIntensity = base + fx.flash;
      fx.flash *= Math.pow(0.02, dt); // fast decay

      // camera shake
      camera.position.set(
        camBase.x + (Math.random() - 0.5) * fx.shake,
        camBase.y + (Math.random() - 0.5) * fx.shake,
        camBase.z
      );
      camera.lookAt(0, BOSS_Y - 0.2, 0);
      fx.shake *= Math.pow(0.01, dt);

      // particles
      let anyAlive = false;
      for (let k = 0; k < MAX_PARTICLES; k++) {
        if (life[k] <= 0) continue;
        anyAlive = true;
        life[k] -= dt;
        velocities[k * 3 + 1] -= 4.5 * dt;
        positions[k * 3] += velocities[k * 3] * dt;
        positions[k * 3 + 1] += velocities[k * 3 + 1] * dt;
        positions[k * 3 + 2] += velocities[k * 3 + 2] * dt;
        if (life[k] <= 0) {
          positions[k * 3] = 9999;
          positions[k * 3 + 1] = 9999;
        }
      }
      if (anyAlive) pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    /* ---------- resize / cleanup ---------- */
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = Math.max(1, container.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      for (const d of disposables) d.dispose();
      (grid.material as THREE.Material).dispose();
      grid.geometry.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
    // colors/variant are stable for a given fight
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, colors.primary, colors.secondary, colors.glow, mini]);

  return <div ref={containerRef} className="h-full w-full" aria-hidden />;
}
