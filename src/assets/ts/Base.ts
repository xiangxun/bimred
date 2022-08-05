import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Vector3,
  Object3D,
  sRGBEncoding,
  MOUSE,
  Fog,
  OrthographicCamera,
  LinearEncoding,
} from "three";
// import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { PositionalAudioHelper } from "three/examples/jsm/helpers/POsitionalAudioHelper";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { EventManager } from "./EventManager";

const calcAspect = (el: HTMLElement) => el.clientWidth / el.clientHeight;

export class Base {
  public dom: HTMLElement;
  public renderer: WebGLRenderer;
  public eventManager: EventManager;
  public scene: Scene;
  public orbitControls: OrbitControls;
  public camera: PerspectiveCamera | OrthographicCamera;
  public cameraPosition: Vector3;
  public lookAtPosition: Vector3;
  public rendererParams: Record<string, any>;
  public perspectiveCameraParams: Record<string, any>;
  public orthographicCameraParams: Record<string, any>;

  constructor(dom: HTMLElement) {
    this.dom = dom;

    this.cameraPosition = new Vector3(5, 5, 5);
    this.lookAtPosition = new Vector3(0, 0, 0);

    this.perspectiveCameraParams = {
      fov: 75,
      near: 0.1,
      far: 100,
    };
    this.orthographicCameraParams = {
      zoom: 2,
      near: -100,
      far: 1000,
    };
    this.rendererParams = {
      outputEncoding: LinearEncoding,
      config: {
        alpha: true,
        antialias: true,
      },
    };

    const renderer = new WebGLRenderer({
      antialias: true,
    });
    renderer.shadowMap.enabled = true; //阴影可见
    renderer.localClippingEnabled = true; //剖切局部效果
    renderer.outputEncoding = sRGBEncoding;

    const scene = new Scene();
    scene.fog = new Fog(0xffffff * Math.random(), 0, 750);
    const camera = new PerspectiveCamera(
      45,
      dom.offsetWidth / dom.offsetHeight,
      1,
      2000
    );
    camera.position.copy(this.cameraPosition);
    camera.lookAt(new Vector3(0, 0, 0));
    camera.up = new Vector3(0, 1, 0);

    //初始化OrbitControls控制器
    const orbitControls: OrbitControls = new OrbitControls(
      camera,
      renderer.domElement
    );
    orbitControls.enableDamping = true;
    orbitControls.mouseButtons = {
      // LEFT: MOUSE.DOLLY,
      LEFT: null as unknown as MOUSE,
      MIDDLE: MOUSE.PAN,
      RIGHT: MOUSE.ROTATE,
    };

    //
    // const pointLockControls = new PointerLockControls(
    //   camera,
    //   renderer.domElement
    // );

    const flyControls = new FlyControls(camera, renderer.domElement);
    flyControls.movementSpeed = 10;
    flyControls.rollSpeed = Math.PI / 24;
    flyControls.autoForward = false;

    //初始化transformControls
    const transformControls: TransformControls = new TransformControls(
      camera,
      renderer.domElement
    );

    //判断此次鼠标事件是否为变换事件
    let transFlag = false;
    transformControls.addEventListener("mouseDown", () => {
      transFlag = true;
      console.log(transFlag);
    });

    //事件管理
    const eventManager = new EventManager({
      dom: renderer.domElement,
      scene: scene,
      camera: camera,
    });

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

    dom.appendChild(renderer.domElement);
    renderer.setSize(dom.offsetWidth, dom.offsetHeight);
    renderer.render(scene, camera);

    // const clock = new Clock();
    const animate = () => {
      // const delta = clock.getDelta();
      orbitControls.update();
      // flyControls.update(delta);
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
    window.addEventListener("resize", () => {
      //更新相机
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      //更新渲染
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    this.orbitControls = orbitControls;
    this.eventManager = eventManager;
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
  }

  addObject(...object: Object3D[]) {
    object.forEach((elem) => {
      this.scene.add(elem);
    });
  }
  //初识化
  init() {
    this.createScene();
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
    const aspect = calcAspect(this.dom);
    const camera = new PerspectiveCamera(fov, aspect, near, far);
    camera.position.copy(cameraPosition);
    camera.lookAt(lookAtPosition);
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
    const { dom } = this;
    const { zoom, near, far } = this.orthographicCameraParams;
    const aspect = calcAspect(dom);
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
    renderer.setSize(this.dom.clientWidth, this.dom.clientHeight);
    renderer.outputEncoding = outputEncoding;
    this.resizeRendererToDisplaySize();
    this.dom.appendChild(renderer.domElement);
    this.renderer = renderer;
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
  // 监听事件
  addListeners() {
    this.onResize();
  }
  // 监听画面缩放
  onResize() {
    window.addEventListener("resize", (e) => {
      if (this.camera instanceof PerspectiveCamera) {
        const aspect = calcAspect(this.dom);
        const camera = this.camera as PerspectiveCamera;
        camera.aspect = aspect;
        camera.updateProjectionMatrix();
      } else if (this.camera instanceof OrthographicCamera) {
        this.updateOrthographicCameraParams();
        const camera = this.camera as THREE.OrthographicCamera;
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
      this.renderer.setSize(this.dom.clientWidth, this.dom.clientHeight);
    });
  }
}
