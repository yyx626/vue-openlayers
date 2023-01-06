<template>
  <div id="wrapBox">
    <div id="mousePosition">
      <div id="mouse-position">十进制：</div>
      <div id="mouse-position2">经纬度：</div>
    </div>
    <div id="scaleLine">
      <span id="scaleWrapper" style="display: none">
        比例尺(km)&nbsp;1:&nbsp;
        <span id="scale" style="display: inline-block" />
      </span>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import { MousePosition } from 'ol/control'
import { createStringXY, toStringHDMS } from 'ol/coordinate'
export default {
  name: 'MousePosition',
  data() {
    return {
      MapObject: null,
    }
  },
  computed: {
    mapType() {
      return this.$parent.mapType
    },
  },
  watch: {
    mapType(newValue) {
      this.exchangeStyle(newValue)
      this.$parent.setCurrentMapType(newValue)
    },
  },
  methods: {
    addScale() {
      document.getElementById('scaleWrapper').style.display = 'inline-block'
      // 监听分辨率变化，通过dpi和像素关系（比例尺=dpi/0.0254*分辨率）输出比例尺
      document.getElementById('scale').innerHTML = (
        this.MapObject.getView().getResolution() * 3779.5275590551
      ).toFixed(4)
      // 重点监听View的resolution改变
      this.MapObject.getView().on('change:resolution', this.viewChange)
    },
    // 取消比例尺
    removeScale() {
      document.getElementById('scaleWrapper').style.display = 'none'
      this.MapObject.getView().un('change:resolution', this.viewChange)
    },
    // 视图监听
    viewChange() {
      document.getElementById('scale').innerHTML = (
        this.MapObject.getView().getResolution() * 3779.5275590551
      ).toFixed(4) // 这里使用了View中的getResolution方法获得当前View的分辨率。
    },
    mousePosition(className, target, coordinateFormat) {
      return new MousePosition({
        projection: 'EPSG:4326',
        className: className,
        target: target,
        coordinateFormat: coordinateFormat,
        undefinedHTML: '&nbsp;',
      })
    },
    exchangeStyle(type) {
      // 1-影像 2-矢量
      if (type == 1) {
        $('#wrapBox').css('color', 'white')
        $('.custom-mouse-position').css('color', 'white')
        $('.custom-mouse-position2').css('color', 'white')
      }
      if (type == 2) {
        $('#wrapBox').css('color', 'black')
        $('.custom-mouse-position').css('color', 'black')
        $('.custom-mouse-position2').css('color', 'black')
      }
    },
    init() {
      setTimeout(() => {
        this.MapObject = this.$parent.MapObject
        let coordinateFormatSjz = createStringXY(3)
        let targetSjz = document.getElementById('mouse-position')
        let sjzControl = this.mousePosition(
          'custom-mouse-position',
          targetSjz,
          coordinateFormatSjz
        )
        const coordinateFormatDfm = function (coord) {
          return toStringHDMS([coord[1], coord[0]])
        }
        let targetDfm = document.getElementById('mouse-position2')
        let dfmControl = this.mousePosition(
          'custom-mouse-position2',
          targetDfm,
          coordinateFormatDfm
        )
        this.MapObject.addControl(sjzControl)
        this.MapObject.addControl(dfmControl)
        this.addScale()
        this.exchangeStyle(this.mapType)
      }, 100)
    },
  },
  mounted() {
    this.init()
  },
}
</script>

<style scoped>
#wrapBox {
  z-index: 5;
  position: absolute;
  bottom: 10px;
  left: 20px;
  color: black;
}
#mousePosition > div,
#scaleLine {
  font-family: '微软雅黑';
  font-weight: bold;
  font-size: 14px;
  line-height: 30px;
  width: 300px;
  display: flex;
}
#mousePosition > div > div {
  width: 200px;
  float: right;
  font-family: '微软雅黑';
  font-weight: bold;
  font-size: 12px;
}
.custom-mouse-position {
  float: right;
  position: absolute;
  bottom: 0px;
  width: 230px;
  height: 20px;
  z-index: 2000;
  color: black;
  left: 65px;
}
.custom-mouse-position2 {
  float: right;
  position: absolute;
  bottom: 0px;
  width: 350px;
  height: 20px;
  z-index: 2000;
  color: black;
  left: 65px;
}
</style>
