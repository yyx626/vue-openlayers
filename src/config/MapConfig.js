export default class MapConfig {
  // 初始化缩放层级
  static initZoom = 15;
  // 初始化定位中心
  static initCenter = [117.169, 31.843];//[122.177343, 41.128599];
  // 投影
  static projection = 'EPSG:4326';

  // 图片
  // static shouye = require('../assets/images/blue.png');

  /**
   * 天地图 底图
   */
  static tdtKey = '59b3ec18eb7e3eb6bdfdf60a5c692c9f';
  // 天地图矢量底图
  static tdtVecUrl = `http://t{0-7}.tianditu.gov.cn/DataServer?x={x}&y={y}&l={z}&T=vec_c&tk=${MapConfig.tdtKey}`;
  // 天地图矢量注记
  static tdtCvaUrl = `http://t{0-7}.tianditu.gov.cn/DataServer?x={x}&y={y}&l={z}&T=cva_c&tk=${MapConfig.tdtKey}`;
  // 天地图影像底图
  static tdtImgUrl = `http://t{0-7}.tianditu.gov.cn/DataServer?x={x}&y={y}&l={z}&T=img_c&tk=${MapConfig.tdtKey}`;
  // 天地图影像注记
  static tdtCiaUrl = `http://t{0-7}.tianditu.gov.cn/DataServer?x={x}&y={y}&l={z}&T=cia_c&tk=${MapConfig.tdtKey}`;

  /**
   * Google Map
   */
  static

}

