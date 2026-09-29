/** 简单一点的测试用例会直接放此文件，也可以单独抽离一个文件 */
import './mock/web.env';
import { encryptP } from '../src/common/utils';
import { overrideFetch } from './mock/utils';
import webMonitorSdk from '../src/index';
const appId = 'appid_test';
const monitor = webMonitorSdk({
  appId,
  api: 'http://localhost/report',
});

//重写monitor重写后的fetch，确认请求完成后是否有自动上报
//拦截上报数据，存储，test()中测试校验
let reportTypePage;
overrideFetch(function () {
  const body = JSON.parse(arguments[1].body);
  //页面上报
  if (body.type === 'PagePerf') {
    reportTypePage = body;
  }
});

const test_uid = '10007',
  test_p = 15198765432;
monitor.setConfig({
  uid: test_uid,
  p: test_p,
});
test('web setConfig', (done) => {
  setTimeout(() => {
    expect(reportTypePage.uid).toEqual(test_uid);
    expect(reportTypePage.p).toEqual(encryptP(test_p));
    done();
  }, 3000);
});

test('web call function: addCustom', () => {});
test('web call function: addError', () => {});
