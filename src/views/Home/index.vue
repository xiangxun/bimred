<template>
  <div class="home-canvas" ref="homeTarget"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Earth } from "../../assets/ts/Earth";
// import { Solar } from "./ts/Solar";
// import { helperList } from "../../assets/ts/THelper";

const homeTarget = ref();
onMounted(() => {
  const earth = new Earth(homeTarget.value);
  // new Solar(homeTarget.value);
});
</script>

<style>
.three-canvas {
  width: 100%;
  height: 100%;
}
</style>
