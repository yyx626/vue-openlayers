<template>
  <div class="toolBarBox">
    <el-button-group>
      <el-button icon="el-icon-edit"></el-button>
      <el-button icon="el-icon-share"></el-button>
      <el-button icon="el-icon-delete"></el-button>
    </el-button-group>
  </div>
</template>

<script>
import $ from 'jquery'
export default {
  name: 'ToolBar',
  data() {
    return {

    }
  },
  methods: {

  },
  mounted() {
    
  },
}
</script>

<style scoped>
.toolBarBox {
  z-index: 5;
  position: absolute;
  right: 25px;
  top: 30px;
} 
</style>
