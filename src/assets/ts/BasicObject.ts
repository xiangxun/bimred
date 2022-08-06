import {
  Mesh,
  // MeshBasicMaterial,
  // MeshNormalMaterial,
  MeshStandardMaterial,
  BoxBufferGeometry,
  Object3D,
  SphereGeometry,
  MeshLambertMaterial,
  MeshBasicMaterial,
  DoubleSide,
  Box3,
  Plane,
} from "three";
import { clipPlane, planeHelper } from "./ClippingBox";
// import { videoTexture } from "./TTextures";
export const basicObjectList: Object3D[] = [];

const box: Mesh = new Mesh(
  new BoxBufferGeometry(10, 10, 10),
  new MeshLambertMaterial({ color: "#ffffaa" })
);
box.position.y = 5;
box.castShadow = true;

const earth = new Mesh(
  new SphereGeometry(5, 50, 100),
  new MeshLambertMaterial({
    // map: this.textureLoader.load(earthImg);,
    // normalMap: earthTexture,
  })
);
earth.position.set(20, 5, 0);

const stage = new Mesh(
  new BoxBufferGeometry(500, 0.1, 500),
  new MeshStandardMaterial({
    clippingPlanes: [clipPlane],
    clipIntersection: true,
  })
);
stage.position.y = -25;
stage.receiveShadow = true;
stage.addEventListener("mouseenter", () => {
  console.log("stage mouseenter");
});

const Box = new Box3().setFromObject(stage);

// basicObjectList.push(stage, planeHelper);
basicObjectList.push(stage);
