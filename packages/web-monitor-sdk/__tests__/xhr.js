import './mock/web.env';
import {
  mockPerformanceResource,
  XMLConstructorEnum,
  mockBaseXhrApi,
} from './mock/mock';
import { overrideFetch, httpServer } from './mock/utils';
import webMonitorSdk from '../src/index';
const appId = 'appid_test';
const monitor = webMonitorSdk({
  appId,
  api: 'http://localhost/report',
});
//启动一个server,接收请求
httpServer(mockBaseXhrApi);

//拦截上报数据，存储，test()中测试校验
let reportTypePage, reportTypeAjax;
//重写monitor重写后的fetch，确认请求完成后是否有自动上报
overrideFetch(function () {
  const body = JSON.parse(arguments[1].body);
  //页面上报
  if (body.type === 'PagePerf') {
    reportTypePage = body;
  }
  //ajax上报
  if (body.type === 'AjaxPerf') {
    reportTypeAjax = body;
  }
});

//测试:页面加载完成的上报，和ajax完成上报,完成2次上报
test('web api: XMLHttpRequest', (done) => {
  //GET
  const requestAddress = mockPerformanceResource.xhr.name;

  //发送请求，能保障成功发出，覆写的收集逻辑能正常执行拿到相应数据，并且能在sdk中生成相应数据
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = state_Change;
  xmlhttp.open('GET', requestAddress, true);
  xmlhttp.send(null);
  //发送请求后，需要模拟浏览器performace数据监听
  window.mockPerformanceEntriesAdd(mockPerformanceResource.xhr);

  function state_Change() {
    // 4 = "loaded"
    if (xmlhttp.readyState == 4) {
      if (xmlhttp.status == 200) {
        expect(xmlhttp.status).toEqual(200);
      }
    }
  }
  //检查XMLHttpRequest可枚举属性重写后是否丢失
  for (var attr in XMLHttpRequest) {
    expect(XMLHttpRequest[attr]).toEqual(XMLConstructorEnum[attr]);
  }
  setTimeout(() => {
    //页面性能上报数据
    expect(reportTypePage.appId).toEqual(appId);
    expect(reportTypePage.performance.andt).toEqual(
      window.performance.getEntriesByType('navigation')[0].domComplete -
        window.performance.getEntriesByType('navigation')[0].domInteractive
    );
    expect(reportTypePage.isFristIn).toEqual(true);
    expect(reportTypePage.markUser.length).toBeGreaterThan(0);
    expect(reportTypePage.markUv.length).toBeGreaterThan(0);
    expect(reportTypePage.resourceList.length).toEqual(0);
    //ajax上报
    expect(reportTypeAjax.resourceList[0].name).toEqual(requestAddress);
    expect(reportTypeAjax.markUser.length).toBeGreaterThan(0);
    expect(reportTypeAjax.markUv.length).toBeGreaterThan(0);
    done();
  }, 6500);
}, 10000);
