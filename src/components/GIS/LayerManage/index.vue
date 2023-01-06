<template>
  <!-- 地图类型面板盒子 -->
  <div class="mapTypeBox" id="id-div-all-layer">
    <div>
      <i class="el-icon-s-operation"></i>
    </div>
    <!-- 显示已选择的地图-->
    <span id="id-span-first-layer" style="display: none">
      <div
        id="yxtypeBox"
        class="typeBox"
        xh="0101"
        lx="1"
        @click="exchangeClick($event)"
      >
        <img src="http://lbs.tianditu.gov.cn/images/img_c.png" />
        <div class="typeWordBox">
          <label class="typxWord" id="yxWord">影像底图</label>
        </div>
      </div>
    </span>
    <!--  隐藏起来的  -->
    <span id="allTcSlt" style="display: none" lx="1">
      <div
        xh="30"
        lx="2"
        id="sltypeBox"
        class="typeBox"
        style="margin-top: 10px"
        @click="exchangeClick($event)"
      >
        <img src="http://lbs.tianditu.gov.cn/images/vec_c.png" />
        <div class="typeWordBox">
          <label class="typxWord" id="slWord">矢量底图</label>
        </div>
      </div>
    </span>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  name: 'LayerManage',
  data() {
    return {
      currentMap: null,
    }
  },
  computed: {
    mapType() {
      return this.currentMap
    },
  },
  watch: {
    mapType(newValue) {
      this.exchangeStyle(newValue)
      this.$parent.setCurrentMapType(newValue)
    },
  },
  methods: {
    init() {
      $('#id-div-all-layer')
        .mouseover(function () {
          var spans1 = $('#id-span-first-layer')
          for (var i in spans1) {
            spans1.eq(i).show()
          }
          var spans = $('#allTcSlt')
          for (var i in spans) {
            spans.eq(i).show()
          }
        })
        .mouseout(function () {
          var spans1 = $('#id-span-first-layer')
          for (var i in spans1) {
            spans1.eq(i).hide()
          }
          var spans = $('#allTcSlt')
          for (var i in spans) {
            spans.eq(i).hide()
          }
        })
      setTimeout(() => {
        this.currentMap = this.$parent.currentMap
      }, 100)
    },
    exchangeStyle(type) {
      // 1-影像 2-矢量
      if (type == 1) {
        $('#yxWord').css('background-color', 'red')
        $('#yxtypeBox').css('border-color', 'red')
        $('#slWord').css('background-color', '#0075c2')
        $('#sltypeBox').css('border-color', '#0075c2')
      }
      if (type == 2) {
        $('#slWord').css('background-color', 'red')
        $('#sltypeBox').css('border-color', 'red')
        $('#yxWord').css('background-color', '#0075c2')
        $('#yxtypeBox').css('border-color', '#0075c2')
      }
    },
    exchangeClick(e) {
      var _this = e.currentTarget
      var lx = $(_this).attr('lx')
      if (lx == '1') {
        this.currentMap = 1
        this.$parent.vecLayer.setVisible(false)
        this.$parent.cvaLayer.setVisible(false)
        this.$parent.imgLayer.setVisible(true)
        this.$parent.ciaLayer.setVisible(true)
      } else if (lx == '2') {
        this.currentMap = 2
        this.$parent.vecLayer.setVisible(true)
        this.$parent.cvaLayer.setVisible(true)
        this.$parent.imgLayer.setVisible(false)
        this.$parent.ciaLayer.setVisible(false)
      }
    },
  },
  mounted() {
    this.init()
  },
}
</script>

<style lang="scss" scoped>
.mapTypeBox {
  border: 0;
  width: 68px;
  height: 68px;
  position: absolute;
  left: 20px;
  top: 20px;
  z-index: 200;
  cursor: pointer;
  .el-icon-s-operation {
    font-size: 30px;
    font-weight: bold;
    color: #0092f1;
  }
}
.mapTypeBox > span {
  display: inline-block;
  width: 100%;
  height: 100%;
}
.mapTypeBox > span > .typeBox {
  width: 100%;
  height: 100%;
  border: 2px solid #0075c2;
  position: relative;
  margin: 0 !important;
}
.mapTypeBox > span > .typeBox > img {
  width: 100%;
  height: 100%;
}
.mapTypeBox > span > .typeBox > .typeWordBox {
  color: black;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 16px;
  line-height: 16px;
  text-align: center;
}
.mapTypeBox > span > .typeBox > .typeWordBox > .typxWord {
  background-color: #0075c2;
  display: block;
  position: absolute;
  bottom: 0;
  width: 100%;
  font-size: 14px;
  font-weight: bold;
}
.mapTypeBox > span > .typeBox:hover {
  border: 2px solid #234267;
}

.mapTypeBox > span > .typeBox:hover > .typeWordBox > .typxWord {
  background-color: #234267;
  color: #fff;
}

#allTcSlt {
  right: 10px;
  top: 78px;
}
</style>
