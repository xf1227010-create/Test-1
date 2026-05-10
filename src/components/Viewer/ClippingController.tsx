import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { applyClipState } from '@/materials/clipping';
import { useBeamStore } from '@/store/useBeamStore';

/** 渲染器开启 localClippingEnabled，并把 store 中的剖切状态同步到全局 Plane */
export function ClippingController() {
  const gl = useThree((s) => s.gl);
  const view = useBeamStore((s) => s.view);

  // 启用局部剖切
  useEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  // 同步剖切平面 constant
  useEffect(() => {
    applyClipState({
      xEnabled: view.clipXEnabled,
      xValue: view.clipX,
      yEnabled: view.clipYEnabled,
      yValue: view.clipY,
      zEnabled: view.clipZEnabled,
      zValue: view.clipZ,
    });
  }, [view.clipXEnabled, view.clipX, view.clipYEnabled, view.clipY, view.clipZEnabled, view.clipZ]);

  return null;
}
