import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Box,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Square,
  Wand2,
} from 'lucide-react';
import { useBeamStore } from '@/store/useBeamStore';
import { buildBeam, type ConcreteGrade, type RebarGrade, type SeismicLevel } from '@/pingfa';
import { parsePingfa } from '@/pingfa/parser';

interface FieldProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}
function NumberField({ label, value, min, max, step = 1, unit = 'mm', onChange }: FieldProps) {
  return (
    <label className="flex items-center justify-between gap-2 py-1">
      <span className="text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          className="w-24 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!Number.isNaN(v)) onChange(v);
          }}
        />
        <span className="text-xs text-slate-500 w-7">{unit}</span>
      </div>
    </label>
  );
}

interface SelectProps<T extends string | number> {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (v: T) => void;
}
function SelectField<T extends string | number>({ label, value, options, onChange }: SelectProps<T>) {
  return (
    <label className="flex items-center justify-between gap-2 py-1">
      <span className="text-sm text-slate-300">{label}</span>
      <select
        className="w-32 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          const opt = options.find((o) => String(o.value) === raw);
          if (opt) onChange(opt.value);
        }}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-800">
      <button
        className="w-full flex items-center gap-1 py-2 text-sm font-semibold text-slate-200 hover:text-white"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        {title}
      </button>
      {open && <div className="pb-2 pl-1">{children}</div>}
    </div>
  );
}

export function ParamsPanel() {
  const params = useBeamStore((s) => s.params);
  const view = useBeamStore((s) => s.view);
  const setParam = useBeamStore((s) => s.setParam);
  const setView = useBeamStore((s) => s.setView);
  const reset = useBeamStore((s) => s.reset);

  const geom = useMemo(() => buildBeam(params), [params]);
  const derived = geom.derived;

  const concreteGrades: ConcreteGrade[] = ['C25', 'C30', 'C35', 'C40', 'C45', 'C50'];
  const rebarGrades: RebarGrade[] = ['HRB400', 'HRB500'];
  const seismicLevels: SeismicLevel[] = [1, 2, 3, 4, 0];

  return (
    <aside className="w-[340px] bg-panel2 border-r border-slate-800 overflow-y-auto h-full">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-slate-100">3D 钢筋平法可视化</h1>
          <p className="text-xs text-slate-500">框架梁 KL · 22G101-1</p>
        </div>
        <button
          className="p-1.5 rounded hover:bg-slate-800 text-slate-400"
          onClick={reset}
          title="重置参数"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="px-4">
        <PingfaParserBox />

        {/* 顶部工具栏: 视图预设 + 相机模式 + 爆炸 */}
        <ViewToolbar />

        {/* 校核警告 */}
        {view.showWarnings && geom.warnings.length > 0 && (
          <div className="my-2 px-2 py-2 bg-red-950/40 border border-red-700/50 rounded text-xs">
            <div className="flex items-center gap-1.5 text-red-300 font-semibold mb-1">
              <AlertTriangle size={12} /> 构造校核 {geom.warnings.length} 处不满足
            </div>
            <ul className="text-red-200/90 list-disc pl-4 space-y-0.5 text-[11px]">
              {geom.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <Section title="几何尺寸">
          <NumberField label="净跨 Ln" value={params.span} min={1000} max={20000} step={100} onChange={(v) => setParam('span', v)} />
          <NumberField label="截面宽 b" value={params.width} min={150} max={800} step={50} onChange={(v) => setParam('width', v)} />
          <NumberField label="截面高 h" value={params.height} min={250} max={1500} step={50} onChange={(v) => setParam('height', v)} />
          <NumberField label="保护层 c" value={params.cover} min={15} max={50} step={5} onChange={(v) => setParam('cover', v)} />
          <NumberField label="左支座宽" value={params.supportLeft} min={200} max={1500} step={50} onChange={(v) => setParam('supportLeft', v)} />
          <NumberField label="右支座宽" value={params.supportRight} min={200} max={1500} step={50} onChange={(v) => setParam('supportRight', v)} />
        </Section>

        <Section title="材料 / 抗震">
          <SelectField<ConcreteGrade>
            label="混凝土"
            value={params.concreteGrade}
            options={concreteGrades.map((g) => ({ label: g, value: g }))}
            onChange={(v) => setParam('concreteGrade', v)}
          />
          <SelectField<RebarGrade>
            label="钢筋"
            value={params.rebarGrade}
            options={rebarGrades.map((g) => ({ label: g, value: g }))}
            onChange={(v) => setParam('rebarGrade', v)}
          />
          <SelectField<SeismicLevel>
            label="抗震等级"
            value={params.seismicLevel}
            options={seismicLevels.map((g) => ({ label: g === 0 ? '非抗震' : `${['', '一', '二', '三', '四'][g]}级`, value: g }))}
            onChange={(v) => setParam('seismicLevel', v)}
          />
        </Section>

        <Section title="纵筋">
          <NumberField label="上部直径" value={params.topDiameter} min={12} max={32} step={2} onChange={(v) => setParam('topDiameter', v)} />
          <NumberField label="上部根数" value={params.topCount} min={2} max={8} unit="根" onChange={(v) => setParam('topCount', v)} />
          <NumberField label="下部直径" value={params.botDiameter} min={12} max={32} step={2} onChange={(v) => setParam('botDiameter', v)} />
          <NumberField label="下部根数" value={params.botCount} min={2} max={8} unit="根" onChange={(v) => setParam('botCount', v)} />
        </Section>

        <Section title="箍筋">
          <NumberField label="直径" value={params.stirrupDiameter} min={6} max={14} step={2} onChange={(v) => setParam('stirrupDiameter', v)} />
          <NumberField label="加密区间距" value={params.stirrupSpacingDense} min={50} max={200} step={10} onChange={(v) => setParam('stirrupSpacingDense', v)} />
          <NumberField label="非加密间距" value={params.stirrupSpacingNormal} min={100} max={300} step={10} onChange={(v) => setParam('stirrupSpacingNormal', v)} />
          <SelectField<2 | 4>
            label="肢数"
            value={params.stirrupLegs}
            options={[{ label: '2 肢', value: 2 }, { label: '4 肢', value: 4 }]}
            onChange={(v) => setParam('stirrupLegs', v)}
          />
        </Section>

        <Section title="自动推导值 (22G101)">
          <Row k="锚固长度 lae" v={`${derived.lae} mm`} />
          <Row k="加密区长度" v={`${derived.densifyLength} mm`} />
          <Row k="加密区间距 (规范)" v={`${derived.densifySpacing} mm`} />
          <Row k="弯钩平直段" v={`${derived.stirrupHookStraight} mm`} />
          <Row k="梁全长" v={`${derived.totalLength} mm`} />
        </Section>

        <Section title="三向剖切" defaultOpen={false}>
          <ClipAxis
            label="X 剖切 (沿梁长)"
            enabled={view.clipXEnabled}
            value={view.clipX}
            min={-derived.totalLength / 2}
            max={derived.totalLength / 2}
            onToggle={(v) => setView({ clipXEnabled: v })}
            onChange={(v) => setView({ clipX: v })}
          />
          <ClipAxis
            label="Y 剖切 (高度)"
            enabled={view.clipYEnabled}
            value={view.clipY}
            min={-params.height / 2}
            max={params.height / 2}
            onToggle={(v) => setView({ clipYEnabled: v })}
            onChange={(v) => setView({ clipY: v })}
          />
          <ClipAxis
            label="Z 剖切 (宽度)"
            enabled={view.clipZEnabled}
            value={view.clipZ}
            min={-params.width / 2}
            max={params.width / 2}
            onToggle={(v) => setView({ clipZEnabled: v })}
            onChange={(v) => setView({ clipZ: v })}
          />
          <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
            剖切面保留法向 +x/+y/+z 一侧。滑块为剖切面位置 (mm)，关闭后恢复完整模型。
          </p>
        </Section>

        <Section title="视图">
          <Toggle label="混凝土半透明" checked={view.concreteTransparent} onChange={(v) => setView({ concreteTransparent: v })} />
          <Toggle label="显示纵筋" checked={view.showLongitudinal} onChange={(v) => setView({ showLongitudinal: v })} />
          <Toggle label="显示箍筋" checked={view.showStirrups} onChange={(v) => setView({ showStirrups: v })} />
          <Toggle label="显示尺寸标注" checked={view.showDimensions} onChange={(v) => setView({ showDimensions: v })} />
          <Toggle label="间距演示动画" checked={view.showSpacingDemo} onChange={(v) => setView({ showSpacingDemo: v })} />
          <Toggle label="构造校核警告" checked={view.showWarnings} onChange={(v) => setView({ showWarnings: v })} />
          <div className="py-1">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>爆炸视图</span>
              <span className="text-xs font-mono text-slate-400">
                {Math.round(view.exploded * 100)}%
              </span>
            </div>
            <input
              type="range"
              className="w-full mt-1 accent-blue-500"
              min={0}
              max={1}
              step={0.02}
              value={view.exploded}
              onChange={(e) => setView({ exploded: Number(e.target.value) })}
            />
          </div>
        </Section>

        <div className="py-3 text-[11px] text-slate-500 leading-relaxed">
          所有锚固/加密/弯钩长度按 22G101-1 自动计算。法线贴图程序化生成，UV 重复随直径自适应。
        </div>
      </div>
    </aside>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between text-xs py-0.5">
      <span className="text-slate-400">{k}</span>
      <span className="text-slate-200 font-mono">{v}</span>
    </div>
  );
}

interface ClipAxisProps {
  label: string;
  enabled: boolean;
  value: number;
  min: number;
  max: number;
  onToggle: (v: boolean) => void;
  onChange: (v: number) => void;
}
function ClipAxis({ label, enabled, value, min, max, onToggle, onChange }: ClipAxisProps) {
  // 当开关从关→开 且 value 在范围外时，把 value 钳到中点
  const safeValue = Math.max(min, Math.min(max, value));
  return (
    <div className="py-1">
      <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm text-slate-300 flex items-center gap-2">
          <input
            type="checkbox"
            className="accent-blue-500"
            checked={enabled}
            onChange={(e) => {
              const on = e.target.checked;
              if (on && (value < min || value > max)) onChange((min + max) / 2);
              onToggle(on);
            }}
          />
          {label}
        </span>
        <span className="text-xs font-mono text-slate-400 w-16 text-right">
          {enabled ? `${Math.round(safeValue)} mm` : '关闭'}
        </span>
      </label>
      <input
        type="range"
        className="w-full mt-1 accent-blue-500 disabled:opacity-40"
        min={Math.floor(min)}
        max={Math.ceil(max)}
        step={10}
        value={safeValue}
        disabled={!enabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function ViewToolbar() {
  const view = useBeamStore((s) => s.view);
  const setView = useBeamStore((s) => s.setView);
  const presets: { key: 'iso' | 'front' | 'side' | 'top'; label: string }[] = [
    { key: 'iso', label: '3D' },
    { key: 'front', label: '正面' },
    { key: 'side', label: '端面' },
    { key: 'top', label: '顶视' },
  ];
  const triggerPreset = (key: typeof presets[number]['key']) => {
    setView({ viewPreset: key, viewPresetTick: view.viewPresetTick + 1 });
  };
  return (
    <div className="py-2 flex items-center gap-1 flex-wrap border-b border-slate-800">
      {presets.map((p) => (
        <button
          key={p.key}
          className={
            'px-2 py-1 text-xs rounded border transition-colors ' +
            (view.viewPreset === p.key
              ? 'bg-blue-600 border-blue-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700')
          }
          onClick={() => triggerPreset(p.key)}
          title={`视图预设: ${p.label}`}
        >
          {p.label}
        </button>
      ))}
      <div className="flex-1" />
      <button
        className={
          'px-2 py-1 text-xs rounded border transition-colors flex items-center gap-1 ' +
          (view.cameraMode === 'orthographic'
            ? 'bg-blue-600 border-blue-500 text-white'
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700')
        }
        onClick={() =>
          setView({
            cameraMode: view.cameraMode === 'perspective' ? 'orthographic' : 'perspective',
          })
        }
        title="透视 / 正交切换"
      >
        {view.cameraMode === 'perspective' ? <Box size={12} /> : <Square size={12} />}
        {view.cameraMode === 'perspective' ? '透视' : '正交'}
      </button>
    </div>
  );
}

function PingfaParserBox() {
  const setParams = useBeamStore((s) => s.setParams);
  const [text, setText] = useState('KL1(2) 300x600 φ8@100/200(2) 2Φ25;3Φ25');
  const [result, setResult] = useState<ReturnType<typeof parsePingfa> | null>(null);

  const apply = () => {
    const r = parsePingfa(text);
    setResult(r);
    if (Object.keys(r.patch).length > 0) setParams(r.patch);
  };

  return (
    <div className="py-3 border-b border-slate-800">
      <div className="text-sm font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
        <Wand2 size={14} className="text-blue-400" />
        平法标注解析
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={2}
        className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100 focus:outline-none focus:border-blue-500 resize-none"
        placeholder="例如: KL1(2) 300x600 φ8@100/200(2) 2Φ25;3Φ25"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            apply();
          }
        }}
      />
      <div className="flex items-center gap-2 mt-1.5">
        <button
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
          onClick={apply}
        >
          解析并应用
        </button>
        <span className="text-[10px] text-slate-500">Ctrl + Enter</span>
      </div>
      {result && (
        <div className="mt-2 text-[11px] leading-relaxed">
          {result.ok ? (
            <div className="text-emerald-400">
              ✓ 已应用{result.name ? ` · ${result.name}` : ''}
            </div>
          ) : (
            <div className="text-red-400">✗ 解析不完整 — 已部分应用</div>
          )}
          {result.warnings.length > 0 && (
            <ul className="mt-1 text-amber-400/90 list-disc pl-4 space-y-0.5">
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

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between py-1 cursor-pointer">
      <span className="text-sm text-slate-300">{label}</span>
      <input
        type="checkbox"
        className="accent-blue-500"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </label>
  );
}
