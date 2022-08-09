<template>
  <div class="container">
    <video
      id="video"
      ref="videotarget"
      controls="true"
      crossOrigin="anonymous"
      :src="videourl"
    ></video>
    <audio
      id="musicL"
      preload="auto"
      ref="musicL"
      loop
      controls
      crossOrigin="anonymous"
      :src="songurl"
    ></audio>
    <audio
      id="musicR"
      preload="auto"
      ref="musicR"
      loop
      controls
      crossOrigin="anonymous"
      :src="songurl"
    ></audio>
    <button class="file-select-btn" @click="fileId.click()">
      选择本地文件
      <input type="file" ref="fileId" @change="getLocalAudio" class="file-input" />
    </button>
    <button @click="playVideo" class="play">播放视频</button>
    <button @click="videoPause" class="pause">视频暂停</button>
    <button @click="playMusic">播放音乐</button>
    <button @click="pauseMusic">音乐暂停</button>
    <button @click="musicLMute">左音响静音</button>
    <button @click="musicRMute">右音响静音</button>
    <input ref="songidInput" placeholder="请粘贴网易云分享链接" />
    <button @click="submit">确定</button>
  </div>
</template>

<script lang="ts" setup>
import { useStore } from "@/store";
import { parseLyric, type LineItem } from "@/utils/lyric";
import { onMounted, ref } from "vue";

// import { getLyricData } from "../assets/ts/Textures";

const store = useStore();
const fileId = ref();
const songurl = ref();
const videourl = ref();
const songid = ref("1148123");
const mvid = ref(14551581);
const songidInput = ref();
// https://music.163.com/mv/?id=14551581&userid=135775831
//https://music.163.com/song?id=1148123&userid=135775831
onMounted(async () => {
  await store.getSongs(songid.value);
  getLyricData();
  await store.getVideoUrl(mvid.value);
  videourl.value = store.videourl;
  songurl.value = store.songurl;
});

let lrcArr: LineItem[] = [];
const getLyricData = () => {
  const store = useStore();
  const lrc: string = store.lyric as string;
  lrcArr = parseLyric(lrc);
  // console.log(store.lyric);
  console.log("lrcArr", lrcArr);
};

//通过输入获取音视频数据
const submit = async () => {
  const songidInputValue = songidInput.value.value;
  const songId = songidInputValue?.split("?i")[1]?.split("=")[1]?.split("&")[0];

  if (songidInputValue.includes("mv")) {
    videotarget.value.src = "";
    store
      .getVideoUrl(songId)
      .then(() => {
        videourl.value = store.videourl;
      })
      .then(() => {
        playVideo();
      })
      .catch();
  } else {
    musicL.value.src = "";
    musicR.value.src = "";
    store
      .getSongs(songId)
      .then(() => {
        songurl.value = store.songurl;
        getLyricData();
      })
      .then(() => {
        playMusic();
      })
      .catch();
  }
};

//音视频播放
const videotarget = ref();
const musicL = ref();
const musicR = ref();
const playVideo = () => {
  videotarget.value.play();
};
const videoPause = () => {
  videotarget.value.pause();
};
const playMusic = () => {
  console.log(songurl.value);
  musicL.value.play();
  musicR.value.play();
};
const pauseMusic = () => {
  musicL.value.pause();
  musicR.value.pause();
};
const musicLMute = () => {
  musicL.value.muted == true
    ? (musicL.value.muted = false)
    : (musicL.value.muted = true);
};
const musicRMute = () => {
  musicR.value.muted == true
    ? (musicR.value.muted = false)
    : (musicR.value.muted = true);
};
// 获取本地音视频文件
const getLocalAudio = () => {
  let objFile = fileId.value;
  console.log(objFile.value);
  if (objFile.value === "") {
    return false;
  }
  if (window.FileReader) {
    let fileReader = new FileReader();
    fileReader.readAsDataURL(objFile.files[0]);
    fileReader.onloadend = (e) => {
      songurl.value = e.target?.result;
      videourl.value = e.target?.result;
    };
    fileReader.onload = () => {
      console.log("数据读取完成");
    };
  }
};

defineExpose({
  videotarget,
});
</script>

<style scoped>
video,
audio {
  display: none;
}
input {
  width: 100px;
  font-size: 10px;
  height: 15px;
}
.file-select-btn .file-input {
  display: none;
}
</style>
