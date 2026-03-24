import { BaseCanvas } from "@wiit/vue3-helper";

export const useWebGL = (fragmentShaderSource: string) => {
  const canvasRef = ref<HTMLCanvasElement>();

  let shader: BaseCanvas | null = null;

  onMounted(() => {
    if (!canvasRef.value) return;
    shader = new BaseCanvas(canvasRef.value, fragmentShaderSource);
  });

  onBeforeRouteLeave(() => {
    shader?.pause();
  });

  onActivated(() => {
    shader?.resume();
  });

  onDeactivated(() => {
    shader?.pause();
  });

  onBeforeUnmount(() => {
    shader?.destory();
  });

  return { shader, canvasRef };
};
