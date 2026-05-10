// 由折线 + 圆角半径生成 Three.js 曲线 (用于 TubeGeometry)
import * as THREE from 'three';
import type { RebarPath, Vec3 } from '@/pingfa';

function v3(p: Vec3): THREE.Vector3 {
  return new THREE.Vector3(p.x, p.y, p.z);
}

/**
 * 给折线的每个内拐角插入圆弧, 输出一系列分段曲线, 再合并为 CurvePath。
 *
 * 算法: 对每个内点 P (前 A, 后 B), 找到 P→A 距 P = r 的点 P1, P→B 距 P = r 的点 P2,
 *       用 **三次贝塞尔** (P1, C1, C2, P2) 精确逼近圆弧。
 *
 * 三次贝塞尔逼近圆弧的标准做法: 控制点距端点 k = (4/3)·tan(θ/4)·r,
 * 其中 θ 是路径在 P 处的"转角" (直线 0; 90° 直角 π/2)。
 * 90° 弯钩误差 ~0.027% · r, 视觉上完全等同于真圆弧;
 * 比之前用 QuadraticBezier(抛物线近似)平滑得多。
 *
 * 当相邻段过短(< 2r) 时自动减小 r。
 */
export function buildCurveFromPath(path: RebarPath): THREE.CurvePath<THREE.Vector3> {
  const pts = path.points.map(v3);
  const r0 = path.bendRadius;
  const curve = new THREE.CurvePath<THREE.Vector3>();
  if (pts.length < 2) return curve;
  if (pts.length === 2) {
    curve.add(new THREE.LineCurve3(pts[0], pts[1]));
    return curve;
  }

  type Arc = { p1: THREE.Vector3; c1: THREE.Vector3; c2: THREE.Vector3; p2: THREE.Vector3 };
  type Seg = { from: THREE.Vector3; to: THREE.Vector3; arc?: Arc };
  const segs: Seg[] = [];

  let lastEnd = pts[0].clone();
  for (let i = 1; i < pts.length - 1; i++) {
    const A = pts[i - 1];
    const P = pts[i];
    const B = pts[i + 1];
    const dirA = new THREE.Vector3().subVectors(A, P);
    const dirB = new THREE.Vector3().subVectors(B, P);
    const lenA = dirA.length();
    const lenB = dirB.length();
    if (lenA < 1e-3 || lenB < 1e-3) continue;
    dirA.normalize();
    dirB.normalize();
    // 共线? 跳过 (路径方向未改变, 不需要圆角)
    if (dirA.clone().add(dirB).length() < 1e-3) continue;

    const r = Math.min(r0, lenA * 0.45, lenB * 0.45);
    const P1 = P.clone().add(dirA.clone().multiplyScalar(r));
    const P2 = P.clone().add(dirB.clone().multiplyScalar(r));

    // 路径转角 θ = π - 夹角(dirA, dirB)
    //   直线: dirA·dirB = -1, θ = 0
    //   90° 直角 (典型箍筋): dirA·dirB = 0, θ = π/2
    const cosBetween = Math.max(-1, Math.min(1, dirA.dot(dirB)));
    const theta = Math.PI - Math.acos(cosBetween);
    // 三次贝塞尔控制点偏移 (圆弧逼近经典常数)
    const k = (4 / 3) * Math.tan(theta / 4) * r;
    // 控制点位于 P 到 P1, P 到 P2 连线上, 距 P 为 (r - k)
    const C1 = P.clone().add(dirA.clone().multiplyScalar(r - k));
    const C2 = P.clone().add(dirB.clone().multiplyScalar(r - k));

    segs.push({ from: lastEnd.clone(), to: P1, arc: { p1: P1, c1: C1, c2: C2, p2: P2 } });
    lastEnd = P2.clone();
  }
  // 最后一段直线
  segs.push({ from: lastEnd, to: pts[pts.length - 1].clone() });

  for (const s of segs) {
    if (s.from.distanceTo(s.to) > 1e-3) {
      curve.add(new THREE.LineCurve3(s.from, s.to));
    }
    if (s.arc) {
      curve.add(new THREE.CubicBezierCurve3(s.arc.p1, s.arc.c1, s.arc.c2, s.arc.p2));
    }
  }
  return curve;
}

export function approximatePathLength(path: RebarPath): number {
  let len = 0;
  for (let i = 1; i < path.points.length; i++) {
    const a = path.points[i - 1];
    const b = path.points[i];
    len += Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  }
  return len;
}
