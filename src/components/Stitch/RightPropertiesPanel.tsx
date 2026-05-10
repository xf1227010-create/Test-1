import { useMemo, useState } from 'react';
import { useBeamStore } from '@/store/useBeamStore';
import { buildBeam, type ConcreteGrade, type RebarGrade, type SeismicLevel } from '@/pingfa';
import { parsePingfa } from '@/pingfa/parser';

/* ---------- 基础控件 ---------- */

function NumberRow({
  label,
  value,
  unit = 'mm',
  onChange,
  min,
  max,
  step = 1,
}: {
  label: string;
  value: number;
  unit?: string;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-outline">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-20 bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-data-mono font-mono text-right text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) onChange(v);
          }}
        />
        <span className="text-[10px] text-outline w-6">{unit}</span>
      </div>
    </div>
  );
}

function SelectRow<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-outline">{label}</label>
      <select
        className="w-24 bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-data-mono font-mono text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          const matched = options.find((o) => String(o.value) === raw);
          if (matched) onChange(matched.value);
        }}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-outline">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={
          'relative w-9 h-5 rounded-full transition-colors ' +
          (checked ? 'bg-primary-container' : 'bg-surface-container-high')
        }
      >
        <span
          className={
            'absolute top-0.5 w-4 h-4 rounded-full bg-on-primary-container transition-transform ' +
            (checked ? 'translate-x-4' : 'translate-x-0.5')
          }
        />
      </button>
    </label>
  );
}

/** 分组标题 */
function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-label-caps font-mono font-bold text-on-surface-variant uppercase">
        {children}
      </span>
      <div className="h-px flex-1 bg-outline-variant/50" />
    </div>
  );
}

/* ---------- 平法解析输入框 ---------- */
function PingfaInput() {
  const setParams = useBeamStore((s) => s.setParams);
  const [text, setText] = useState('KL1(2) 300x600 φ8@100/200(2) 2Φ25;3Φ25');
  const [result, setResult] = useState<ReturnType<typeof parsePingfa> | null>(null);

  const apply = () => {
    const r = parsePingfa(text);
    setResult(r);
    if (Object.keys(r.patch).length > 0) setParams(r.patch);
  };

  return (
    <div className="mb-6">
      <GroupTitle>平法标注 / Pingfa Parser</GroupTitle>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1.5 text-[12px] font-mono text-on-surface focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none"
        placeholder="KL1(2) 300x600 φ8@100/200(2) 2Φ25;3Φ25"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            apply();
          }
        }}
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          className="px-3 py-1 bg-primary-container text-on-primary-container text-[11px] font-bold rounded hover:opacity-90 active:scale-95 transition-all"
          onClick={apply}
        >
          解析并应用
        </button>
        <span className="text-[10px] text-outline font-mono">Ctrl + Enter</span>
      </div>
      {result && (
        <div className="mt-2 text-[11px] leading-relaxed">
          {result.ok ? (
            <div className="text-secondary-fixed-dim">
              ✓ 已应用{result.name ? ` · ${result.name}` : ''}
            </div>
          ) : (
            <div className="text-red-400">✗ 解析不完整 — 已部分应用</div>
          )}
          {result.warnings.length > 0 && (
            <ul className="mt-1 text-amber-300/80 list-disc pl-4 space-y-0.5">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- 主面板 ---------- */
export function RightPropertiesPanel() {
  const params = useBeamStore((s) => s.params);
  const view = useBeamStore((s) => s.view);
  const setParam = useBeamStore((s) => s.setParam);
  const setView = useBeamStore((s) => s.setView);

  const geom = useMemo(() => buildBeam(params), [params]);
  const derived = geom.derived;

  const concreteGrades: { value: ConcreteGrade; label: ConcreteGrade }[] = (
    ['C25', 'C30', 'C35', 'C40', 'C45', 'C50'] as ConcreteGrade[]
  ).map((g) => ({ value: g, label: g }));
  const rebarGrades: { value: RebarGrade; label: RebarGrade }[] = (
    ['HRB400', 'HRB500'] as RebarGrade[]
  ).map((g) => ({ value: g, label: g }));
  const seismicOptions: { value: SeismicLevel; label: string }[] = [
    { value: 1, label: '一级' },
    { value: 2, label: '二级' },
    { value: 3, label: '三级' },
    { value: 4, label: '四级' },
    { value: 0, label: '非抗震' },
  ];

  return (
    <aside className="flex flex-col w-[320px] h-full border-l border-outline-variant bg-surface-container-low/90 backdrop-blur-md shrink-0">
      <div className="flex-1 overflow-y-auto p-4">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-label-caps font-mono font-bold text-primary">
              PROPERTIES / 参数调整
            </h2>
            <p className="text-[10px] text-outline">Selected: Beam-KL1 (22G101-1)</p>
          </div>
          <span className="material-symbols-outlined text-outline">settings_input_component</span>
        </div>

        {/* 平法输入 */}
        <PingfaInput />

        {/* 校核警告 */}
        {view.showWarnings && geom.warnings.length > 0 && (
          <div className="mb-4 px-2 py-2 bg-red-950/40 border border-red-700/50 rounded text-xs">
            <div className="flex items-center gap-1.5 text-red-300 font-semibold mb-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              构造校核 {geom.warnings.length} 处不满足
            </div>
            <ul className="text-red-200/90 list-disc pl-4 space-y-0.5 text-[11px]">
              {geom.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 几何 */}
        <div className="mb-6">
          <GroupTitle>几何尺寸 / Geometry</GroupTitle>
          <div className="space-y-3">
            <NumberRow label="净跨 Ln" value={params.span} min={1000} max={20000} step={100}
              onChange={(v) => setParam('span', v)} />
            <NumberRow label="截面宽 b" value={params.width} min={150} max={800} step={50}
              onChange={(v) => setParam('width', v)} />
            <NumberRow label="截面高 h" value={params.height} min={250} max={1500} step={50}
              onChange={(v) => setParam('height', v)} />
            <NumberRow label="保护层 c" value={params.cover} min={15} max={50} step={5}
              onChange={(v) => setParam('cover', v)} />
            <NumberRow label="左支座宽" value={params.supportLeft} min={200} max={1500} step={50}
              onChange={(v) => setParam('supportLeft', v)} />
            <NumberRow label="右支座宽" value={params.supportRight} min={200} max={1500} step={50}
              onChange={(v) => setParam('supportRight', v)} />
          </div>
        </div>

        {/* 材料 */}
        <div className="mb-6">
          <GroupTitle>材料 / Materials</GroupTitle>
          <div className="space-y-3">
            <SelectRow label="混凝土等级" value={params.concreteGrade}
              options={concreteGrades} onChange={(v) => setParam('concreteGrade', v)} />
            <SelectRow label="钢筋级别" value={params.rebarGrade}
              options={rebarGrades} onChange={(v) => setParam('rebarGrade', v)} />
            <SelectRow label="抗震等级" value={params.seismicLevel}
              options={seismicOptions} onChange={(v) => setParam('seismicLevel', v)} />
          </div>
        </div>

        {/* 纵筋 */}
        <div className="mb-6">
          <GroupTitle>纵向钢筋 / Longitudinal</GroupTitle>
          <div className="space-y-3">
            <NumberRow label="上部根数" value={params.topCount} min={2} max={8} step={1} unit="根"
              onChange={(v) => setParam('topCount', v)} />
            <NumberRow label="上部直径" value={params.topDiameter} min={12} max={32} step={1}
              onChange={(v) => setParam('topDiameter', v)} />
            <NumberRow label="下部根数" value={params.botCount} min={2} max={8} step={1} unit="根"
              onChange={(v) => setParam('botCount', v)} />
            <NumberRow label="下部直径" value={params.botDiameter} min={12} max={32} step={1}
              onChange={(v) => setParam('botDiameter', v)} />
          </div>
        </div>

        {/* 箍筋 */}
        <div className="mb-6">
          <GroupTitle>箍筋 / Stirrup</GroupTitle>
          <div className="space-y-3">
            <NumberRow label="箍筋直径" value={params.stirrupDiameter} min={6} max={14} step={2}
              onChange={(v) => setParam('stirrupDiameter', v)} />
            <NumberRow label="加密区间距" value={params.stirrupSpacingDense} min={50} max={200} step={10}
              onChange={(v) => setParam('stirrupSpacingDense', v)} />
            <NumberRow label="非加密间距" value={params.stirrupSpacingNormal} min={100} max={300} step={10}
              onChange={(v) => setParam('stirrupSpacingNormal', v)} />
            <SelectRow label="肢数" value={params.stirrupLegs}
              options={[{ value: 2, label: '2 肢' }, { value: 4, label: '4 肢' }]}
              onChange={(v) => setParam('stirrupLegs', v as 2 | 4)} />
          </div>
        </div>

        {/* 视图 */}
        <div className="mb-6">
          <GroupTitle>视图 / View</GroupTitle>
          <div className="space-y-2.5">
            <ToggleRow label="混凝土半透明" checked={view.concreteTransparent}
              onChange={(v) => setView({ concreteTransparent: v })} />
            <ToggleRow label="显示纵筋" checked={view.showLongitudinal}
              onChange={(v) => setView({ showLongitudinal: v })} />
            <ToggleRow label="显示箍筋" checked={view.showStirrups}
              onChange={(v) => setView({ showStirrups: v })} />
            <ToggleRow label="显示尺寸标注" checked={view.showDimensions}
              onChange={(v) => setView({ showDimensions: v })} />
            <ToggleRow label="构造校核警告" checked={view.showWarnings}
              onChange={(v) => setView({ showWarnings: v })} />
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-outline">爆炸视图</span>
                <span className="text-[11px] font-mono text-outline">
                  {Math.round(view.exploded * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={view.exploded}
                onChange={(e) => setView({ exploded: Number(e.target.value) })}
                className="w-full accent-primary-container"
              />
            </div>
          </div>
        </div>

        {/* 派生信息 */}
        <div className="mb-2 p-3 bg-surface-container-lowest rounded border border-outline-variant/50">
          <div className="text-label-caps font-mono text-outline mb-2">DERIVED · 自动计算</div>
          <div className="space-y-1 text-[12px] font-mono text-on-surface-variant">
            <div className="flex justify-between">
              <span>锚固 LaE</span>
              <span className="text-secondary-fixed-dim">{derived.lae} mm</span>
            </div>
            <div className="flex justify-between">
              <span>加密区长</span>
              <span className="text-secondary-fixed-dim">{derived.densifyLength} mm</span>
            </div>
            <div className="flex justify-between">
              <span>梁全长</span>
              <span className="text-secondary-fixed-dim">{derived.totalLength} mm</span>
            </div>
            <div className="flex justify-between">
              <span>弯钩平直段</span>
              <span className="text-secondary-fixed-dim">{derived.stirrupHookStraight} mm</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Copilot 占位 (功能预留) */}
      <div className="h-[180px] border-t border-outline-variant flex flex-col bg-surface-container-lowest/50">
        <div className="px-4 py-2 flex items-center gap-2 border-b border-outline-variant/30">
          <span
            className="material-symbols-outlined text-secondary-container text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            forum
          </span>
          <span className="text-label-caps font-mono font-bold text-on-surface">AI COPILOT</span>
          <span className="ml-auto text-[9px] uppercase tracking-wider text-outline/60 font-mono">
            soon
          </span>
        </div>
        <div className="flex-1 p-3 text-[11px] text-outline/70 leading-relaxed">
          AI 助手即将上线 — 自动校核规范、生成调整建议、一键修复。当前请通过参数面板手动调整。
        </div>
      </div>
    </aside>
  );
}
