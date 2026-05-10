import { describe, expect, it } from 'vitest';
import { buildBeam, computeDensifyLength, computeDensifySpacing, computeLae } from '..';
import { DEFAULT_PARAMS } from '@/store/useBeamStore';

describe('锚固长度 lae', () => {
  it('HRB400 + C30 + 二级抗震 = 35 * 1.15 = 40.25 → 取 41d', () => {
    expect(computeLae(25, 'C30', 'HRB400', 2)).toBe(41 * 25);
  });
  it('HRB400 + C30 非抗震 = 35d', () => {
    expect(computeLae(25, 'C30', 'HRB400', 0)).toBe(35 * 25);
  });
  it('HRB500 + C40 + 三级抗震', () => {
    expect(computeLae(20, 'C40', 'HRB500', 3)).toBe(Math.ceil(36 * 1.05) * 20);
  });
});

describe('加密区计算', () => {
  it('h=600 抗震二级 → 加密区 = max(2*600, 500) = 1200', () => {
    expect(computeDensifyLength({ ...DEFAULT_PARAMS, height: 600, seismicLevel: 2 })).toBe(1200);
  });
  it('非抗震 → 加密区 = 0', () => {
    expect(computeDensifyLength({ ...DEFAULT_PARAMS, seismicLevel: 0 })).toBe(0);
  });
  it('h=600 d=25 → 间距 = min(150, 200, 100) = 100', () => {
    expect(computeDensifySpacing({ ...DEFAULT_PARAMS, height: 600, topDiameter: 25, botDiameter: 25 })).toBe(100);
  });
});

describe('buildBeam 集成', () => {
  it('生成纵筋 + 箍筋', () => {
    const g = buildBeam(DEFAULT_PARAMS);
    expect(g.rebars.length).toBeGreaterThan(0);
    const longs = g.rebars.filter((r) => r.kind !== 'stirrup');
    const stirrups = g.rebars.filter((r) => r.kind === 'stirrup');
    expect(longs.length).toBe(DEFAULT_PARAMS.topCount + DEFAULT_PARAMS.botCount);
    expect(stirrups.length).toBeGreaterThan(10);
    expect(g.derived.lae).toBeGreaterThan(0);
    expect(g.derived.totalLength).toBe(DEFAULT_PARAMS.span + DEFAULT_PARAMS.supportLeft + DEFAULT_PARAMS.supportRight);
  });
});
