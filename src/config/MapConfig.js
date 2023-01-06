export default class MapConfig {
  // 天地图 授权
  static tdtKey = '59b3ec18eb7e3eb6bdfdf60a5c692c9f';
  static baseURL = 'http://t{0-7}.tianditu.gov.cn/DataServer?x={x}&y={y}&l={z}';
  // 地图类型
  static type = {
    imgLayer: 'img_c',
    vecLayer: 'vec_c',
    cvaLayer: 'cva_c', // 矢量注记
    ciaLayer: 'cia_c'  // 影像注记
  }
  // 初始化缩放层级
  static initZoom = 9;
  // 初始化定位中心
  static initCenter = [122.177343, 41.128599];
  // 投影
  static projection = 'EPSG:4326';

  // 图片
  // static shouye = require('../assets/images/blue.png');
}

