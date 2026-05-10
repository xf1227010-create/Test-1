import { describe, expect, it } from 'vitest';
import { parsePingfa } from '../parser';

describe('parsePingfa', () => {
  it('解析典型完整标注', () => {
    const r = parsePingfa('KL1(2) 300x600 φ8@100/200(2) 2Φ25;3Φ25');
    expect(r.ok).toBe(true);
    expect(r.name).toMatch(/^KL1/);
    expect(r.patch).toMatchObject({
      width: 300,
      height: 600,
      stirrupDiameter: 8,
      stirrupSpacingDense: 100,
      stirrupSpacingNormal: 200,
      stirrupLegs: 2,
      topCount: 2,
      topDiameter: 25,
      botCount: 3,
      botDiameter: 25,
    });
  });

  it('全角符号与四肢箍', () => {
    const r = parsePingfa('KL3(3A) 250×500 Φ10@100/150(4) 2C25;4C25');
    expect(r.ok).toBe(true);
    expect(r.patch.width).toBe(250);
    expect(r.patch.height).toBe(500);
    expect(r.patch.stirrupDiameter).toBe(10);
    expect(r.patch.stirrupLegs).toBe(4);
    expect(r.patch.botCount).toBe(4);
  });

  it('单一间距箍筋', () => {
    const r = parsePingfa('KL2(1) 200x400 φ8@200(2) 2Φ20;2Φ20');
    expect(r.patch.stirrupSpacingDense).toBe(200);
    expect(r.patch.stirrupSpacingNormal).toBe(200);
  });

  it('缺失字段返回 ok=false 并给出警告', () => {
    const r = parsePingfa('KL1(2) 300x600');
    expect(r.ok).toBe(false);
    expect(r.warnings.length).toBeGreaterThan(0);
  });
});
