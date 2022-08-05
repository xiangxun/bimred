<script setup lang="ts">
import { RouterView } from "vue-router";
import HeaderView from "./components/HeaderView.vue";
import FooterView from "./components/FooterView.vue";
</script>

<template>
  <HeaderView msg="Hello"></HeaderView>
  <FooterView></FooterView>
  <RouterView></RouterView>
</template>

<style scoped></style>
