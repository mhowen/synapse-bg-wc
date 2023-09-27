import Entity from "./SynapseBgEntity";

export default class SynapseBgLayer {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  entities: Array<Entity>;
  fadeRate: number; // in percentage of maximum per cycle
  private static defaultFadeRate = 0.01;
  private static fadeInterval = 20;

  constructor(userContainerSelector?: string) {
    this.canvas = SynapseBgLayer.createCanvas();
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.mountCanvas(userContainerSelector);
    this.entities = [];
    this.fadeRate = SynapseBgLayer.defaultFadeRate;
  }

  // if user specified an element to contain canvases, find and append to it. otherwise, append to document body.
  mountCanvas(containerSelector?: string): void {
    if (!containerSelector) return document.body.append(this.canvas);

    try {
      const container = document.querySelector(containerSelector) as HTMLElement;

      this.canvas.style.position = 'absolute'; // should position relative to container rather than viewport

      container.append(this.canvas);
    } catch {
      console.warn(`Found no container with selector '${containerSelector}' -- appending SynapseBg to document body`);
      return document.body.append(this.canvas);
    }
  }

  static createCanvas(): HTMLCanvasElement {
    const cnv = document.createElement('CANVAS') as HTMLCanvasElement;
    cnv.role = 'presentation';

    return cnv;
  }

  // get or set value of global alpha scalar for this layer's rendering context
  get globalAlpha() {
    return this.context.globalAlpha;
  } // CanvasRenderingContext2D setter will ignore values under 0 or over 1, so handle those first
  set globalAlpha(value: number) {
    if (value > 1) value = 1;
    else if (value < 0) value = 0;

    this.context.globalAlpha = value;
  }

  // define logic to fade in or out, pass Promise back to caller, and resolve it once fade is complete
  doFade(fadeIn: boolean = false) {
    this.globalAlpha = fadeIn ? 0 : 1; // set initial value opposite our eventual target value

    // resolves promise if fade is complete or recurses after a delay if not
    const fadeFunction = (callback: (value?: any) => void ) => {
      if (fadeIn ? this.globalAlpha >= 1 : this.globalAlpha <= 0) return callback();

      this.renderAll();
      // this.globalAlpha += fadeIn ? 0.025 : -0.025;
      this.globalAlpha += fadeIn ? this.fadeRate : -this.fadeRate;
      setTimeout(() => fadeFunction(callback), SynapseBgLayer.fadeInterval);
    }

    return new Promise(resolve => fadeFunction(resolve));
  }

  // add a new entity and immediately draw it
  addEntity(entity: Entity): void {
    this.entities.push(entity);
    entity.render(this.canvas, this.context);
  }

  // filter an entity, stopping its simulation and leaving it for the garbage collector
  removeEntity(entity: Entity): void {
    this.entities = this.entities.filter(t => t.id !== entity.id);
  }

  // completely replace the current set of entities and render the new ones
  setEntities(entities: Array<Entity>): void {
    this.entities = entities;
    this.renderAll();
  }

  // clear this canvas altogether
  clear(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // cycle and render active entities and remove any inert ones
  cycleAll(): void {
    this.entities.forEach(t => t.isActive ? t.cycle() : this.removeEntity(t));
    this.renderAll();
  }

  // wipe whatever's already drawn on this layer and then draw every living entity
  renderAll(): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.entities.forEach(t => t.render(this.canvas, this.context));
  }
}