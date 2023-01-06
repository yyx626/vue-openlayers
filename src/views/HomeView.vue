<template>
  <div id="main">
    <map-component :currentMap="currentMap" ref="getData"></map-component>
  </div>
</template>
 
<script>
import MapComponent from '@/components/GIS/MapComponent'

export default {
  components: { MapComponent },
  data() {
    return {
      currentMap: 2,
    }
  },
  mounted() {},
}
</script>
 
<style scoped>
#main {
  width: 100%;
  height: 100%;
}
</style>