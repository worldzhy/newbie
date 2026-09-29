/** 简单一点的测试用例会直接放此文件，也可以单独抽离一个文件 */
import './mock/web.env';
import { mockErrcodeReportApi, mockPerformanceResource } from './mock/mock';
import { overrideFetch, httpServer } from './mock/utils';
import webMonitorSdk from '../src/index';
const appId = 'appid_test';
//启动一个server,接收请求
httpServer(mockErrcodeReportApi);
/** default env domain, 顺便作为errcodeReport、filterUrls的测试实例 */
const monitor = webMonitorSdk({
  appId,
  api: 'http://localhost/report',
  errcodeReport(res) {
    if (
      Object.prototype.toString.call(res) === '[object Object]' &&
      res.hasOwnProperty('errcode') &&
      res.errcode !== 0
    ) {
      return { isReport: true, errMsg: res.errmsg, code: res.errcode };
    }
    return { isReport: false };
  },
});
/**
 * errcodeReport
 */
let errcodeReportData;
//重写，避免真正发送报告数据
overrideFetch(function () {
  const body = JSON.parse(arguments[1].body);
  //ajax和errcodeReport同时上报
  if (body.type === 'AjaxPerf') {
    errcodeReportData = body;
  }
});

/** options errcodeReport 自定义业务接口错误上报 */
test('web options: errcodeReport', (done) => {
  fetch(mockErrcodeReportApi.api, {
    method: 'GET',
  }).then((res) => {});
  //发送请求后，需要模拟浏览器performace数据监听
  window.mockPerformanceEntriesAdd(mockPerformanceResource.fetchErrcode);
  setTimeout(() => {
    expect(errcodeReportData.resourceList.length).toEqual(1);
    expect(errcodeReportData.errorList.length).toEqual(1);
    expect(errcodeReportData.errorList[0].msg).toEqual(
      mockErrcodeReportApi.res.errmsg
    );
    expect(errcodeReportData.errorList[0].data.status).toEqual(
      mockErrcodeReportApi.res.errcode
    );

    done();
  }, 3000);
});
