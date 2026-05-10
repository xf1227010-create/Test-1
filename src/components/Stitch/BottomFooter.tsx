/**
 * Stitch 底部状态栏
 *  - 左: 错误数 / 警告数 / 关键参数显示
 *  - 右: Terminal / 编码标签
 */
import { useMemo } from 'react';
import { useBeamStore } from '@/store/useBeamStore';
import { buildBeam } from '@/pingfa';

export function BottomFooter() {
  const params = useBeamStore((s) => s.params);
  const geom = useMemo(() => buildBeam(params), [params]);
  const warnings = geom.warnings.length;

  return (
    <footer className="fixed bottom-0 left-0 right-0 h-8 bg-surface-container-lowest border-t border-outline-variant flex items-center px-4 z-50">
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-outline">
          <span className="material-symbols-outlined text-[14px] text-red-400">error</span> 0
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-outline">
          <span className="material-symbols-outlined text-[14px] text-secondary-container">
            warning
          </span>
          {warnings}
        </div>
        <div className="h-3 w-px bg-outline-variant" />
        <span className="font-mono text-[11px] text-outline uppercase tracking-wider">
          Ln: {params.span} | b: {params.width} | h: {params.height}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-1 font-mono text-[11px] text-outline">
          <span className="material-symbols-outlined text-[14px]">terminal</span> Terminal
        </div>
        <div className="flex items-center gap-1 font-mono text-[11px] text-outline">UTF-8</div>
      </div>
    </footer>
  );
}
