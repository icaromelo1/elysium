import { Assets, Graphics, Texture, type Renderer } from 'pixi.js'

export async function loadTextureOrFallback(
  renderer: Renderer,
  url: string,
  fallbackDraw: (g: Graphics) => void,
): Promise<Texture> {
  try {
    return await Assets.load<Texture>(url)
  } catch {
    const g = new Graphics()
    fallbackDraw(g)
    const texture = renderer.generateTexture(g)
    g.destroy()
    return texture
  }
}
