<template>
  <div class="three-canvas" ref="threeTarget"></div>
  <div draggable="true">
    <div class="info">你好</div>
  </div>
</template>

<script setup lang="ts">
import { bimPromise } from "@/assets/ts/LoadModel";
import { onMounted, ref } from "vue";
import { useMepStore } from "../../store/bim";
import { Bim } from "./ts/Bim";

const store = useMepStore();
const threeTarget = ref();

onMounted(() => {
  const bim = new Bim(threeTarget.value);
  bim.init();
  console.log("bim", bim);
  bimPromise.then((gltfModel) => {
    bim.addObject(gltfModel);
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
</style>
