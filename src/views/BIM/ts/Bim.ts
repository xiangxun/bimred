/* eslint-disable @typescript-eslint/no-empty-function */
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { Base } from "@/assets/ts/Base";
import { EventManager } from "@/assets/ts/EventManager";
import { hilly } from "@/assets/ts/Texture";
import { ViewCube } from "./ViewCube";
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
  Vector2,
} from "three";

export class Bim extends Base {
  loader!: TextureLoader;
  transformControls!: TransformControls;
  infoDiv!: HTMLElement | null;
  viewCubeDiv!: HTMLElement | null;
  bloomPass!: UnrealBloomPass;
  outlinePass!: OutlinePass;
  viewCube!: ViewCube;
  constructor(dom: HTMLElement) {
    super(dom);
    // this.cameraPosition.set(100, 100, 100);
    this.cameraPosition.set(0, 0, 10);
    this.perspectiveCameraParams = {
      fov: 45,
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
    // this.createFlyControls();
    this.createViewCube();
    this.createTable();
    this.createComposer();
    this.createEvent();
    // this.animate();
    this.addListeners();
    this.setLoop();
  }
  createLight() {
    //添加环境光
    const ambientLight: AmbientLight = new AmbientLight(0xffffff, 0.5);
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
    // transformControls.raycast = () => {};
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
  createViewCube() {
    // const div = document.createElement("div");
    // div.className = "viewCube";
    const viewCubeDiv: HTMLElement | null =
      document.querySelector("div.viewCube");
    console.log("viewCubeDiv", viewCubeDiv);
    this.viewCubeDiv = viewCubeDiv;

    if (viewCubeDiv) {
      const viewCube = new ViewCube(viewCubeDiv);
      console.log("viewCube", viewCube);
      viewCube.viewCubeControls.addEventListener(
        "angle-change",
        ({ quaternion }) => {
          this.camera.setRotationFromQuaternion(quaternion.invert());
        }
      );
      this.viewCube = viewCube;
    }
  }
  createEvent() {
    // 初始化transformControls
    // const transformControls: TransformControls = new TransformControls(
    //   this.camera,
    //   this.renderer.domElement
    // );
    const { transformControls } = this;
    // 判断此次鼠标事件是否为变换事件
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
    const cacheMaterial = new MeshBasicMaterial({
      opacity: 0.5,
      transparent: true,
    });
    let cacheObject: Mesh | null = new Mesh(undefined, cacheMaterial);
    eventManager.addEventListener("mousemove", (event) => {
      if (event.intersects.length) {
        const intersected = event.intersects[0].object;
        // 对比新老物体
        if (intersected === cacheObject) {
          return;
        } else if (intersected !== cacheObject && cacheObject) {
          (cacheObject.material as MeshBasicMaterial).color.multiplyScalar(0.5);
          // this.outlinePass.selectedObjects = [];
        }
        if (intersected.material) {
          // this.outlinePass.selectedObjects = [intersected];
          intersected.material.color.multiplyScalar(2);
          cacheObject = intersected;
        }
      } else {
        if (cacheObject) {
          (cacheObject.material as MeshBasicMaterial).color.multiplyScalar(0.5);
          // this.outlinePass.selectedObjects = [];
          cacheObject = null;
        }
      }
    });

    //单击选中物体
    let timer: number | undefined;
    eventManager.addEventListener("click", (event) => {
      const { scene, transformControls } = this;
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
            this.outlinePass.selectedObjects = [];
            if (this.infoDiv) {
              this.infoDiv.style.visibility = "hidden";
            }
          } else {
            this.outlinePass.selectedObjects = [object];

            // object.matrixWorld = object.modelViewMatrix.clone();

            transformControls.setSize(0.5);
            scene.add(transformControls);
            transformControls.attach(
              //@ts-ignore
              object
              // object.parent instanceof Group ? object.parent : object
            );
            //@ts-ignore
            // transformControls.position.copy(object.geometry.center());
            // this.bloomPass
            if (this.infoDiv) {
              this.infoDiv.style.visibility = "visible";
            }
            //@ts-ignore
            this.generateTable(object.userData);
          }
        } else {
          transformControls.detach();
          scene.remove(transformControls);
          this.outlinePass.selectedObjects = [];
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
      // transformControls.detach();
      // scene.remove(transformControls);
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

  createTable() {
    const div = document.createElement("div");
    div.className = "info";
    const infoDiv: HTMLElement | null = document.querySelector("div.info");
    console.log("infoDiv", infoDiv);
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
      infoDiv.style.height = "500px";
      infoDiv.appendChild(table);
    }
  }
  createComposer() {
    const { renderer, scene, camera } = this;
    const renderPass = new RenderPass(scene, camera);
    const outlinePass = new OutlinePass(
      new Vector2(window.innerWidth, window.innerHeight),
      scene,
      camera
    );
    outlinePass.edgeStrength = 10;
    outlinePass.edgeGlow = 1;
    outlinePass.usePatternTexture = false;
    outlinePass.edgeThickness = 1;
    outlinePass.pulsePeriod = 5;
    outlinePass.visibleEdgeColor.set("#ff0055");
    outlinePass.hiddenEdgeColor.set("#ffff00");

    const bloomPass = new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      1,
      0.4,
      0.85
    );
    // bloomPass.threshold = 1;
    // bloomPass.strength = 2;
    // bloomPass.radius = 0.5;

    const composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    // composer.addPass(bloomPass);
    composer.addPass(outlinePass);
    this.composer = composer;
    this.outlinePass = outlinePass;
    this.bloomPass = bloomPass;
  }
  // 动画
  animate() {
    //console.log("animation");
  }
  // 渲染
  setLoop() {
    this.renderer.setAnimationLoop(() => {
      this.resizeRendererToDisplaySize();
      this.animate();
      if (this.orbitControls) {
        // this.orbitControls.update();
      }
      if (this.flyControls) {
        // const clock = new Clock();
        // const delta = clock.getDelta();
        this.flyControls.update(this.delta);
      }
      if (this.viewCube) {
        // this.viewCube.cubeCamera.position.copy(this.camera.position);
        console.log("this.camera.quaternion", this.camera.quaternion);
        this.viewCube.viewCubeControls._cube.quaternion.copy(
          this.camera.quaternion
        );
        // this.viewCube.cubeCamera.quaternion.copy(this.camera.quaternion);
        // this.viewCube.cubeCamera.lookAt(this.scene.position);
        // this.viewCube.viewCubeControls.update();
      }

      // if (this.stats) {
      //   this.stats.update();
      // }
      if (this.composer) {
        this.composer.render(this.delta);
      } else {
        this.renderer.render(this.scene, this.camera);
        // this.viewCube.cubeRenderer.render(
        //   this.viewCube.cubeScene,
        //   this.viewCube.cubeCamera
        // );
      }
    });
  }
}
