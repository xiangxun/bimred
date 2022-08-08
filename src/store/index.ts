import { reqLyric, reqSongs, reqVideoUrl } from "../api/index";
import { defineStore } from "pinia";

export const useStore = defineStore({
  id: "store",
  state: () => ({
    songurl: <String>"",
    videourl: <String>"",
    lyric: <String>"",
  }),
  getters: {},
  actions: {
    async getSongs(songid: string) {
      const result = await reqSongs(songid);
      if (result.data.code === 200) {
        this.songurl = result.data.data[0].url;
        const lyricRes = await reqLyric(songid);
        this.lyric = lyricRes.data?.lrc?.lyric;
      }
    },
    async getVideoUrl(mvid: number) {
      const result = await reqVideoUrl(mvid);
      this.videourl = result.data.data.url;
    },
  },
});
