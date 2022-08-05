<template>
  <div class="three-canvas" ref="threeTarget"></div>
  <div draggable="true">
    hello
    <div class="pr">你好</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Mep } from "../../assets/ts/BIM";
import { useMepStore } from "../../stores/bim";

const store = useMepStore();
const threeTarget = ref();

onMounted(async () => {
  init();
  store.showCurrentObject();
});
const init = () => {
  const mep = new Mep(threeTarget.value);
  console.log("mep", mep);
  console.log("vue", mep.currentObject);
};
// requestAnimationFrame(init);
</script>

<style>
.three-canvas {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.table {
  position: absolute;
  bottom: 300px;
  color: aliceblue;
}
</style>
