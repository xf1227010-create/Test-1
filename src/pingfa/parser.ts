// 平法标注字符串解析器
// 支持示例:
//   "KL1(2) 300x600 φ8@100/200(2) 2Φ25;3Φ25"
//   "KL3(3A) 250×500  Φ10@100/150(4)  2C25;4C25"
//   全角/半角空格、x / × / *、中英冒号、; / ; / 、 分隔符
import type { BeamParams } from './types';

export interface ParseResult {
  ok: boolean;
  patch: Partial<BeamParams>;
  warnings: string[];
  error?: string;
  /** 解析得到的构件名，仅供显示 */
  name?: string;
}

const PHI_RE = /[φΦ\u24C5\u2476\u2474C]/; // 钢筋符号: φ Φ Ⓒ ⑥ ④ C (容错)

/** 主入口 */
export function parsePingfa(raw: string): ParseResult {
  const warnings: string[] = [];
  if (!raw || !raw.trim()) {
    return { ok: false, patch: {}, warnings, error: '输入为空' };
  }

  // 归一化: 全角→半角空格、× → x、Ｘ → x；保留 φ/Φ
  let s = raw
    .replace(/[\u3000\s]+/g, ' ')
    .replace(/[×Ｘ✕✖]/g, 'x')
    .replace(/[，；]/g, (m) => (m === '，' ? ',' : ';'))
    .trim();

  const patch: Partial<BeamParams> = {};

  // 1) 构件名 KL/L/WKL/KZL n (跨数)
  const nameMatch = s.match(/^(KL|L|WKL|KZL|LL)(\d+)\s*\(([^)]+)\)/i);
  let name: string | undefined;
  if (nameMatch) {
    name = nameMatch[0];
    s = s.slice(nameMatch[0].length).trim();
  }

  // 2) 截面 bxh
  const secMatch = s.match(/(\d{2,4})\s*x\s*(\d{2,4})/);
  if (secMatch) {
    patch.width = Number(secMatch[1]);
    patch.height = Number(secMatch[2]);
    s = s.replace(secMatch[0], ' ').trim();
  } else {
    warnings.push('未找到截面 b×h');
  }

  // 3) 箍筋  φ8@100/200(2)  或  Φ10@150(2) (无加密区)
  // 直径(可能有 φ/Φ/C)，@ 间距1 [/间距2]，([肢数])
  const stirrupRe = new RegExp(
    `${PHI_RE.source}?\\s*(\\d{1,2})\\s*@\\s*(\\d{2,3})(?:\\s*\\/\\s*(\\d{2,3}))?\\s*(?:\\(\\s*(\\d)\\s*\\))?`,
  );
  const stirMatch = s.match(stirrupRe);
  if (stirMatch) {
    const d = Number(stirMatch[1]);
    const sp1 = Number(stirMatch[2]);
    const sp2 = stirMatch[3] ? Number(stirMatch[3]) : sp1;
    const legs = stirMatch[4] ? Number(stirMatch[4]) : 2;
    if ([6, 8, 10, 12, 14].includes(d)) patch.stirrupDiameter = d;
    else warnings.push(`箍筋直径 ${d} 不在常规范围 [6,14]，已忽略`);
    patch.stirrupSpacingDense = Math.min(sp1, sp2);
    patch.stirrupSpacingNormal = Math.max(sp1, sp2);
    if (legs === 2 || legs === 4) patch.stirrupLegs = legs;
    else warnings.push(`肢数 ${legs} 不支持(仅 2/4)，已默认 2`);
    s = s.replace(stirMatch[0], ' ').trim();
  } else {
    warnings.push('未找到箍筋标注 (φd@s1/s2(n))');
  }

  // 4) 纵筋: 上部 ; 下部, 形如 "2Φ25;3Φ25"  或 "2C25;3C25" 或 "2φ22 ; 4Φ25"
  // 取最后剩余字符串里所有 "数字 + 钢筋符号 + 直径" 段，按 ; 分上下
  const longRe = new RegExp(`(\\d+)\\s*${PHI_RE.source}\\s*(\\d{2})`, 'g');
  const sections = s.split(/[;]/);
  const groups: { count: number; diameter: number }[][] = sections.map((seg) => {
    const out: { count: number; diameter: number }[] = [];
    let m: RegExpExecArray | null;
    const re = new RegExp(longRe.source, 'g');
    while ((m = re.exec(seg)) !== null) {
      out.push({ count: Number(m[1]), diameter: Number(m[2]) });
    }
    return out;
  });
  const nonEmpty = groups.filter((g) => g.length > 0);
  if (nonEmpty.length >= 2) {
    // 第一段 = 上部，第二段 = 下部 (取每段第一个组合作为通长筋)
    patch.topCount = nonEmpty[0][0].count;
    patch.topDiameter = nonEmpty[0][0].diameter;
    patch.botCount = nonEmpty[1][0].count;
    patch.botDiameter = nonEmpty[1][0].diameter;
    if (nonEmpty[0].length > 1 || nonEmpty[1].length > 1) {
      warnings.push('检测到多组纵筋(支座/架立筋)，仅取首组作为通长筋');
    }
  } else if (nonEmpty.length === 1) {
    warnings.push('仅检测到一组纵筋，已作为下部纵筋');
    patch.botCount = nonEmpty[0][0].count;
    patch.botDiameter = nonEmpty[0][0].diameter;
  } else {
    warnings.push('未找到纵筋标注 (nΦd;nΦd)');
  }

  // 校验范围
  if (patch.topDiameter && (patch.topDiameter < 12 || patch.topDiameter > 32)) {
    warnings.push(`上部纵筋直径 ${patch.topDiameter} 超出 [12,32]`);
  }
  if (patch.botDiameter && (patch.botDiameter < 12 || patch.botDiameter > 32)) {
    warnings.push(`下部纵筋直径 ${patch.botDiameter} 超出 [12,32]`);
  }

  const ok = secMatch !== null && stirMatch !== null && nonEmpty.length >= 1;
  return { ok, patch, warnings, name };
}
