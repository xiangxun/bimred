import { AudioPlayer } from "@/views/CineRoom/ts/MediaPlayer";
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Vector3,
  Object3D,
  sRGBEncoding,
  Mesh,
  AudioListener,
  MeshBasicMaterial,
  MOUSE,
  Fog,
  Clock,
  Box3,
  Box3Helper,
} from "three";
// import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import { PositionalAudioHelper } from "three/examples/jsm/helpers/POsitionalAudioHelper";
import { TransformControls } from "three/examples/jsm/controls/TransformControls";
import { FlyControls } from "three/examples/jsm/controls/FlyControls";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls";
import { EventManager } from "@/assets/ts/EventManager";
export class Cineroom {
  private dom: HTMLElement;
  private renderer: WebGLRenderer;
  private eventManager: EventManager;
  private scene: Scene;
  public camera: PerspectiveCamera;
  // private listener: AudioListener;

  constructor(dom: HTMLElement) {
    this.dom = dom;
    const renderer = new WebGLRenderer({
      antialias: true,
    });
    renderer.shadowMap.enabled = true; //阴影可见
    renderer.outputEncoding = sRGBEncoding;
    // renderer.localClippingEnabled = true; //剖切局部效果

    const scene = new Scene();
    scene.fog = new Fog(0xffffff * Math.random(), 0, 750);
    const camera = new PerspectiveCamera(
      45,
      dom.offsetWidth / dom.offsetHeight,
      1,
      10000
    );
    camera.position.set(-40, 30, 7);
    camera.lookAt(new Vector3(0, 0, 0));
    camera.up = new Vector3(0, 1, 0);

    //初始化OrbitControls
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
    const pointLockControls = new PointerLockControls(
      camera,
      renderer.domElement
    );

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

    let cacheObject: Mesh | null = null;
    eventManager.addEventListener("mousemove", (event) => {
      if (event.intersects.length) {
        const intersected = event.intersects[0].object;
        // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
        // INTERSECTED.material.emissive.setHex( 0xff0000 );

        // 对比新老物体
        if (intersected === cacheObject) {
          return;
        } else if (intersected !== cacheObject && cacheObject) {
          (cacheObject.material as MeshBasicMaterial).color.multiplyScalar(0.1);
          // (cacheObject.material as MeshBasicMaterial).transparent = false;
          // (cacheObject.material as MeshLambertMaterial).emissive.set(1);
        }
        if (intersected.material) {
          //@ts-ignore
          this.createLabel(intersected.userData);
          intersected.material.color.multiplyScalar(10);
          // intersected.material.transparent = true;
          // intersected.material.opacity = 0.01;

          // intersected.material.emissive.setHex(0xffff00);
          cacheObject = intersected;
        }
      } else {
        if (cacheObject) {
          (cacheObject.material as MeshBasicMaterial).color.multiplyScalar(0.1);
          // (cacheObject.material as MeshBasicMaterial).transparent = false;
          // (cacheObject.material as MeshLambertMaterial).emissive.set(1);

          cacheObject = null;
        }
      }
    });

    let timer: number | undefined;
    eventManager.addEventListener("click", (event) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (transFlag) {
          transFlag = false;
          return false;
        }
        if (event.intersection.length) {
          const object = event.intersection[0].object as Object3D;
          console.log(object);
          if (object.type === "TransformControlsPlane") {
            transformControls.detach();
            scene.remove(transformControls);
          } else {
            transformControls.setSize(0.5);
            scene.add(transformControls);
            transformControls.attach(
              object
              // object.parent instanceof Group ? object.parent : object
            );
          }
        } else {
          transformControls.detach();
          scene.remove(transformControls);
        }
      }, 300);
    });

    //双击选择物体成为旋转中心
    eventManager.addEventListener("dblclick", (event) => {
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

    const clock = new Clock();
    const animate = () => {
      const delta = clock.getDelta();
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

    this.eventManager = eventManager;
    this.renderer = renderer;
    this.camera = camera;
    this.scene = scene;
  }

  playMusic() {
    //收听者，位置与camera绑定
    const listener = new AudioListener();
    this.camera.add(listener);
    //左音响
    const audioL: HTMLAudioElement = document.querySelector(
      "#musicL"
    ) as HTMLAudioElement;
    const audioPlayerL = new AudioPlayer(audioL, listener);
    audioPlayerL.player.position.set(40, -6, -28);
    audioPlayerL.player.rotation.y -= (Math.PI * 1) / 5;
    this.scene.add(audioPlayerL.player);
    //右音响
    const audioR: HTMLAudioElement = document.querySelector(
      "#musicR"
    ) as HTMLAudioElement;
    const audioPlayerR = new AudioPlayer(audioR, listener);
    audioPlayerR.player.position.set(40, -6, 25);
    audioPlayerR.player.rotation.y += (Math.PI * 5) / 4;
    this.scene.add(audioPlayerR.player);
  }

  addObject(...object: Object3D[]) {
    object.forEach((elem) => {
      this.scene.add(elem);
    });
  }
  createLabel(data: [key: string]) {
    let labelDiv: HTMLElement | null = document.querySelector("div.label");
    console.log("data===", data);
    const p = document.createElement("p");
    p.className = "label";
    //@ts-ignore
    const [key, value] = Object.entries(data);
    p.textContent = [key, value].toString();
    if (labelDiv) {
      labelDiv.innerHTML = "";
      labelDiv.appendChild(p);
    }
  }
}
