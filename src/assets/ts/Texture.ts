import earthImg from "../img/earth.jpg";
import sunImg from "../img/sun.jpg";
import stars from "../img/stars.jpg";
import hilly from "../img/hilly.jpg";
import { CanvasEditor } from "./CanvasEditor";
import { CanvasTexture, Texture, TextureLoader } from "three";

export { earthImg, sunImg, stars, hilly };
export const lyricTexture: CanvasTexture = new CanvasTexture(
  new CanvasEditor(1920, 1080).draw((ctx) => {
    ctx.fillStyle = "rgb(256, 150, 256)";
    ctx.beginPath();
    ctx.fillRect(0, 0, 1920, 1080);
    ctx.closePath();

    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "80px 黑体";
    ctx.translate(960, 440);

    ctx.beginPath();
    ctx.fillText(`111`, 0, 100);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillText("时间：2022年7月28日", 0, 200);
    ctx.closePath();
  }).canvas
);
