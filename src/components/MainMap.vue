<template>
  <div id="main">
    <div id="map"></div>
    <div id="tool-bar">
      <el-button-group>
        <el-button icon="el-icon-edit"></el-button>
        <el-button icon="el-icon-share"></el-button>
        <el-button icon="el-icon-delete"></el-button>
      </el-button-group>
    </div>
    <div id="bottom-left"></div>
  </div>
</template>
 
<script>
import 'ol/ol.css'
import { Map, View } from 'ol'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'

export default {
  data() {
    return {
      map: null,
    }
  },
  mounted() {
    new Map({
      target: 'map',
      layers: [
        new TileLayer({
          // 使用Google Map
          source: new XYZ({
            url: 'http://www.google.cn/maps/vt/pb=!1m4!1m3!1i{z}!2i{x}!3i{y}!2m3!1e0!2sm!3i380072576!3m8!2sen!3scn!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0',
          }),
        }),
      ],
      view: new View({
        projection: 'EPSG:4326',
        center: [117.28, 31.8],
        zoom: 12,
      }),
    })
  },
}
</script>
 
<style scoped>
#map,
#main {
  width: 100%;
  height: 100%;
}
#tool-bar {
  position: absolute;
  right: 25px;
  top: 30px;
}
#bottom-left {
  position: absolute;
  width: 50px;
  height: 50px;
  background-color: aquamarine;
  right: 25px;
  bottom: 50px;
}
</style>