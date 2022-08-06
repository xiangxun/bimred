import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

//路由信息
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    meta: {
      showHome: true,
    },
    component: () => import("../views/Home/SolarSystem.vue"),
  },
  {
    path: "/bim",
    name: "bim",
    component: () => import("../views/BIM/BimModel.vue"),
  },
];
const router = createRouter({
  //路由模式
  history: createWebHistory(),
  routes,
});
export default router;
