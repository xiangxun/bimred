import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  LoadingManager,
  Mesh,
  MOUSE,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Raycaster,
  Scene,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
// import Stats from "three/examples/jsm/libs/stats.module";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";

export class Mep {
  private dom: HTMLElement;
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private loader: TextureLoader;
  private orbitControls: OrbitControls;
  public currentObject: Mesh;
  private sceneReady: boolean;
  private pointer;
  private prDiv: HTMLElement | null;
  constructor(dom: HTMLElement) {
    this.dom = dom;
    //渲染 antialias抗锯齿
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    // this. renderer.outputEncoding = sRGBEncoding;

    // 新建场景
    this.scene = new Scene();
    // 新建透视相机
    // this.camera = new PerspectiveCamera(45,dom.offsetWidth/dom.offsetHeight,0.1,1000);

    this.camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.camera.position.set(100, 100, 100);
    this.camera.lookAt(new Vector3(10, 10, 10));
    // this.camera.position.z=500
    this.scene.add(this.camera);

    //使用后处理模块
    const composer = new EffectComposer(this.renderer);
    //渲染通道
    const renderPass = new RenderPass(this.scene, this.camera);
    composer.addPass(renderPass);
    //高亮边框通道
    const outlinePass = new OutlinePass(
      new Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
    );
    outlinePass.edgeStrength = 10;
    outlinePass.edgeGlow = 0.1;
    outlinePass.edgeThickness = 1;
    //outlinePass.pulsePeriod = 2;
    outlinePass.visibleEdgeColor.set("#ff0055");
    outlinePass.hiddenEdgeColor.set("#ffff00");
    composer.addPass(outlinePass);

    //光
    //添加环境光
    const ambientLight: AmbientLight = new AmbientLight(0xffffff);
    this.scene.add(ambientLight);
    // 添加点光源
    const pointlight: PointLight = new PointLight(0xffffff, 5, 100);
    pointlight.position.set(50, 50, 50);
    this.scene.add(pointlight);

    //设置性能监视器
    // const stats = Stats();
    // dom.appendChild(stats.domElement);

    //设置3D背景
    this.loader = new TextureLoader();
    const texture = this.loader.load("/loader/hdr/hilly.jpg", () => {
      const rt = new WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(this.renderer, texture);
      this.scene.background = rt.texture;
    });

    this.sceneReady = false;
    const loadingManager = new LoadingManager(
      //loaded 载入完成
      () => {
        console.log("载入完成");
        this.sceneReady = true;
        console.log("scene===", this.scene);
      },
      //Progress 载入过程
      (itemUrl, itemsLoaded, itemsTotal) => {
        console.log(itemUrl, itemsTotal);
        console.log("载入中...", itemsLoaded);
      }
    );

    //加载gltf模型，使用draco解析
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(
      "https://www.gstatic.com/draco/versioned/decoders/1.4.3/"
    );
    // dracoLoader.setDecoderPath("/examples/js/libs/draco/");
    const gltfLoader = new GLTFLoader(loadingManager);
    gltfLoader.setDRACOLoader(dracoLoader);
    // "loader/dracoModel/dracoRoom.gltf"
    gltfLoader.load("gltfModel/buildingDraco.gltf", (gltf) => {
      const object = gltf.scene || gltf.scene[0];

      //1.调整物体位置
      const box = new Box3().setFromObject(object);
      // const size = box.getSize(new Vector3()).length();
      const center = box.getCenter(new Vector3());
      object.position.x += object.position.x - center.x;
      object.position.y += object.position.y - center.y;
      object.position.z += object.position.z - center.z;
      //2.调整相机位置
      //   this.camera.near = size / 100
      //   this.camera.far = size * 100
      //   this.camera.updateProjectionMatrix()

      //   this.camera.position.copy(center)
      //   this.camera.position.x += size/2.0
      //   this.camera.position.y += size/2.0
      //   this.camera.position.z += size/2.0
      //   this.camera.lookAt(center)
      this.scene.add(object);
      console.log("gltf.scene", gltf.scene);
      console.log("scene===", this.scene);
    });

    //设置轨道控制
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    //设置鼠标键位
    this.orbitControls.mouseButtons = {
      // LEFT: null as unknown as MOUSE,
      LEFT: MOUSE.ROTATE,
      MIDDLE: MOUSE.PAN,
      RIGHT: MOUSE.ROTATE,
    };

    //resize 加入大小尺寸的控制
    window.addEventListener("resize", () => {
      //更新相机
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      //更新渲染
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    const div = document.createElement("div");
    div.className = "pr";
    const prDiv: HTMLElement | null = document.querySelector("div.pr");
    this.prDiv = prDiv;
    //@ts-ignore
    const generateTable = (data) => {
      console.log("data===", data);
      const table = document.createElement("table");
      table.className = "styled-table";
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
          //@ts-ignore
          cellSecond.textContent = value;
          row.appendChild(cellFirst);
          row.appendChild(cellSecond);
          tbody.appendChild(row);
          // table.appendChild(row);
        } else {
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
      if (prDiv) {
        prDiv.innerHTML = "";
        prDiv.style.width = "400px";
        prDiv.style.height = "500px";
        prDiv.appendChild(table);
      }
    };

    //使用射线法
    //当前选中物体
    // const currentObject = {};
    this.currentObject = <Mesh>{};
    //之前选中的物体
    let lastObject: Mesh = <Mesh>{};
    this.pointer = new Raycaster();
    //mouse
    const mouse = new Vector2();
    window.addEventListener(
      "mousemove",
      // 将鼠标位置归一化为设备坐标。x 和 y 方向的取值范围是 (-1 to +1)
      (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      }
    );
    window.addEventListener("click", () => {
      if (
        JSON.stringify(this.currentObject) != "{}" &&
        this.currentObject != undefined &&
        this.currentObject != null &&
        this.currentObject != lastObject
      ) {
        console.log("选中了", this.currentObject);
        lastObject = this.currentObject;
        if (prDiv) {
          prDiv.style.visibility = "visible";
        }
        //@ts-ignore
        generateTable(this.currentObject.userData);

        const outlineObjcets: Mesh[] = [];
        outlineObjcets.push(this.currentObject);
        // outlinePass.selectedObjects = currentObject;
        outlinePass.selectedObjects = outlineObjcets;
      } else {
        console.log("没有选中");
        console.log("没有选中1");
        lastObject = <Mesh>{};
        this.currentObject = <Mesh>{};
        outlinePass.selectedObjects = [];
        if (prDiv) {
          prDiv.style.visibility = "hidden";
        }
      }
    });

    console.log(this.dom);
    this.dom?.appendChild(this.renderer.domElement);
    if (this.dom) {
      this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight, true);
    }
    // this.renderer.setSize(this.dom.offsetWidth, this.dom.offsetHeight, true);

    //设置动画
    const animate = () => {
      //模型加载完以后，确定当前点选的对象currentObject
      if (this.sceneReady) {
        // 通过摄像机和鼠标位置更新射线
        this.pointer.setFromCamera(mouse, this.camera);
        // 计算物体和射线的交点
        const intersects = this.pointer.intersectObjects(
          this.scene.children[3].children[0].children
        );
        // console.log("intersects", intersects);
        if (intersects.length > 0) {
          const selectedObject: Mesh = <Mesh>intersects[0].object;
          if (this.currentObject != selectedObject) {
            this.currentObject = selectedObject;
          }
        } else {
          this.currentObject = <Mesh>{};
        }
      }

      // console.log(1);
      // this.renderer.render(this.scene, this.camera);

      // stats.update();
      composer.render();
      this.orbitControls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
      requestAnimationFrame(animate);
    };

    animate();

    // this.dom?.appendChild(this.renderer.domElement);
  }

  // seletedObject() {
  //   //模型加载完以后，确定当前点选的对象currentObject
  //   if (this.sceneReady) {
  //     // 通过摄像机和鼠标位置更新射线
  //     this.pointer.setFromCamera(mouse, this.camera);
  //     // 计算物体和射线的交点
  //     const intersects = this.pointer.intersectObjects(
  //       this.scene.children[3].children[0].children
  //     );
  //     // console.log("intersects", intersects);
  //     if (intersects.length > 0) {
  //       const selectedObject: Mesh = <Mesh>intersects[0].object;
  //       if (this.currentObject != selectedObject) {
  //         this.currentObject = selectedObject;
  //       }
  //     } else {
  //       this.currentObject = <Mesh>{};
  //     }
  //   }
  // }
  addObject(...object: Object3D[]) {
    object.forEach((elem) => {
      this.scene.add(elem);
    });
  }
}
