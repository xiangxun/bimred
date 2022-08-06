import { earthImg, stars, sunImg } from "@/assets/ts/Texture";
import {
  AmbientLight,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PointLight,
  Points,
  PointsMaterial,
  SphereGeometry,
  TextureLoader,
  Vector3,
  WebGLCubeRenderTarget,
} from "three";
import { Base } from "@/assets/ts/Base";

export class Solar extends Base {
  textureLoader!: TextureLoader;
  solarSystem!: Group;
  earthSystem!: Group;
  sun!: Mesh;
  earth!: Mesh;
  constructor(dom: HTMLElement) {
    super(dom);
    this.textureLoader = new TextureLoader();
    this.cameraPosition = new Vector3(350, 200, 350);
    // 背景;
    // const starsTexture = this.textureLoader.load(stars, () => {
    //   const rt = new WebGLCubeRenderTarget(starsTexture.image.height);
    //   rt.fromEquirectangularTexture(this.renderer, starsTexture);
    //   this.scene.background = rt.texture;
    // });
  }
  init(): void {
    this.createScene();
    this.createPerspectiveCamera();
    this.createRenderer();
    // 渲染阴影
    this.renderer.shadowMap.enabled = true;
    // this.createMesh();
    this.createLight();
    this.createSolar();
    this.createStars();
    this.createOrbitControls();
    this.addListeners();
    this.setLoop();
  }
  createLight(): void {
    //环境光
    const light = new AmbientLight(0xffffee, 0.01); // soft white light
    this.scene.add(light);
    //日光
    const sunLight = new PointLight(0xffffff, 1.5);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    this.scene.add(sunLight);
  }
  createSolar() {
    //sun
    const sunGeometry = new SphereGeometry(70, 100, 100);
    const sunTexture = this.textureLoader.load(sunImg);
    const sunMaterial = new MeshBasicMaterial({
      map: sunTexture,
    });
    const sun = new Mesh(sunGeometry, sunMaterial);

    //earth
    const earthGeometry = new SphereGeometry(15, 50, 100);
    const earthTexture = this.textureLoader.load(earthImg);
    const earthMaterial = new MeshLambertMaterial({
      map: earthTexture,
    });
    const earth = new Mesh(earthGeometry, earthMaterial);
    earth.receiveShadow = true;

    //moon
    const moonGeometry = new SphereGeometry(3, 50, 100);
    const moonMaterial = new MeshLambertMaterial({
      color: 0xeeeeee,
    });
    const moon = new Mesh(moonGeometry, moonMaterial);
    moon.castShadow = true;

    const solarSystem: Group = new Group();
    console.log(this.scene);
    this.scene.add(solarSystem);
    solarSystem.add(sun);
    const earthSystem: Group = new Group();
    earthSystem.position.x = 150;
    solarSystem.add(earthSystem);
    earthSystem.add(earth);

    const moonSystem: Group = new Group();
    moonSystem.position.x = 30;
    earthSystem.add(moonSystem);
    moonSystem.add(moon);
    this.solarSystem = solarSystem;
    this.earthSystem = earthSystem;
    this.sun = sun;
    this.earth = earth;
  }
  update(): void {
    const { solarSystem, earthSystem, sun, earth } = this;
    solarSystem.rotation.y += 0.0005;
    solarSystem.rotation.z = 0.05;
    sun.rotation.y -= 0.0004;
    earthSystem.rotation.y += 0.01;
    earth.rotation.y += 0.01;
    earth.rotation.z = 0.01;
  }
  createStars() {
    // stars
    const radius = 6;
    const r = radius,
      starsGeometry = [new BufferGeometry(), new BufferGeometry()];

    const vertices1 = [];
    const vertices2 = [];

    const vertex = new Vector3();

    for (let i = 0; i < 250; i++) {
      vertex.x = Math.random() * 2 - 1;
      vertex.y = Math.random() * 2 - 1;
      vertex.z = Math.random() * 2 - 1;
      vertex.multiplyScalar(r);

      vertices1.push(vertex.x, vertex.y, vertex.z);
    }

    for (let i = 0; i < 1500; i++) {
      vertex.x = Math.random() * 2 - 1;
      vertex.y = Math.random() * 2 - 1;
      vertex.z = Math.random() * 2 - 1;
      vertex.multiplyScalar(r);

      vertices2.push(vertex.x, vertex.y, vertex.z);
    }

    starsGeometry[0].setAttribute(
      "position",
      new Float32BufferAttribute(vertices1, 3)
    );
    starsGeometry[1].setAttribute(
      "position",
      new Float32BufferAttribute(vertices2, 3)
    );

    const starsMaterials = [
      new PointsMaterial({
        color: 0x555555,
        size: 2,
        sizeAttenuation: false,
      }),
      new PointsMaterial({
        color: 0x555555,
        size: 1,
        sizeAttenuation: false,
      }),
      new PointsMaterial({
        color: 0x333333,
        size: 2,
        sizeAttenuation: false,
      }),
      new PointsMaterial({
        color: 0x3a3a3a,
        size: 1,
        sizeAttenuation: false,
      }),
      new PointsMaterial({
        color: 0x1a1a1a,
        size: 2,
        sizeAttenuation: false,
      }),
      new PointsMaterial({
        color: 0x1a1a1a,
        size: 1,
        sizeAttenuation: false,
      }),
    ];

    for (let i = 10; i < 30; i++) {
      const stars = new Points(starsGeometry[i % 2], starsMaterials[i % 6]);

      stars.rotation.x = Math.random() * 6;
      stars.rotation.y = Math.random() * 6;
      stars.rotation.z = Math.random() * 6;
      stars.scale.setScalar(i * 10);

      stars.matrixAutoUpdate = false;
      stars.updateMatrix();

      this.scene.add(stars);
    }
  }
}
