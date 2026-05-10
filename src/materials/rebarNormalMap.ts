// 程序化生成 HRB 螺纹钢的法线贴图
// 设计要点：
//  - U 方向 (沿圆周, 0~1) = 一圈展开
//  - V 方向 (沿钢筋长度方向)，按"每米肋数"周期重复
//  - 内容：2 条对称纵肋（U=0.25, U=0.75 处）+ 月牙状横肋（沿 V 周期排布，左右两侧对称、互成相位偏移以模拟实际螺纹）
import * as THREE from 'three';

export interface RebarTextureOptions {
  width?: number;       // 像素宽度 (展开圆周方向)
  height?: number;      // 像素高度 (沿轴方向，对应一个重复周期 = 螺距)
  longitudinalRibWidth?: number; // 纵肋宽度比例 (相对 width)
  longitudinalRibHeight?: number; // 法线突起强度 (0~1)
  transverseRibAngle?: number;    // 横肋倾角 (deg)
  transverseRibWidth?: number;    // 横肋占 V 方向比例
  transverseRibHeight?: number;
}

/**
 * 生成法线贴图。颜色编码: R=X, G=Y, B=Z (切线空间)
 * 平面 = (0.5, 0.5, 1.0) = (#8080ff)
 */
export function generateRebarNormalMap(opts: RebarTextureOptions = {}): THREE.CanvasTexture {
  const W = opts.width ?? 512;
  const H = opts.height ?? 512;
  const longW = opts.longitudinalRibWidth ?? 0.06;
  const longH = opts.longitudinalRibHeight ?? 0.7;
  const transAngle = ((opts.transverseRibAngle ?? 65) * Math.PI) / 180;
  const transW = opts.transverseRibWidth ?? 0.18;
  const transH = opts.transverseRibHeight ?? 0.85;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // 1) 高度场 (灰度) - 用浮点数组先算高度，再求梯度得到法线
  const height = new Float32Array(W * H);

  // --- 纵肋 ---
  const longCenters = [0.25, 0.75];
  const longHalf = longW / 2;
  for (let i = 0; i < W; i++) {
    const u = i / W;
    let h = 0;
    for (const c of longCenters) {
      let d = Math.abs(u - c);
      d = Math.min(d, 1 - d); // 环绕
      if (d < longHalf) {
        // 余弦剖面
        const t = d / longHalf;
        h = Math.max(h, longH * Math.cos(t * Math.PI / 2));
      }
    }
    for (let j = 0; j < H; j++) height[j * W + i] = h;
  }

  // --- 横肋 (左右两片，从纵肋出发斜向延伸到对侧纵肋附近) ---
  // 同一截面在左右两侧错开半个周期，形成"月牙"双螺旋
  const drawTransverse = (vCenter: number, uStart: number, uEnd: number) => {
    // 横肋为一条带：在 (u,v) 平面上斜线; 在带宽 transW*H 范围内余弦突起
    const halfBand = (transW * H) / 2;
    const slope = Math.tan(transAngle); // dv/du (per full unit)
    for (let i = 0; i < W; i++) {
      const u = i / W;
      // 仅在 [uStart, uEnd] (按周向距离) 内绘制
      const inRange = (() => {
        if (uStart < uEnd) return u >= uStart && u <= uEnd;
        return u >= uStart || u <= uEnd;
      })();
      if (!inRange) continue;
      const vBaseline = vCenter + (u - (uStart + uEnd) / 2) * slope;
      for (let j = 0; j < H; j++) {
        const v = j / H;
        // 周向 v 距离 (考虑 v 周期=1 内重复)
        let dv = (v - vBaseline);
        dv = dv - Math.round(dv); // wrap to [-0.5, 0.5]
        const dvPx = dv * H;
        if (Math.abs(dvPx) < halfBand) {
          const t = Math.abs(dvPx) / halfBand;
          const h = transH * Math.cos((t * Math.PI) / 2);
          const idx = j * W + i;
          if (h > height[idx]) height[idx] = h;
        }
      }
    }
  };

  // 在 V 方向放 4 个横肋周期 (每个 0.25)，左右两侧错半周期
  const periods = 4;
  for (let k = 0; k < periods; k++) {
    const v = k / periods;
    drawTransverse(v, 0.27, 0.73);                    // 上半区 (纵肋 0.25 → 0.75)
    drawTransverse(v + 0.5 / periods, 0.77, 0.23);    // 下半区 (绕过 0/1 边界)
  }

  // 2) 由高度场计算法线
  const img = ctx.createImageData(W, H);
  const strength = 2.5;
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const xL = height[j * W + ((i - 1 + W) % W)];
      const xR = height[j * W + ((i + 1) % W)];
      const yU = height[((j - 1 + H) % H) * W + i];
      const yD = height[((j + 1) % H) * W + i];
      const dx = (xR - xL) * strength;
      const dy = (yD - yU) * strength;
      // 法线 = normalize(-dx, -dy, 1)
      const nx = -dx;
      const ny = -dy;
      const nz = 1;
      const len = Math.hypot(nx, ny, nz);
      const r = (nx / len) * 0.5 + 0.5;
      const g = (ny / len) * 0.5 + 0.5;
      const b = (nz / len) * 0.5 + 0.5;
      const p = (j * W + i) * 4;
      img.data[p] = Math.round(r * 255);
      img.data[p + 1] = Math.round(g * 255);
      img.data[p + 2] = Math.round(b * 255);
      img.data[p + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/** 生成轻微变化的粗糙度贴图 (单通道灰度) */
export function generateRebarRoughnessMap(): THREE.CanvasTexture {
  const W = 256, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  for (let i = 0; i < W * H; i++) {
    const v = 110 + Math.floor(Math.random() * 40); // 0.43~0.59
    img.data[i * 4] = v;
    img.data[i * 4 + 1] = v;
    img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
