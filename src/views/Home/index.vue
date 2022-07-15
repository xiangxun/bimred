<template>
  <div class="home-canvas" ref="homeTarget"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { Earth } from "../../assets/ts/Earth";

export default defineComponent({
  setup() {
    const homeTarget = ref();
    onMounted(() => {
      new Earth(homeTarget.value);
      console.log(homeTarget.value);
    });

    return {
      homeTarget,
    };
  },
});
</script>

<style>
.three-canvas {
  width: 100%;
  height: 100%;
}
</style>
