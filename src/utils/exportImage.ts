import { toPng } from "html-to-image";

export async function exportNodeAsImage(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}
