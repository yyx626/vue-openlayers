<template>
  <div class="wrapDiv">
    <!-- 工具条 -->
    <el-button-group class="toolBarBox">
      <el-button icon="el-icon-edit" @click="showPanel(1)">地形分析</el-button>
      <el-button icon="el-icon-edit" @click="showPanel(2)">测量</el-button>
      <el-button icon="el-icon-delete" @click="clear">清空</el-button>
    </el-button-group>

    <!-- 地形分析 -->
    <div class="dxfx-control-panel">
      <!-- 选择分析类型 -->
      <el-radio-group v-model="dxfxType" @change="dxfxTypeChange" size="small">
        <el-radio-button :label="1">等高线分析</el-radio-button>
        <el-radio-button :label="2">坡度分析</el-radio-button>
        <el-radio-button :label="3">坡向分析</el-radio-button>
        <el-radio-button :label="4">地形因子</el-radio-button>
        <el-radio-button :label="5">视线分析</el-radio-button>
        <el-radio-button :label="6">视域分析</el-radio-button>
      </el-radio-group>
      <!-- <el-row>
        <el-col :span=""></el-col>
      </el-row> -->
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
    <div class="dxfx-legend-panel">
      <el-row class="dxfx-legend-header">
        <el-col :span="2"
          ><i class="el-icon-close" @click="hideLegend"></i
        ></el-col>
        <el-col :span="8">
          <span style="margin-right: 8px">{{ legendTitle }}</span>
        </el-col>
        <el-col :span="14">
          <span style="margin-right: -90px">信息面板</span>
        </el-col>
      </el-row>
      <el-row>
        <el-divider content-position="left">分析说明</el-divider>
        <el-col :span="24">
          <span>{{ dxfxDescription }}</span>
        </el-col>
      </el-row>
      <el-row>
        <el-divider content-position="left">图例说明</el-divider>
        <el-col class="dxfx-legend-tlsm"> </el-col>
      </el-row>
    </div>
    <el-button
      class="dxfx-legend-btn"
      type="primary"
      icon="el-icon-message"
      circle
      @click="openDxfxLegend"
    ></el-button>
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
import { Style, Icon, Stroke, Fill, Text } from 'ol/style'
import { Draw } from 'ol/interaction'
import { unByKey } from 'ol/Observable'
import { createBox, createRegularPolygon } from 'ol/interaction/Draw'
import GeoJSON from 'ol/format/GeoJSON'
import { gpService } from '@/api/gpService'
export default {
  name: 'ToolBar',
  watch: {
    currentTool(current, old) {
      old ? this.hidePanel(old) : ''
    },
  },
  data() {
    return {
      MapObject: null,
      currentTool: null,
      layer: null,
      gpSource: null,
      gpLayer: null,
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
      drawControl: null,
      sketch: null,
      drawRes: {},
      listener: null,
      clearLast: false,
      geoJsonObj: new GeoJSON(),
      gpStyles: {
        Point: new Style({
          image: new Icon({
            src: require('@/assets/img/mark_b.png'),
            anchor: [0.5, 1],
          }),
        }),
        LineString: new Style({
          stroke: new Stroke({
            color: 'orange',
            width: 1,
          }),
          text: new Text({
            offsetX: 0,
            offsetY: 0,
            textAlign: 'center',
            text: '',
          }),
        }),
        Polygon: new Style({
          stroke: new Stroke({
            color: 'rgba(255,255,255,0.2)',
            width: 0.5,
          }),
          text: new Text({
            offsetX: 0,
            offsetY: 0,
            textAlign: 'center',
            text: '',
          }),
          fill: new Fill({
            color: 'rgba(0,0,255,0.1)',
          }),
        }),
        Circle: new Style({
          stroke: new Stroke({
            color: 'red',
            width: 1,
          }),
          fill: new Fill({
            color: 'rgba(255,0,0,0.2)',
          }),
        }),
      },
      legendTitle: null,
      dxfxDescription: null,
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
          $('.dxfx-control-panel').hide()
          $('.dxfx-legend-panel').hide()
          $('.dxfx-legend-btn').hide()
          break
        case 2:
          $('.cl-control-panel').hide()
          break
        default:
          break
      }
    },
    hideLegend() {
      $('.dxfx-legend-panel').hide(350)
      $('.dxfx-legend-btn').show()
    },
    showPanel(lx) {
      switch (lx) {
        case 1:
          $('.dxfx-control-panel').animate({ height: 'toggle' }, 150)
          break
        case 2:
          $('.cl-control-panel').animate({ height: 'toggle' }, 150)
          break
        default:
          break
      }
      this.currentTool = lx
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
          maxPoints: type == 2 && this.currentTool == 1 ? 2 : '',
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
            src: require('@/assets/img/mark_b.png'),
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
      this.drawType == 2
        ? (this.paramsObj.lineCoordinates = `${
            data.feature.getGeometry().getCoordinates()[0][0]
          },${data.feature.getGeometry().getCoordinates()[0][1]},${
            data.feature.getGeometry().getCoordinates()[1][0]
          },${data.feature.getGeometry().getCoordinates()[1][1]}`)
        : ''
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
          if (res) {
            let fs = this.geoJsonObj.readFeatures(res)
            switch (this.dxfxType) {
              case 1:
                this.showContourRes(fs)
                break
              case 2:
                this.showSlopeRes(fs)
                break
              case 3:
                this.showAspectRes(fs)
                break
              case 4:
                // 地形因子
                break
              case 5:
                this.showLineOfSightRes(fs)
                break
              case 6:
                this.showViewShedRes(fs)
                break
              default:
                break
            }
          }
        })
      } else if (this.currentTool == 2) {
        // 测量
      }
    },
    addResToLayer(result) {
      this.clearGp()
      if (this.gpSource == null) {
        this.gpSource = new VectorSource({
          features: result,
          wrapX: false,
        })
        this.gpLayer = new VectorLayer({
          source: this.gpSource,
          style: this.gpStyleFunction,
        })
        this.MapObject.addLayer(this.gpLayer)
      } else {
        this.gpSource.addFeatures(result)
      }
    },
    gpStyleFunction(feature) {
      var style = this.gpStyles[feature.getGeometry().getType()]
      switch (this.dxfxType) {
        case 1: // 提取等高线
          style.getText().setText(feature.getProperties().value.toString())
          style.getStroke().setColor('orange')
          style.getStroke().setWidth(1)
          break
        case 2: // 坡度分析
          let val = feature.getProperties().gridCode
          let obj = { start: 1, end: 11 }
          let colorList = this.getColorList(obj)
          let color
          let text = ''
          if (val == 0) {
            color = colorList[0]
            text = '0'
          } else if (val <= 10) {
            color = colorList[1]
            text = '0-10'
          } else if (val <= 20) {
            color = colorList[2]
            text = '10-20'
          } else if (val <= 30) {
            color = colorList[3]
            text = '20-30'
          } else if (val <= 40) {
            color = colorList[4]
            text = '30-40'
          } else if (val <= 50) {
            color = colorList[5]
            text = '40-50'
          } else if (val <= 60) {
            color = colorList[6]
            text = '50-60'
          } else if (val <= 70) {
            color = colorList[7]
            text = '60-70'
          } else if (val <= 80) {
            color = colorList[8]
            text = '70-80'
          } else if (val <= 90) {
            color = colorList[9]
            text = '80-90'
          } else {
            color = colorList[10]
            text = '其他'
          }
          text = '坡度: '
          let c = color
            .split('rgb')[1]
            .replace('(', '')
            .replace(')', '')
            .split(',') // [229,9,42,0.5]
          c = [c[0], c[1], c[2], 0.6]
          style.getFill().setColor(c)
          break
        case 3: // 坡向分析
          let val1 = feature.getProperties().gridCode
          let text1 = ''
          let obj1 = { start: 1, end: 9 }
          let colorList1 = this.getColorList(obj1)
          let color1
          if ((val1 > 0 && val1 <= 22.5) || (val1 > 337.5 && val1 <= 360)) {
            color1 = colorList1[0]
            text1 = '北坡'
          } else if (val1 > 22.5 && val1 <= 67.5) {
            color1 = colorList1[1]
            text1 = '东北坡'
          } else if (val1 > 67.5 && val1 <= 112.5) {
            color1 = colorList1[2]
            text1 = '东坡'
          } else if (val1 > 112.5 && val1 <= 157.5) {
            color1 = colorList1[3]
            text1 = '东南坡'
          } else if (val1 > 157.5 && val1 <= 202.5) {
            color1 = colorList1[4]
            text1 = '南坡'
          } else if (val1 > 202.5 && val1 <= 247.5) {
            color1 = colorList1[5]
            text1 = '西南坡'
          } else if (val1 > 247.5 && val1 <= 292.5) {
            color1 = colorList1[6]
            text1 = '西坡'
          } else if (val1 > 292.5 && val1 <= 337.5) {
            color1 = colorList1[7]
            text1 = '西北坡'
          } else {
            color1 = colorList1[8]
            text1 = '平坦地区'
          }
          let c1 = color1
            .split('rgb')[1]
            .replace('(', '')
            .replace(')', '')
            .split(',') // [229,9,42,0.5]
          c1 = [c1[0], c1[1], c1[2], 0.5]
          style.getFill().setColor(c1)
          break
        case 4: // 地形因子
          break
        case 5: // 视线分析
          let ifViewLine = ''
          if (feature.getProperties().visCode == 2) {
            style.getStroke().setColor([229, 9, 42, 0.5])
            ifViewLine = '不可见'
          } else {
            style.getStroke().setColor([25, 234, 20, 0.5])
            ifViewLine = '可见'
          }
          style.getStroke().setWidth(3)
          style.getText().setText(ifViewLine)
          break
        case 6: // 视域分析
          if (feature.getProperties().gridCode == 0) {
            style.getFill().setColor([229, 9, 42, 0.5])
          } else {
            style.getFill().setColor([25, 234, 20, 0.5])
          }
          break
        default:
          break
      }
      return style
    },
    getColorList(rules) {
      let color = [
        'rgb(205,101,82)',
        'rgb(79,228,18)',
        'rgb(42,236,199)',
        'rgb(72,113,9)',
        'rgb(21,89,236)',
        'rgb(124,21,236)',
        'rgb(126,95,105)',
        'rgb(236,21,86)',
        'rgb(144,141,84)',
        'rgb(74,97,95)',
        'rgb(29,28,27)',
        'rgb(227,250,21)',
      ]
      if (typeof rules == undefined || rules == '' || rules == null)
        return color
      let start = rules.start
      let end = rules.end
      let result = new Array()
      for (let i = start - 1; i <= end - 1; i++) {
        result.push(color[i])
      }
      return result
    },
    showContourRes(result) {
      // 添加分析结果到GP图层
      this.addResToLayer(result)
      // 构造图例
      let pxObj = ['等高线']
      var otherColorList = ['orange']
      let tlOptions = new Array()
      for (let k in otherColorList) {
        if (k != 'unique') {
          let o = { color: otherColorList[k], text: pxObj[k], id: 'pdfxtl' + k }
          tlOptions.push(o)
        }
      }
      var tmOptions = { title: '等高线分析', ms: '等高线分析[单位：米]' }
      this.showLegendPanel(tmOptions, tlOptions)
    },
    showSlopeRes(result) {
      this.addResToLayer(result)
      // 构造图例
      let tlOptions = new Array()
      let obj = { start: 1, end: 11 }
      let pxObj = [
        '0',
        '0-10',
        '10-20',
        '20-30',
        '30-40',
        '40-50',
        '50-60',
        '60-70',
        '70-80',
        '80-90',
        '90',
      ]
      let otherColorList = this.getColorList(obj)
      for (let k in otherColorList) {
        if (k != 'unique') {
          let o = { color: otherColorList[k], text: pxObj[k], id: 'pdfxtl' + k }
          tlOptions.push(o)
        }
      }
      var tmOptions = { title: '坡度分析', ms: '坡度分析[单位：度]' }
      this.showLegendPanel(tmOptions, tlOptions)
    },
    showAspectRes(result) {
      this.addResToLayer(result)
      // 构造图例
      let tlOptions = new Array()
      let obj = { start: 1, end: 9 }
      let pxObj = [
        '北坡',
        '东北坡',
        '东坡',
        '东南坡',
        '南坡',
        '西南坡',
        '西坡',
        '西北坡',
        '平坦地区',
      ]
      let otherColorList = this.getColorList(obj)
      for (let k in otherColorList) {
        if (k != 'unique') {
          let o = { color: otherColorList[k], text: pxObj[k], id: 'pdfxtl' + k }
          tlOptions.push(o)
        }
      }
      var tmOptions = { title: '坡向分析', ms: '坡向分析按八个方向的方式显示' }
      this.showLegendPanel(tmOptions, tlOptions)
    },
    showLineOfSightRes(result) {
      this.addResToLayer(result)
      let tlOptions = new Array()
      let pxObj = ['可见', '不可见']
      let otherColorList = ['green', 'red']
      for (let k in otherColorList) {
        if (k != 'unique') {
          let o = { color: otherColorList[k], text: pxObj[k], id: 'pdfxtl' + k }
          tlOptions.push(o)
        }
      }
      var tmOptions = { title: '视线分析', ms: '视线分析' }
      this.showLegendPanel(tmOptions, tlOptions)
    },
    showViewShedRes(result) {
      this.addResToLayer(result)
      // 显示观察点
      this.showObservePoint()
      // 构造图例
      let tlOptions = new Array()
      let pxObj = ['可见', '不可见']
      let otherColorList = ['green', 'red']
      for (let k in otherColorList) {
        if (k != 'unique') {
          let o = { color: otherColorList[k], text: pxObj[k], id: 'pdfxtl' + k }
          tlOptions.push(o)
        }
      }
      var tmOptions = { title: '视域分析', ms: '视域分析' }
      this.showLegendPanel(tmOptions, tlOptions)
    },
    showObservePoint() {
      this.pointFeatureArray[0].setStyle(
        new Style({
          image: new Icon({
            src: require('@/assets/img/observe.png'),
            anchor: [0.5, 1],
          }),
        })
      )
      this.gpSource.addFeature(this.pointFeatureArray[0])
    },
    clear() {
      this.layer.getSource().clear()
      if (this.gpSource != null) this.gpSource.clear()
      this.pointFeatureArray = []
      this.viewShedFeatureArray = []
      this.hideLegend()
      $('.dxfx-legend-btn').hide()
    },
    clearGp() {
      if (this.gpSource != null) this.gpSource.clear()
      this.layer.getSource().clear() //清除绘制
      // 打开图例
    },
    openDxfxLegend() {
      $('.dxfx-legend-panel').show(350)
      $('.dxfx-legend-btn').hide()
    },
    showLegendPanel(tmOptions, tlOptions) {
      $('.dxfx-legend-panel').show(350)
      this.legendTitle = tmOptions.title
      this.dxfxDescription = tmOptions.ms
      $('.dxfx-legend-tlsm').html('')
      tlOptions.forEach((v, i) => {
        let divStr = `<div style="display:flex;margin-top:2px;margin-left:40px">
                        <div style="width:35px;height:20px;background-color:${v.color}"></div>
                        <span style="margin-left:20px">${v.text}</span>
                      </div>`
        $('.dxfx-legend-tlsm').append(divStr)
      })
    },
    measure() {},
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
  position: absolute;
  margin-top: 10px;
  padding-top: 30px;
  padding-bottom: 30px;
  width: 100%;
  background: rgba($color: #ffffff, $alpha: 0.9);
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  z-index: 5;
  display: none;
}
.cl-control-panel {
  position: absolute;
  margin-top: 10px;
  padding-top: 30px;
  padding-bottom: 30px;
  width: 100%;
  background: rgba($color: #ffffff, $alpha: 0.9);
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
.dxfx-legend-panel {
  padding: 10px;
  position: absolute;
  width: 280px;
  bottom: -760px;
  right: 0;
  background: rgba($color: #ffffff, $alpha: 0.9);
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  z-index: 5;
  display: none;
}
.dxfx-legend-btn {
  position: absolute;
  bottom: -760px;
  right: 0;
  z-index: 4;
  display: none;
}
.el-icon-close {
  cursor: pointer;
}
</style>
