import ViewCubeControls from "@/assets/ts/ViewCubeControls";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

export class ViewCube {
  viewCubeControls: ViewCubeControls;
  cubeRenderer!: WebGLRenderer;
  cubeScene!: Scene;
  cubeCamera!: PerspectiveCamera;
  constructor(dom: HTMLElement) {
    // const cubeDiv = document.createElement("div");
    // cubeDiv.className = "cube-view";
    const cubeRenderer = new WebGLRenderer({ alpha: true });
    cubeRenderer.setSize(150, 150);
    // const cubeDiv = document.querySelector("#view-cube");
    // if (cubeDiv) {
    //   cubeDiv.appendChild(cubeRenderer.domElement);
    // }
    dom.appendChild(cubeRenderer.domElement);
    const cubeScene = new Scene();
    const cubeCamera = new PerspectiveCamera(45, 1, 0.1, 1000);
    cubeCamera.position.set(0, 0, 70);
    cubeCamera.lookAt(0, 0, 0);
    const viewCubeControls = new ViewCubeControls(
      cubeCamera,
      undefined,
      undefined,
      cubeRenderer.domElement
    );
    cubeScene.add(viewCubeControls.getObject());
    this.viewCubeControls = viewCubeControls;
    this.cubeRenderer = cubeRenderer;
    this.cubeScene = cubeScene;
    this.cubeCamera = cubeCamera;
    const animate = () => {
      requestAnimationFrame(animate);
      // viewCubeControls.update();
      cubeRenderer.render(cubeScene, cubeCamera);
    };
    animate();
  }
}

// createViewCube() {
//   const cubeRenderer = new WebGLRenderer({ alpha: true });
//   cubeRenderer.setSize(150, 150);
//   const cubescenediv = document.createElement("div");
//   document
//     .querySelector("#cubescenediv")
//     ?.appendChild(cubeRenderer.domElement);
//   const cubeScene = new Scene();
//   const cubeCamera = new PerspectiveCamera(45, 1, 0.1, 1000);
//   cubeCamera.position.set(0, 0, 70);
//   cubeCamera.lookAt(0, 0, 0);
//   const viewCube = new ViewCubeControls(
//     cubeCamera,
//     undefined,
//     undefined,
//     cubeRenderer.domElement
//   );
//   cubeScene.add(viewCube.getObject());
//   viewCube.addEventListener("angle-change", ({ quaternion }) => {
//     this.camera.setRotationFromQuaternion(quaternion.inverse());
//   });
// }
