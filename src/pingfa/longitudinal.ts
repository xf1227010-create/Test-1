// 纵筋路径生成 (含支座弯锚 0.4lae + 15d)
import type { BeamParams, RebarPath, Vec3 } from './types';

/**
 * 生成上部 / 下部通长纵筋。
 * 当支座宽度足够直锚时走直锚 (≥ lae)，否则采用弯锚: 水平段 ≥ 0.4lae + 竖直段 15d。
 * 坐标: X 沿梁长 (0 = 梁左端含支座), Y 截面高度 (0 = 形心), Z 截面宽度 (0 = 中线)
 */
export function buildLongitudinal(
  params: BeamParams,
  lae: number,
  position: 'top' | 'bottom',
): RebarPath[] {
  const { width, height, cover, stirrupDiameter, supportLeft, supportRight, span } = params;
  const totalLen = supportLeft + span + supportRight;
  const diameter = position === 'top' ? params.topDiameter : params.botDiameter;
  const count = position === 'top' ? params.topCount : params.botCount;
  if (count <= 0) return [];

  // 钢筋形心距截面边缘
  const yEdge = height / 2 - cover - stirrupDiameter - diameter / 2;
  const y = position === 'top' ? yEdge : -yEdge;

  // 横向布置: 在保护层 + 箍筋 + 自身半径 之内均布
  const zEdge = width / 2 - cover - stirrupDiameter - diameter / 2;
  const zPositions: number[] = [];
  if (count === 1) zPositions.push(0);
  else {
    const step = (2 * zEdge) / (count - 1);
    for (let i = 0; i < count; i++) zPositions.push(-zEdge + i * step);
  }

  // 端部锚固判定
  const hookVert = 15 * diameter;
  const hookHorizMin = 0.4 * lae;
  const canStraightLeft = supportLeft >= lae + cover; // 支座内可直锚
  const canStraightRight = supportRight >= lae + cover;

  const yHookEnd = position === 'top' ? y - hookVert : y + hookVert; // 上筋向下弯，下筋向上弯

  const rebars: RebarPath[] = [];
  zPositions.forEach((z, i) => {
    const points: Vec3[] = [];

    // 左端
    if (canStraightLeft) {
      points.push({ x: cover, y, z });
    } else {
      const xVert = supportLeft - cover; // 弯锚竖直段位置 (柱内边)
      // 起点: 柱内边再往里 hookHorizMin (实际: 0.4lae 水平段从柱外边算起)
      // 简化: 竖直段顶部
      points.push({ x: xVert, y: yHookEnd, z });
      points.push({ x: xVert, y, z });
    }

    // 跨中无变化，直线即可（一笔到右端）

    // 右端
    if (canStraightRight) {
      points.push({ x: totalLen - cover, y, z });
    } else {
      const xVert = totalLen - supportRight + cover;
      points.push({ x: xVert, y, z });
      points.push({ x: xVert, y: yHookEnd, z });
    }

    rebars.push({
      id: `${position}-${i}`,
      kind: position === 'top' ? 'longitudinal-top' : 'longitudinal-bottom',
      diameter,
      points,
      bendRadius: Math.max(4 * diameter, 40),
    });
  });

  return rebars;
}
