import axios from "axios";
import nprogress from "nprogress";
import "nprogress/nprogress.css";

let requests = axios.create({
  baseURL: "https://netease-cloud-music-api-path-yu.vercel.app",
  method: "get",
  withCredentials: true,
});

//添加请求拦截器
requests.interceptors.request.use(
  (config) => {
    nprogress.start();
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);
//添加响应拦截器
requests.interceptors.response.use(
  (data) => {
    nprogress.done();
    return data;
  },
  (err) => {
    return Promise.reject(err);
  }
);
export default requests;
