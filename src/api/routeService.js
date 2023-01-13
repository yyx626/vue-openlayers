import $ from 'jquery'
import { Loading } from 'element-ui';
import { Message } from 'element-ui';
import MapConfig from '@/config/MapConfig'
// 请求地址
const baseURL = 'http://api.tianditu.gov.cn'

let loading;
function createLoading(text) {
  const loadingObj = Loading.service({
    lock: true,
    text: text,
    spinner: 'el-icon-loading',
    background: 'rgba(0, 0, 0, 0.7)',
  });
  loading = loadingObj
}

export function geocoder(jwd,callBack) {
  $.ajax({
    url: `${baseURL}/geocoder?postStr={'lon':${jwd[0]},'lat':${jwd[1]},'ver':1}&type=geocode&tk=${MapConfig.tdtKey}`,
    type: 'get',
    crossDomain: true,
    beforeSend: () => {
      document.querySelector("body").style.cursor= 'wait'
    },
    complete: function () {
      document.querySelector("body").style.cursor= 'default'
    },
    success: function (data) {
      let resData = JSON.parse(data)
      if(resData.status == 0) callBack(resData.result)
      else Message({
        showClose: true,
        message: resData.msg,
        type: 'error'
      });
    },
    error: function (msg) {
      Message({
        showClose: true,
        message: msg,
        type: 'error'
      });
    }
  });
}