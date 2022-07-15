import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
// import HomeView from "../views/HomeView.vue";
// import Mep from "../views/Mep/index.vue";
// import Home from "../views/Home/index.vue";

//路由信息
const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    meta: {
      showHome: true,
    },
    component: () => import("../views/Home/index.vue"),
  },
  {
    path: "/mep",
    name: "mep",
    component: () => import("../views/Mep/index.vue"),
  },
];
const router = createRouter({
  //路由模式
  history: createWebHistory(),
  routes,
});
export default router;
