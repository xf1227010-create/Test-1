import { useState } from 'react';

/**
 * Stitch 左侧模块导航
 *  - 顶部: 项目标识
 *  - 主体: 5 个模块 (BEAMS/WALLS/COLUMNS/STAIRS/FOUNDATIONS)
 *  - 底部: COPILOT AI / LOGS
 *
 * 当前只有 BEAMS 是真正可用的, 其它模块点击后只是切换激活态作为视觉反馈
 */
const MODULES = [
  { key: 'beams', icon: 'architecture', label: 'BEAMS / 梁', enabled: true },
  { key: 'walls', icon: 'view_quilt', label: 'WALLS / 墙', enabled: false },
  { key: 'columns', icon: 'view_column', label: 'COLUMNS / 柱', enabled: false },
  { key: 'stairs', icon: 'stairs', label: 'STAIRS / 楼梯', enabled: false },
  { key: 'foundations', icon: 'foundation', label: 'FOUNDATIONS / 基础', enabled: false },
] as const;

export function LeftModuleNav() {
  const [active, setActive] = useState<string>('beams');

  return (
    <aside className="flex flex-col w-[320px] h-full py-4 px-1 border-r border-outline-variant bg-surface-container-lowest/80 backdrop-blur-xl shrink-0">
      {/* 项目标识 */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary-fixed-dim">engineering</span>
          </div>
          <div>
            <div className="text-label-caps font-mono font-bold text-outline">PROJECT ALPHA</div>
            <div className="text-sm text-on-surface">Rebar Engineering v4.2</div>
          </div>
        </div>
      </div>

      {/* 模块列表 */}
      <nav className="flex-1 space-y-1 px-2">
        {MODULES.map((m) => {
          const isActive = active === m.key;
          return (
            <button
              key={m.key}
              onClick={() => m.enabled && setActive(m.key)}
              disabled={!m.enabled}
              className={
                'w-full text-left rounded-lg p-3 flex items-center gap-3 transition-colors ' +
                (isActive
                  ? 'bg-primary-container text-on-primary-container font-bold border-l-4 border-primary'
                  : m.enabled
                    ? 'text-outline hover:text-on-surface hover:bg-surface-container-high'
                    : 'text-outline/40 cursor-not-allowed')
              }
              title={m.enabled ? m.label : `${m.label} (即将上线)`}
            >
              <span className="material-symbols-outlined">{m.icon}</span>
              <span className="text-label-caps font-mono">{m.label}</span>
              {!m.enabled && (
                <span className="ml-auto text-[9px] uppercase tracking-wider text-outline/60">
                  soon
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 底部辅助 */}
      <div className="mt-auto px-2 space-y-1 pt-4 border-t border-outline-variant">
        <button
          disabled
          className="w-full text-left text-outline/40 cursor-not-allowed p-3 flex items-center gap-3 rounded-lg"
        >
          <span className="material-symbols-outlined">smart_toy</span>
          <span className="text-label-caps font-mono">COPILOT AI</span>
          <span className="ml-auto text-[9px] uppercase tracking-wider">soon</span>
        </button>
        <button
          disabled
          className="w-full text-left text-outline/40 cursor-not-allowed p-3 flex items-center gap-3 rounded-lg"
        >
          <span className="material-symbols-outlined">terminal</span>
          <span className="text-label-caps font-mono">LOGS</span>
        </button>
      </div>
    </aside>
  );
}
