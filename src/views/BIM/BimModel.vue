<template>
  <div class="three-canvas" ref="threeTarget"></div>
  <div class="cube">
    <!-- <div class="viewCube"></div> -->
  </div>

  <!-- <RouterView /> -->
  <div>
    <div class="info">你好</div>
  </div>
  <div class="loading" ref="loading" v-show="isShow">
    <div class="loadingtext">
      <div class="loadingEight">
        <span></span>
      </div>
      <p><br />加载模型需要一些时间......</p>
    </div>
  </div>
  <ECharts></ECharts>
</template>

<script setup lang="ts">
import { bimPromise } from "@/assets/ts/LoadModel";
import { onMounted, ref } from "vue";
import { useMepStore } from "../../store/bim";
import { Bim } from "./ts/Bim";
import ECharts from "./ECharts.vue";

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

<style scoped>
.three-canvas {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

.cube {
  position: fixed;
  right: 10px;
  bottom: 10px;
}
.loading {
  position: fixed;
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
  font-size: 1em;
}
.loadingEight {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto;
  margin-top: 100px;
  position: relative;
  border: 5px solid #ff8888;
  animation: turn 2s linear infinite;
}
.loadingEight span {
  display: inline-block;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #ff8888;
  position: absolute;
  left: 50%;
  margin-top: -15px;
  margin-left: -15px;
  animation: changeBgColor 2s linear infinite;
}
@keyframes changeBgColor {
  0% {
    background: red;
  }
  100% {
    background: #ffeeee;
  }
}
@keyframes turn {
  0% {
    -webkit-transform: rotate(0deg);
    border-color: #ff8888;
  }
  100% {
    -webkit-transform: rotate(360deg);
    border-color: #ffeeee;
  }
}
</style>
