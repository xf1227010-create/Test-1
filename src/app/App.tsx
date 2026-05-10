import { Scene } from '@/components/Viewer/Scene';
import { TopAppBar } from '@/components/Stitch/TopAppBar';
import { LeftModuleNav } from '@/components/Stitch/LeftModuleNav';
import { RightPropertiesPanel } from '@/components/Stitch/RightPropertiesPanel';
import { BottomFooter } from '@/components/Stitch/BottomFooter';
import { ViewportOverlay } from '@/components/Stitch/ViewportOverlay';

/**
 * 主工作台 — Stitch 设计稿落地实现
 * 布局: TopAppBar (56px) + [LeftNav 320 | 中间 3D | RightProps 320] + BottomFooter (32px)
 */
export default function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-on-surface">
      <TopAppBar />
      <div className="flex h-screen pt-[56px] pb-8">
        <LeftModuleNav />
        <main className="flex-1 flex flex-col relative bg-background">
          <div className="flex-1 relative viewport-grid min-h-[400px]">
            <Scene />
            <ViewportOverlay />
          </div>
        </main>
        <RightPropertiesPanel />
      </div>
      <BottomFooter />
    </div>
  );
}
