import { Scene } from '@/components/Viewer/Scene';
import { ParamsPanel } from '@/components/ParamsPanel/ParamsPanel';

export default function App() {
  return (
    <div className="h-screen w-screen flex bg-panel">
      <ParamsPanel />
      <main className="flex-1 relative">
        <Scene />
        <div className="absolute top-3 right-3 px-3 py-2 bg-slate-900/70 backdrop-blur border border-slate-700 rounded text-xs text-slate-300">
          鼠标左键旋转 · 右键平移 · 滚轮缩放
        </div>
      </main>
    </div>
  );
}
