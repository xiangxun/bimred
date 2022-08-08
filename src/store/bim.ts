import { defineStore } from "pinia";
import type { Mesh } from "three";
// import { Mep } from "@/assets/ts/Mep";

export const useMepStore = defineStore({
  id: "store",
  state: () => ({
    currentObject: <Mesh>{},
  }),
  getters: {},
  actions: {
    showCurrentObject() {
      // const mep = new Mep();
      // this.currentObject = <Mesh>mep.currentObject.userData;
      // console.log(this.currentObject);
    },
  },
});
