// 平法规则引擎类型定义（单位：mm）
export type ConcreteGrade = 'C25' | 'C30' | 'C35' | 'C40' | 'C45' | 'C50';
export type RebarGrade = 'HRB400' | 'HRB500';
export type SeismicLevel = 1 | 2 | 3 | 4 | 0; // 0 = 非抗震

export interface BeamParams {
  // 几何
  span: number;           // 净跨 Ln
  width: number;          // 截面宽 b
  height: number;         // 截面高 h
  cover: number;          // 保护层 c (到箍筋外缘)
  supportLeft: number;    // 左支座宽度
  supportRight: number;   // 右支座宽度

  // 材料
  concreteGrade: ConcreteGrade;
  rebarGrade: RebarGrade;
  seismicLevel: SeismicLevel;

  // 纵筋
  topDiameter: number;    // 上部通长筋直径
  topCount: number;       // 上部通长筋根数
  botDiameter: number;    // 下部纵筋直径
  botCount: number;       // 下部纵筋根数

  // 箍筋
  stirrupDiameter: number;       // 箍筋直径
  stirrupSpacingDense: number;   // 加密区间距 (自动 / 用户可覆盖)
  stirrupSpacingNormal: number;  // 非加密区间距
  stirrupLegs: 2 | 4;             // 肢数
}

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface RebarPath {
  id: string;
  kind: 'longitudinal-top' | 'longitudinal-bottom' | 'stirrup';
  diameter: number;
  points: Vec3[];        // 折线节点 (相邻段之间的拐角自动倒圆角)
  bendRadius: number;    // 弯曲半径 (mm)
  closed?: boolean;      // 闭合（箍筋在弯钩段后端不闭合）
  warn?: boolean;        // 净距/构造校核不通过
}

export interface BeamGeometry {
  params: BeamParams;
  concrete: { width: number; height: number; length: number };
  rebars: RebarPath[];
  // 推导值（供 UI 显示）
  derived: {
    lae: number;                  // 锚固长度
    densifyLength: number;        // 加密区长度
    densifySpacing: number;       // 加密区间距 (实际采用)
    normalSpacing: number;        // 非加密区间距
    stirrupHookStraight: number;  // 弯钩平直段长度
    totalLength: number;          // 梁全长 (Ln + 左右支座)
  };
  /** 构造校核警告 (净距等) */
  warnings: string[];
}
