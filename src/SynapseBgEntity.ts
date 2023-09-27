import uniqueId from "lodash.uniqueid";

type Position2D = { x: number, y: number };
type ColorCoords = [number, number, number];

export default abstract class SynapseBgEntity {
  id: string;
  pos: Position2D;
  color: ColorCoords // a CSS <color> value

  constructor(pos: Position2D, coordinatesRGB: ColorCoords) {
    this.id = uniqueId();
    this.pos = pos;
    this.color = coordinatesRGB;
  }

  // active entities are cycled and rendered; inactive ones are filtered and garbage-collected
  abstract get isActive(): boolean;

  // convert RGB coords in this.color to a CSS rgb() string, optionally adjusting alpha
  getColorString(pctAlpha = 100): string {
    const [r, g, b] = this.color;
    return `rgb(${r * 255} ${g * 255} ${b * 255} / ${pctAlpha}%)`;
  }

  // converts a normalized coordinate pair into a 2D position relative to canvas size
  // if a second arg is provided, it gets evaluated instead of this entity's intrinsic position
  getCanvasPos(cnv: HTMLCanvasElement, nPos: Position2D = this.pos): Position2D {
    return {
      x: Math.floor((nPos.x) * cnv.width),
      y: Math.floor((nPos.y) * cnv.height)
    };
  }

  // cycle may return false to signal that this entity is ready to be removed from a network
  abstract cycle(): void;

  // entities need to know their canvas to determine coordinates and its context to draw to it
  abstract render(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, color?: string): void;
}
