import {
  AmbientLight,
  Clock,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  Object3D,
  PerspectiveCamera,
  PointLight,
  Scene,
  SphereGeometry,
  TextureLoader,
  Vector3,
  WebGLCubeRenderTarget,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import {
//   Lensflare,
//   LensflareElement,
// } from "three/examples/jsm/objects/Lensflare.js";
import earthImg from "../img/earth.jpg";
import sunImg from "../img/sun.jpg";
// import lensflare0 from "../img/lensflare0.png";
// import lensflare3 from "../img/lensflare3.png";
import stars from "../img/stars.jpg";

export class Earth {
  private dom: HTMLElement;
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: PerspectiveCamera;
  private textureLoader: TextureLoader;

  constructor(dom: HTMLElement) {
    this.dom = dom;
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.textureLoader = new TextureLoader();
    const clock = new Clock();
    this.renderer = new WebGLRenderer({
      antialias: true, //消除锯齿
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // 渲染阴影
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.dom.appendChild(this.renderer.domElement);
    // this.renderer.outputEncoding = sRGBEncoding; //优化渲染效果
    this.renderer.render(this.scene, this.camera);

    // 背景
    const starsTexture = this.textureLoader.load(stars, () => {
      const rt = new WebGLCubeRenderTarget(starsTexture.image.height);
      rt.fromEquirectangularTexture(this.renderer, starsTexture);
      this.scene.background = rt.texture;
    });

    //
    const controls: OrbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    //环境光
    const light = new AmbientLight(0xffffee, 0.01); // soft white light
    this.scene.add(light);
    // White directional light at half intensity shining from the top.
    //日光
    const sunLight = new PointLight(0xffffff, 1.5);
    sunLight.position.set(0, 0, 0);
    this.scene.add(sunLight);

    //lensflare
    //const textureFlare0 = this.textureLoader.load(lensflare0);
    // const textureFlare0a = textureLoader.load("./img/lensflare0_alpha.png ");
    /*const textureFlare3 = this.textureLoader.load(lensflare3);
    const addLight = (
      h: number,
      s: number,
      l: number,
      x: number,
      y: number,
      z: number
    ) => {
      const light = new PointLight(0xffffff, 20, 500);
      light.color.setHSL(h, s, l);
      light.position.set(x, y, z);
      this.scene.add(light);

      const lensflare = new Lensflare();
      lensflare.addElement(
        new LensflareElement(textureFlare0, 400, 1, light.color)
      );
      lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.6));
      lensflare.addElement(new LensflareElement(textureFlare3, 100, 0.7));
      lensflare.addElement(new LensflareElement(textureFlare3, 200, 0.9));
      lensflare.addElement(new LensflareElement(textureFlare3, 2500, 1));
      light.add(lensflare);
    };*/
    // addLight(0.8, 1, 1, 0, 0, 0);

    //sun
    const sunGeometry = new SphereGeometry(80, 100, 100);
    const sunTexture = this.textureLoader.load(sunImg);
    const sunMaterial = new MeshBasicMaterial({
      //   color: 0xff11aa,
      // transparent: true,
      //   opacity: 0.5,
      //   transparent: true,
      // blending: AdditiveBlending,
      map: sunTexture,
      // alphaMap: sunTexture,
    });
    const sun = new Mesh(sunGeometry, sunMaterial);
    this.scene.add(sun);

    //earth
    const earthGeometry = new SphereGeometry(15, 50, 100);
    const earthTexture = this.textureLoader.load(earthImg);
    const earthMaterial = new MeshLambertMaterial({
      map: earthTexture,
      // normalMap: earthTexture,
    });
    const earth = new Mesh(earthGeometry, earthMaterial);
    earth.position.set(0, 0, 0);
    this.scene.add(earth);

    //camera
    this.camera.position.set(250, 0, 0);
    // this.camera.lookAt(new Vector3(0, 0, 0));
    controls.update();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      sun.rotation.x += 0.0002;
      sun.rotation.y += 0.0002;

      //地球绕太阳旋转
      earth.position.set(
        0,
        -Math.sin(elapsed / 15) * 180,
        Math.cos(elapsed / 15) * 180
      );
      //地球自旋
      const axis = new Vector3(1, 0, 0);
      earth.rotateOnAxis(axis, Math.PI / 100);
      // required if controls.enableDamping or controls.autoRotate are set to true
      controls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(animate);
    };

    animate();
    // 调整尺寸
    window.addEventListener("resize", () => {
      //更新相机
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      //更新渲染
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }
  addObject(...object: Object3D[]) {
    object.forEach((elem) => {
      this.scene.add(elem);
    });
  }
}
