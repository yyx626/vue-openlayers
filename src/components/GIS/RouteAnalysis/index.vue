<template>
  <!-- 路线分析 -->
  <div class="wrapBox">
    <el-input
      placeholder="Search Map"
      v-model="searchInput"
      class="input-with-select"
    >
      <el-tooltip
        class="item"
        effect="dark"
        content="menu"
        placement="bottom"
        slot="prepend"
      >
        <el-button icon="el-icon-menu"></el-button>
      </el-tooltip>
      <div slot="append">
        <el-tooltip
          class="item"
          effect="dark"
          content="search"
          placement="bottom"
          style="margin-right: -10px"
        >
          <el-button icon="el-icon-search"></el-button>
        </el-tooltip>
        <el-divider direction="vertical"></el-divider>
        <el-tooltip
          class="item"
          effect="dark"
          content="route"
          placement="bottom"
          style="margin-left: -10px"
        >
          <el-button
            icon="el-icon-discover"
            @click="showRoutePanel = true"
          ></el-button>
        </el-tooltip>
      </div>
    </el-input>
  </div>
</template>

<script>
import $ from 'jquery'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { geocoder } from '@/api/routeService'
export default {
  name: 'RouteAnalysis',
  data() {
    return {
      MapObject: null,
      routeLayer: null,
      searchInput: null,
      showRoutePanel: false,
    }
  },
  computed: {},
  watch: {
    showRoutePanel(current, old) {
      // current ? this.hidePanel(old) : ''
    },
  },
  methods: {
    init() {
      setTimeout(() => {
        this.MapObject = this.$parent.MapObject
        this.routeLayer = new VectorLayer({
          source: new VectorSource({ wrapX: false }),
          properties: {
            id: 'routeLayer',
          },
        })
        this.MapObject.addLayer(this.routeLayer)
        this.initMapEvent()
      }, 100)
    },
    mapDbClickEvent(e) {
      let coord = e.coordinate
      geocoder(coord, (res) => {
        console.log(res)
        this.$notify({
          title: 'INFO',
          position: 'bottom-right',
          dangerouslyUseHTMLString: true,
          // duration: 0,
          message: `
        <div>Address: ${res.formatted_address}</div>
        <div>Location: ${res.location.lon.toFixed(4)}, ${res.location.lat.toFixed(4)}</div>
        `,
        })
      })
    },
    initMapEvent() {
      this.$parent.mapDbClick(this.mapDbClickEvent)
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
  left: 90px;
  top: 20px;
  // width: 300px;
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.3);
}
</style>
