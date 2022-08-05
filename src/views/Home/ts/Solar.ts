import {
  AmbientLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PointLight,
  SphereGeometry,
  TextureLoader,
} from "three";
import { Base } from "./../../../assets/ts/Base";
import earthImg from "./../../../assets/img/earth.jpg";
import sunImg from "./../../../assets/img/sun.jpg";
export class Solar extends Base {
  private textureLoader: TextureLoader;
  constructor(dom: HTMLElement) {
    super(dom);
    this.textureLoader = new TextureLoader();
    //环境光
    const light = new AmbientLight(0xffffee, 0.01); // soft white light
    this.scene.add(light);
    //日光
    const sunLight = new PointLight(0xffffff, 1.5);
    sunLight.position.set(0, 0, 0);
    sunLight.castShadow = true;
    this.scene.add(sunLight);

    //sun
    const sunGeometry = new SphereGeometry(80, 100, 100);
    const sunTexture = this.textureLoader.load(sunImg);
    const sunMaterial = new MeshBasicMaterial({
      map: sunTexture,
    });
    const sun = new Mesh(sunGeometry, sunMaterial);

    //earth
    const earthGeometry = new SphereGeometry(10, 50, 100);
    const earthTexture = this.textureLoader.load(earthImg);
    const earthMaterial = new MeshLambertMaterial({
      map: earthTexture,
    });
    const earth = new Mesh(earthGeometry, earthMaterial);
    earth.receiveShadow = true;

    //moon
    const moonGeometry = new SphereGeometry(2, 50, 100);
    const moonMaterial = new MeshLambertMaterial({
      color: 0xeeeeee,
    });
    const moon = new Mesh(moonGeometry, moonMaterial);
    moon.castShadow = true;

    const solarSystem: Group = new Group();
    this.scene.add(solarSystem);
    solarSystem.add(sun);
    const earthSystem: Group = new Group();
    earthSystem.position.x = 200;
    solarSystem.add(earthSystem);
    earthSystem.add(earth);

    const moonSystem: Group = new Group();
    moonSystem.position.x = 20;
    earthSystem.add(moonSystem);
    moonSystem.add(moon);

    this.orbitControls.update();

    dom.appendChild(this.renderer.domElement);
    // this.renderer.setSize(dom.offsetWidth, dom.offsetHeight);
    this.createRenderer();
    this.renderer.render(this.scene, this.camera);

    const animate = () => {
      solarSystem.rotation.y += 0.0005;
      solarSystem.rotation.z = 0.05;
      sun.rotation.y -= 0.0004;
      earthSystem.rotation.y += 0.01;
      earth.rotation.y += 0.01;
      earth.rotation.z = 0.01;

      this.orbitControls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(animate);
    };

    animate();
  }
}
