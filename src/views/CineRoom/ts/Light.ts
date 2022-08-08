import { AmbientLight, Object3D, PointLight, SpotLight } from "three";

export const lightsList: Object3D[] = [];

const randomColor: number = 0xffffff * Math.random();
//环境光ambientLight
const ambientLight: AmbientLight = new AmbientLight(
  randomColor * Math.random(),
  0.01
);
//点光源
export const pointLight: PointLight = new PointLight(
  randomColor * Math.random(),
  0.2
);
pointLight.position.set(-25, 10, 0);
pointLight.castShadow = true;
//投影光源
export const spotLight: SpotLight = new SpotLight(
  randomColor,
  5,
  100,
  (Math.PI / 180) * 10
);
spotLight.castShadow = true;
spotLight.position.set(-50, 30, -1);

lightsList.push(ambientLight, pointLight, spotLight);
