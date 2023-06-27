const CANVAS_ID = 'canvas';

export function getCanvas(): HTMLCanvasElement {
  const existing_canvas = document.getElementById(CANVAS_ID);

  if (existing_canvas && existing_canvas instanceof HTMLCanvasElement) {
    return existing_canvas;
  }

  if (existing_canvas) {
    existing_canvas.remove();
  }

  const rect = document.documentElement.getBoundingClientRect();

  const width = rect.width;
  const height = rect.height;

  const cx = document.createElement('canvas');
  cx.height = height;
  cx.width = width;
  cx.id = CANVAS_ID;

  document.body.appendChild(cx);

  return cx;
}
