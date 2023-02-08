/* eslint-disable @typescript-eslint/no-empty-function */
import {
  BoxGeometry,
  Camera,
  EdgesGeometry,
  EventDispatcher,
  Group,
  LinearFilter,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  Texture,
  Vector3,
} from "three";

const MAINCOLOR = 0xdddddd;
const ACCENTCOLOR = 0xf2f5ce;
const OUTLINECOLOR = 0xcccccc;

export default class ViewCubeControls extends EventDispatcher {
  cubeSize: number;
  edgeSize: number;
  domElement: any;
  _cube: ViewCube;
  _camera: Camera;
  _animation: any;
  constructor(
    camera: PerspectiveCamera,
    cubeSize = 30,
    edgeSize = 5,
    domElement: HTMLCanvasElement
  ) {
    super();
    this.cubeSize = cubeSize;
    this.edgeSize = edgeSize;
    this.domElement = domElement;
    this._cube = new ViewCube({
      size: this.cubeSize,
      edge: this.edgeSize,
      outline: true,
      bgColor: MAINCOLOR,
      hoverColor: ACCENTCOLOR,
      outlineColor: OUTLINECOLOR,
    });
    this._camera = camera;
    this._animation = null;
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseClick = this._handleMouseClick.bind(this);
    this._listen();
  }

  _listen() {
    this.domElement.addEventListener("mousemove", this._handleMouseMove);
    this.domElement.addEventListener("click", this._handleMouseClick);
  }

  _handleMouseClick(event: {
    offsetX: number;
    target: { clientWidth: number; clientHeight: number };
    offsetY: number;
  }) {
    const x = (event.offsetX / event.target.clientWidth) * 2 - 1;
    const y = -(event.offsetY / event.target.clientHeight) * 2 + 1;
    this._checkSideTouch(x, y);
  }

  _checkSideTouch(x: number, y: number) {
    const raycaster = new Raycaster();
    raycaster.setFromCamera({ x, y }, this._camera);
    const intersects = raycaster.intersectObjects(this._cube.children, true);
    if (intersects.length) {
      for (let { object } of intersects) {
        if (object.name) {
          this._rotateTheCube(object.name);
          break;
        }
      }
    }
  }

  _rotateTheCube(side: any) {
    switch (side) {
      case FACES.FRONT:
        this._setCubeAngles(0, 0, 0);
        break;
      case FACES.RIGHT:
        this._setCubeAngles(0, -90, 0);
        break;
      case FACES.BACK:
        this._setCubeAngles(0, -180, 0);
        break;
      case FACES.LEFT:
        this._setCubeAngles(0, -270, 0);
        break;
      case FACES.TOP:
        this._setCubeAngles(90, 0, 0);
        break;
      case FACES.BOTTOM:
        this._setCubeAngles(-90, 0, 0);
        break;

      case FACES.TOP_FRONT_EDGE:
        this._setCubeAngles(45, 0, 0);
        break;
      case FACES.TOP_RIGHT_EDGE:
        this._setCubeAngles(45, -90, 0);
        break;
      case FACES.TOP_BACK_EDGE:
        this._setCubeAngles(45, -180, 0);
        break;
      case FACES.TOP_LEFT_EDGE:
        this._setCubeAngles(45, -270, 0);
        break;

      case FACES.BOTTOM_FRONT_EDGE:
        this._setCubeAngles(-45, 0, 0);
        break;
      case FACES.BOTTOM_RIGHT_EDGE:
        this._setCubeAngles(-45, -90, 0);
        break;
      case FACES.BOTTOM_BACK_EDGE:
        this._setCubeAngles(-45, -180, 0);
        break;
      case FACES.BOTTOM_LEFT_EDGE:
        this._setCubeAngles(-45, -270, 0);
        break;

      case FACES.FRONT_RIGHT_EDGE:
        this._setCubeAngles(0, -45, 0);
        break;
      case FACES.BACK_RIGHT_EDGE:
        this._setCubeAngles(0, -135, 0);
        break;
      case FACES.BACK_LEFT_EDGE:
        this._setCubeAngles(0, -225, 0);
        break;
      case FACES.FRONT_LEFT_EDGE:
        this._setCubeAngles(0, -315, 0);
        break;

      case FACES.TOP_FRONT_RIGHT_CORNER:
        this._setCubeAngles(45, -45, 0);
        break;
      case FACES.TOP_BACK_RIGHT_CORNER:
        this._setCubeAngles(45, -135, 0);
        break;
      case FACES.TOP_BACK_LEFT_CORNER:
        this._setCubeAngles(45, -225, 0);
        break;
      case FACES.TOP_FRONT_LEFT_CORNER:
        this._setCubeAngles(45, -315, 0);
        break;

      case FACES.BOTTOM_FRONT_RIGHT_CORNER:
        this._setCubeAngles(-45, -45, 0);
        break;
      case FACES.BOTTOM_BACK_RIGHT_CORNER:
        this._setCubeAngles(-45, -135, 0);
        break;
      case FACES.BOTTOM_BACK_LEFT_CORNER:
        this._setCubeAngles(-45, -225, 0);
        break;
      case FACES.BOTTOM_FRONT_LEFT_CORNER:
        this._setCubeAngles(-45, -315, 0);
        break;

      default:
        break;
    }
  }

  _setCubeAngles(x: number, y: number, z: number) {
    const base = this._cube.rotation;
    this._animation = {
      base: {
        x: base.x,
        y: base.y,
        z: base.z,
      },
      delta: {
        x: calculateAngleDelta(base.x, x * toRad),
        y: calculateAngleDelta(base.y, y * toRad),
        z: calculateAngleDelta(base.z, z * toRad),
      },
      duration: 500,
      time: Date.now(),
    };
  }

  _handleMouseMove(event: {
    offsetX: number;
    target: { clientWidth: number; clientHeight: number };
    offsetY: number;
  }) {
    const x = (event.offsetX / event.target.clientWidth) * 2 - 1;
    const y = -(event.offsetY / event.target.clientHeight) * 2 + 1;
    this._checkSideOver(x, y);
  }

  _checkSideOver(x: number, y: number) {
    const raycaster = new Raycaster();
    raycaster.setFromCamera({ x, y }, this._camera);
    const intersects = raycaster.intersectObjects(this._cube.children, true);
    // unhover
    this._cube.traverse(function (obj) {
      if (obj.name) {
        obj.material.color.setHex(MAINCOLOR);
      }
    });
    // check hover
    if (intersects.length) {
      for (let { object } of intersects) {
        if (object.name) {
          const prop = CUBE_FACES.find((prop) => prop.name === object.name);
          object.parent.children.forEach(function (child: {
            name: any;
            material: { color: { setHex: (arg0: number) => void } };
          }) {
            if (child.name === object.name) {
              child.material.color.setHex(ACCENTCOLOR);
            }
          });
          break;
        }
      }
    }
  }

  update() {
    this._animate();
  }

  _animate() {
    if (!this._animation) return;
    const now = Date.now();
    const { duration, time } = this._animation;
    const alpha = Math.min((now - time) / duration, 1);
    this._animateCubeRotation(this._animation, alpha);
    if (alpha == 1) this._animation = null;
    this.dispatchEvent({
      type: "angle-change",
      quaternion: this._cube.quaternion.clone(),
    });
  }

  _animateCubeRotation({ base, delta }: any, alpha: number) {
    const ease = (Math.sin((alpha * 2 - 1) * Math.PI * 0.5) + 1) * 0.5;
    let angleX = -TWOPI + base.x + delta.x * ease;
    let angleY = -TWOPI + base.y + delta.y * ease;
    let angleZ = -TWOPI + base.z + delta.z * ease;
    this._cube.rotation.set(angleX % TWOPI, angleY % TWOPI, angleZ % TWOPI);
  }

  setQuaternion(quaternion: Quaternion) {
    this._cube.setRotationFromQuaternion(quaternion);
    // wip
    // const base = { x: this._cube.rotation.x, y: this._cube.rotation.y, z: this._cube.rotation.z };
    // const object = new Object3D();
    // object.setRotationFromQuaternion(quaternion);
    // const delta = {
    // 	x: calculateAngleDelta(base.x, object.rotation.x),
    // 	y: calculateAngleDelta(base.y, object.rotation.y),
    // 	z: calculateAngleDelta(base.z, object.rotation.z)
    // };
    // let angleX = -TWOPI + base.x + delta.x;
    // let angleY = -TWOPI + base.y + delta.y;
    // let angleZ = -TWOPI + base.z + delta.z;
    // console.log('camera:', (angleX % TWOPI).toFixed(3), (angleY % TWOPI).toFixed(3), (angleZ % TWOPI).toFixed(3));
    // this._cube.rotation.set(angleX % TWOPI, angleY % TWOPI, angleZ % TWOPI);
  }

  getObject() {
    return this._cube;
  }
}

class ViewCube extends Object3D {
  _cubeSize: number;
  _edgeSize: number;
  _outline: boolean;
  _bgColor: number;
  _hoverColor: number;
  _outlineColor: number;
  constructor({
    size = 60,
    edge = 5,
    outline = true,
    bgColor = 0xcccccc,
    hoverColor = 0xffffff,
    outlineColor = 0x999999,
  }) {
    super();
    this._cubeSize = size;
    this._edgeSize = edge;
    this._outline = outline;
    this._bgColor = bgColor;
    this._hoverColor = hoverColor;
    this._outlineColor = outlineColor;
    this._build();
  }
  _build() {
    const faceSize = this._cubeSize - this._edgeSize * 2;
    const faceOffset = this._cubeSize / 2;
    const borderSize = this._edgeSize;

    /* faces: front, right, back, left, top, bottom */
    const cubeFaces = this._createCubeFaces(faceSize, faceOffset);
    for (let [i, props] of BOX_FACES.entries()) {
      cubeFaces.children[i].name = props.name;
      cubeFaces.children[i].material.color.setHex(this._bgColor);
      cubeFaces.children[i].material.map = props.map;
    }
    this.add(cubeFaces);

    /* corners: top, bottom */
    const corners = [];
    for (let [i, props] of CORNER_FACES.entries()) {
      const corner = this._createCornerFaces(
        borderSize,
        faceOffset,
        props.name,
        { color: this._bgColor }
      );
      corner.rotateOnAxis(new Vector3(0, 1, 0), (i % 4) * 90 * toRad);
      corners.push(corner);
    }
    const topCorners = new Group();
    const bottomCorners = new Group();
    this.add(topCorners.add(...corners.slice(0, 4)));
    this.add(
      bottomCorners
        .add(...corners.slice(4))
        .rotateOnAxis(new Vector3(1, 0, 0), 180 * toRad)
    );

    /* edges: top + bottom */
    const edges = [];
    for (let [i, props] of EDGE_FACES.entries()) {
      const edge = this._createHorzEdgeFaces(
        faceSize,
        borderSize,
        faceOffset,
        props.name,
        { color: this._bgColor }
      );
      edge.rotateOnAxis(new Vector3(0, 1, 0), (i % 4) * 90 * toRad);
      edges.push(edge);
    }
    const topEdges = new Group();
    const bottomEdges = new Group();
    this.add(topEdges.add(...edges.slice(0, 4)));
    this.add(
      bottomEdges
        .add(...edges.slice(4))
        .rotateOnAxis(new Vector3(1, 0, 0), 180 * toRad)
    );

    /* edges on the side */
    const sideEdges = new Group();
    for (let [i, props] of EDGE_FACES_SIDE.entries()) {
      const edge = this._createVertEdgeFaces(
        borderSize,
        faceSize,
        faceOffset,
        props.name,
        { color: this._bgColor }
      );
      edge.rotateOnAxis(new Vector3(0, 1, 0), i * 90 * toRad);
      sideEdges.add(edge);
    }
    this.add(sideEdges);

    if (this._outline) {
      this.add(this._createCubeOutline(this._cubeSize));
    }
  }
  _createFace(
    size: number | number[],
    position: number[],
    { axis = [0, 1, 0], angle = 0, name = "", matProps = {} } = {}
  ) {
    if (!Array.isArray(size)) size = [size, size];
    const material = new MeshBasicMaterial(matProps);
    const geometry = new PlaneGeometry(size[0], size[1]);
    const face = new Mesh(geometry, material);
    face.name = name;
    face.rotateOnAxis(new Vector3(...axis), angle * toRad);
    face.position.set(...position);
    return face;
  }
  _createCubeFaces(faceSize: number, offset: number) {
    const faces = new Object3D();
    faces.add(
      this._createFace(faceSize, [0, 0, offset], { axis: [0, 1, 0], angle: 0 })
    );
    faces.add(
      this._createFace(faceSize, [offset, 0, 0], { axis: [0, 1, 0], angle: 90 })
    );
    faces.add(
      this._createFace(faceSize, [0, 0, -offset], {
        axis: [0, 1, 0],
        angle: 180,
      })
    );
    faces.add(
      this._createFace(faceSize, [-offset, 0, 0], {
        axis: [0, 1, 0],
        angle: 270,
      })
    );
    faces.add(
      this._createFace(faceSize, [0, offset, 0], {
        axis: [1, 0, 0],
        angle: -90,
      })
    );
    faces.add(
      this._createFace(faceSize, [0, -offset, 0], {
        axis: [1, 0, 0],
        angle: 90,
      })
    );
    return faces;
  }
  _createCornerFaces(
    faceSize: number,
    offset: number,
    name = "",
    matProps = {}
  ) {
    const corner = new Object3D();
    const borderOffset = offset - faceSize / 2;
    corner.add(
      this._createFace(faceSize, [borderOffset, borderOffset, offset], {
        axis: [0, 1, 0],
        angle: 0,
        matProps,
        name,
      })
    );
    corner.add(
      this._createFace(faceSize, [offset, borderOffset, borderOffset], {
        axis: [0, 1, 0],
        angle: 90,
        matProps,
        name,
      })
    );
    corner.add(
      this._createFace(faceSize, [borderOffset, offset, borderOffset], {
        axis: [1, 0, 0],
        angle: -90,
        matProps,
        name,
      })
    );
    return corner;
  }
  _createHorzEdgeFaces(
    w: number,
    h: number,
    offset: number,
    name = "",
    matProps = {}
  ) {
    const edge = new Object3D();
    const borderOffset = offset - h / 2;
    edge.add(
      this._createFace([w, h], [0, borderOffset, offset], {
        axis: [0, 1, 0],
        angle: 0,
        name,
        matProps,
      })
    );
    edge.add(
      this._createFace([w, h], [0, offset, borderOffset], {
        axis: [1, 0, 0],
        angle: -90,
        name,
        matProps,
      })
    );
    return edge;
  }
  _createVertEdgeFaces(
    w: number,
    h: number,
    offset: number,
    name = "",
    matProps = {}
  ) {
    const edge = new Object3D();
    const borderOffset = offset - w / 2;
    edge.add(
      this._createFace([w, h], [borderOffset, 0, offset], {
        axis: [0, 1, 0],
        angle: 0,
        name,
        matProps,
      })
    );
    edge.add(
      this._createFace([w, h], [offset, 0, borderOffset], {
        axis: [0, 1, 0],
        angle: 90,
        name,
        matProps,
      })
    );
    return edge;
  }
  _createCubeOutline(size: number | undefined) {
    const geometry = new BoxGeometry(size, size, size);
    const geo = new EdgesGeometry(geometry);
    const mat = new LineBasicMaterial({
      color: this._outlineColor,
      linewidth: 1,
    });
    const wireframe = new LineSegments(geo, mat);
    return wireframe;
  }
}

const toRad = Math.PI / 180;
const TWOPI = 2 * Math.PI;

function calculateAngleDelta(from: number, to: number) {
  const direct = to - from;
  const altA = direct - TWOPI;
  const altB = direct + TWOPI;
  if (Math.abs(direct) > Math.abs(altA)) {
    return altA;
  } else if (Math.abs(direct) > Math.abs(altB)) {
    return altB;
  }
  return direct;
}

function createTextSprite(
  text: string,
  props: {
    fontSize: any;
    font: any;
    width?: any;
    height?: any;
    color?: any;
    bgColor?: any;
  }
) {
  const fontface = props.font || "Helvetica";
  const fontsize = props.fontSize || 30;
  const width = props.width || 200;
  const height = props.height || 200;
  const bgColor = props.color ? props.bgColor.join(", ") : "255, 255, 255, 1.0";
  const fgColor = props.color ? props.color.join(", ") : "0, 0, 0, 1.0";
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (context) {
    context.font = `bold ${fontsize}px ${fontface}`;
    context.fillStyle = `rgba(${bgColor})`;
    context.fillRect(0, 0, width, height);
    // get size data (height depends only on font size)
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    // text color
    context.fillStyle = `rgba(${fgColor})`;
    context.fillText(
      text,
      width / 2 - textWidth / 2,
      height / 2 + fontsize / 2 - 2
    );
  }
  // canvas contents will be used for a texture
  const texture = new Texture(canvas);
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const FACES = {
  TOP: 1,
  FRONT: 2,
  RIGHT: 3,
  BACK: 4,
  LEFT: 5,
  BOTTOM: 6,

  TOP_FRONT_EDGE: 7,
  TOP_RIGHT_EDGE: 8,
  TOP_BACK_EDGE: 9,
  TOP_LEFT_EDGE: 10,

  FRONT_RIGHT_EDGE: 11,
  BACK_RIGHT_EDGE: 12,
  BACK_LEFT_EDGE: 13,
  FRONT_LEFT_EDGE: 14,

  BOTTOM_FRONT_EDGE: 15,
  BOTTOM_RIGHT_EDGE: 16,
  BOTTOM_BACK_EDGE: 17,
  BOTTOM_LEFT_EDGE: 18,

  TOP_FRONT_RIGHT_CORNER: 19,
  TOP_BACK_RIGHT_CORNER: 20,
  TOP_BACK_LEFT_CORNER: 21,
  TOP_FRONT_LEFT_CORNER: 22,

  BOTTOM_FRONT_RIGHT_CORNER: 23,
  BOTTOM_BACK_RIGHT_CORNER: 24,
  BOTTOM_BACK_LEFT_CORNER: 25,
  BOTTOM_FRONT_LEFT_CORNER: 26,
};

const BOX_FACES = [
  {
    name: FACES.FRONT,
    map: createTextSprite("FRONT", {
      fontSize: 60,
      font: "Arial Narrow, sans-serif",
    }),
  },
  {
    name: FACES.RIGHT,
    map: createTextSprite("RIGHT", {
      fontSize: 60,
      font: "Arial Narrow, sans-serif",
    }),
  },
  {
    name: FACES.BACK,
    map: createTextSprite("BACK", {
      fontSize: 60,
      font: "Arial Narrow, sans-serif",
    }),
  },
  {
    name: FACES.LEFT,
    map: createTextSprite("LEFT", {
      fontSize: 60,
      font: "Arial Narrow, sans-serif",
    }),
  },
  {
    name: FACES.TOP,
    map: createTextSprite("TOP", {
      fontSize: 60,
      font: "Arial Narrow, sans-serif",
    }),
  },
  {
    name: FACES.BOTTOM,
    map: createTextSprite("BOTTOM", {
      fontSize: 60,
      font: "Arial Narrow, sans-serif",
    }),
  },
];
const CORNER_FACES = [
  { name: FACES.TOP_FRONT_RIGHT_CORNER },
  { name: FACES.TOP_BACK_RIGHT_CORNER },
  { name: FACES.TOP_BACK_LEFT_CORNER },
  { name: FACES.TOP_FRONT_LEFT_CORNER },
  { name: FACES.BOTTOM_BACK_RIGHT_CORNER },
  { name: FACES.BOTTOM_FRONT_RIGHT_CORNER },
  { name: FACES.BOTTOM_FRONT_LEFT_CORNER },
  { name: FACES.BOTTOM_BACK_LEFT_CORNER },
];
const EDGE_FACES = [
  { name: FACES.TOP_FRONT_EDGE },
  { name: FACES.TOP_RIGHT_EDGE },
  { name: FACES.TOP_BACK_EDGE },
  { name: FACES.TOP_LEFT_EDGE },
  // flip back and front bottom edges
  { name: FACES.BOTTOM_BACK_EDGE },
  { name: FACES.BOTTOM_RIGHT_EDGE },
  { name: FACES.BOTTOM_FRONT_EDGE },
  { name: FACES.BOTTOM_LEFT_EDGE },
];
const EDGE_FACES_SIDE = [
  { name: FACES.FRONT_RIGHT_EDGE },
  { name: FACES.BACK_RIGHT_EDGE },
  { name: FACES.BACK_LEFT_EDGE },
  { name: FACES.FRONT_LEFT_EDGE },
];
// merge them all to ease the traversing
const CUBE_FACES = [
  ...BOX_FACES,
  ...CORNER_FACES,
  ...EDGE_FACES,
  ...EDGE_FACES_SIDE,
];
