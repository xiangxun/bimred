import {
  Camera,
  EventDispatcher,
  Object3D,
  Raycaster,
  Scene,
  Vector2,
} from "three";

export interface EventManagerParameters {
  dom: HTMLCanvasElement;
  scene: Scene;
  camera: Camera;
}

export class EventManager extends EventDispatcher {
  private raycaster: Raycaster = new Raycaster();
  private mouse: Vector2 = new Vector2();
  private dom: HTMLCanvasElement;
  private scene: Scene;
  private camera: Camera;
  constructor(params: EventManagerParameters) {
    super();
    this.dom = params.dom;
    this.scene = params.scene;
    this.camera = params.camera;

    const mouse = this.mouse;
    const raycaster = this.raycaster;
    const dom = this.dom;

    let cacheObject: Object3D | null = null;
    dom.addEventListener("mousedown", () => {
      // 选取物体的操作
      raycaster.setFromCamera(mouse, this.camera);
      const intersection = raycaster.intersectObjects(this.scene.children);
      this.dispatchEvent({
        type: "mousedown",
        intersection,
      });
      if (intersection.length) {
        const object = intersection[0].object;
        object.dispatchEvent({
          type: "mousedown",
        });
      }
    });

    dom.addEventListener("mousemove", (event) => {
      mouse.x = 2 * (event.offsetX / dom.offsetWidth) - 1;
      mouse.y = -2 * (event.offsetY / dom.offsetHeight) + 1;
      // console.log(mouse.x, mouse.y);
      raycaster.setFromCamera(mouse, this.camera);
      const intersects = raycaster.intersectObjects(this.scene.children);
      this.dispatchEvent({
        type: "mousemove",
        intersects,
      });
      if (intersects.length) {
        const intersected = intersects[0].object;

        if (intersected !== cacheObject) {
          if (cacheObject) {
            console.log("mouseleave");
            cacheObject.dispatchEvent({
              type: "mouseleave",
            });
          }
          intersected.dispatchEvent({
            type: "mouseenter",
          });
        } else if (intersected === cacheObject) {
          intersected.dispatchEvent({
            type: "mousemove",
          });
        }
        cacheObject = intersected;
      } else {
        if (cacheObject) {
          cacheObject.dispatchEvent({
            type: "mouseleave",
          });
        }
        cacheObject = null;
      }
    });

    dom.addEventListener("mouseup", () => {
      // 选取物体的操作
      console.log(mouse.x, mouse.y);
      raycaster.setFromCamera(mouse, this.camera);
      const intersection = raycaster.intersectObjects(this.scene.children);

      this.dispatchEvent({
        type: "mouseup",
        intersection,
      });
      if (intersection.length) {
        const object = intersection[0].object;
        object.dispatchEvent({
          type: "mouseup",
        });
      }
    });

    dom.addEventListener("click", () => {
      // 选取物体的操作
      raycaster.setFromCamera(mouse, this.camera);
      const intersection = raycaster.intersectObjects(
        this.scene.children,
        true
      );

      this.dispatchEvent({
        type: "click",
        intersection,
      });
      if (intersection.length) {
        const object = intersection[0].object;
        object.dispatchEvent({
          type: "click",
        });
      }
    });
    //双击事件
    dom.addEventListener("dblclick", () => {
      // 选取物体的操作
      raycaster.setFromCamera(mouse, this.camera);
      const intersection = raycaster.intersectObjects(
        this.scene.children,
        true
      );

      this.dispatchEvent({
        type: "dblclick",
        intersection,
      });
      if (intersection.length) {
        const object = intersection[0].object;
        object.dispatchEvent({
          type: "dblclick",
        });
      }
    });
  }
}
