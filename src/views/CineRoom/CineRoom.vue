<template>
  <div class="three-canvas" ref="threeTarget"></div>
  <div class="overlay" ref="overlay">
    <button @click="enterButton" ref="enter">Enter</button>
    <p class="tip">带上耳机食用更佳</p>
  </div>
  <div class="container">
    <MediaPlayer v-show="isShow" ref="playerRef"></MediaPlayer>
    <button @click="show">收起/展开</button>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { Base } from "@/assets/ts/Base";
import { basicObjectList } from "@/assets/ts/BasicObject";
import { lightsList } from "@/assets/ts/Light";
import { gltfPromise } from "@/assets/ts/LoadModel";
import { VideoPlayer } from "@/assets/ts/MediaPlayer";
import MediaPlayer from "@/components/MediaPlayer.vue";
// import { helperList } from "@/assets/ts/Helper";
import { lyric, lyricList, lyricSprite } from "@/assets/ts/Lyric";
const playerRef = ref();
const threeTarget = ref();
const enter = ref();
onMounted(() => {
  const base = new Base(threeTarget.value);
  base.addObject(...basicObjectList);
  base.addObject(...lightsList);

  const videoPlayer = new VideoPlayer(playerRef.value.videotarget);
  base.addObject(videoPlayer.screen);

  gltfPromise.then((gltfModel) => {
    console.log("@", gltfModel);
    base.addObject(gltfModel);
  });
  // base.addObject(...helperList);
  enter.value.addEventListener("click", function () {
    base.playMusic(), false;
  });
  base.addObject(...lyricList);
});

let isShow = ref(true);
const show = () => {
  isShow.value = !isShow.value;
  console.log(isShow);
};

const overlay = ref();
const enterButton = () => {
  overlay.value.remove();
};
</script>

<style scoped>
.three-canvas {
  width: 100%;
  height: 100%;
}
.overlay {
  position: absolute;
  font-size: 16px;
  z-index: 2;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.7);
}
.container {
  position: absolute;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  width: 100px;
  left: 10px;
  bottom: 30px;
}
.tip {
  margin: 10px;
  color: aqua;
}
</style>
