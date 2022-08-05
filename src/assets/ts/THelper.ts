import { AxesHelper, GridHelper, Object3D } from "three";
// import { pointLight, spotLight } from "./TLight";

export const helperList: Object3D[] = [];
const axesHelper: AxesHelper = new AxesHelper(500);
const gridHelper: GridHelper = new GridHelper(10000, 500, 0x62626a, 0x22426a);

// const pointLightHelper: PointLightHelper = new PointLightHelper(
//   pointLight,
//   2,
//   0xffffff
// );
// const spotLightHelper: SpotLightHelper = new SpotLightHelper(
//   spotLight,
//   0xffffff
// );

helperList.push(axesHelper, gridHelper);
