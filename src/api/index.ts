import requests from "./request";
import qs from "qs";

//获取音乐url
export const reqSongs = (id: string) => {
  const query = qs.stringify({
    timestamp: Date.now(),
    id,
  });
  console.log(query);
  return requests.get("/song/url?" + query);
};
// 获取歌词
export function reqLyric(id: string) {
  return requests.get("/lyric?id=" + id);
}

// 获取mv url地址
export function reqVideoUrl(id: number) {
  return requests.get(`/mv/url?id=${id}`);
}
