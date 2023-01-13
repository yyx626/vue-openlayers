<template>
  <!-- 右键菜单 -->
  <div class="wrapBox" :style="{ left: left + 'px', top: top + 'px' }">
    <ul class="contextmenu">
      <li
        v-for="(item, index) in menuListArr"
        :key="index"
        @click="menuClick(index)"
        :class="setItemClass(index)"
        :data-clipboard-text="item"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<script>
import Clipboard from 'clipboard'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { geocoder } from '@/api/routeService'
import Feature from 'ol/Feature'
import { Point } from 'ol/geom'
import { Style, Icon } from 'ol/style'
export default {
  name: 'ContextMenu',
  data() {
    return {
      MapObject: null,
      layer: null,
      top: 0,
      left: 0,
      menuListArr: [
        '',
        'Where is this?',
        'Search around',
        'Set as map center point',
      ],
      tempPoint: null,
    }
  },
  computed: {},
  watch: {},
  methods: {
    init() {
      setTimeout(() => {
        this.MapObject = this.$parent.MapObject
        this.layer = new VectorLayer({
          source: new VectorSource({ wrapX: false }),
          properties: {
            id: 'menuLayer',
          },
        })
        this.MapObject.addLayer(this.layer)
        this.initMapEvent()
      }, 100)
    },
    initMapEvent() {
      this.$parent.mapClick(this.closeMenu)
      this.$parent.mapMoveStart(this.closeMenu)
      this.$parent.mapMoveEnd(this.closeMenu)
    },
    closeMenu(e) {
      if (this.$parent.showContextMenu) {
        this.$parent.showContextMenu = false
      }
    },
    setItemClass(index) {
      return 'item-' + index
    },
    copyJwd(index) {
      var clipboard = new Clipboard('.item-' + index)
      clipboard.on('success', (e) => {
        this.$notify({
          title: 'success',
          message: 'Copied to clipboard',
          type: 'success',
        })
        // 释放内存
        clipboard.destroy()
      })
      clipboard.on('error', (e) => {
        this.$notify.error({
          title: 'error',
          message: 'The browser does not support copying',
        })
        // 释放内存
        clipboard.destroy()
      })
    },
    searchPoint() {
      geocoder(this.tempPoint, (res) => {
        console.log(res)
        this.$notify({
          title: 'INFO',
          position: 'bottom-right',
          dangerouslyUseHTMLString: true,
          duration: 0,
          message: `
        <div>Address: ${res.formatted_address}</div>
        <div>Location: ${res.location.lon.toFixed(
          4
        )}, ${res.location.lat.toFixed(4)}</div>
        `,
        })
      })
    },
    searchAround() {
      if (this.layer.getSource().getFeatureById('tempPoint'))
        this.layer
          .getSource()
          .removeFeature(this.layer.getSource().getFeatureById('tempPoint'))
      let f = new Feature({ geometry: new Point(this.tempPoint) })
      f.setStyle(
        new Style({
          image: new Icon({
            src: require('@/assets/img/mark_b.png'),
            anchor: [0.5, 1],
          }),
        })
      )
      f.setId('tempPoint')
      this.layer.getSource().addFeature(f)
      // 打开overlay

    },
    setCenter() {
      this.MapObject.getView().animate(
        { zoom: this.MapObject.getView().getZoom() },
        { center: this.tempPoint }
      )
    },
    menuClick(index) {
      this.closeMenu()
      switch (index) {
        case 0:
          this.copyJwd(index)
          break
        case 1:
          this.searchPoint()
          break
        case 2:
          this.searchAround()
          break
        case 3:
          this.setCenter()
          break
        default:
          break
      }
    },
  },
  mounted() {
    this.init()
  },
}
</script>

<style lang="scss" scoped>
.wrapBox {
  border: 0;
  z-index: 5;
  position: absolute;
  // width: 300px;
}
.contextmenu {
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: fixed; //关键样式设置固定定位
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
}

.contextmenu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
}
.contextmenu li:hover {
  background: #eee;
}
</style>
