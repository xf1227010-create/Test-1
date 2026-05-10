// 由折线 + 圆角半径生成 Three.js 曲线 (用于 TubeGeometry)
import * as THREE from 'three';
import type { RebarPath, Vec3 } from '@/pingfa';

function v3(p: Vec3): THREE.Vector3 {
  return new THREE.Vector3(p.x, p.y, p.z);
}

/**
 * 给折线的每个内拐角插入圆弧，输出一系列分段曲线，再合并为 CurvePath。
 * 算法: 对每个内点 P (前 A，后 B)，找到 A→P 上距 P = r 的点 P1，P→B 上距 P = r 的点 P2，
 *       用 QuadraticBezier(P1, P, P2) 作为圆角；前后段截短为 A→P1 和 P2→B。
 * 当相邻段过短(< 2r)时自动减小 r。
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

  // 计算每个点的圆角端点
  type Seg = { from: THREE.Vector3; to: THREE.Vector3; arc?: { p1: THREE.Vector3; ctrl: THREE.Vector3; p2: THREE.Vector3 } };
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
    // 共线? 跳过
    if (dirA.clone().add(dirB).length() < 1e-3) continue;
    const r = Math.min(r0, lenA * 0.45, lenB * 0.45);
    const P1 = P.clone().add(dirA.clone().multiplyScalar(r));
    const P2 = P.clone().add(dirB.clone().multiplyScalar(r));
    // 直线段: lastEnd → P1
    segs.push({ from: lastEnd.clone(), to: P1, arc: { p1: P1, ctrl: P.clone(), p2: P2 } });
    lastEnd = P2.clone();
  }
  // 最后一段直线
  segs.push({ from: lastEnd, to: pts[pts.length - 1].clone() });

  for (const s of segs) {
    if (s.from.distanceTo(s.to) > 1e-3) {
      curve.add(new THREE.LineCurve3(s.from, s.to));
    }
    if (s.arc) {
      curve.add(new THREE.QuadraticBezierCurve3(s.arc.p1, s.arc.ctrl, s.arc.p2));
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
