import { Caps } from "./ClippingBox";
import { Base } from "@/assets/ts/Base";
import { Scene } from "three";
export class Clipping extends Base {
  capsScene: Scene;
  backStencil: Scene;
  frontStencil: Scene;

  controls = undefined;

  showCaps = true;
  constructor(dom: HTMLElement) {
    super(dom);
    this.scene = new Scene();
    this.capsScene = new Scene();
    this.backStencil = new Scene();
    this.frontStencil = new Scene();
  }
}
