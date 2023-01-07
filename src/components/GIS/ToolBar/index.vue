<template>
  <div class="wrapDiv">
    <!-- 工具条 -->
    <el-button-group class="toolBarBox">
      <el-button icon="el-icon-edit" @click="hidePanel(1)">地形分析</el-button>
      <el-button icon="el-icon-edit" @click="hidePanel(2)">测量</el-button>
      <el-button icon="el-icon-delete" @click="clear">清空</el-button>
    </el-button-group>

    <!-- 地形分析 -->
    <div class="dxfx-control-panel">
      <!-- 选择分析类型 -->
      <el-radio-group v-model="dxfxType" @change="dxfxTypeChange">
        <el-radio :label="1">等高线分析</el-radio>
        <el-radio :label="2">坡度分析</el-radio>
        <el-radio :label="3">坡向分析</el-radio>
        <el-radio :label="4">地形因子</el-radio>
        <el-radio :label="5">视线分析</el-radio>
        <el-radio :label="6">视域分析</el-radio>
      </el-radio-group>
      <!-- 选择绘制类型 -->
      <el-select
        v-model="selectDrawType"
        placeholder="请选择绘制类型"
        class="lx-select"
        @change="dxfxDrawTypeChange"
        @visible-change="dxfxSelectVisibleChange"
      >
        <el-option
          v-for="item in tempDrawTypeArray"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <!-- 等高线间距 -->
      <div class="intervalBox">
        <el-input
          class="intervalInput"
          placeholder="请输入等高线间距"
          v-model="contourInterval"
          v-show="showInterval"
          clearable
        >
        </el-input>
      </div>
      <!-- 视域分析 -->
      <div class="viewShedBox" v-show="showViewShed">
        <el-button round icon="el-icon-location" @click="setPoint"
          >观测点</el-button
        >
      </div>
      <!-- 绘制开关 -->
      <el-switch
        style="display: block"
        v-model="isStartDraw"
        active-color="#13ce66"
        inactive-color="#ff4949"
        active-text="开启绘制"
        inactive-text="关闭绘制"
        class="cl-switch"
        @change="drawSwitchChange"
      >
      </el-switch>
    </div>

    <!-- 地形分析结果展示图例 -->
    
    <!-- 测量 -->
    <div class="cl-control-panel">
      <el-radio-group v-model="measureType">
        <el-radio :label="1">测距</el-radio>
        <el-radio :label="2">测面</el-radio>
      </el-radio-group>
      <!-- 选择绘制类型 -->
      <el-select
        v-model="selectDrawType"
        placeholder="请选择绘制类型"
        class="lx-select"
        @change="measureDrawTypeChange"
      >
        <el-option
          v-for="item in drawTypeArray"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        >
        </el-option>
      </el-select>
      <!-- 绘制开关 -->
      <el-switch
        style="display: block"
        v-model="isStartDraw"
        active-color="#13ce66"
        inactive-color="#ff4949"
        active-text="开启绘制"
        inactive-text="关闭绘制"
        class="cl-switch"
        @change="drawSwitchChange"
      >
      </el-switch>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Icon } from 'ol/style'
import { Draw } from 'ol/interaction'
import { unByKey } from 'ol/Observable'
import { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import GeoJSON from 'ol/format/GeoJSON'
import { gpService } from '@/api/gpService'
export default {
  name: 'ToolBar',
  watch: {
    currentTool(current) {
      // this.hidePanel(current)
      console.log(current)
    },
  },
  data() {
    return {
      MapObject: null,
      currentTool: null,
      measureType: 1,
      dxfxType: null,
      showViewShed: false,
      showInterval: false,
      isStartDraw: true,
      contourInterval: 20,
      pointFeatureArray: [],
      viewShedFeatureArray: [],
      tempDrawTypeArray: [],
      drawTypeArray: [
        {
          value: 1,
          label: '点',
        },
        {
          value: 2,
          label: '线',
        },
        {
          value: 3,
          label: '圆形',
        },
        {
          value: 4,
          label: '矩形',
        },
        {
          value: 5,
          label: '多边形',
        },
        {
          value: 6,
          label: '自由曲面',
        },
      ],
      paramsObj: {},
      selectDrawType: null,
      drawType: null,
      layer: null,
      drawControl: null,
      sketch: null,
      drawRes: {},
      listener: null,
      clearLast: false,
      geoJsonObj: new GeoJSON(),
    }
  },
  methods: {
    init() {
      setTimeout(() => {
        this.MapObject = this.$parent.MapObject
        this.layer = new VectorLayer({
          source: new VectorSource({ wrapX: false }),
          properties: {
            id: 'drawLayer',
          },
        })
        this.MapObject.addLayer(this.layer)
      }, 100)
    },
    hidePanel(type) {
      switch (type) {
        case 1:
          $('.dxfx-control-panel').animate({ height: 'toggle' }, 150)
          this.currentTool = 1
          break
        case 2:
          $('.cl-control-panel').animate({ height: 'toggle' }, 150)
          this.currentTool = 2
          break
        default:
          break
      }
    },
    showDxfxPanel() {
      this.currentTool ? this.hidePanel(this.currentTool) : ''
      this.currentTool = 1
      $('.dxfx-control-panel').animate({ height: 'toggle' }, 150)
    },
    showClPanel() {
      this.currentTool ? this.hidePanel(this.currentTool) : ''
      this.currentTool = 2
      $('.cl-control-panel').animate({ height: 'toggle' }, 150)
    },
    setDxfxDrawType(dxfxType) {
      if (dxfxType == 1) {
        this.showInterval = true
      } else {
        this.showInterval = false
      }
      if (dxfxType == 1 || dxfxType == 2 || dxfxType == 3) {
        this.showViewShed = false
        this.tempDrawTypeArray = this.drawTypeArray.filter(
          (item) => item.value >= 3
        )
      } else if (dxfxType == 4) {
        this.showViewShed = false
        this.tempDrawTypeArray = this.drawTypeArray.filter(
          (item) => item.value == 1
        )
      } else if (dxfxType == 5) {
        this.showViewShed = false
        // 视线分析
        this.tempDrawTypeArray = this.drawTypeArray.filter(
          (item) => item.value == 2
        )
      } else if (dxfxType == 6) {
        this.showViewShed = true
        this.clear()
        // 视域分析
        this.tempDrawTypeArray = this.drawTypeArray.filter(
          (item) => item.value > 2
        )
      }
    },
    dxfxTypeChange() {
      this.selectDrawType = null
      this.drawControl ? this.MapObject.removeInteraction(this.drawControl) : ''
      this.setDxfxDrawType(this.dxfxType)
    },
    measureDrawTypeChange() {
      if (this.selectDrawType && this.isStartDraw) {
        this.draw(this.selectDrawType)
      }
    },
    dxfxDrawTypeChange() {
      this.isStartDraw = true
      if (this.selectDrawType && this.isStartDraw) {
        this.draw(this.selectDrawType)
      }
    },
    dxfxSelectVisibleChange(value) {
      value && this.tempDrawTypeArray.length == 0
        ? this.$message.info('请先选择地形分析类型')
        : ''
    },
    drawSwitchChange() {
      if (this.isStartDraw) {
        !this.selectDrawType
          ? this.$message.warning('请选择绘制类型')
          : this.draw(this.selectDrawType)
      } else {
        this.MapObject.removeInteraction(this.drawControl)
      }
    },
    setPoint() {
      this.isStartDraw = true
      this.draw(1)
    },
    draw(type) {
      // 视域分析观察点
      if (this.showViewShed && type == 1) {
        this.pointFeatureArray[0]
          ? this.layer.getSource().removeFeature(this.pointFeatureArray[0])
          : ''
        this.pointFeatureArray.pop()
      }
      if (this.showViewShed && type != 1) {
        this.viewShedFeatureArray[0]
          ? this.layer.getSource().removeFeature(this.viewShedFeatureArray[0])
          : ''
        this.viewShedFeatureArray.pop()
      }
      this.drawType = type
      this.drawControl ? this.MapObject.removeInteraction(this.drawControl) : ''
      return new Promise((resolve, reject) => {
        this.clearLast ? this.layer.getSource().clear() : ''
        let lx
        switch (type) {
          case 1:
            lx = 'Point'
            break
          case 2:
            lx = 'LineString'
            break
          case 3:
          case 4:
            lx = 'Circle'
            break
          case 5:
          case 6:
            lx = 'Polygon'
            break
          default:
            reject('wrong type')
            break
        }
        this.drawControl = new Draw({
          source: this.layer.getSource(),
          type: lx,
          style: this.getStyle(type),
          freehand: type == 6 ? true : false,
          geometryFunction:
            type == 4 ? createBox() : type == 3 ? createRegularPolygon(0) : '',
        })
        this.MapObject.addInteraction(this.drawControl)
        this.drawControl.on('drawstart', (evt) => {
          this.sketch = evt.feature
          this.listener = this.sketch.getGeometry().on('change', (evt) => {
            const geom = evt.target
            let output
          })
        })
        this.drawControl.on('drawend', (evt) => {
          // 视域分析观察点
          if (this.showViewShed && type == 1) {
            this.pointFeatureArray.push(evt.feature)
            this.drawControl && this.drawType == 1
              ? this.MapObject.removeInteraction(this.drawControl)
              : ''
            this.isStartDraw = false
          }
          // 视域分析区域
          if (this.showViewShed && type != 1) {
            this.viewShedFeatureArray.push(evt.feature)
            this.drawControl && this.drawType != 1
              ? this.MapObject.removeInteraction(this.drawControl)
              : ''
            this.isStartDraw = false
          }
          this.drawRes.feature = evt.feature
          this.drawRes.geoJson = this.geoJsonObj.writeFeatures([evt.feature])
          evt.feature.setStyle(this.getStyle(type))
          this.isStartDraw
            ? ''
            : this.MapObject.removeInteraction(this.drawControl)
          this.sketch = null
          unByKey(this.listener)
          // resolve(this.drawRes)
          // resolve(this.$parent.callBack('drawend', this.drawRes))
          resolve(this.drawCallBack(this.drawRes))
        })
        // this.modify.on('modifyend', (evt) => {
        //   let fs = evt.features
        //   fs.forEach((v, i) => {
        //     console.log(i, `id是${v.getId()}`)
        //     getAddress(v.getId(), v.getGeometry().getCoordinates())
        //   })
        //   createRes()
        // })
      })
    },
    getStyle(type) {
      if (type == 1) {
        return new Style({
          image: new Icon({
            src: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            anchor: [0.5, 1],
          }),
        })
      }
    },
    getGpParamsObj(data) {
      this.paramsObj.geoJson = JSON.stringify(data.geoJson)
      this.paramsObj.interval = parseFloat(this.contourInterval)
      this.paramsObj.pointStr = `${
        data.feature.getGeometry().getCoordinates()[0]
      },${data.feature.getGeometry().getCoordinates()[1]}`
      // this.paramsObj.lineCoordinates =
      this.paramsObj.viewPoint = this.pointFeatureArray[0]
        ? `${this.pointFeatureArray[0].getGeometry().getCoordinates()[0]},${
            this.pointFeatureArray[0].getGeometry().getCoordinates()[1]
          }`
        : ''
      this.paramsObj.viewShedGeojson = this.viewShedFeatureArray[0]
        ? JSON.stringify(
            this.geoJsonObj.writeFeatures([this.viewShedFeatureArray[0]])
          )
        : ''
    },
    drawCallBack(data) {
      if (this.currentTool == 1) {
        this.getGpParamsObj(data)
        gpService(this.dxfxType, this.paramsObj, (res) => {
          console.log(res)
        })
      } else if (this.currentTool == 2) {
        // 测量
      }
    },
    measure() {},
    clear() {
      this.layer.getSource().clear()
      this.pointFeatureArray = []
      this.viewShedFeatureArray = []
    },
  },
  mounted() {
    this.init()
  },
}
</script>

<style lang="scss" scoped>
.wrapDiv {
  border: 0;
  z-index: 5;
  position: absolute;
  right: 20px;
  top: 20px;
  width: 300px;
}
.toolBarBox {
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.3);
}
.dxfx-control-panel {
  margin-top: 10px;
  padding-top: 30px;
  padding-bottom: 30px;
  width: 100%;
  background: #ffffff;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  z-index: 5;
  display: none;
}
.cl-control-panel {
  margin-top: 10px;
  padding-top: 30px;
  padding-bottom: 30px;
  width: 100%;
  background: #ffffff;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  z-index: 5;
  display: none;
}
.lx-select,
.cl-switch {
  margin-top: 15px;
}
.intervalBox {
  width: 220px;
  padding-left: 40px;
  padding-top: 15px;
}
.viewShedBox {
  margin-top: 15px;
}
</style>
