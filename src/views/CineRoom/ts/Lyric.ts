import { lyricTexture } from "../../../assets/ts/Texture";
import {
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneBufferGeometry,
  Sprite,
  SpriteMaterial,
} from "three";
export const lyricList: Object3D[] = [];
export const lyric: Mesh = new Mesh(
  new PlaneBufferGeometry(16, 9),
  new MeshStandardMaterial({
    map: lyricTexture,
  })
);
lyric.position.set(25, -20, 0);
lyric.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);

export const lyricSprite: Sprite = new Sprite(
  new SpriteMaterial({
    map: lyricTexture,
  })
);
lyricSprite.position.set(-30, 0, 0);
lyricSprite.scale.set(16, 9, 1);
lyricSprite.raycast = () => {};

const info: Sprite = new Sprite(
  new SpriteMaterial({
    // map: infoTexture,
  })
);

lyricList.push(lyric, lyricSprite);
