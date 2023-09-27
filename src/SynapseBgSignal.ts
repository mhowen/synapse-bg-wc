import SynapseBgEntity from "./SynapseBgEntity";
import SynapseBgTracer from "./SynapseBgTracer";

type Position2D = { x: number, y: number };
type ColorCoords = [number, number, number];

export default class SynapseBgSignal extends SynapseBgEntity {
  waypoints: Array<Position2D>;
  tracers: Array<SynapseBgTracer>;
  tracerScale: number;
  speed: number;
  static defaultSpeed = 0.01; // i.e., one percent of normalized canvas dimensions

  constructor(network: Array<SynapseBgEntity>, color: ColorCoords, speedMultiplier = 1, tracerScale = 1) {
    super(network[0].pos, color); // start Signal over top of first node in network
    this.speed = SynapseBgSignal.defaultSpeed * speedMultiplier;
    this.waypoints = SynapseBgSignal.calculateWaypoints(network, this.speed);
    this.tracers = [];
    this.tracerScale = tracerScale;
  }

  // create a bunch of evenly spaced steps between every adjacent pair of nodes
  static calculateWaypoints(nodes: Array<SynapseBgEntity>, speed: number): Array<Position2D> {
    const waypoints = new Array<Position2D>();

    // get waypoints between each node and its terminal except the very last, which necessarily has no terminal
    for (let i = 0; i < nodes.length - 1; i++) {
      const n0 = nodes[i];
      const n1 = nodes[i + 1];
      
      const len = Math.hypot(n1.pos.x - n0.pos.x, n1.pos.y - n0.pos.y); // linear distance btwn node and terminal
      const dir = Math.atan2(n1.pos.y - n0.pos.y, n1.pos.x - n0.pos.x); // angle from n0 to n1 relative to horizontal
      const steps = Math.ceil(len / speed); // waypoints btwn n0 and n1 given Signal speed
      waypoints.push(n0.pos); // add initial node's position as waypoint
      
      // calculate and push an intermediate waypoint for every step in between n0 and n1
      for (let step = 1; step < steps; step++) {
        waypoints.push({
          x: n0.pos.x + (Math.cos(dir) * step * speed),
          y: n0.pos.y + (Math.sin(dir) * step * speed)
        });
      }
    }
    waypoints.push(nodes[nodes.length - 1].pos); // add the very last node's position as a waypoint

    return waypoints;
  }

  // Signals are active if they're moving or if they're done but still have visible Tracers
  get isActive(): boolean {
    return (this.waypoints.length > 0 || this.tracers.some(tr => tr.isActive));
  }

  createTracer(): void {
    this.tracers.push(new SynapseBgTracer(this.pos, this.waypoints[0], this.color, this.tracerScale));
  }

  removeTracer(toRemove: SynapseBgTracer): void {
    this.tracers = this.tracers.filter(tr => tr.id !== toRemove.id);
  }

  // IFF there's another waypoint, create a Tracer and move to it
  cycle(): void {
    if (this.waypoints.length > 0) {
      this.createTracer();
      this.pos = this.waypoints.shift() as Position2D;
    }
  }

  render(cnv: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.getColorString();

    // render tracers
    this.tracers.forEach(tr => {
      tr.render(cnv, ctx);
      tr.cycle();
      if (!tr.isActive) this.removeTracer(tr);
    });

    // DEBUG: render circle over Signal's current position
    // const { x, y } = this.getCanvasPos(cnv);
    // ctx.beginPath();
    // ctx.arc(x, y, 8, 0, Math.PI * 2);
    // ctx.fill();
    // ctx.closePath();

    // // DEBUG: render waypoints
    // this.waypoints.forEach(wp => {
    //   const [ wpx, wpy ] = [wp.x * cnv.width, wp.y * cnv.height];
    //   ctx.beginPath();
    //   ctx.arc(wpx, wpy, 6, 0, Math.PI * 2);
    //   ctx.fill();
    //   ctx.closePath();
    // });
  }
}
