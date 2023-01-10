import $ from 'jquery'
import { Loading } from 'element-ui';
import { Message } from 'element-ui';
// 请求地址
const baseURL = 'http://127.0.0.1:8080/geoTools'

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

function getUrl(type) {
  let url = '';
  switch (type) {
    case 1: url += '/contour'
      break;
    case 2: url += '/slope'
      break;
    case 3: url += '/aspect'
      break;
    case 4: url += '/factors'
      break;
    case 5: url += '/lineView'
      break;
    case 6: url += '/viewShed'
      break;
    default: url = null
      break;
  }
  return url
}
function getParamsObj(type, params) {
  let paramsObj = {};
  switch (type) {
    case 1: paramsObj.geoJson = params.geoJson
      paramsObj.interval = params.interval
      break;
    case 2: paramsObj.geoJson = params.geoJson
      break;
    case 3: paramsObj.geoJson = params.geoJson
      break;
    case 4: paramsObj.point = params.pointStr
      break;
    case 5: paramsObj.lineCoordinates = params.lineCoordinates
      break;
    case 6: paramsObj.geoJson = params.viewShedGeojson
      paramsObj.viewPoint = params.viewPoint
      break;
    default: paramsObj = null
      break;
  }
  return paramsObj
}

export function gpService(type, paramsObj, callBack) {
  let _url = getUrl(type)
  let _paramsObj = getParamsObj(type, paramsObj)
  if (!_url || !_paramsObj) {
    !_url ? Message({
      showClose: true,
      message: 'gpservice url is null',
      type: 'error'
    }) : ''
    !_paramsObj ? Message({
      showClose: true,
      message: 'wrong params is null',
      type: 'error'
    }) : ''
    return
  }
  $.ajax({
    url: baseURL + _url,
    type: 'post',
    crossDomain: true,
    dataType: 'json',
    data: _paramsObj,
    beforeSend: () => {
      createLoading('正在分析')
    },
    complete: function () {
      loading.close();
    },
    success: function (data) {
      if (data.code == 0) callBack(data.data)
      else Message({
        showClose: true,
        message: data.msg,
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


