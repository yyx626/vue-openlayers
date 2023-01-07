<template>
  <div id="map">
    <!-- 鼠标经纬度及比例尺 -->
    <mouse-position></mouse-position>
    <!-- 图层切换 -->
    <layer-manage v-if="!hideLayerControl"></layer-manage>
    <!-- 右上工具条 -->
    <tool-bar></tool-bar>
  </div>
</template>

<script>
import Map from 'ol/Map'
import XYZ from 'ol/source/XYZ'
import TileLayer from 'ol/layer/Tile'
import View from 'ol/View'
import { defaults } from 'ol/control'
import { defaults as indefaults } from 'ol/interaction'
import MapConfig from '@/config/MapConfig.js'
import LayerManage from '@/components/GIS/LayerManage'
import MousePosition from '@/components/GIS/MousePosition'
import ToolBar from '@/components/GIS/ToolBar'
export default {
  components: { LayerManage, MousePosition, ToolBar },
  name: 'MapComponent',
  props: ['currentMap', 'hideLayerControl'],
  data() {
    return {
      vecLayer: null,
      imgLayer: null,
      cvaLayer: null,
      ciaLayer: null,
      MapObject: null,
      mapType: this.currentMap,
    }
  },
  computed: {
    currentMapType() {
      return this.mapType
    },
  },
  watch: {
    currentMapType(newValue) {
      this.mapType = newValue
    },
  },
  methods: {
    // 地图初始化
    initMap() {
      // 矢量底图
      this.vecLayer = new TileLayer({
        source: new XYZ({
          url: `${MapConfig.baseURL}&T=${MapConfig.type.vecLayer}&tk=${MapConfig.tdtKey}`,
          projection: MapConfig.projection,
          wrapX: false,
        }),
        zIndex: 0,
      })
      // 影像底图
      this.imgLayer = new TileLayer({
        source: new XYZ({
          url: `${MapConfig.baseURL}&T=${MapConfig.type.imgLayer}&tk=${MapConfig.tdtKey}`,
          projection: MapConfig.projection,
          wrapX: false,
        }),
        zIndex: 0,
      })
      // 矢量注记
      this.cvaLayer = new TileLayer({
        source: new XYZ({
          url: `${MapConfig.baseURL}&T=${MapConfig.type.cvaLayer}&tk=${MapConfig.tdtKey}`,
          projection: MapConfig.projection,
          wrapX: false,
        }),
        zIndex: 0,
      })
      // 影像注记
      this.ciaLayer = new TileLayer({
        source: new XYZ({
          url: `${MapConfig.baseURL}&T=${MapConfig.type.ciaLayer}&tk=${MapConfig.tdtKey}`,
          projection: MapConfig.projection,
          wrapX: false,
        }),
        zIndex: 0,
      })
      this.MapObject = new Map({
        interactions: indefaults({
          doubleClickZoom: false,
        }),
        layers: [this.imgLayer, this.vecLayer, this.cvaLayer, this.ciaLayer],
        view: new View({
          center: MapConfig.initCenter,
          projection: MapConfig.projection,
          zoom: MapConfig.initZoom,
        }),
        target: 'map',
        controls: defaults({
          zoom: false,
          attribution: false,
          rotate: false,
        }),
      })
      if (this.mapType == 2) {
        this.vecLayer.setVisible(true)
        this.cvaLayer.setVisible(true)
        this.imgLayer.setVisible(false)
        this.ciaLayer.setVisible(false)
      }
      if (this.mapType == 1) {
        this.vecLayer.setVisible(false)
        this.cvaLayer.setVisible(false)
        this.imgLayer.setVisible(true)
        this.ciaLayer.setVisible(true)
      }
    },
    // 地图单击事件入口
    mapClick(func) {
      this.MapObject.on('singleclick', (e) => {
        func(e)
      })
    },
    // 更新当前底图类型
    setCurrentMapType(newValue) {
      this.mapType = newValue
    },
    // 事件回调函数
    callBack(type, param) {
      // 绘制图形结束回调
      type == 'drawend' && this.$parent.drawCallBack
        ? this.$parent.drawCallBack(param)
        : ''
    },
  },
  mounted() {
    this.initMap()
    // 父组件内部自定义mapClickEvent方法
    this.$parent.mapClickEvent ? this.mapClick(this.$parent.mapClickEvent) : ''
  },
}
</script>

<style scoped>
#map {
  width: 100%;
  height: 100%;
  /* z-index: 5; */
  position: absolute;
  left: 0;
  top: 0;
}
</style>
