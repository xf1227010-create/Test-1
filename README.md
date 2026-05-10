# 3D 钢筋平法可视化 (KL 框架梁)

纯前端的钢筋平法 3D 可视化网页。基于 React + Three.js (@react-three/fiber)，按 22G101-1 自动计算锚固长度、弯钩、箍筋加密区，并以 PBR 螺纹钢材质渲染钢筋。

## 启动

```bash
npm install
npm run dev
```

打开 http://127.0.0.1:5173

## 测试

```bash
npm test
```

## 技术栈

- Vite + React 18 + TypeScript
- three + @react-three/fiber + @react-three/drei
- Zustand (状态)
- Tailwind CSS (样式)
- Vitest (单测)

## 目录

```
src/
  app/                    入口
  pingfa/                 平法规则引擎 (纯函数, 可单测)
    anchorage.ts          锚固长度查表
    stirrup.ts            箍筋路径 + 加密区
    longitudinal.ts       纵筋路径 + 弯锚
  materials/
    rebarNormalMap.ts     程序化生成螺纹钢法线贴图
    rebarMaterial.ts      PBR 钢筋/混凝土材质
  utils/
    rebarGeometry.ts      折线 → CurvePath (含倒圆角) → TubeGeometry
  components/
    Viewer/Scene.tsx      Canvas + 灯光 + 控制
    BeamModel/            梁模型 (Concrete / Rebar / Dimensions / SpacingDemo)
    ParamsPanel/          左侧参数表单
  store/                  Zustand store
```

## 画质设计

钢筋螺纹外观采用 **程序化生成法线贴图 + PBR**：
- 圆周方向 2 条纵肋 (U=0.25 / 0.75)
- 沿轴向月牙状横肋，左右两侧错半周期形成双螺旋
- 法线贴图 UV 重复数随钢筋直径与长度自适应，保持物理尺度一致

## 范围

首期仅支持框架梁 KL（详见 `.windsurf/plans/3d-rebar-pingfa-visualization-5cd2f5.md`）。后续可扩展柱、板、墙。
