import {
  Audio,
  AudioAnalyser,
  BoxBufferGeometry,
  ClampToEdgeWrapping,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
  PositionalAudio,
  SphereGeometry,
  VideoTexture,
} from "three";
// import { PositionalAudioHelper } from "three/examples/jsm/helpers/PositionalAudioHelper";

export class VideoPlayer {
  screen!: Mesh;
  constructor(video: HTMLVideoElement) {
    const videoTexture = new VideoTexture(video);
    videoTexture.wrapS = videoTexture.wrapT = ClampToEdgeWrapping;
    videoTexture.minFilter = LinearFilter;
    // const videoMaterial = new MeshLambertMaterial({ map: videoTexture });
    const videoMaterial = new MeshBasicMaterial({ map: videoTexture });
    const screen = new Mesh(new BoxBufferGeometry(0.01, 27, 51), videoMaterial);
    screen.position.set(43, -6, -1.5);
    // screen.material.color.multiplyScalar(10);
    this.screen = screen;
  }
}
export class AudioPlayer {
  player: Mesh;
  constructor(audio: HTMLAudioElement, listener: THREE.AudioListener) {
    const randomColor: number = 0xffffff * Math.random();
    audio.play();
    const positionalAudio = new PositionalAudio(listener);
    positionalAudio.setMediaElementSource(audio);
    positionalAudio.setRefDistance(100);
    positionalAudio.setMaxDistance(120);
    positionalAudio.setDirectionalCone(120, 230, 0.1);
    // const helper = new PositionalAudioHelper(positionalAudio, 0);
    // helper.raycast = () => {};
    // positionalAudio.add(helper);
    const player = new Mesh(
      new SphereGeometry(0.5, 50, 50),
      new MeshBasicMaterial({
        color: randomColor,
      })
    );
    player.add(positionalAudio);
    this.player = player;
  }
}
