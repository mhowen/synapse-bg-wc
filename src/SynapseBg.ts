import SynapseBgLayer from "./SynapseBgLayer";
import NetworkNode from "./SynapseBgNode";
import NetworkSignal from "./SynapseBgSignal";
import {
  ColorSpace,
  HSL,
  HWB,
  sRGB,
  Lab,
  LCH,
  OKLab,
  OKLCH,
  to as convertToGamut,
  parse as parseColor
} from "colorjs.io/fn";

type ColorCoords = [number, number, number];

export default class SynapseBg extends HTMLElement {
  networkLayer: SynapseBgLayer;
  signalLayer: SynapseBgLayer;
  colorCoords: ColorCoords;
  networkSize: number;
  signalSpeedScale: number; // number greater than zero
  tracerSizeScale: number; // number greater than zero
  intervalId: number;
  static allowedColorSpaces = [sRGB, HSL, HWB, Lab, LCH, OKLab, OKLCH];
  static cycleInterval = 20; // in ms
  static defaultNetworkSize = 5; // number of Nodes in network
  static defaultColorCoords: ColorCoords = [0, 0, 0];

  constructor() {
    super(); // establish prototype chain

    const shadow = this.attachShadow({ mode: 'closed' });
    
    this.networkLayer = new SynapseBgLayer();
    this.signalLayer = new SynapseBgLayer();
    this.colorCoords = this.getColor();
    this.networkSize = this.getNetworkSize();
    this.signalSpeedScale = this.getSignalSpeedScale();
    this.tracerSizeScale = this.getTracerSizeScale();
    this.intervalId = -1; // initialized to an arbitrary number that will never get picked as intervalId

    const shadowStyle = document.createElement('style');
    const hasContainer = this.parentElement !== document.body;

    // establish how much, if any, to offset vertical position based on parent's CSS positioning
    let topVal = 0;
    if (this.parentElement && this.parentElement !== document.body) {
      const parentOffset = this.parentElement.getBoundingClientRect().top;
      topVal = this.parentElement.offsetTop - parentOffset;
    }

    // canvases fill their container or the viewport if the shadow root is a direct child of document body
    shadowStyle.textContent = `
    canvas {
      position: ${hasContainer ? 'absolute' : 'fixed' };
      top: ${topVal}px;
      z-index: ${hasContainer ? this.parentElement?.style.zIndex : -999};
    }`;

    // append the style element and the two canvases to the Shadow DOM
    shadow.append(shadowStyle, this.networkLayer.canvas, this.signalLayer.canvas);

    this.init();
  }

  // parse color attribute string into a set of ColorSpace coordinates; return default if it's invalid or not present
  getColor(): ColorCoords {
    const userColor = this.getAttribute('color');
    if (!userColor || userColor === "") return SynapseBg.defaultColorCoords;
    
    try {
      // check list of allowed ColorSpaces and register any that haven't already been
      const reg = ColorSpace.registry;
      SynapseBg.allowedColorSpaces.forEach(space => {
        if (!(space.id in reg)) ColorSpace.register(space);
      });

      const parsed = parseColor(userColor); // attempts to convert string into Colorjs.io Color Object

      // parseColor returns srgb space for keywords or hex; if user specified something else, convert it to srgb
      return parsed.spaceId === 'srgb' ? parsed.coords : convertToGamut(parsed, 'srgb').coords;
    } catch {
      console.warn(`synapse-bg couldn't parse '${userColor}' as CSS <color> -- setting fallback color`);
      return SynapseBg.defaultColorCoords;
    } 
  }

  // set number of nodes per network based on user specification or class default
  getNetworkSize(): number {
    const sizeAttr = this.getAttribute('nodes');
    if (!sizeAttr) return SynapseBg.defaultNetworkSize;

    // a network needs at least two nodes to do anything interesting
    const userSize = parseInt(sizeAttr);
    if (!userSize || userSize < 2) {
      console.warn(`Invalid synapse-bg node count '${sizeAttr}' -- node count must be an integer greater than 1`);
      return SynapseBg.defaultNetworkSize;
    }

    return userSize;
  }

  // set Signal speed multiplier based on user specification or class default
  getSignalSpeedScale(): number {
    const scaleAttr = this.getAttribute('speed-scale');
    if (!scaleAttr) return 1;

    const userScalar = parseFloat(scaleAttr);
    if (!userScalar || userScalar <= 0) {
      console.warn(`Invalid synapse-bg speed scalar '${scaleAttr}' -- must be a Number greater than 0`);
      return 1;
    }

    return userScalar;
  }

  // set Tracer size multiplier based on user specifications or class default
  getTracerSizeScale(): number {
    const scaleAttr = this.getAttribute('tracer-scale');
    if (!scaleAttr) return 1;

    const userScalar = parseFloat(scaleAttr);
    if (!userScalar || userScalar <= 0) {
      console.warn(`Invalid synapse-bg tracer size scalar '${scaleAttr}' -- must be a Number greater than 0`);
      return 1;
    }

    return userScalar;
  }

  // true if at least one Signal or Tracer exists and has stuff left to do
  get hasLivingEntities(): boolean { return this.signalLayer.entities.some(t => t.isActive) }

  // resize canvases to fill the shadow root's container, or the viewport if it has none
  resize(): void {
    const parentElement = this.parentElement as HTMLElement;
    const hasContainer = parentElement !== document.body;

    [this.networkLayer.canvas, this.signalLayer.canvas].forEach(cnv => {
      cnv.width = hasContainer ? parentElement.offsetWidth : window.innerWidth;
      cnv.height = hasContainer ? parentElement.offsetHeight : window.innerHeight;
    });
  }

  // create a network and a Signal to traverse it, then fade in and begin simulation
  init(): void {
    this.resize();

    this.createNetwork();
    this.createSignal();
    this.networkLayer.doFade(true).then(() => this.start()); // promise resolves once fade-in is complete
  }

  // randomly create a bunch of nodes, linking each to whichever was created just before
  createNetwork(): void {
    // create an initial node to begin the chain of linked terminal nodes
    const nodes: Array<NetworkNode> = [new NetworkNode(null, this.colorCoords)];

    for (let i = 1; i < this.networkSize; i++) {
      nodes.unshift(new NetworkNode(nodes[0], this.colorCoords)); // create nodes linked to previously created node
    }

    this.networkLayer.setEntities(nodes); // assign the result to networkLayer so it can all be rendered
  }

  // creates a new Signal over the Node at the beginning of the current network
  createSignal(): void {
    const sig = new NetworkSignal(this.networkLayer.entities, this.colorCoords, this.signalSpeedScale, this.tracerSizeScale);
    this.signalLayer.addEntity(sig);
  }

  // tell signalLayer to update all dynamic entities. if none remain, start a new network
  cycle(): void {
    this.hasLivingEntities ? this.signalLayer.cycleAll() : this.reset();
  }

  // begin updating and re-drawing dynamic assets at defined interval
  start(): void {
    clearInterval(this.intervalId);
    this.intervalId = window.setInterval(() => this.cycle(), SynapseBg.cycleInterval);
  }

  // fade existing network out then start the process anew
  reset(): void {
    clearInterval(this.intervalId);
    this.networkLayer.doFade().then(() => this.init()); // promise resolves once fade-out is complete
  }
}
