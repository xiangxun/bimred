import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Box3, DoubleSide, Group, Mesh, Object3D, Vector3 } from "three";
import { clipPlane } from "./ClippingBox";

// "https://www.gstatic.com/draco/versioned/decoders/1.4.3/"
const dracoLoader = new DRACOLoader().setDecoderPath("draco/");
const gltfLoader: GLTFLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
// export const gltfPromise1 = gltfLoader.loadAsync(
//   "/gltfModel/cineroomDraco.glb"
// );

export const gltfPromise = new Promise<Group>((resolve, reject) => {
  gltfLoader
    .loadAsync("/gltfModel/cineroomDraco.glb")
    .then((gltf) => {
      const gltfModel: Group = gltf.scene;
      //将导入模型中心移到坐标原点
      const box = new Box3().setFromObject(gltfModel);
      const center = box.getCenter(new Vector3());
      gltfModel.position.x += gltfModel.position.x - center.x;
      gltfModel.position.y += gltfModel.position.y - center.y;
      gltfModel.position.z += gltfModel.position.z - center.z;

      // const pointMax = new Vector3();

      // gltfModel.traverse((child) => {
      //   // console.log(child);
      //   if (child.isMesh) {
      //     child.material.clippingPlanes = [clipPlane];
      //     child.side = DoubleSide;
      //   }
      // });
      resolve(gltfModel);
    })
    .catch((err) => {
      reject(err);
    });
});

export const bimPromise = new Promise<Group>((resolve, reject) => {
  gltfLoader
    // .loadAsync("/gltfModel/RefrigerationRoom.glb")
    // .loadAsync("/gltfModel/cineroomDraco.glb")
    .loadAsync("/gltfModel/buildingDraco.gltf")
    // .loadAsync("/loader/dracoModel/dracoRoom.gltf")
    .then((gltf) => {
      const gltfModel = gltf.scene;
      // console.log(gltf, gltf.scene.children[0].children);
      // 将导入模型中心移到坐标原点
      const box = new Box3().setFromObject(gltfModel);
      const center = box.getCenter(new Vector3());
      gltfModel.position.x += gltfModel.position.x - center.x;
      gltfModel.position.y += gltfModel.position.y - center.y;
      gltfModel.position.z += gltfModel.position.z - center.z;
      resolve(gltfModel);
    })
    .catch((err) => {
      reject(err);
    });
});
