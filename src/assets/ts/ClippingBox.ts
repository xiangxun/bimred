import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Plane,
  PlaneGeometry,
  PlaneHelper,
  Vector3,
} from "three";

const clipMaterial = new MeshBasicMaterial({
  color: 0xffeeaa,
  side: DoubleSide,
  transparent: true,
  opacity: 0.2,
});

export const clipPlane = new Plane(new Vector3(0, 0, 1), 30);
export const clipPlane1 = new Mesh(new PlaneGeometry(50, 50), clipMaterial);
export const planeHelper = new PlaneHelper(clipPlane, 200, 0x00ff00);

/*
const planesFromMesh = (vertices: Vector3[], indices: number[]) => {
  const n: number = indices.length / 3;
  const result = new Array(n);
  for (let i = 0, j = 0; i < n; ++i, j += 3) {
    const a = vertices[indices[j]];
    const b = vertices[indices[j + 1]];
    const c = vertices[indices[j + 2]];

    result[i] = new Plane().setFromCoplanarPoints(a, b, c);
  }

  return result;
};

const createPlanes = (n: number) => {
  // 创建一个包含n个未初始化平面对象的数组
  const result = new Array(n);
  for (let i = 0; i !== n; ++i) result[i] = new Plane();
  return result;
};
*/
