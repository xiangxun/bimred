import earthImg from "../img/earth.jpg";
import sunImg from "../img/sun.jpg";
import stars from "../img/stars.jpg";
import hilly from "../img/hilly.jpg";
import { CanvasEditor } from "./CanvasEditor";
import { CanvasTexture } from "three";

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
    ctx.font = "100px 黑体";
    ctx.translate(960, 440);

    ctx.beginPath();
    ctx.fillText(`xiangxun`, 0, 80);
    ctx.closePath();

    ctx.beginPath();
    ctx.fillText("2022", 0, 220);
    ctx.closePath();
  }).canvas
);
