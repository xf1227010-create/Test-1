import { useBeamStore } from '@/store/useBeamStore';

/**
 * 浮在 3D 视口上方的控制叠层:
 *  - 左上: 视图预设 (3D/正面/端面/顶视) + 透视/正交切换
 *  - 右上: 当前选中构件标签
 */
export function ViewportOverlay() {
  const view = useBeamStore((s) => s.view);
  const setView = useBeamStore((s) => s.setView);

  const presets: { key: 'iso' | 'front' | 'side' | 'top'; label: string }[] = [
    { key: 'iso', label: '3D' },
    { key: 'front', label: '正面' },
    { key: 'side', label: '端面' },
    { key: 'top', label: '顶视' },
  ];

  const triggerPreset = (key: 'iso' | 'front' | 'side' | 'top') => {
    setView({ viewPreset: key, viewPresetTick: view.viewPresetTick + 1 });
  };

  const toggleCamera = () =>
    setView({ cameraMode: view.cameraMode === 'perspective' ? 'orthographic' : 'perspective' });

  return (
    <>
      {/* 左上: 视图预设 + 相机模式 */}
      <div className="absolute top-4 left-4 flex gap-2 z-10">
        <div className="glass-panel rounded-lg p-1 flex gap-1">
          {presets.map((p) => (
            <button
              key={p.key}
              onClick={() => triggerPreset(p.key)}
              className={
                'px-3 py-1 rounded text-label-caps font-mono transition-colors ' +
                (view.viewPreset === p.key
                  ? 'bg-primary text-on-primary'
                  : 'text-outline hover:text-on-surface')
              }
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="glass-panel rounded-lg p-1">
          <button
            onClick={toggleCamera}
            className="px-3 py-1 text-outline hover:text-on-surface flex items-center gap-2 text-label-caps font-mono transition-colors"
            title="透视 / 正交切换"
          >
            <span className="material-symbols-outlined text-[16px]">videocam</span>
            {view.cameraMode === 'perspective' ? '透视' : '正交'}
          </button>
        </div>
      </div>

      {/* 右上: 当前构件 */}
      <div className="absolute top-4 right-4 glass-panel rounded-lg px-3 py-2 z-10">
        <div className="text-label-caps font-mono font-bold text-secondary-fixed-dim">
          BEAM-KL1 SELECTED
        </div>
      </div>

      {/* 右下: 操作提示 */}
      <div className="absolute bottom-4 right-4 glass-panel rounded-lg px-3 py-1.5 z-10">
        <div className="text-[11px] font-mono text-outline">
          鼠标左键旋转 · 右键平移 · 滚轮缩放
        </div>
      </div>
    </>
  );
}
