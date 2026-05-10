// 箍筋路径生成 + 加密区计算 (22G101-1)
import type { BeamParams, RebarPath, Vec3 } from './types';

/** 加密区长度: 抗震框架梁 = max(2h, 500) */
export function computeDensifyLength(params: BeamParams): number {
  if (params.seismicLevel === 0) return 0;
  return Math.max(2 * params.height, 500);
}

/** 加密区间距: min(h/4, 8d, 100), d = 纵筋最小直径 */
export function computeDensifySpacing(params: BeamParams): number {
  const dMin = Math.min(params.topDiameter, params.botDiameter);
  return Math.min(Math.floor(params.height / 4), 8 * dMin, 100);
}

/** 弯钩平直段: max(10d, 75) */
export function computeStirrupHookStraight(stirrupD: number): number {
  return Math.max(10 * stirrupD, 75);
}

/** 生成箍筋分布的 X 坐标列表 (沿梁长方向，0 = 梁左端含支座) */
export function distributeStirrups(
  params: BeamParams,
  densifyLen: number,
  densifySpacing: number,
  normalSpacing: number,
): number[] {
  const totalLen = params.span + params.supportLeft + params.supportRight;
  const xs: number[] = [];

  // 起始位置: 距支座边缘 50mm 起第一根箍筋
  const startOffset = 50;
  const leftDenseStart = params.supportLeft + startOffset;
  const leftDenseEnd = params.supportLeft + densifyLen;
  const rightDenseStart = totalLen - params.supportRight - densifyLen;
  const rightDenseEnd = totalLen - params.supportRight - startOffset;

  if (densifyLen === 0) {
    // 非抗震，全跨非加密
    for (let x = params.supportLeft + startOffset; x <= totalLen - params.supportRight - startOffset; x += normalSpacing) {
      xs.push(x);
    }
    return xs;
  }

  // 左加密区
  for (let x = leftDenseStart; x <= leftDenseEnd + 1e-3; x += densifySpacing) xs.push(x);
  // 中间非加密区
  const midStart = leftDenseEnd + normalSpacing;
  for (let x = midStart; x < rightDenseStart - 1e-3; x += normalSpacing) xs.push(x);
  // 右加密区
  for (let x = rightDenseStart; x <= rightDenseEnd + 1e-3; x += densifySpacing) xs.push(x);

  return xs;
}

/**
 * 单根矩形箍筋路径 (含 135° 弯钩)，位于 X = x 平面
 * 坐标系: X = 沿梁长, Y = 高度, Z = 宽度方向
 * 截面外尺寸 (箍筋外皮): bw × bh
 */
export function buildStirrupPath(
  x: number,
  bw: number,
  bh: number,
  diameter: number,
  hookStraight: number,
  tag = 'outer',
): RebarPath {
  // 箍筋中心线尺寸 = 外皮 - 直径
  const w = bw - diameter;
  const h = bh - diameter;
  const halfW = w / 2;
  const halfH = h / 2;

  // 起点: 左上角附近 (135° 弯钩外伸方向 = 朝向截面内 45°)
  // 路径顺序: 弯钩起点 → 左上 → 右上 → 右下 → 左下 → 回到左上 → 弯钩终点
  // 弯钩从左上角沿对角线方向外伸 hookStraight，但实际是从内向外伸入混凝土
  // 简化: 起点和终点都是从左上角向截面内侧 45° 延伸 hookStraight
  const hookDx = (hookStraight * Math.SQRT1_2);
  const points: Vec3[] = [
    // 弯钩起点 (从内向左上角)
    { x, y: halfH - hookDx, z: -halfW + hookDx },
    // 左上角
    { x, y: halfH, z: -halfW },
    // 右上角
    { x, y: halfH, z: halfW },
    // 右下角
    { x, y: -halfH, z: halfW },
    // 左下角
    { x, y: -halfH, z: -halfW },
    // 回到左上角
    { x, y: halfH, z: -halfW },
    // 弯钩终点 (再次往内 45°)
    { x, y: halfH - hookDx, z: -halfW + hookDx },
  ];

  return {
    id: `stirrup-${tag}-${x.toFixed(0)}`,
    kind: 'stirrup',
    diameter,
    points,
    bendRadius: Math.max(2.5 * diameter, 25),
  };
}
