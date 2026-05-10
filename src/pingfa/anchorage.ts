// 锚固长度 lae 查表 (22G101-1 表)，单位 = 钢筋直径 d 的倍数
// 抗震等级一/二级取相同值；三级、四级、非抗震分别给值
import type { ConcreteGrade, RebarGrade, SeismicLevel } from './types';

// la (非抗震基本锚固长度，倍数)
const LA_TABLE: Record<RebarGrade, Record<ConcreteGrade, number>> = {
  HRB400: { C25: 40, C30: 35, C35: 32, C40: 29, C45: 28, C50: 27 },
  HRB500: { C25: 48, C30: 43, C35: 39, C40: 36, C45: 34, C50: 32 },
};

// 抗震修正系数 ζaE: 一二级 1.15, 三级 1.05, 四级及非抗震 1.00
function seismicFactor(level: SeismicLevel): number {
  if (level === 1 || level === 2) return 1.15;
  if (level === 3) return 1.05;
  return 1.0;
}

/** 计算 lae (mm) */
export function computeLae(
  diameter: number,
  concrete: ConcreteGrade,
  rebar: RebarGrade,
  seismic: SeismicLevel,
): number {
  const la = LA_TABLE[rebar][concrete];
  const zeta = seismicFactor(seismic);
  return Math.ceil(la * zeta) * diameter;
}
