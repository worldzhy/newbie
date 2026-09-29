import './mock/web.env';
import { mockPerformanceResource, mockHttpStatusError } from './mock/mock';
import { overrideFetch, httpServer } from './mock/utils';
import webMonitorSdk from '../src/index';
const appId = 'appid_test';
const monitor = webMonitorSdk({
  appId,
  api: 'http://localhost/report',
});
//启动一个server,接收请求
httpServer(mockHttpStatusError);

//重写monitor重写后的fetch，确认请求完成后是否有自动上报
//拦截上报数据，存储，test()中测试校验
let reportData;
overrideFetch(function () {
  const body = JSON.parse(arguments[1].body);
  //ajax上报
  if (body.type === 'AjaxPerf') {
    reportData = body;
  }
});

//测试:页面加载完成的上报，和fetch完成上报,完成2次上报
test('web api: fetch http error 404', (done) => {
  //GET
  const requestAddress = mockPerformanceResource.fetchHttpErr.name;

  fetch(requestAddress, {
    method: 'GET',
  }).then((res) => {});

  //发送请求后，需要模拟浏览器performace数据监听
  window.mockPerformanceEntriesAdd(mockPerformanceResource.fetchHttpErr);
  fetch(requestAddress, {
    method: 'GET',
  }).then((res) => {});

  //发送请求后，需要模拟浏览器performace数据监听
  window.mockPerformanceEntriesAdd(mockPerformanceResource.fetchHttpErr);

  setTimeout(() => {
    expect(reportData.resourceList.length).toEqual(2);
    expect(reportData.errorList.length).toEqual(2);
    expect(reportData.errorList[0].data.status).toEqual(
      mockHttpStatusError.statuscode
    );
    done();
  }, 6500);
}, 10000);
