import SynapseBgEntity from "./SynapseBgEntity";

type Position2D = { x: number, y: number };
type ColorCoords = [number, number, number];

export default class SynapseBgTracer extends SynapseBgEntity {
  endpoint: Position2D;
  cyclesLeft: number;
  width: number; // for CanvasRenderingContext2D.lineWidth
  static init_lifespan = 20; // in cycles
  
  constructor(startpoint: Position2D, endpoint: Position2D, color: ColorCoords, width = 1) {
    super(startpoint, color);
    this.endpoint = endpoint;
    this.cyclesLeft = SynapseBgTracer.init_lifespan;
    this.width = width;
  }

  // Tracers are active when they have at least one cycle remaining in their lifespan
  get isActive(): boolean {
    return this.cyclesLeft > 0;
  }

  // Tracers exist for a limited time and gradually fade until they run out of cycles
  cycle(): void {
    this.cyclesLeft -= 1;
  }

  // draw a line from end to end such that opacity is inversely proportional to lifetime
  render(cnv: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    // set Tracer's apparent opacity proportional to remaining lifespan
    const pctAlpha = 100 * (this.cyclesLeft / SynapseBgTracer.init_lifespan);
    ctx.strokeStyle = this.getColorString(pctAlpha);
    ctx.lineWidth = this.width;

    // convert start and endpoints to canvas coordinates
    const { x: sx, y: sy } = this.getCanvasPos(cnv);
    const { x: ex, y: ey } = this.getCanvasPos(cnv, this.endpoint);
    
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.closePath();
  }
}
