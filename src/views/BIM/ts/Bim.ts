/* eslint-disable @typescript-eslint/no-empty-function */
import { Base } from "@/assets/ts/Base";
import { EventManager } from "@/assets/ts/EventManager";
import { hilly } from "@/assets/ts/Texture";
import {
  PointLight,
  AmbientLight,
  TextureLoader,
  WebGLCubeRenderTarget,
  Object3D,
  Box3Helper,
  Box3,
  MeshBasicMaterial,
  Mesh,
  Clock,
  MeshLambertMaterial,
} from "three";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";

export class Bim extends Base {
  loader!: TextureLoader;
  flyControls!: FlyControls;
  transformControls!: TransformControls;
  infoDiv!: HTMLElement | null;
  constructor(dom: HTMLElement) {
    super(dom);
    this.cameraPosition.set(200, 200, 200);
    this.perspectiveCameraParams = {
      fov: 60,
      near: 0.1,
      far: 2000,
    };
    this.orthographicCameraParams = {
      zoom: 2,
      near: -100,
      far: 1000,
    };
  }
  init(): void {
    this.createScene();
    this.createPerspectiveCamera();
    // this.createOrthographicCamera();
    this.createRenderer();
    // 渲染阴影
    this.renderer.shadowMap.enabled = true;
    this.createBackground();
    // this.createMesh();
    this.createLight();
    this.createOrbitControls();
    this.createTransformControls();
    this.createTable();
    this.createEvent();
    // this.createFlyControls();
    // this.update();
    this.addListeners();
    this.setLoop();
  }
  createLight() {
    //添加环境光
    const ambientLight: AmbientLight = new AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);
    // 添加点光源
    const pointlight: PointLight = new PointLight(0xffffff, 1, 100);
    pointlight.position.set(10, 10, 10);
    this.scene.add(pointlight);
  }
  createBackground() {
    this.loader = new TextureLoader();
    const texture = this.loader.load(hilly, () => {
      const rt = new WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(this.renderer, texture);
      this.scene.background = rt.texture;
    });
  }
  createTransformControls() {
    //初始化transformControls
    const transformControls: TransformControls = new TransformControls(
      this.camera,
      this.renderer.domElement
    );
    //设置transformControls的模式
    document.addEventListener("keyup", (event) => {
      console.log(event);
      switch (event.key) {
        case "e":
          transformControls.mode = "translate";
          //切换至平移模式
          break;
        case "r":
          transformControls.mode = "rotate";
          //切换至旋转模式
          break;
        case "s":
          transformControls.mode = "scale";
          //切换至缩放模式
          break;

        default:
          break;
      }
    });
    this.transformControls = transformControls;
  }
  createEvent() {
    // //初始化transformControls
    // const transformControls: TransformControls = new TransformControls(
    //   this.camera,
    //   this.renderer.domElement
    // );
    const { transformControls } = this;
    //判断此次鼠标事件是否为变换事件
    let transFlag = false;
    transformControls.addEventListener("mouseDown", () => {
      transFlag = true;
      console.log("transFlag", transFlag);
    });

    //事件管理
    const eventManager = new EventManager({
      dom: this.renderer.domElement,
      scene: this.scene,
      camera: this.camera,
    });

    //鼠标以上时物体高亮
    let cacheObject: Mesh | null = null;
    eventManager.addEventListener("mousemove", (event) => {
      if (event.intersects.length) {
        const intersected = event.intersects[0].object;
        // 对比新老物体
        if (intersected === cacheObject) {
          return;
        } else if (intersected !== cacheObject && cacheObject) {
          (cacheObject.material as MeshBasicMaterial).color.multiplyScalar(0.5);
        }
        if (intersected.material) {
          intersected.material.color.multiplyScalar(2);
          cacheObject = intersected;
        }
      } else {
        if (cacheObject) {
          (cacheObject.material as MeshBasicMaterial).color.multiplyScalar(0.5);
          cacheObject = null;
        }
      }
    });

    //单击选中物体
    let timer: number | undefined;
    eventManager.addEventListener("click", (event) => {
      const { scene } = this;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (transFlag) {
          transFlag = false;
          console.log("transFlag1", transFlag);
          return false;
        }
        if (event.intersection.length) {
          const object = event.intersection[0].object as Object3D;
          console.log(object);
          if (object.type === "TransformControlsPlane") {
            transformControls.detach();
            scene.remove(transformControls);
            if (this.infoDiv) {
              this.infoDiv.style.visibility = "hidden";
            }
          } else {
            transformControls.setSize(0.5);
            scene.add(transformControls);
            transformControls.attach(
              object
              // object.parent instanceof Group ? object.parent : object
            );
            if (this.infoDiv) {
              this.infoDiv.style.visibility = "visible";
            }
            //@ts-ignore
            this.generateTable(object.userData);
          }
        } else {
          transformControls.detach();
          scene.remove(transformControls);
          if (this.infoDiv) {
            this.infoDiv.style.visibility = "hidden";
          }
        }
      }, 300);
    });

    //双击选择物体成为旋转中心
    eventManager.addEventListener("dblclick", (event) => {
      const { scene, camera, orbitControls } = this;
      clearTimeout(timer);
      transformControls.detach();
      scene.remove(transformControls);
      if (event.intersection.length) {
        const object = event.intersection[0].object as Object3D;
        camera.lookAt(object.position);
        orbitControls.target = object.position;
        const box = new Box3().setFromObject(object);
        const helper = new Box3Helper(box);
        helper.raycast = () => {};
        scene.add(helper);
        console.log(object);
      }
      console.log("dblclick");
    });
  }
  createFlyControls() {
    const flyControls = new FlyControls(this.camera, this.renderer.domElement);
    flyControls.movementSpeed = 10;
    flyControls.rollSpeed = Math.PI / 24;
    flyControls.autoForward = false;
    this.flyControls = flyControls;
    console.log(flyControls);
  }
  update(): void {
    const clock = new Clock();
    const delta = clock.getDelta();
    // this.flyControls.update(delta);
  }

  createTable() {
    const div = document.createElement("div");
    div.className = "info";
    const infoDiv: HTMLElement | null = document.querySelector("div.info");
    this.infoDiv = infoDiv;
  }
  generateTable(data: [key: string]) {
    const { infoDiv } = this;
    console.log("data===", data);
    const table = document.createElement("table");
    table.className = "info-table";
    if (Object.keys(data).length == 0) {
      return;
    }
    const thead = document.createElement("thead");
    const headtr = document.createElement("tr");
    const headFirst = document.createElement("th");
    const headSecond = document.createElement("th");
    headFirst.textContent = "属性";
    headSecond.textContent = "属性值";
    headtr.appendChild(headFirst);
    headtr.appendChild(headSecond);
    thead.appendChild(headtr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    for (const [key, value] of Object.entries(data)) {
      if (key != "Properties") {
        const row = document.createElement("tr");
        const cellFirst = document.createElement("td");
        const cellSecond = document.createElement("td");
        cellFirst.textContent = key;
        cellSecond.textContent = value;
        row.appendChild(cellFirst);
        row.appendChild(cellSecond);
        tbody.appendChild(row);
        // table.appendChild(row);
      } else {
        //@ts-ignore
        for (const [key, value] of Object.entries(data.Properties)) {
          const row = document.createElement("tr");
          const cellFirst = document.createElement("td");
          const cellSecond = document.createElement("td");
          cellFirst.textContent = key;
          //@ts-ignore
          cellSecond.textContent = value;
          row.appendChild(cellFirst);
          row.appendChild(cellSecond);
          tbody.appendChild(row);
          // table.appendChild(row);
        }
      }
    }
    if (infoDiv) {
      infoDiv.innerHTML = "";
      infoDiv.style.width = "350px";
      infoDiv.style.height = "450px";
      infoDiv.appendChild(table);
    }
  }
}
