<template>
  <div class="three-canvas" ref="threeTarget"></div>
  <div>
    <div class="info">你好</div>
  </div>
  <div class="loading" ref="loading" v-show="isShow">
    <div class="loadingtext">加载模型需要一些时间......</div>
  </div>
</template>

<script setup lang="ts">
import { bimPromise } from "@/assets/ts/LoadModel";
import { onMounted, ref } from "vue";
import { useMepStore } from "../../store/bim";
import { Bim } from "./ts/Bim";

const store = useMepStore();
const threeTarget = ref();
const loading = ref();
let isShow = ref(true);

onMounted(() => {
  const bim = new Bim(threeTarget.value);
  bim.init();
  console.log("bim", bim);
  bimPromise
    .then((gltfModel) => {
      bim.addObject(gltfModel);
    })
    .then(() => {
      isShow.value = false;
    });
});
</script>

<style>
.three-canvas {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.loading {
  z-index: 3;
  background-color: #000000;
  opacity: 0.7;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.loadingtext {
  color: aliceblue;
  font-size: 3em;
}
</style>
