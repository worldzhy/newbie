import { StackTrace, computeStackTrace } from "./common/tracekit";
import { ERRORAPIS, ERRORTYPES, getConsoleErrorMsg, isObject } from "./common/utils";
import { filterResourceError, getHeaderMap, randomString } from "./utils";
import { markDevice, markUser, markUv } from "./identity";
import {
  clearPerformanceResourceList,
  filterResource,
  initPerformanceObserver,
  perforPage,
  perforResource,
} from "./performance";
import { InitOptions, PerformanceOptions, ReportType } from "./types";

const sdk_version = "rollup.replace.WEB_VERSION";

let reportData: (type?: ReportType) => void;
let reportCustomsNow: () => void;
let reportCustomsSoon: () => void;
let customsTimer: number | null;
const errorDefault: any = { createTime: "", type: "js", msg: "", data: {} };
let _conf: any;
let reportSdkError: (error: any) => void;

const reportDebounce = function () {
  if (_conf && _conf.page === location.href && !_conf.haveAjax) return true;
  return false;
};

const ErrorInstanceReport = function (error: StackTrace, api: string): void {
  const defaults = Object.assign({}, errorDefault);
  setTimeout(function () {
    defaults.msg = error.message;
    defaults.type = ERRORTYPES.script;
    defaults.name = error.name;
    defaults.api = api;
    defaults.stack = error.stack;
    let line: number | undefined, col: number | undefined, _url: string | undefined;
    if (error.stack && error.stack.length > 0) {
      col = error.stack[0].column || undefined;
      line = error.stack[0].line || undefined;
      _url = error.stack[0].url;
    }
    defaults.data = { resourceUrl: _url, line, col };
    defaults.createTime = new Date().getTime();
    _conf && _conf.errorList.push(defaults);
    if (reportDebounce()) reportData(ReportType.Error);
  }, 0);
};

function Performance(options: InitOptions): void {
  if (!options.appId || !options.api) throw new Error("appId或者api未定义");
  const filterUrlsDefault = ["/api/v1/report/web"];
  const opt: PerformanceOptions = {
    outTime: 300,
    filterUrls: [],
    isPage: true,
    isAjax: true,
    isResource: true,
    isError: true,
    user: { uid: undefined, p: undefined },
    traceIdHeaderName: "x-trace-id",
    isTraceId: false,
    customsThrottleMs: 1000,
    ...options,
  };
  opt.filterUrls = opt.filterUrls.concat(filterUrlsDefault);

  const conf: any = {
    opt,
    ajaxCompleteTemp: [],
    resourceList: [],
    performance: {},
    errorList: [],
    customs: [],
    fetchNum: 0,
    loadNum: 0,
    ajaxLength: 0,
    fetLength: 0,
    ajaxMsg: {},
    haveAjax: false,
    haveFetch: false,
    preUrl: document.referrer && document.referrer !== location.href ? document.referrer : "",
    page: "",
    markPage: "",
    markPageUrl: "",
    apiDead: false,
  };

  const beginTime = new Date().getTime();
  let loadTime = 0;
  let ajaxTime = 0;
  let fetchTime = 0;

  function getAjaxJson(ajax: any) {
    const { xhr = {} } = ajax;
    let responseJson: any = {};
    if (xhr.responseType === "" || xhr.responseType === "text") {
      const { responseText } = xhr;
      try {
        responseJson = JSON.parse(responseText);
      } catch (e) {}
    } else if (xhr.responseType === "json" && isObject(xhr.response)) {
      responseJson = xhr.response;
    }
    return responseJson;
  }
  function getAjaxResponseSize(ajax: any) {
    const { xhr = {} } = ajax;
    let resSize = 0;
    if (xhr.responseType === "blob" && xhr.response instanceof Blob) {
      resSize = xhr.response.size;
    } else if (xhr.responseType === "" || xhr.responseType === "text") {
      resSize = xhr.responseText.length;
    } else if (xhr.responseType === "json") {
      try {
        resSize = JSON.stringify(xhr.response).length;
      } catch (e) {}
    }
    return resSize;
  }
  function ajaxEnded(ajax: any) {
    const _id = ajax.args._id;
    let _traceId: string | null = null;
    if (conf.opt.isTraceId) {
      _traceId = getHeaderMap(ajax)[conf.opt.traceIdHeaderName.toLocaleLowerCase()] || null;
    }
    if (conf.ajaxMsg[_id]) {
      try {
        if (_traceId) conf.ajaxMsg[_id].traceId = _traceId;
        conf.ajaxMsg[_id]["bodySize"] = getAjaxResponseSize(ajax);
      } catch (err) {}
    }
    if (ajax.status < 200 || ajax.status > 300) {
      ajaxErrResponse(ajax);
    } else if (ajax.status === 200) {
      const result = getAjaxJson(ajax);
      if (opt.errcodeReport) {
        const { xhr = {} } = ajax;
        const { isReport, errMsg, code } = opt.errcodeReport(result);
        if (isReport) {
          const defaults = Object.assign({}, errorDefault);
          defaults.createTime = new Date().getTime();
          defaults.type = ERRORTYPES.bussinessAjax;
          defaults.msg = errMsg || "业务接口异常";
          defaults.method = ajax.args.method;
          defaults.options = ajax.args.options || "";
          if (_traceId) defaults.traceId = _traceId;
          defaults.data = { resourceUrl: xhr.responseURL, status: code };
          conf.errorList.push(defaults);
        }
      }
    }
    getAjaxTime();
  }

  reportSdkError = function (error: any): void {
    const { api } = opt;
    let _error: any;
    let result = getBaseData(ReportType.SdkError);
    const stack = computeStackTrace(error);
    if (stack.failed) {
      _error = { msg: error.toString() };
    } else {
      _error = {
        msg: stack.message,
        name: stack.name,
        stack: JSON.stringify(stack.stack || {}),
      };
    }
    result = Object.assign(result, { version: sdk_version, ..._error });
    doReport({ api, body: JSON.stringify(result), outTime: 0 });
  };

  function getLargeTime() {
    if (conf.page !== location.href) {
      if (conf.haveAjax && conf.haveFetch && loadTime && ajaxTime && fetchTime) {
        reportData(ReportType.PagePerf);
      } else if (conf.haveAjax && !conf.haveFetch && loadTime && ajaxTime) {
        reportData(ReportType.PagePerf);
      } else if (!conf.haveAjax && conf.haveFetch && loadTime && fetchTime) {
        reportData(ReportType.PagePerf);
      } else if (!conf.haveAjax && !conf.haveFetch && loadTime) {
        reportData(ReportType.PagePerf);
      }
    } else {
      if (conf.haveAjax && conf.haveFetch && ajaxTime && fetchTime) {
        reportData(ReportType.AjaxPerf);
      } else if (conf.haveAjax && !conf.haveFetch && ajaxTime) {
        reportData(ReportType.AjaxPerf);
      } else if (!conf.haveAjax && conf.haveFetch && fetchTime) {
        reportData(ReportType.AjaxPerf);
      }
    }
  }

  function _Ajax(proxy: any) {
    (window as any)._ahrealxhr = (window as any)._ahrealxhr || XMLHttpRequest;
    (window as any).XMLHttpRequest = function () {
      this.xhr = new (window as any)._ahrealxhr();
      const xhr = this.xhr;
      for (const attr in this.xhr) {
        let type = "";
        try {
          type = typeof this.xhr[attr];
        } catch (e) {}
        if (type === "function") {
          this[attr] = hookfun(attr);
        } else {
          Object.defineProperty(this, attr, {
            get: getFactory(attr),
            set: setFactory(attr),
          });
        }
      }
    };
    for (const attr in (window as any)._ahrealxhr) {
      (XMLHttpRequest as any)[attr] = (window as any)._ahrealxhr[attr];
    }
    function getFactory(attr: string) {
      return function () {
        const v = this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
        const attrGetterHook = (proxy[attr] || {})["getter"];
        return (attrGetterHook && attrGetterHook(v, this)) || v;
      };
    }
    function setFactory(attr: string) {
      return function (v: any) {
        const xhr = this.xhr;
        const that = this;
        const hook = proxy[attr];
        if (typeof hook === "function") {
          xhr[attr] = function () {
            proxy[attr](that) || v.apply(xhr, arguments as any);
          };
        } else {
          const attrSetterHook = (hook || {})["setter"];
          v = (attrSetterHook && attrSetterHook(v, that)) || v;
          try {
            xhr[attr] = v;
          } catch (e) {
            this[attr + "_"] = v;
          }
        }
      };
    }
    function hookfun(fun: string) {
      return function () {
        const args = [].slice.call(arguments);
        if (proxy[fun] && proxy[fun].call(this, args, this.xhr)) {
          return;
        }
        return this.xhr[fun].apply(this.xhr, args);
      };
    }
    return (window as any)._ahrealxhr;
  }

  function _fetch() {
    if (!window.fetch) return;
    const _fetch = fetch;
    (window as any).fetch = function () {
      const _arg = arguments;
      const _id = randomString();
      const req = fetArg(_arg);
      if (req.type !== "report-data") {
        conf.ajaxCompleteTemp.push({ name: req.url, _id });
        conf.ajaxMsg[_id] = req;
        conf.fetLength = conf.fetLength + 1;
        conf.haveFetch = true;
      }
      return _fetch
        .apply(this, arguments as any)
        .then((originRes: Response) => {
          if (req.type === "report-data") return originRes;
          const url = originRes.url ? originRes.url.split("?")[0] : "";
          let _traceId: string | null = null;
          if (conf.opt.isTraceId) {
            _traceId = originRes.headers.get(conf.opt.traceIdHeaderName) || null;
          }
          if (conf.ajaxMsg[_id] && _traceId) {
            conf.ajaxMsg[_id].traceId = _traceId;
          }
          let res: Response | undefined;
          try {
            res = originRes.clone();
            res
              .clone()
              .text()
              .then((data) => {
                if (res!.status < 200 || res!.status > 300) {
                  fetchErrResponse(res!, req, data);
                  getFetchTime();
                } else if (res!.status == 200) {
                  if (conf.ajaxMsg[_id]) {
                    conf.ajaxMsg[_id]["bodySize"] = data.length;
                  }
                  let resResult: any = {};
                  try {
                    resResult = JSON.parse(data);
                  } catch (e) {}
                  if (opt.errcodeReport) {
                    const { isReport, errMsg, code } = opt.errcodeReport(resResult);
                    if (isReport) {
                      const defaults = Object.assign({}, errorDefault);
                      defaults.createTime = new Date().getTime();
                      defaults.type = ERRORTYPES.bussinessFetch;
                      defaults.msg = errMsg || "业务接口异常";
                      defaults.method = req.method;
                      defaults.options = req.options || "";
                      if (_traceId) defaults.traceId = _traceId;
                      defaults.data = { resourceUrl: url, status: code };
                      conf.errorList.push(defaults);
                    }
                  }
                  getFetchTime();
                }
              });
          } catch (e) {}
          return res ? res.clone() : originRes;
        })
        .catch((err: any) => {
          if (req.type === "report-data") return Promise.reject(err);
          let msg = "fetch request error";
          if (isObject(err) && (err as any).name) {
            msg = `${(err as any).name}: ${(err as any).message}`;
          } else if (err) {
            msg = err;
          }
          const defaults = Object.assign({}, errorDefault);
          defaults.createTime = new Date().getTime();
          defaults.type = ERRORTYPES.fetch;
          defaults.msg = msg;
          defaults.method = req.method;
          defaults.options = req.options || "";
          defaults.data = { resourceUrl: req.url, status: 0 };
          conf.errorList.push(defaults);
          getFetchTime();
          return Promise.reject(err);
        });
    };
  }

  function fetArg(arg: IArguments) {
    const result: any = { method: "GET", type: "fetchrequest" };
    const args = Array.prototype.slice.apply(arg);
    if (!args || !args.length) return result;
    try {
      if (args.length === 1) {
        if (typeof args[0] === "string") {
          result.url = args[0];
        } else if (typeof args[0] === "object") {
          result.url = args[0].url;
          result.method = args[0].method;
          if (args[0].body) result.options = args[0].body;
        }
      } else {
        result.url = args[0];
        result.method = args[1].method || "GET";
        result.type = args[1].type || "fetchrequest";
        if (args[1].body) result.options = args[1].body;
      }
      if (result.method.toLocaleUpperCase() === "GET") {
        const [url, options] = result.url.split("?");
        result.options = options || "";
      }
    } catch (err) {}
    return result;
  }

  function _error() {
    window.addEventListener(
      "error",
      function (e: any) {
        const defaults = Object.assign({}, errorDefault);
        defaults.type = ERRORTYPES.resource;
        defaults.createTime = new Date().getTime();
        defaults.msg = e.target.localName + " is load error";
        defaults.method = "GET";
        defaults.api = ERRORAPIS.onerror;
        defaults.data = {
          target: e.target.localName,
          type: e.type,
          resourceUrl: e.target.href || e.target.src || e.target.currentSrc,
        };
        if (e.target != window) conf.errorList.push(defaults);
      },
      true,
    );
    const _oldOnerror = window.onerror as any;
    window.onerror = function (msg: any, _url: any, line: any, col: any, error: any) {
      const stack = computeStackTrace(error);
      if (stack.failed) {
        const defaults = Object.assign({}, errorDefault);
        defaults.msg = msg;
        defaults.type = ERRORTYPES.log;
        defaults.api = ERRORAPIS.onerror;
        defaults.createTime = new Date().getTime();
        defaults.data = { resourceUrl: _url, line, col };
        conf.errorList.push(defaults);
        if (reportDebounce()) reportData(ReportType.Error);
      } else {
        ErrorInstanceReport(stack, ERRORAPIS.onerror);
      }
      if (_oldOnerror) {
        return _oldOnerror.apply(this, arguments as any);
      }
    };
    window.addEventListener("unhandledrejection", function (e: any) {
      const error = e && e.reason;
      const stack = computeStackTrace(error);
      if (stack.failed) {
        const defaults = Object.assign({}, errorDefault);
        if (isObject(error)) {
          defaults.msg = JSON.stringify(error);
        } else {
          defaults.msg = "" + error;
        }
        defaults.type = ERRORTYPES.log;
        defaults.api = ERRORAPIS.unhandleReject;
        defaults.createTime = new Date().getTime();
        defaults.data = { resourceUrl: location.href };
        conf.errorList.push(defaults);
        if (reportDebounce()) reportData(ReportType.Error);
      } else {
        ErrorInstanceReport(stack, ERRORAPIS.unhandleReject);
      }
    });
    const oldError = console.error;
    console.error = function () {
      if (arguments.length === 1) {
        const stack = computeStackTrace(arguments[0]);
        if (!stack.failed) {
          ErrorInstanceReport(stack, ERRORAPIS.consoleError);
          return;
        }
      }
      const msg = getConsoleErrorMsg(arguments as any);
      if (msg) {
        const defaults = Object.assign({}, errorDefault);
        setTimeout(function () {
          defaults.msg = msg;
          defaults.type = ERRORTYPES.log;
          defaults.api = ERRORAPIS.consoleError;
          defaults.createTime = new Date().getTime();
          defaults.data = { resourceUrl: location.href };
          conf.errorList.push(defaults);
          if (reportDebounce()) reportData(ReportType.Error);
        }, 0);
      }
      return (oldError as any).apply(console, arguments as any);
    };
    addEventListener(
      "load",
      function () {
        loadTime = new Date().getTime() - beginTime;
        getLargeTime();
      },
      false,
    );
    addEventListener(
      "unload",
      function () {
        if (navigator && (navigator as any).sendBeacon) reportData(ReportType.Unload);
      },
      false,
    );
  }

  function ajaxErrResponse(ajax: any) {
    if (ajax.isLock) return;
    ajax.isLock = true;
    let msg = "ajax request error";
    try {
      if (ajax.xhr && ajax.xhr.responseText) {
        msg = ajax.xhr.responseText;
      } else if (ajax.statusText) {
        msg = ajax.statusText;
      }
    } catch (e) {}
    const defaults = Object.assign({}, errorDefault);
    defaults.createTime = new Date().getTime();
    defaults.type = ERRORTYPES.ajax;
    defaults.msg = msg;
    defaults.method = ajax.args.method;
    defaults.options = ajax.args.options || "";
    if (conf.opt.isTraceId) {
      const _traceId = getHeaderMap(ajax)[conf.opt.traceIdHeaderName.toLocaleLowerCase()] || null;
      if (_traceId) defaults.traceId = _traceId;
    }
    defaults.data = {
      resourceUrl: ajax.args.url,
      text: msg,
      status: ajax.status,
    };
    conf.errorList.push(defaults);
  }

  function fetchErrResponse(res: Response, req: any, resData?: string) {
    const defaults = Object.assign({}, errorDefault);
    let msg = "fetch request error";
    if (resData) {
      msg = resData;
    } else if ((res as any).statusText) {
      msg = (res as any).statusText;
    }
    defaults.createTime = new Date().getTime();
    defaults.type = ERRORTYPES.fetch;
    defaults.msg = msg;
    defaults.method = req.method;
    defaults.options = req.options || "";
    try {
      const _traceId = res.headers.get(conf.opt.traceIdHeaderName) || null;
      if (_traceId) defaults.traceId = _traceId;
    } catch (e) {}
    defaults.data = { resourceUrl: req.url, status: res.status };
    conf.errorList.push(defaults);
  }

  function getFetchTime() {
    setTimeout(() => {
      conf.fetchNum += 1;
      if (conf.fetLength === conf.fetchNum) {
        conf.fetchNum = conf.fetLength = 0;
        fetchTime = new Date().getTime() - beginTime;
        getLargeTime();
      }
    }, 600);
  }

  function getAjaxTime() {
    setTimeout(() => {
      conf.loadNum += 1;
      if (conf.loadNum >= conf.ajaxLength) {
        conf.ajaxLength = conf.loadNum = 0;
        ajaxTime = new Date().getTime() - beginTime;
        getLargeTime();
      }
    }, 600);
  }
  function clear() {
    clearPerformanceResourceList();
    conf.performance = {};
    conf.errorList = [];
    conf.preUrl = "";
    conf.resourceList = [];
    conf.page = location.href;
    conf.haveAjax = false;
    conf.haveFetch = false;
    conf.ajaxMsg = {};
    conf.ajaxCompleteTemp = [];
    ajaxTime = 0;
    fetchTime = 0;
  }

  function getBaseData(type: ReportType, time?: number) {
    const { appId } = opt;
    const markuser = markUser(type);
    if (conf.markPageUrl !== location.href) {
      conf.markPageUrl = location.href;
      conf.markPage = randomString();
    }
    const result = {
      appId,
      time: time || new Date().getTime(),
      markUser: markuser.markUser,
      markPage: conf.markPage,
      isFirstIn: markuser.isFirstIn,
      markUv: markUv(),
      markDevice: markDevice(),
      type: type,
      url: location.href,
      uid: undefined,
      p: undefined,
    };
    if (conf.opt.user.uid) result.uid = conf.opt.user.uid;
    if (conf.opt.user.p) result.p = conf.opt.user.p;
    return result;
  }
  function doReport({ api, body, outTime, type }: { api: string; body: string; outTime: number; type?: ReportType }) {
    if (conf.apiDead) return;
    if (type === ReportType.Unload) {
      (navigator as any).sendBeacon(api, body);
      return;
    }
    if (window.fetch) {
      setTimeout(() => {
        fetch(api, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          // @ts-ignore
          type: "report-data" as any,
          body,
        }).catch((err) => {
          conf.apiDead = true;
          return err;
        });
      }, outTime);
    }
  }

  try {
    _conf = conf;
    initPerformanceObserver(_conf);

    if (opt.isError) _error();
    if (opt.isAjax || opt.isError) _fetch();
    if (opt.isAjax || opt.isError) {
      _Ajax({
        onreadystatechange: function (ajax: any) {
          if (ajax.readyState === 4 && !ajax.endedCallbackName) {
            ajax.endedCallbackName = "onreadystatechange";
            ajaxEnded(ajax);
          }
        },
        onloadend: function (ajax: any) {
          if (!ajax.endedCallbackName) {
            ajax.endedCallbackName = "onloadend";
            ajaxEnded(ajax);
          }
        },
        onerror: function (ajax: any) {
          getAjaxTime();
          ajaxErrResponse(ajax);
        },
        send: function (data: any[]) {
          if (this.args && data && data.length > 0) {
            if (typeof data[0] === "string") this.args.options = data[0];
            else {
              if (data[0] !== null && data[0] !== undefined) {
                this.args.options = Object.prototype.toString.apply(data[0]);
              }
            }
          }
        },
        open: function (arg: any[]) {
          let url = arg[1];
          if (!url.startsWith("http")) url = window.location.origin + url;
          const result = {
            url,
            method: arg[0] || "GET",
            type: "xmlhttprequest",
            _id: randomString(),
          };
          this.args = result;
          conf.ajaxCompleteTemp.push({ name: url, _id: result._id });
          conf.ajaxMsg[result._id] = result;
          conf.ajaxLength = conf.ajaxLength + 1;
          conf.haveAjax = true;
        },
      });
    }

    reportData = function (type = ReportType.PagePerf): void {
      const { api, outTime } = opt;
      if (opt.isPage) perforPage(conf);
      if (opt.isResource || opt.isAjax) perforResource({ conf, opt });
      filterResource({ conf, opt });
      filterResourceError({ conf, opt });
      const { resourceList, performance, preUrl, errorList } = conf;
      let time = new Date().getTime();
      // 如果存在资源请求，用资源的第一个时间作为起始时间
      if (resourceList && resourceList.length) {
        time = resourceList[0].requestTime;
      }
      let result = getBaseData(type, time);
      if (result.isFirstIn) {
        result = Object.assign(result, {
          performance,
          preUrl,
          screenWidth: document.documentElement.clientWidth || document.body.clientWidth,
          screenHeight: document.documentElement.clientHeight || document.body.clientHeight,
        });
      }
      if (type !== ReportType.Custom) {
        result = Object.assign(result, {
          resourceList,
          errorList,
        });
      }
      const body = JSON.stringify(result);
      clear();
      if (type === ReportType.AjaxPerf && resourceList.length === 0 && errorList.length === 0) {
        return;
      }
      if (type === ReportType.Unload && resourceList.length === 0 && errorList.length === 0) {
        return;
      }
      doReport({ api, body, outTime, type });
    };

    reportCustomsNow = function (): void {
      const { api, outTime } = opt;
      const customs = conf.customs || [];
      if (!customs.length) return;
      const body = JSON.stringify({
        ...getBaseData(ReportType.Custom),
        customs,
      });
      conf.customs = [];
      customsTimer = null;
      doReport({ api, body, outTime, type: ReportType.Custom });
    };

    reportCustomsSoon = function (): void {
      if (customsTimer != null) return;
      customsTimer = window.setTimeout(() => {
        reportCustomsNow();
      }, opt.customsThrottleMs);
    };
  } catch (err: any) {
    reportSdkError(err);
  }
}

export { reportData, reportCustomsNow, reportCustomsSoon, _conf, ErrorInstanceReport, reportSdkError };
export default Performance;
