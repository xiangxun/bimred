import { FlyControls } from "three/examples/jsm/controls/FlyControls";
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Vector3,
  Object3D,
  OrthographicCamera,
  LinearEncoding,
  Color,
  AmbientLight,
  DirectionalLight,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  MOUSE,
  Clock,
} from "three";
// import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import type { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
// import { PositionalAudioHelper } from "three/examples/jsm/helpers/POsitionalAudioHelper";
// import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import type { EventManager } from "./EventManager";

const calcAspect = () => window.innerWidth / window.innerHeight;

export class Base {
  public dom: HTMLElement;
  public renderer!: WebGLRenderer;
  public eventManager!: EventManager;
  public scene!: Scene;
  public orbitControls!: OrbitControls;
  public flyControls!: FlyControls;
  delta!: number;
  public camera!: PerspectiveCamera | OrthographicCamera;
  public cameraPosition: Vector3;
  public lookAtPosition: Vector3;
  public rendererParams: Record<string, any>;
  public perspectiveCameraParams: Record<string, any>;
  public orthographicCameraParams: Record<string, any>;
  public composer!: EffectComposer;

  constructor(dom: HTMLElement) {
    this.dom = dom;
    this.delta = new Clock().getDelta();

    this.cameraPosition = new Vector3(5, 5, 5);
    this.lookAtPosition = new Vector3(0, 0, 0);
    this.perspectiveCameraParams = {
      fov: 30,
      near: 0.1,
      far: 2000,
    };
    this.orthographicCameraParams = {
      zoom: 2,
      near: -100,
      far: 1000,
    };
    this.rendererParams = {
      outputEncoding: LinearEncoding,
      config: {
        // alpha: true,
        antialias: true,
      },
    };
  }

  addObject(...object: Object3D[]) {
    object.forEach((elem) => {
      this.scene.add(elem);
    });
  }
  //初始化
  init() {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    this.createMesh();
    this.createLight();
    // this.createOrbitControls();
    // this.createFlyControls();
    this.addListeners();
    this.setLoop();
  }
  //创建场景
  createScene() {
    const scene = new Scene();
    this.scene = scene;
  }

  // 创建透视相机
  createPerspectiveCamera() {
    const { perspectiveCameraParams, cameraPosition, lookAtPosition } = this;
    const { fov, near, far } = perspectiveCameraParams;
    const aspect = calcAspect();
    const camera = new PerspectiveCamera(fov, aspect, near, far);
    camera.position.copy(cameraPosition);
    camera.lookAt(lookAtPosition);
    camera.up = new Vector3(0, 1, 0);
    this.camera = camera;
  }
  // 创建正交相机
  createOrthographicCamera() {
    const { orthographicCameraParams, cameraPosition, lookAtPosition } = this;
    const { left, right, top, bottom, near, far } = orthographicCameraParams;
    const camera = new OrthographicCamera(left, right, top, bottom, near, far);
    camera.position.copy(cameraPosition);
    camera.lookAt(lookAtPosition);
    this.camera = camera;
  }
  // 更新正交相机参数
  updateOrthographicCameraParams() {
    const { zoom, near, far } = this.orthographicCameraParams;
    const aspect = calcAspect();
    this.orthographicCameraParams = {
      left: -zoom * aspect,
      right: zoom * aspect,
      top: zoom,
      bottom: -zoom,
      near,
      far,
      zoom,
    };
  }
  //创建渲染
  createRenderer() {
    const { rendererParams } = this;
    const { outputEncoding, config } = rendererParams;
    const renderer = new WebGLRenderer(config);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = outputEncoding;
    this.resizeRendererToDisplaySize();
    this.dom.appendChild(renderer.domElement);
    console.log(renderer);
    this.renderer = renderer;
    // this.renderer.setClearColor(0x000000, 0);
  }
  // 调整渲染器尺寸
  resizeRendererToDisplaySize() {
    const { renderer } = this;
    if (!renderer) {
      return;
    }
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const { clientWidth, clientHeight } = canvas;
    const width = (clientWidth * pixelRatio) | 0;
    const height = (clientHeight * pixelRatio) | 0;
    const isResizeNeeded = canvas.width !== width || canvas.height !== height;
    if (isResizeNeeded) {
      renderer.setSize(width, height, false);
    }
    return isResizeNeeded;
  }
  // 创建Mesh
  createMesh() {
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshStandardMaterial({
        color: new Color("#d9dfc8"),
      }),
      position = new Vector3(0, 0, 0);

    const mesh = new Mesh(geometry, material);
    mesh.position.copy(position);
    console.log(this.scene, mesh);
    this.scene.add(mesh);
  }
  // 创建光源
  createLight() {
    const dirLight = new DirectionalLight(new Color("#ffff00"), 0.5);
    dirLight.position.set(0, 50, 0);
    console.log(dirLight);
    this.scene.add(dirLight);
    const ambiLight = new AmbientLight(new Color("#f00fff"), 0.4);
    this.scene.add(ambiLight);
  }
  // 创建轨道控制
  createOrbitControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    const { lookAtPosition } = this;
    controls.target.copy(lookAtPosition);
    controls.enableDamping = true;
    controls.mouseButtons = {
      // LEFT: MOUSE.DOLLY,
      LEFT: null as unknown as MOUSE,
      MIDDLE: MOUSE.PAN,
      RIGHT: MOUSE.ROTATE,
    };
    controls.update();
    this.orbitControls = controls;
  }
  //创建飞行控制器
  createFlyControls() {
    const flyControls = new FlyControls(this.camera, this.renderer.domElement);
    flyControls.movementSpeed = 1000;
    flyControls.domElement = this.renderer.domElement;
    flyControls.rollSpeed = Math.PI / 24;
    // flyControls.autoForward = false;

    flyControls.update(this.delta);
    this.flyControls = flyControls;
    console.log(flyControls);
  }
  // 监听事件
  addListeners() {
    this.onResize();
  }
  // 监听画面缩放
  onResize() {
    window.addEventListener("resize", () => {
      if (this.camera instanceof PerspectiveCamera) {
        const aspect = calcAspect;
        const camera = this.camera as PerspectiveCamera;
        camera.aspect = aspect();
        camera.updateProjectionMatrix();
      } else if (this.camera instanceof OrthographicCamera) {
        this.updateOrthographicCameraParams();
        const camera = this.camera as OrthographicCamera;
        const { left, right, top, bottom, near, far } =
          this.orthographicCameraParams;
        camera.left = left;
        camera.right = right;
        camera.top = top;
        camera.bottom = bottom;
        camera.near = near;
        camera.far = far;
        camera.updateProjectionMatrix();
      }
      // this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setSize(this.dom.clientWidth, this.dom.clientHeight);
    });
  }
  // 动画
  animate() {
    // console.log("animation");
  }
  // 渲染
  setLoop() {
    this.renderer.setAnimationLoop(() => {
      this.resizeRendererToDisplaySize();
      this.animate();
      if (this.orbitControls) {
        this.orbitControls.update();
      }
      if (this.flyControls) {
        // const clock = new Clock();
        // const delta = clock.getDelta();
        this.flyControls.update(this.delta);
      }

      // if (this.stats) {
      //   this.stats.update();
      // }
      if (this.composer) {
        this.composer.render(this.delta);
      } else {
        this.renderer.render(this.scene, this.camera);
      }
    });
  }
}
