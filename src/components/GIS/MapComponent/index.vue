<template>
  <div
    id="map"
    @contextmenu.prevent=""
    @mousedown.right="mouseDownRightEvent($event)"
  >
    <!-- 鼠标经纬度及比例尺 -->
    <mouse-position></mouse-position>
    <!-- 图层切换 -->
    <layer-manage v-if="!hideLayerControl"></layer-manage>
    <!-- 右上工具条 -->
    <tool-bar ref="toolBarChild"></tool-bar>
    <!-- 路网相关 -->
    <route-analysis ref="routeChild"></route-analysis>
    <!-- 右键菜单 -->
    <context-menu v-show="showContextMenu" ref="menuChild"></context-menu>
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
import RouteAnalysis from '@/components/GIS/RouteAnalysis'
import ContextMenu from '@/components/GIS/ContextMenu'
export default {
  components: {
    LayerManage,
    MousePosition,
    ToolBar,
    RouteAnalysis,
    ContextMenu,
  },
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
      showContextMenu: false,
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
          url: MapConfig.tdtVecUrl,
          projection: MapConfig.projection,
          wrapX: false,
        }),
        zIndex: 0,
      })
      // 影像底图
      this.imgLayer = new TileLayer({
        source: new XYZ({
          url: MapConfig.tdtImgUrl,
          projection: MapConfig.projection,
          wrapX: false,
        }),
        zIndex: 0,
      })
      // 矢量注记
      this.cvaLayer = new TileLayer({
        source: new XYZ({
          url: MapConfig.tdtCvaUrl,
          projection: MapConfig.projection,
          wrapX: false,
        }),
        zIndex: 0,
      })
      // 影像注记
      this.ciaLayer = new TileLayer({
        source: new XYZ({
          url: MapConfig.tdtCiaUrl,
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
    // 地图右键事件
    mouseDownRightEvent(e) {
      if (this.$refs.toolBarChild.isStartDraw) {
        this.$refs.toolBarChild.handleDrawing(false)
      } else {
        this.showContextMenu = true
        this.$refs.menuChild.left = e.pageX
        this.$refs.menuChild.top = e.pageY
        this.$refs.menuChild.menuListArr[0] = `${this.MapObject.getCoordinateFromPixel(
          [e.pageX, e.pageY]
        )[0].toFixed(5)}, ${this.MapObject.getCoordinateFromPixel([
          e.pageX,
          e.pageY,
        ])[1].toFixed(5)}`
        this.$refs.menuChild.tempPoint = this.MapObject.getCoordinateFromPixel([
          e.pageX,
          e.pageY,
        ]).map((item) => item.toFixed(5))
      }
    },
    // 地图单击事件入口
    mapClick(func) {
      this.MapObject.on('singleclick', (e) => {
        func(e)
      })
    },
    // 地图双击事件入口
    mapDbClick(func) {
      this.MapObject.on('dblclick', (e) => {
        func(e)
      })
    },
    // 地图鼠标移动事件入口
    mapPointermove(func) {
      this.MapObject.on('pointermove', (e) => {
        func(e)
      })
    },
    // 地图鼠标拖拽事件
    mapDrag(func) {
      this.MapObject.on('pointerdrag', (e) => {
        document.querySelector('body').style.cursor = 'move'
        func(e)
      })
    },
    mapMoveStart(func) {
      this.MapObject.on('movestart', (e) => {
        document.querySelector('body').style.cursor = 'move'
        func(e)
      })
    },
    mapMoveEnd(func) {
      this.MapObject.on('moveend', (e) => {
        document.querySelector('body').style.cursor = 'default'
        func(e)
      })
    },
    // 更新当前底图类型
    setCurrentMapType(newValue) {
      this.mapType = newValue
    },
    // 事件回调函数
    callBack(type, param) {},
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
  /* left: 0; */
  /* top: 0; */
}
</style>
