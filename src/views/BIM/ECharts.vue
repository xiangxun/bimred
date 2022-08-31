<template>
  <div>
    <div class="box">
      <div class="box-left">
        <div class="box-left-wind"></div>
        <div class="box-left-pie"></div>
        <div class="box-left-bar"></div>
      </div>
      <div class="box-center">center</div>
      <div class="box-right">right</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import rawData from "../../assets/json/wind-barb-hobart.json";
import * as echarts from "echarts";
import type {
  CustomSeriesOption,
  CustomSeriesRenderItemAPI,
  CustomSeriesRenderItemParams,
  CustomSeriesRenderItemReturn,
  EChartsOption,
} from "echarts";
import Showers from "../../assets/img/showers_128.png";
import Sunny from "../../assets/img/Sunny_128.png";
import Cloudy from "../../assets/img/Cloudy_128.png";

onMounted(async () => {
  console.log(rawData);
  initWind();
  initPie();
  initDottedBar();
});
//风向图
const initWind = () => {
  const charts = echarts.init(document.querySelector(".box-left-wind") as HTMLElement);
  // ROOT_PATH + '/data/asset/data/wind-barb-hobart.json',

  const weatherIcons: Record<string, string> = {
    Showers: Showers,
    Sunny: Sunny,
    Cloudy: Cloudy,
  };

  const directionMap: Record<string, number> = {};

  // prettier-ignore
  ['W', 'WSW', 'SW', 'SSW', 'S', 'SSE', 'SE', 'ESE', 'E', 'ENE', 'NE', 'NNE', 'N', 'NNW', 'NW', 'WNW'].forEach(
      function (name, index) {
          directionMap[name] = Math.PI / 8 * index;
      }
    );

  const data = rawData.data.map(function (entry: any) {
    return [entry.time, entry.windSpeed, entry.R, entry.waveHeight];
  });
  const weatherData = rawData.forecast.map(function (entry: any) {
    return [
      entry.localDate,
      0,
      weatherIcons[entry.skyIcon],
      entry.minTemp,
      entry.maxTemp,
    ];
  });

  const dims = {
    time: 0,
    windSpeed: 1,
    R: 2,
    waveHeight: 3,
    weatherIcon: 2,
    minTemp: 3,
    maxTemp: 4,
  };
  const arrowSize = 18;
  const weatherIconSize = 45;

  const renderArrow: CustomSeriesOption["renderItem"] = function (param, api) {
    const point = api.coord([api.value(dims.time), api.value(dims.windSpeed)]);

    return {
      type: "path",
      shape: {
        pathData: "M31 16l-15-15v9h-26v12h26v9z",
        x: -arrowSize / 2,
        y: -arrowSize / 2,
        width: arrowSize,
        height: arrowSize,
      },
      rotation: directionMap[api.value(dims.R)],
      position: point,
      style: api.style({
        stroke: "#555",
        lineWidth: 1,
      }),
    };
  };

  const renderWeather = function (
    param: CustomSeriesRenderItemParams,
    api: CustomSeriesRenderItemAPI
  ) {
    const point = api.coord([
      (api.value(dims.time) as number) + (3600 * 24 * 1000) / 2,
      0,
    ]);

    return {
      type: "group",
      children: [
        {
          type: "image",
          style: {
            image: api.value(dims.weatherIcon) as string,
            x: -weatherIconSize / 2,
            y: -weatherIconSize / 2,
            width: weatherIconSize,
            height: weatherIconSize,
          },
          position: [point[0], 110],
        },
        {
          type: "text",
          style: {
            text: api.value(dims.minTemp) + " - " + api.value(dims.maxTemp) + "°",
            textFont: api.font({ fontSize: 14 }),
            textAlign: "center",
            textVerticalAlign: "bottom",
          },
          position: [point[0], 80],
        },
      ],
    } as CustomSeriesRenderItemReturn;
  };

  charts.setOption({
    backgroundColor: "rgba(88,160,253,0.3)",
    title: {
      text: "天气 风向 风速 海浪 预报",
      // subtext: "示例数据源于 www.seabreeze.com.au",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params: any) {
        return [
          echarts.format.formatTime("yyyy-MM-dd", params[0].value[dims.time]) +
            " " +
            echarts.format.formatTime("hh:mm", params[0].value[dims.time]),
          "风速：" + params[0].value[dims.windSpeed],
          "风向：" + params[0].value[dims.R],
          "浪高：" + params[0].value[dims.waveHeight],
        ].join("<br>");
      },
    },
    grid: {
      top: 160,
      bottom: 125,
    },
    xAxis: {
      type: "time",
      maxInterval: 3600 * 1000 * 24,
      splitLine: {
        lineStyle: {
          color: "#ddd",
        },
      },
    },
    yAxis: [
      {
        name: "风速（节）",
        nameLocation: "middle",
        nameGap: 35,
        axisLine: {
          lineStyle: {
            color: "#666",
          },
        },
        splitLine: {
          lineStyle: {
            color: "#ddd",
          },
        },
      },
      {
        name: "浪高（米）",
        nameLocation: "middle",
        nameGap: 35,
        max: 6,
        axisLine: {
          lineStyle: {
            color: "#015DD5",
          },
        },
        splitLine: { show: false },
      },
      {
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
    ],
    visualMap: {
      type: "piecewise",
      // show: false,
      orient: "horizontal",
      left: "center",
      bottom: 10,
      pieces: [
        {
          gte: 17,
          color: "#18BF12",
          label: "大风（>=17节）",
        },
        {
          gte: 11,
          lt: 17,
          color: "#f4e9a3",
          label: "中风（11  ~ 17 节）",
        },
        {
          lt: 11,
          color: "#D33C3E",
          label: "微风（小于 11 节）",
        },
      ],
      seriesIndex: 1,
      dimension: 1,
    },
    dataZoom: [
      {
        type: "inside",
        xAxisIndex: 0,
        minSpan: 5,
      },
      {
        type: "slider",
        xAxisIndex: 0,
        minSpan: 5,
        bottom: 50,
      },
    ],
    series: [
      {
        type: "line",
        yAxisIndex: 1,
        showSymbol: false,
        emphasis: {
          scale: false,
        },
        symbolSize: 10,
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            global: false,
            colorStops: [
              {
                offset: 0,
                color: "rgba(88,160,253,1)",
              },
              {
                offset: 0.5,
                color: "rgba(88,160,253,0.7)",
              },
              {
                offset: 1,
                color: "rgba(88,160,253,0)",
              },
            ],
          },
        },
        lineStyle: {
          color: "rgba(88,160,253,1)",
        },
        itemStyle: {
          color: "rgba(88,160,253,1)",
        },
        encode: {
          x: dims.time,
          y: dims.waveHeight,
        },
        data: data,
        z: 2,
      },
      {
        type: "custom",
        renderItem: renderArrow,
        encode: {
          x: dims.time,
          y: dims.windSpeed,
        },
        data: data,
        z: 10,
      },
      {
        type: "line",
        symbol: "none",
        encode: {
          x: dims.time,
          y: dims.windSpeed,
        },
        lineStyle: {
          color: "#aaa",
          type: "dotted",
        },
        data: data,
        z: 1,
      },
      {
        type: "custom",
        renderItem: renderWeather,
        data: weatherData,
        tooltip: {
          trigger: "item",
          formatter: function (param: any) {
            return (
              param.value[dims.time] +
              ": " +
              param.value[dims.minTemp] +
              " - " +
              param.value[dims.maxTemp] +
              "°"
            );
          },
        },
        yAxisIndex: 2,
        z: 11,
      },
    ],
  });
};
//饼图
const initPie = () => {
  const charts = echarts.init(document.querySelector(".box-left-pie") as HTMLElement);
  charts.setOption({
    backgroundColor: "rgba(88,160,253,0.3)",
    legend: {},
    tooltip: {
      trigger: "axis",
      showContent: false,
    },
    dataset: {
      source: [
        ["product", "2017", "2018", "2019", "2020", "2021", "2022"],
        ["A", 56.5, 82.1, 88.7, 70.1, 53.4, 85.1],
        ["B", 51.1, 51.4, 55.1, 53.3, 73.8, 68.7],
        ["C", 40.1, 62.2, 69.5, 36.4, 45.2, 32.5],
        ["D", 25.2, 37.1, 41.2, 18, 33.9, 49.1],
      ],
    },
    xAxis: { type: "category" },
    yAxis: { gridIndex: 0 },
    grid: { top: "55%" },
    series: [
      {
        type: "line",
        smooth: true,
        seriesLayoutBy: "row",
        emphasis: { focus: "series" },
      },
      {
        type: "line",
        smooth: true,
        seriesLayoutBy: "row",
        emphasis: { focus: "series" },
      },
      {
        type: "line",
        smooth: true,
        seriesLayoutBy: "row",
        emphasis: { focus: "series" },
      },
      {
        type: "line",
        smooth: true,
        seriesLayoutBy: "row",
        emphasis: { focus: "series" },
      },
      {
        type: "pie",
        id: "pie",
        radius: "30%",
        center: ["50%", "25%"],
        emphasis: {
          focus: "self",
        },
        label: {
          formatter: "{b}: {@2017} ({d}%)",
        },
        encode: {
          itemName: "product",
          value: "2017",
          tooltip: "2017",
        },
      },
    ],
  });
  charts.on("updateAxisPointer", (event: any) => {
    const xAxisInfo = event.axesInfo[0];
    if (xAxisInfo) {
      const dimension = xAxisInfo.value + 1;
      charts.setOption<EChartsOption>({
        series: {
          id: "pie",
          label: {
            formatter: "{b}: {@[" + dimension + "]} ({d}%)",
          },
          encode: {
            value: dimension,
            tooltip: dimension,
          },
        },
      });
    }
  });
};
//虚线柱状图
const initDottedBar = () => {
  const charts = echarts.init(document.querySelector(".box-left-bar") as HTMLElement);
  // Generate data
  let category = [];
  let dottedBase = +new Date();
  let lineData = [];
  let barData = [];

  for (let i = 0; i < 20; i++) {
    let date = new Date((dottedBase += 3600 * 24 * 1000));
    category.push([date.getFullYear(), date.getMonth() + 1, date.getDate()].join("-"));
    let b = Math.random() * 200;
    let d = Math.random() * 200;
    barData.push(b);
    lineData.push(d + b);
  }
  charts.setOption({
    // backgroundColor: "#0f375f",
    backgroundColor: "rgba(88,160,253,0.3)",
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["line", "bar"],
      textStyle: {
        color: "#ccc",
      },
    },
    xAxis: {
      data: category,
      axisLine: {
        lineStyle: {
          color: "#ccc",
        },
      },
    },
    yAxis: {
      splitLine: { show: false },
      axisLine: {
        lineStyle: {
          color: "#ccc",
        },
      },
    },
    series: [
      {
        name: "line",
        type: "line",
        smooth: true,
        showAllSymbol: true,
        symbol: "emptyCircle",
        symbolSize: 15,
        data: lineData,
      },
      {
        name: "bar",
        type: "bar",
        barWidth: 10,
        itemStyle: {
          borderRadius: 5,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#14c8d4" },
            { offset: 1, color: "#43eec6" },
          ]),
        },
        data: barData,
      },
      {
        name: "line",
        type: "bar",
        barGap: "-100%",
        barWidth: 10,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(20,200,212,0.5)" },
            { offset: 0.2, color: "rgba(20,200,212,0.2)" },
            { offset: 1, color: "rgba(20,200,212,0)" },
          ]),
        },
        z: -12,
        data: lineData,
      },
      {
        name: "dotted",
        type: "pictorialBar",
        symbol: "rect",
        itemStyle: {
          color: "#0f375f",
        },
        symbolRepeat: true,
        symbolSize: [12, 4],
        symbolMargin: 1,
        z: -10,
        data: lineData,
      },
    ],
  });
};
</script>

<style scoped lang="less">
* {
  padding: 0;
  margin: 0;
}
html,
body,
#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.box {
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
  &-left {
    width: 500px;
    display: flex;
    flex-flow: column;
    overflow: hidden;
    &-wind {
      height: 400px;
      margin-bottom: auto;
    }
    &-pie {
      height: 400px;
      margin-bottom: auto;
    }
    &-bar {
      height: 400px;
      margin-top: auto;
    }
  }
  &-center {
    flex: 1;
  }
  &-right {
    width: 400px;
  }
}
</style>
