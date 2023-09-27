import SynapseBgEntity from "./SynapseBgEntity";

export default class SynapseBgNode extends SynapseBgEntity {
  terminal: SynapseBgNode | null;

  constructor(terminal: SynapseBgNode | null, color: [number, number, number]) {
    const randomPos = { x: Math.random(), y: Math.random() };
    super(randomPos, color);
    this.terminal = terminal;
  }

  // a Node is only ever removed alongside the rest of its network, never by itself
  get isActive(): true { return true }

  // Nodes don't change once created  
  cycle(): void { return }

  // if this Node has a temrinal, draws the connection between this.pos and this.terminal.pos
  render(cnv: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    // draw network entities at fractional opacity
    ctx.strokeStyle = this.getColorString(25);
    ctx.fillStyle = this.getColorString(25);
    
    const { x, y } = this.getCanvasPos(cnv); // Node's position relative to canvas
    
    // line connecting node to its terminal, if it has one
    if (this.terminal) {
      const { x: tx, y: ty } = this.terminal.getCanvasPos(cnv);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.closePath();
    }
  }
}
