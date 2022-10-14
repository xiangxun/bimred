import {
  BackSide,
  BoxGeometry,
  Camera,
  Color,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Raycaster,
  ShaderMaterial,
  Vector2,
  Vector3,
  type Event,
} from "three";

export class Caps {
  UNIFORMS = {
    clipping: {
      color: { type: "c", value: new Color(0x3d9ecb) },
      clippingLow: { type: "v3", value: new Vector3(0, 0, 0) },
      clippingHigh: { type: "v3", value: new Vector3(0, 0, 0) },
    },
    caps: {
      color: { type: "c", value: new Color(0xf83610) },
    },
  };
  SHADER = {
    vertex: `"
      uniform vec3 color;
      constying vec3 pixelNormal;
      
      void main() {
        
        pixelNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
      }"`,

    vertexClipping: `"
      uniform vec3 color;
      uniform vec3 clippingLow;
      uniform vec3 clippingHigh;
      
      constying vec3 pixelNormal;
      constying vec4 worldPosition;
      constying vec3 camPosition;
      
      void main() {
        
        pixelNormal = normal;
        worldPosition = modelMatrix * vec4( position, 1.0 );
        camPosition = cameraPosition;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        
      }"`,

    fragment: `"
      uniform vec3 color;
      constying vec3 pixelNormal;
      
      void main( void ) {
        
        float shade = (
            3.0 * pow ( abs ( pixelNormal.y ), 2.0 )
          + 2.0 * pow ( abs ( pixelNormal.z ), 2.0 )
          + 1.0 * pow ( abs ( pixelNormal.x ), 2.0 )
        ) / 3.0;
        
        gl_FragColor = vec4( color * shade, 1.0 );
        
      }"`,

    fragmentClipping: `"
      uniform vec3 color;
      uniform vec3 clippingLow;
      uniform vec3 clippingHigh;
      
      constying vec3 pixelNormal;
      constying vec4 worldPosition;
      
      void main( void ) {
        
        float shade = (
            3.0 * pow ( abs ( pixelNormal.y ), 2.0 )
          + 2.0 * pow ( abs ( pixelNormal.z ), 2.0 )
          + 1.0 * pow ( abs ( pixelNormal.x ), 2.0 )
        ) / 3.0;
        
        if (
             worldPosition.x < clippingLow.x
          || worldPosition.x > clippingHigh.x
          || worldPosition.y < clippingLow.y
          || worldPosition.y > clippingHigh.y
          || worldPosition.z < clippingLow.z
          || worldPosition.z > clippingHigh.z
        ) {
          
          discard;
          
        } else {
          
          gl_FragColor = vec4( color * shade, 1.0 );
          
        }
        
      }"`,

    fragmentClippingFront: `"
      uniform vec3 color;
      uniform vec3 clippingLow;
      uniform vec3 clippingHigh;
      
      constying vec3 pixelNormal;
      constying vec4 worldPosition;
      constying vec3 camPosition;
      
      void main( void ) {
        
        float shade = (
            3.0 * pow ( abs ( pixelNormal.y ), 2.0 )
          + 2.0 * pow ( abs ( pixelNormal.z ), 2.0 )
          + 1.0 * pow ( abs ( pixelNormal.x ), 2.0 )
        ) / 3.0;
        
        if (
             worldPosition.x < clippingLow.x  && camPosition.x < clippingLow.x
          || worldPosition.x > clippingHigh.x && camPosition.x > clippingHigh.x
          || worldPosition.y < clippingLow.y  && camPosition.y < clippingLow.y
          || worldPosition.y > clippingHigh.y && camPosition.y > clippingHigh.y
          || worldPosition.z < clippingLow.z  && camPosition.z < clippingLow.z
          || worldPosition.z > clippingHigh.z && camPosition.z > clippingHigh.z
        ) {
          
          discard;
          
        } else {
          
          gl_FragColor = vec4( color * shade, 1.0 );
          
        }
        
      }"`,

    invisibleVertexShader: `"
      void main() {
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        gl_Position = projectionMatrix * mvPosition;
      }"`,

    invisibleFragmentShader: `"
      void main( void ) {
        gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
        discard;
      }"`,
  };
  MATERIAL = {
    sheet: new ShaderMaterial({
      uniforms: this.UNIFORMS.clipping,
      vertexShader: this.SHADER.vertexClipping,
      fragmentShader: this.SHADER.fragmentClipping,
    }),

    cap: new ShaderMaterial({
      uniforms: this.UNIFORMS.caps,
      vertexShader: this.SHADER.vertex,
      fragmentShader: this.SHADER.fragment,
    }),

    backStencil: new ShaderMaterial({
      uniforms: this.UNIFORMS.clipping,
      vertexShader: this.SHADER.vertexClipping,
      fragmentShader: this.SHADER.fragmentClippingFront,
      colorWrite: false,
      depthWrite: false,
      side: BackSide,
    }),

    frontStencil: new ShaderMaterial({
      uniforms: this.UNIFORMS.clipping,
      vertexShader: this.SHADER.vertexClipping,
      fragmentShader: this.SHADER.fragmentClippingFront,
      colorWrite: false,
      depthWrite: false,
    }),

    BoxBackFace: new MeshBasicMaterial({ color: 0xeeddcc, transparent: true }),
    BoxWireframe: new LineBasicMaterial({ color: 0x000000, linewidth: 2 }),
    BoxWireActive: new LineBasicMaterial({ color: 0xf83610, linewidth: 4 }),

    Invisible: new ShaderMaterial({
      vertexShader: this.SHADER.invisibleVertexShader,
      fragmentShader: this.SHADER.invisibleFragmentShader,
    }),
  };
  limitLow: any;
  limitHigh: any;
  box!: BoxGeometry;
  boxMesh!: Mesh<BoxGeometry, any>;
  vertices!: Vector3[];
  displayMeshes: any;
  meshGeometries!: [];
  lineGeometries!: [];
  selectables!: never[];
  touchMeshes: any;
  constructor() {}

  picking = (simulation: {
    scene: { add: (arg0: Mesh<PlaneGeometry, ShaderMaterial>) => void };
    camera: Camera;
    selection: {
      selectables: Object3D<Event>[];
      setValue: (arg0: any, arg1: any) => void;
    };
    renderer: {
      domElement: {
        style: { cursor: string };
        addEventListener: (
          arg0: string,
          arg1: { (event: any): void; (event: any): void; (event: any): void },
          arg2: boolean
        ) => void;
      };
    };
    throttledRender: () => void;
    controls: { enabled: boolean };
  }) => {
    const intersected: Object3D<Event> | null = null;
    const mouse = new Vector2();
    const ray = new Raycaster();

    const normals = {
      x1: new Vector3(-1, 0, 0),
      x2: new Vector3(1, 0, 0),
      y1: new Vector3(0, -1, 0),
      y2: new Vector3(0, 1, 0),
      z1: new Vector3(0, 0, -1),
      z2: new Vector3(0, 0, 1),
    };

    const plane = new Mesh(
      new PlaneGeometry(100, 100, 4, 4),
      this.MATERIAL.Invisible
    );
    simulation.scene.add(plane);

    const targeting = function (event: any) {
      mouse.setToNormalizedDeviceCoordinates(event, window);

      ray.setFromCamera(mouse, simulation.camera);

      const intersects = ray.intersectObjects(simulation.selection.selectables);

      if (intersects.length > 0) {
        const candidate = intersects[0].object;

        if (intersected !== candidate) {
          if (intersected !== null) {
            intersected.guardian.rayOut();
          }

          candidate.guardian.rayOver();

          intersected = candidate;

          simulation.renderer.domElement.style.cursor = "pointer";
          simulation.throttledRender();
        }
      } else if (intersected !== null) {
        intersected.guardian.rayOut();
        intersected = null;

        simulation.renderer.domElement.style.cursor = "auto";
        simulation.throttledRender();
      }
    };

    const beginDrag = function (event: {
      preventDefault: () => void;
      stopPropagation: () => void;
    }) {
      mouse.setToNormalizedDeviceCoordinates(event, window);

      ray.setFromCamera(mouse, simulation.camera);

      const intersects = ray.intersectObjects(simulation.selection.selectables);

      if (intersects.length > 0) {
        event.preventDefault();
        event.stopPropagation();

        simulation.controls.enabled = false;

        const intersectionPoint = intersects[0].point;

        const axis = intersects[0].object.axis;

        if (axis === "x1" || axis === "x2") {
          intersectionPoint.setX(0);
        } else if (axis === "y1" || axis === "y2") {
          intersectionPoint.setY(0);
        } else if (axis === "z1" || axis === "z2") {
          intersectionPoint.setZ(0);
        }
        plane.position.copy(intersectionPoint);

        const newNormal = simulation.camera.position
          .clone()
          .sub(
            simulation.camera.position.clone().projectOnVector(normals[axis])
          );
        plane.lookAt(newNormal.add(intersectionPoint));

        simulation.renderer.domElement.style.cursor = "move";
        simulation.throttledRender();

        const continueDrag = function (event: {
          preventDefault: () => void;
          stopPropagation: () => void;
        }) {
          event.preventDefault();
          event.stopPropagation();

          mouse.setToNormalizedDeviceCoordinates(event, window);

          ray.setFromCamera(mouse, simulation.camera);

          const intersects = ray.intersectObject(plane);

          if (intersects.length > 0) {
            if (axis === "x1" || axis === "x2") {
              value = intersects[0].point.x;
            } else if (axis === "y1" || axis === "y2") {
              value = intersects[0].point.y;
            } else if (axis === "z1" || axis === "z2") {
              value = intersects[0].point.z;
            }

            simulation.selection.setValue(axis, value);
            simulation.throttledRender();
          }
        };

        const endDrag = function (event: any) {
          simulation.controls.enabled = true;

          simulation.renderer.domElement.style.cursor = "pointer";

          document.removeEventListener("mousemove", continueDrag, true);
          document.removeEventListener("touchmove", continueDrag, true);

          document.removeEventListener("mouseup", endDrag, false);
          document.removeEventListener("touchend", endDrag, false);
          document.removeEventListener("touchcancel", endDrag, false);
          document.removeEventListener("touchleave", endDrag, false);
        };

        document.addEventListener("mousemove", continueDrag, true);
        document.addEventListener("touchmove", continueDrag, true);

        document.addEventListener("mouseup", endDrag, false);
        document.addEventListener("touchend", endDrag, false);
        document.addEventListener("touchcancel", endDrag, false);
        document.addEventListener("touchleave", endDrag, false);
      }
    };

    simulation.renderer.domElement.addEventListener(
      "mousemove",
      targeting,
      true
    );
    simulation.renderer.domElement.addEventListener(
      "mousedown",
      beginDrag,
      false
    );
    simulation.renderer.domElement.addEventListener(
      "touchstart",
      beginDrag,
      false
    );
  };
  Selection = (low: any, high: any) => {
    this.limitLow = low;
    this.limitHigh = high;

    this.box = new BoxGeometry(1, 1, 1);
    this.boxMesh = new Mesh(this.box, this.MATERIAL.cap);

    this.vertices = [
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
      new Vector3(),
    ];
    this.updateVertices();

    const v = this.vertices;

    this.touchMeshes = new Object3D();
    this.displayMeshes = new Object3D();
    this.meshGeometries = [];
    this.lineGeometries = [];
    this.selectables = [];

    const faces: void[] = [];
    const f = faces;
    faces.push(this.SelectionBoxFace("y1", v[0], v[1], v[5], v[4], this));
    faces.push(this.SelectionBoxFace("z1", v[0], v[2], v[3], v[1], this));
    faces.push(this.SelectionBoxFace("x1", v[0], v[4], v[6], v[2], this));
    faces.push(this.SelectionBoxFace("x2", v[7], v[5], v[1], v[3], this));
    faces.push(this.SelectionBoxFace("y2", v[7], v[3], v[2], v[6], this));
    faces.push(this.SelectionBoxFace("z2", v[7], v[6], v[4], v[5], this));

    const l0 = this.SelectionBoxLine(v[0], v[1], f[0], f[1], this);
    const l1 = this.SelectionBoxLine(v[0], v[2], f[1], f[2], this);
    const l3 = this.SelectionBoxLine(v[1], v[3], f[1], f[3], this);
    const l5 = this.SelectionBoxLine(v[2], v[3], f[1], f[4], this);
    const l4 = this.SelectionBoxLine(v[1], v[5], f[0], f[3], this);
    const l6 = this.SelectionBoxLine(v[2], v[6], f[2], f[4], this);
    const l7 = this.SelectionBoxLine(v[3], v[7], f[3], f[4], this);
    const l2 = this.SelectionBoxLine(v[0], v[4], f[0], f[2], this);
    const l8 = this.SelectionBoxLine(v[4], v[5], f[0], f[5], this);
    const l9 = this.SelectionBoxLine(v[4], v[6], f[2], f[5], this);
    const l10 = this.SelectionBoxLine(v[5], v[7], f[3], f[5], this);
    const l11 = this.SelectionBoxLine(v[6], v[7], f[4], f[5], this);

    this.setBox();
    this.setUniforms();
  };
  SelectionBoxLine = (v0: Vector3, v1: Vector3, f0, f1, selection: this) => {
    const lineGeometry = new Geometry();
    lineGeometry.vertices.push(v0, v1);
    lineGeometry.computeLineDistances();
    lineGeometry.dynamic = true;
    selection.lineGeometries.push(lineGeometry);

    this.line = new LineSegments(lineGeometry, MATERIAL.BoxWireframe);
    selection.displayMeshes.add(this.line);

    f0.lines.push(this);
    f1.lines.push(this);
  };

  setHighlight = (b: any) => {
    this.line.material = b ? MATERIAL.BoxWireActive : MATERIAL.BoxWireframe;
  };

  lines = new Array();

  SelectionBoxFace = function (
    axis: string,
    v0: number | Vector3 | undefined,
    v1: number | Vector3 | undefined,
    v2: number | Vector3 | undefined,
    v3: number | Vector3 | undefined,
    selection: this
  ) {
    const frontFaceGeometry = new PlaneGeometry(v0, v1, v2, v3);
    frontFaceGeometry.dynamic = true;
    selection.meshGeometries.push(frontFaceGeometry);

    const frontFaceMesh = new Mesh(frontFaceGeometry, MATERIAL.Invisible);
    frontFaceMesh.axis = axis;
    frontFaceMesh.guardian = this;
    selection.touchMeshes.add(frontFaceMesh);
    selection.selectables.push(frontFaceMesh);

    const backFaceGeometry = new PlaneGeometry(v3, v2, v1, v0);
    backFaceGeometry.dynamic = true;
    selection.meshGeometries.push(backFaceGeometry);

    const backFaceMesh = new Mesh(backFaceGeometry, MATERIAL.BoxBackFace);
    selection.displayMeshes.add(backFaceMesh);
  };

  highlightLines = (b: boolean) => {
    for (let i = 0; i < this.lines.length; i++) {
      this.lines[i].setHighlight(b);
    }
  };

  rayOver = () => {
    this.highlightLines(true);
  };

  rayOut = () => {
    this.highlightLines(false);
  };
}
