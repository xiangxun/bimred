<template>
  <div class="home-canvas" ref="homeTarget"></div>
</template>

<script setup lang="ts">
import { onMounted, onUpdated, ref } from "vue";
// import { Earth } from "../../assets/ts/Earth";
import { Solar } from "./ts/Solar";
// import { helperList } from "../../assets/ts/THelper";

const homeTarget = ref();
// const solar = new Solar(homeTarget.value);
onMounted(() => {
  const solar = new Solar(homeTarget.value);
  // new Earth(homeTarget.value);
  solar.init();
});
onUpdated(() => {
  // solar.init();
});
</script>

<style>
.three-canvas {
  width: 100%;
  height: 100%;
}
</style>
