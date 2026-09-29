/** 简单一点的测试用例会直接放此文件，也可以单独抽离一个文件 */
import "./mock/web.env";
import { mockOnerrorInfo } from "./mock/mock";
import { overrideFetch } from "./mock/utils";
import { ERRORTYPES, ERRORAPIS } from "../src/common/utils";
import webMonitorSdk from "../src/index";
const appId = "appid_test";
const monitor = webMonitorSdk({
  appId,
  api: "http://localhost/report",
});
//拦截上报数据，存储，test()中测试校验
let reportTypeError = [];
//重写monitor重写后的fetch，确认请求完成后是否有自动上报
overrideFetch(function () {
  const body = JSON.parse(arguments[1].body);
  //页面上报
  if (body.type === "Error") {
    //console.log(body);
    reportTypeError.push(body);
  }
});

test("web api: console.error", (done) => {
  const errMsg = "error test, dont care! ignore this!!!";
  console.error(errMsg);
  setTimeout(() => {
    //页面错误上报数据
    expect(reportTypeError[0].appId).toEqual(appId);
    expect(reportTypeError[0].errorList.length).toEqual(1);
    expect(reportTypeError[0].errorList[0].msg).toEqual(errMsg);
    expect(reportTypeError[0].errorList[0].type).toEqual(ERRORTYPES.log);
    expect(reportTypeError[0].errorList[0].api).toEqual(ERRORAPIS.consoleError);
    expect(reportTypeError[0].errorList[0].data.resourceUrl).toBeDefined();
    done();
  }, 3500);
}, 6000);
test("web api: onerror", (done) => {
  window.onerror.apply(window, mockOnerrorInfo);
  setTimeout(() => {
    //页面错误上报数据
    expect(reportTypeError[1].appId).toEqual(appId);
    expect(reportTypeError[1].errorList.length).toEqual(1);
    expect(reportTypeError[1].errorList[0].msg.indexOf("xx is not defined")).not.toEqual(-1);
    expect(reportTypeError[1].errorList[0].type).toEqual(ERRORTYPES.script);
    expect(reportTypeError[1].errorList[0].api).toEqual(ERRORAPIS.onerror);
    expect(reportTypeError[1].errorList[0].data.resourceUrl).toBeDefined();
    done();
  }, 3500);
}, 6000);
