<template>
  <div class="three-canvas" ref="threeTarget"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { Mep } from "../../assets/ts/Mep";

export default defineComponent({
  setup() {
    const threeTarget = ref();
    onMounted(() => {
      new Mep(threeTarget.value);
    });
    return {
      threeTarget,
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
