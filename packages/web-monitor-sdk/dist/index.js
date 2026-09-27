function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

(function (global, factory) {
  (typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports) : typeof define === 'function' && define.amd ? define(['exports'], factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["frontend-monitor"] = {}));
})(this, function (exports) {
  'use strict';

  function isObject(value) {
    return Object.prototype.toString.apply(value) === "[object Object]";
  }

  var middle = {
    0: "QR",
    1: "xa",
    2: "cL",
    3: "pF",
    4: "Oe",
    5: "bn",
    6: "sM",
    7: "yt",
    8: "Uv",
    9: "ik"
  };

  function encryptP(value) {
    var str = typeof value === "number" ? String(value) : value;
    if (typeof str !== "string") throw new Error("p字段格式错误，只能是数字或者数字字符串");
    return str.split("").map(function (item) {
      var n = Number(item);
      return Number.isInteger(n) && middle[n] ? middle[n] : "";
    }).join("");
  }

  function ifGetReasonOrStr(err) {
    if (Object.prototype.toString.apply(err) === "[object PromiseRejectionEvent]") {
      return "PromiseRejectionEvent: " + err.reason;
    } else if (isObject(err)) {
      return JSON.stringify(err);
    }

    return String(err);
  }

  function getConsoleErrorMsg(args) {
    var msg = "";

    try {
      if (args.length === 1) {
        msg = "" + ifGetReasonOrStr(args[0]);
      } else if (args.length > 1) {
        var arr = [];

        for (var i in args) {
          arr.push("" + ifGetReasonOrStr(args[i]));
        }

        msg = arr.toString();
      }
    } catch (e) {}

    return msg;
  }

  var ERRORTYPES = {
    log: "log",
    script: "script",
    ajax: "ajax",
    fetch: "fetch",
    bussinessAjax: "bussiness-ajax",
    bussinessFetch: "bussiness-fetch",
    resource: "resource"
  };
  var ERRORAPIS = {
    consoleError: "conso.err",
    onerror: "onerror",
    unhandleReject: "reject"
  };
  var UNKNOWN_FUNCTION = '?';
  var chrome = /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|address|native|eval|webpack|<anonymous>|[-a-z]+:|.*bundle|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i;
  var gecko = /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:file|https?|blob|chrome|webpack|resource|moz-extension|capacitor).*?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i;
  var winjs = /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;
  var geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i;
  var chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;
  var reactMinifiedRegexp = /Minified React error #\d+;/i;

  function computeStackTrace(ex) {
    var stack = null;
    var popSize = 0;

    if (ex) {
      if (typeof ex.framesToPop === 'number') {
        popSize = ex.framesToPop;
      } else if (reactMinifiedRegexp.test(ex.message)) {
        popSize = 1;
      }
    }

    try {
      stack = computeStackTraceFromStacktraceProp(ex);

      if (stack) {
        return popFrames(stack, popSize);
      }
    } catch (e) {}

    try {
      stack = computeStackTraceFromStackProp(ex);

      if (stack) {
        return popFrames(stack, popSize);
      }
    } catch (e) {}

    return {
      message: extractMessage(ex),
      name: ex && ex.name,
      stack: [],
      failed: true
    };
  }

  function computeStackTraceFromStackProp(ex) {
    if (!ex || !ex.stack) {
      return null;
    }

    var stack = [];
    var lines = ex.stack.split('\n');
    var isEval;
    var submatch;
    var parts;
    var element;

    for (var i = 0; i < lines.length; ++i) {
      if (parts = chrome.exec(lines[i])) {
        var isNative = parts[2] && parts[2].indexOf('native') === 0;
        isEval = parts[2] && parts[2].indexOf('eval') === 0;

        if (isEval && (submatch = chromeEval.exec(parts[2]))) {
          parts[2] = submatch[1];
          parts[3] = submatch[2];
          parts[4] = submatch[3];
        }

        element = {
          url: parts[2] && parts[2].indexOf('address at ') === 0 ? parts[2].substr('address at '.length) : parts[2],
          func: parts[1] || UNKNOWN_FUNCTION,
          args: isNative ? [parts[2]] : [],
          line: parts[3] ? +parts[3] : null,
          column: parts[4] ? +parts[4] : null
        };
      } else if (parts = winjs.exec(lines[i])) {
        element = {
          url: parts[2],
          func: parts[1] || UNKNOWN_FUNCTION,
          args: [],
          line: +parts[3],
          column: parts[4] ? +parts[4] : null
        };
      } else if (parts = gecko.exec(lines[i])) {
        isEval = parts[3] && parts[3].indexOf(' > eval') > -1;

        if (isEval && (submatch = geckoEval.exec(parts[3]))) {
          parts[1] = parts[1] || "eval";
          parts[3] = submatch[1];
          parts[4] = submatch[2];
          parts[5] = '';
        } else if (i === 0 && !parts[5] && ex.columnNumber !== void 0) {
          stack[0].column = ex.columnNumber + 1;
        }

        element = {
          url: parts[3],
          func: parts[1] || UNKNOWN_FUNCTION,
          args: parts[2] ? parts[2].split(',') : [],
          line: parts[4] ? +parts[4] : null,
          column: parts[5] ? +parts[5] : null
        };
      } else {
        continue;
      }

      if (!element.func && element.line) {
        element.func = UNKNOWN_FUNCTION;
      }

      stack.push(element);
    }

    if (!stack.length) {
      return null;
    }

    return {
      message: extractMessage(ex),
      name: ex.name,
      stack: stack
    };
  }

  function computeStackTraceFromStacktraceProp(ex) {
    if (!ex || !ex.stacktrace) {
      return null;
    }

    var stacktrace = ex.stacktrace;
    var opera10Regex = / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i;
    var opera11Regex = / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^)]+))\((.*)\))? in (.*):\s*$/i;
    var lines = stacktrace.split('\n');
    var stack = [];
    var parts;

    for (var line = 0; line < lines.length; line += 2) {
      var element = null;

      if (parts = opera10Regex.exec(lines[line])) {
        element = {
          url: parts[2],
          func: parts[3],
          args: [],
          line: +parts[1],
          column: null
        };
      } else if (parts = opera11Regex.exec(lines[line])) {
        element = {
          url: parts[6],
          func: parts[3] || parts[4],
          args: parts[5] ? parts[5].split(',') : [],
          line: +parts[1],
          column: +parts[2]
        };
      }

      if (element) {
        if (!element.func && element.line) {
          element.func = UNKNOWN_FUNCTION;
        }

        stack.push(element);
      }
    }

    if (!stack.length) {
      return null;
    }

    return {
      message: extractMessage(ex),
      name: ex.name,
      stack: stack
    };
  }

  function popFrames(stacktrace, popSize) {
    try {
      return _objectSpread(_objectSpread({}, stacktrace), {}, {
        stack: stacktrace.stack.slice(popSize)
      });
    } catch (e) {
      return stacktrace;
    }
  }

  function extractMessage(ex) {
    var message = ex && ex.message;

    if (!message) {
      return 'No error message';
    }

    if (message.error && typeof message.error.message === 'string') {
      return message.error.message;
    }

    return message;
  }

  function randomString(len) {
    var l = len || 10;
    var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789';
    var maxPos = chars.length;
    var pwd = '';

    for (var i = 0; i < l; i++) {
      pwd = pwd + chars.charAt(Math.floor(Math.random() * maxPos));
    }

    return pwd + new Date().getTime();
  }

  var getHeaderMap = function getHeaderMap(ajax) {
    var headers = ajax.getAllResponseHeaders();
    var arr = headers.trim().split(/[\r\n]+/);
    var headerMap = {};
    arr.forEach(function (line) {
      var parts = line.split(': ');
      var header = parts.shift();
      var value = parts.join(': ');
      headerMap[header.toLocaleLowerCase()] = value;
    });
    return headerMap;
  };

  var API_ERROR_TYPES = ['bussiness-fetch', 'bussiness-ajax'];

  var filterResourceError = function filterResourceError(_ref) {
    var conf = _ref.conf,
        opt = _ref.opt;
    var list = conf.errorList;
    var filterUrls = opt.filterUrls;
    var newlist = [];

    if (list && list.length && filterUrls && filterUrls.length) {
      for (var i = 0; i < list.length; i++) {
        var isIgnore = false;

        for (var j = 0; j < filterUrls.length; j++) {
          if (API_ERROR_TYPES.indexOf(list[i]['type']) > -1 && list[i]['data']['resourceUrl'] && list[i]['data']['resourceUrl'].indexOf(filterUrls[j]) > -1) {
            isIgnore = true;
            break;
          }
        }

        if (!isIgnore) newlist.push(list[i]);
      }
    }

    conf.errorList = newlist;
  };

  var ReportType;

  (function (ReportType) {
    ReportType["PagePerf"] = "PagePerf";
    ReportType["AjaxPerf"] = "AjaxPerf";
    ReportType["Error"] = "Error";
    ReportType["Custom"] = "Custom";
    ReportType["Unload"] = "Unload";
    ReportType["SdkError"] = "SdkError";
  })(ReportType || (ReportType = {}));

  function markUser(type) {
    var markUser = sessionStorage.getItem('ps_markUser') || '';
    var isFirstIn = sessionStorage.getItem('ps_isFirstIn') || '';
    var result = {
      markUser: markUser,
      isFirstIn: false
    };

    if (!markUser) {
      markUser = randomString();
      sessionStorage.setItem('ps_markUser', markUser);
      result.markUser = markUser;
    }

    if (!isFirstIn && type !== ReportType.Custom) {
      result.isFirstIn = true;
      sessionStorage.setItem('ps_isFirstIn', '1');
    }

    return result;
  }

  function markDevice() {
    var mkDevice = localStorage.getItem('ps_markDevice') || '';

    if (!mkDevice) {
      mkDevice = randomString(11);
      localStorage.setItem('ps_markDevice', mkDevice);
    }

    return mkDevice;
  }

  function markUv() {
    var date = new Date();
    var markUv = localStorage.getItem('ps_markUv') || '';
    var datatime = localStorage.getItem('ps_markUvTime') || '';
    var today = "".concat(date.getFullYear(), "/").concat(date.getMonth() + 1, "/").concat(date.getDate(), " 23:59:59");

    if (!markUv && !datatime || date.getTime() > Number(datatime)) {
      markUv = randomString();
      localStorage.setItem('ps_markUv', markUv);
      localStorage.setItem('ps_markUvTime', new Date(today).getTime().toString());
    }

    return markUv;
  }

  var getNavigationEntryFromPerformanceTiming = function getNavigationEntryFromPerformanceTiming() {
    var timing = performance.timing;
    var navigationEntry = {
      entryType: 'navigation',
      startTime: 0
    };

    for (var key in timing) {
      if (key !== 'navigationStart' && key !== 'toJSON') {
        navigationEntry[key] = Math.max(timing[key] - timing.navigationStart, 0);
      }
    }

    return navigationEntry;
  };

  var getNavigationEntry = function getNavigationEntry() {
    try {
      if (performance.getEntriesByType && performance.getEntriesByType('navigation') && performance.getEntriesByType('navigation')[0]) {
        return performance.getEntriesByType('navigation')[0];
      }

      return getNavigationEntryFromPerformanceTiming();
    } catch (error) {
      reportSdkError(error);
      return false;
    }
  };

  var getFCP = function getFCP() {
    try {
      if (performance.getEntriesByType && performance.getEntriesByType('paint')) {
        var firstPaint = performance.getEntriesByType('paint').filter(function (item) {
          return item.name === 'first-contentful-paint';
        });
        if (firstPaint[0]) return firstPaint[0].startTime;
      }

      var timing = getNavigationEntry();
      return (timing.domInteractive || timing.domLoading) - timing.fetchStart;
    } catch (error) {
      reportSdkError(error);
      return false;
    }
  };

  var _performanceResourceList = [];

  function getPerformanceResourceList() {
    return [].concat(_performanceResourceList);
  }

  function clearPerformanceResourceList() {
    _performanceResourceList = [];
  }

  function initPerformanceObserver(conf) {
    if (window.PerformanceObserver) {
      _performanceResourceList = [].concat(performance.getEntriesByType('resource'));
      var observer = new window.PerformanceObserver(function (list) {
        var entries = list.getEntriesByType('resource');
        entries.forEach(function (item) {
          if (item.initiatorType == 'xmlhttprequest' || item.initiatorType == 'fetch') {
            for (var i = 0; i < conf.ajaxCompleteTemp.length; i++) {
              if (conf.ajaxCompleteTemp[i].name == item.name) {
                item._id = conf.ajaxCompleteTemp[i]._id;
                conf.ajaxCompleteTemp.splice(i, 1);
                break;
              }
            }
          }
        });
        _performanceResourceList = _performanceResourceList.concat(entries);
      });
      observer.observe({
        entryTypes: ['resource']
      });
    }
  }

  function perforPage(conf) {
    if (!window.performance) return;
    var fcp = getFCP();
    var navigationEntry = getNavigationEntry();
    if (!navigationEntry || !fcp) return;
    conf.performance = {
      dnst: Math.round(navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart) || 0,
      tcpt: Math.round(navigationEntry.connectEnd - navigationEntry.connectStart) || 0,
      wit: Math.round(fcp),
      lodt: Math.round(navigationEntry.duration),
      reqt: Math.round(navigationEntry.responseStart),
      andt: Math.round(navigationEntry.domComplete - navigationEntry.domInteractive) || 0
    };
  }

  function perforResource(_ref2) {
    var conf = _ref2.conf,
        opt = _ref2.opt;
    if (!window.performance || !window.performance.getEntries) return false;
    var resource = getPerformanceResourceList();
    var resourceList = [];
    if (!resource && !resource.length) return;
    resource.forEach(function (item) {
      if (!opt.isAjax && (item.initiatorType == 'xmlhttprequest' || item.initiatorType == 'fetch')) return;
      if (!opt.isResource && item.initiatorType != 'xmlhttprequest' && item.initiatorType !== 'fetch') return;
      var json = {
        name: item.name,
        method: 'GET',
        type: item.initiatorType,
        duration: Number(item.duration.toFixed(2)) || 0,
        requestTime: Number((performance.timeOrigin + item.startTime).toFixed(0)) || 0,
        bodySize: item.encodedBodySize || 0,
        nextHopProtocol: item.nextHopProtocol
      };
      var ajaxMsg = conf.ajaxMsg[item._id] || '';

      if (ajaxMsg) {
        if (ajaxMsg.traceId) json.traceId = ajaxMsg.traceId;
        json.method = ajaxMsg.method || 'GET';
        json.type = ajaxMsg.type || json.type;
        json.bodySize = json.bodySize || ajaxMsg.bodySize || 0;
        json.options = ajaxMsg.options || '';
      }

      resourceList.push(json);
    });
    conf.resourceList = resourceList;
  }

  function filterResource(_ref3) {
    var conf = _ref3.conf,
        opt = _ref3.opt;
    var reslist = conf.resourceList;
    var filterUrls = opt.filterUrls;
    var newlist = [];

    if (reslist && reslist.length && filterUrls && filterUrls.length) {
      for (var i = 0; i < reslist.length; i++) {
        var begin = false;

        for (var j = 0; j < filterUrls.length; j++) {
          if (reslist[i]['name'].indexOf(filterUrls[j]) > -1) {
            begin = true;
            break;
          }
        }

        if (!begin) newlist.push(reslist[i]);
      }
    }

    conf.resourceList = newlist;
  }

  var sdk_version = '1.0.0';
  var reportData;
  var reportCustomsNow;
  var reportCustomsSoon;
  var customsTimer;
  var errorDefault = {
    createTime: '',
    type: 'js',
    msg: '',
    data: {}
  };

  var _conf;

  var reportSdkError;

  var reportDebounce = function reportDebounce() {
    if (_conf && _conf.page === location.href && !_conf.haveAjax) return true;
    return false;
  };

  var ErrorInstanceReport = function ErrorInstanceReport(error, api) {
    var defaults = Object.assign({}, errorDefault);
    setTimeout(function () {
      defaults.msg = error.message;
      defaults.type = ERRORTYPES.script;
      defaults.name = error.name;
      defaults.api = api;
      defaults.stack = error.stack;

      var line, col, _url;

      if (error.stack && error.stack.length > 0) {
        col = error.stack[0].column || undefined;
        line = error.stack[0].line || undefined;
        _url = error.stack[0].url;
      }

      defaults.data = {
        resourceUrl: _url,
        line: line,
        col: col
      };
      defaults.createTime = new Date().getTime();
      _conf && _conf.errorList.push(defaults);
      if (reportDebounce()) reportData(ReportType.Error);
    }, 0);
  };

  function Performance(options) {
    if (!options.appId || !options.api) throw new Error('appId或者api未定义');
    var filterUrlsDefault = ['/api/v1/report/web'];

    var opt = _objectSpread({
      outTime: 300,
      filterUrls: [],
      isPage: true,
      isAjax: true,
      isResource: true,
      isError: true,
      user: {
        uid: undefined,
        p: undefined
      },
      traceIdHeaderName: 'x-trace-id',
      isTraceId: false,
      customsThrottleMs: 1000
    }, options);

    opt.filterUrls = opt.filterUrls.concat(filterUrlsDefault);
    var conf = {
      opt: opt,
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
      preUrl: document.referrer && document.referrer !== location.href ? document.referrer : '',
      page: '',
      markPage: '',
      markPageUrl: '',
      apiDead: false
    };
    var beginTime = new Date().getTime();
    var loadTime = 0;
    var ajaxTime = 0;
    var fetchTime = 0;

    function getAjaxJson(ajax) {
      var _ajax$xhr = ajax.xhr,
          xhr = _ajax$xhr === void 0 ? {} : _ajax$xhr;
      var responseJson = {};

      if (xhr.responseType === '' || xhr.responseType === 'text') {
        var responseText = xhr.responseText;

        try {
          responseJson = JSON.parse(responseText);
        } catch (e) {}
      } else if (xhr.responseType === 'json' && isObject(xhr.response)) {
        responseJson = xhr.response;
      }

      return responseJson;
    }

    function getAjaxResponseSize(ajax) {
      var _ajax$xhr2 = ajax.xhr,
          xhr = _ajax$xhr2 === void 0 ? {} : _ajax$xhr2;
      var resSize = 0;

      if (xhr.responseType === 'blob' && xhr.response instanceof Blob) {
        resSize = xhr.response.size;
      } else if (xhr.responseType === '' || xhr.responseType === 'text') {
        resSize = xhr.responseText.length;
      } else if (xhr.responseType === 'json') {
        try {
          resSize = JSON.stringify(xhr.response).length;
        } catch (e) {}
      }

      return resSize;
    }

    function ajaxEnded(ajax) {
      var _id = ajax.args._id;
      var _traceId = null;

      if (conf.opt.isTraceId) {
        _traceId = getHeaderMap(ajax)[conf.opt.traceIdHeaderName.toLocaleLowerCase()] || null;
      }

      if (conf.ajaxMsg[_id]) {
        try {
          if (_traceId) conf.ajaxMsg[_id].traceId = _traceId;
          conf.ajaxMsg[_id]['bodySize'] = getAjaxResponseSize(ajax);
        } catch (err) {}
      }

      if (ajax.status < 200 || ajax.status > 300) {
        ajaxErrResponse(ajax);
      } else if (ajax.status === 200) {
        var result = getAjaxJson(ajax);

        if (opt.errcodeReport) {
          var _ajax$xhr3 = ajax.xhr,
              xhr = _ajax$xhr3 === void 0 ? {} : _ajax$xhr3;

          var _opt$errcodeReport = opt.errcodeReport(result),
              isReport = _opt$errcodeReport.isReport,
              errMsg = _opt$errcodeReport.errMsg,
              code = _opt$errcodeReport.code;

          if (isReport) {
            var defaults = Object.assign({}, errorDefault);
            defaults.createTime = new Date().getTime();
            defaults.type = ERRORTYPES.bussinessAjax;
            defaults.msg = errMsg || '业务接口异常';
            defaults.method = ajax.args.method;
            defaults.options = ajax.args.options || '';
            if (_traceId) defaults.traceId = _traceId;
            defaults.data = {
              resourceUrl: xhr.responseURL,
              status: code
            };
            conf.errorList.push(defaults);
          }
        }
      }

      getAjaxTime();
    }

    reportSdkError = function reportSdkError(error) {
      var api = opt.api;

      var _error;

      var result = getBaseData(ReportType.SdkError);
      var stack = computeStackTrace(error);

      if (stack.failed) {
        _error = {
          msg: error.toString()
        };
      } else {
        _error = {
          msg: stack.message,
          name: stack.name,
          stack: JSON.stringify(stack.stack || {})
        };
      }

      result = Object.assign(result, _objectSpread({
        version: sdk_version
      }, _error));
      doReport({
        api: api,
        body: JSON.stringify(result),
        outTime: 0
      });
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

    function _Ajax(proxy) {
      window._ahrealxhr = window._ahrealxhr || XMLHttpRequest;

      window.XMLHttpRequest = function () {
        this.xhr = new window._ahrealxhr();
        this.xhr;

        for (var attr in this.xhr) {
          var type = '';

          try {
            type = _typeof(this.xhr[attr]);
          } catch (e) {}

          if (type === 'function') {
            this[attr] = hookfun(attr);
          } else {
            Object.defineProperty(this, attr, {
              get: getFactory(attr),
              set: setFactory(attr)
            });
          }
        }
      };

      for (var attr in window._ahrealxhr) {
        XMLHttpRequest[attr] = window._ahrealxhr[attr];
      }

      function getFactory(attr) {
        return function () {
          var v = this.hasOwnProperty(attr + '_') ? this[attr + '_'] : this.xhr[attr];
          var attrGetterHook = (proxy[attr] || {})['getter'];
          return attrGetterHook && attrGetterHook(v, this) || v;
        };
      }

      function setFactory(attr) {
        return function (v) {
          var xhr = this.xhr;
          var that = this;
          var hook = proxy[attr];

          if (typeof hook === 'function') {
            xhr[attr] = function () {
              proxy[attr](that) || v.apply(xhr, arguments);
            };
          } else {
            var attrSetterHook = (hook || {})['setter'];
            v = attrSetterHook && attrSetterHook(v, that) || v;

            try {
              xhr[attr] = v;
            } catch (e) {
              this[attr + '_'] = v;
            }
          }
        };
      }

      function hookfun(fun) {
        return function () {
          var args = [].slice.call(arguments);

          if (proxy[fun] && proxy[fun].call(this, args, this.xhr)) {
            return;
          }

          return this.xhr[fun].apply(this.xhr, args);
        };
      }

      return window._ahrealxhr;
    }

    function _fetch() {
      if (!window.fetch) return;
      var _fetch = fetch;

      window.fetch = function () {
        var _arg = arguments;

        var _id = randomString();

        var req = fetArg(_arg);

        if (req.type !== 'report-data') {
          conf.ajaxCompleteTemp.push({
            name: req.url,
            _id: _id
          });
          conf.ajaxMsg[_id] = req;
          conf.fetLength = conf.fetLength + 1;
          conf.haveFetch = true;
        }

        return _fetch.apply(this, arguments).then(function (originRes) {
          if (req.type === 'report-data') return originRes;
          var url = originRes.url ? originRes.url.split('?')[0] : '';
          var _traceId = null;

          if (conf.opt.isTraceId) {
            _traceId = originRes.headers.get(conf.opt.traceIdHeaderName) || null;
          }

          if (conf.ajaxMsg[_id] && _traceId) {
            conf.ajaxMsg[_id].traceId = _traceId;
          }

          var res;

          try {
            res = originRes.clone();
            res.clone().text().then(function (data) {
              if (res.status < 200 || res.status > 300) {
                fetchErrResponse(res, req, data);
                getFetchTime();
              } else if (res.status == 200) {
                if (conf.ajaxMsg[_id]) {
                  conf.ajaxMsg[_id]['bodySize'] = data.length;
                }

                var resResult = {};

                try {
                  resResult = JSON.parse(data);
                } catch (e) {}

                if (opt.errcodeReport) {
                  var _opt$errcodeReport2 = opt.errcodeReport(resResult),
                      isReport = _opt$errcodeReport2.isReport,
                      errMsg = _opt$errcodeReport2.errMsg,
                      code = _opt$errcodeReport2.code;

                  if (isReport) {
                    var defaults = Object.assign({}, errorDefault);
                    defaults.createTime = new Date().getTime();
                    defaults.type = ERRORTYPES.bussinessFetch;
                    defaults.msg = errMsg || '业务接口异常';
                    defaults.method = req.method;
                    defaults.options = req.options || '';
                    if (_traceId) defaults.traceId = _traceId;
                    defaults.data = {
                      resourceUrl: url,
                      status: code
                    };
                    conf.errorList.push(defaults);
                  }
                }

                getFetchTime();
              }
            });
          } catch (e) {}

          return res ? res.clone() : originRes;
        })["catch"](function (err) {
          if (req.type === 'report-data') return Promise.reject(err);
          var msg = 'fetch request error';

          if (isObject(err) && err.name) {
            msg = "".concat(err.name, ": ").concat(err.message);
          } else if (err) {
            msg = err;
          }

          var defaults = Object.assign({}, errorDefault);
          defaults.createTime = new Date().getTime();
          defaults.type = ERRORTYPES.fetch;
          defaults.msg = msg;
          defaults.method = req.method;
          defaults.options = req.options || '';
          defaults.data = {
            resourceUrl: req.url,
            status: 0
          };
          conf.errorList.push(defaults);
          getFetchTime();
          return Promise.reject(err);
        });
      };
    }

    function fetArg(arg) {
      var result = {
        method: 'GET',
        type: 'fetchrequest'
      };
      var args = Array.prototype.slice.apply(arg);
      if (!args || !args.length) return result;

      try {
        if (args.length === 1) {
          if (typeof args[0] === 'string') {
            result.url = args[0];
          } else if (_typeof(args[0]) === 'object') {
            result.url = args[0].url;
            result.method = args[0].method;
            if (args[0].body) result.options = args[0].body;
          }
        } else {
          result.url = args[0];
          result.method = args[1].method || 'GET';
          result.type = args[1].type || 'fetchrequest';
          if (args[1].body) result.options = args[1].body;
        }

        if (result.method.toLocaleUpperCase() === 'GET') {
          var _result$url$split = result.url.split('?'),
              _result$url$split2 = _slicedToArray(_result$url$split, 2),
              url = _result$url$split2[0],
              _options = _result$url$split2[1];

          result.options = _options || '';
        }
      } catch (err) {}

      return result;
    }

    function _error() {
      window.addEventListener('error', function (e) {
        var defaults = Object.assign({}, errorDefault);
        defaults.type = ERRORTYPES.resource;
        defaults.createTime = new Date().getTime();
        defaults.msg = e.target.localName + ' is load error';
        defaults.method = 'GET';
        defaults.api = ERRORAPIS.onerror;
        defaults.data = {
          target: e.target.localName,
          type: e.type,
          resourceUrl: e.target.href || e.target.src || e.target.currentSrc
        };
        if (e.target != window) conf.errorList.push(defaults);
      }, true);
      var _oldOnerror = window.onerror;

      window.onerror = function (msg, _url, line, col, error) {
        var stack = computeStackTrace(error);

        if (stack.failed) {
          var defaults = Object.assign({}, errorDefault);
          defaults.msg = msg;
          defaults.type = ERRORTYPES.log;
          defaults.api = ERRORAPIS.onerror;
          defaults.createTime = new Date().getTime();
          defaults.data = {
            resourceUrl: _url,
            line: line,
            col: col
          };
          conf.errorList.push(defaults);
          if (reportDebounce()) reportData(ReportType.Error);
        } else {
          ErrorInstanceReport(stack, ERRORAPIS.onerror);
        }

        if (_oldOnerror) {
          return _oldOnerror.apply(this, arguments);
        }
      };

      window.addEventListener('unhandledrejection', function (e) {
        var error = e && e.reason;
        var stack = computeStackTrace(error);

        if (stack.failed) {
          var defaults = Object.assign({}, errorDefault);

          if (isObject(error)) {
            defaults.msg = JSON.stringify(error);
          } else {
            defaults.msg = '' + error;
          }

          defaults.type = ERRORTYPES.log;
          defaults.api = ERRORAPIS.unhandleReject;
          defaults.createTime = new Date().getTime();
          defaults.data = {
            resourceUrl: location.href
          };
          conf.errorList.push(defaults);
          if (reportDebounce()) reportData(ReportType.Error);
        } else {
          ErrorInstanceReport(stack, ERRORAPIS.unhandleReject);
        }
      });
      var oldError = console.error;

      console.error = function () {
        if (arguments.length === 1) {
          var stack = computeStackTrace(arguments[0]);

          if (!stack.failed) {
            ErrorInstanceReport(stack, ERRORAPIS.consoleError);
            return;
          }
        }

        var msg = getConsoleErrorMsg(arguments);

        if (msg) {
          var defaults = Object.assign({}, errorDefault);
          setTimeout(function () {
            defaults.msg = msg;
            defaults.type = ERRORTYPES.log;
            defaults.api = ERRORAPIS.consoleError;
            defaults.createTime = new Date().getTime();
            defaults.data = {
              resourceUrl: location.href
            };
            conf.errorList.push(defaults);
            if (reportDebounce()) reportData(ReportType.Error);
          }, 0);
        }

        return oldError.apply(console, arguments);
      };

      addEventListener('load', function () {
        loadTime = new Date().getTime() - beginTime;
        getLargeTime();
      }, false);
      addEventListener('unload', function () {
        if (navigator && navigator.sendBeacon) reportData(ReportType.Unload);
      }, false);
    }

    function ajaxErrResponse(ajax) {
      if (ajax.isLock) return;
      ajax.isLock = true;
      var msg = 'ajax request error';

      try {
        if (ajax.xhr && ajax.xhr.responseText) {
          msg = ajax.xhr.responseText;
        } else if (ajax.statusText) {
          msg = ajax.statusText;
        }
      } catch (e) {}

      var defaults = Object.assign({}, errorDefault);
      defaults.createTime = new Date().getTime();
      defaults.type = ERRORTYPES.ajax;
      defaults.msg = msg;
      defaults.method = ajax.args.method;
      defaults.options = ajax.args.options || '';

      if (conf.opt.isTraceId) {
        var _traceId = getHeaderMap(ajax)[conf.opt.traceIdHeaderName.toLocaleLowerCase()] || null;

        if (_traceId) defaults.traceId = _traceId;
      }

      defaults.data = {
        resourceUrl: ajax.args.url,
        text: msg,
        status: ajax.status
      };
      conf.errorList.push(defaults);
    }

    function fetchErrResponse(res, req, resData) {
      var defaults = Object.assign({}, errorDefault);
      var msg = 'fetch request error';

      if (resData) {
        msg = resData;
      } else if (res.statusText) {
        msg = res.statusText;
      }

      defaults.createTime = new Date().getTime();
      defaults.type = ERRORTYPES.fetch;
      defaults.msg = msg;
      defaults.method = req.method;
      defaults.options = req.options || '';

      try {
        var _traceId = res.headers.get(conf.opt.traceIdHeaderName) || null;

        if (_traceId) defaults.traceId = _traceId;
      } catch (e) {}

      defaults.data = {
        resourceUrl: req.url,
        status: res.status
      };
      conf.errorList.push(defaults);
    }

    function getFetchTime() {
      setTimeout(function () {
        conf.fetchNum += 1;

        if (conf.fetLength === conf.fetchNum) {
          conf.fetchNum = conf.fetLength = 0;
          fetchTime = new Date().getTime() - beginTime;
          getLargeTime();
        }
      }, 600);
    }

    function getAjaxTime() {
      setTimeout(function () {
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
      conf.preUrl = '';
      conf.resourceList = [];
      conf.page = location.href;
      conf.haveAjax = false;
      conf.haveFetch = false;
      conf.ajaxMsg = {};
      conf.ajaxCompleteTemp = [];
      ajaxTime = 0;
      fetchTime = 0;
    }

    function getBaseData(type, time) {
      var appId = opt.appId;
      var markuser = markUser(type);

      if (conf.markPageUrl !== location.href) {
        conf.markPageUrl = location.href;
        conf.markPage = randomString();
      }

      var result = {
        appId: appId,
        time: time || new Date().getTime(),
        markUser: markuser.markUser,
        markPage: conf.markPage,
        isFirstIn: markuser.isFirstIn,
        markUv: markUv(),
        markDevice: markDevice(),
        type: type,
        url: location.href,
        uid: undefined,
        p: undefined
      };
      if (conf.opt.user.uid) result.uid = conf.opt.user.uid;
      if (conf.opt.user.p) result.p = conf.opt.user.p;
      return result;
    }

    function doReport(_ref4) {
      var api = _ref4.api,
          body = _ref4.body,
          outTime = _ref4.outTime,
          type = _ref4.type;
      if (conf.apiDead) return;

      if (type === ReportType.Unload) {
        navigator.sendBeacon(api, body);
        return;
      }

      if (window.fetch) {
        setTimeout(function () {
          fetch(api, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/plain'
            },
            type: 'report-data',
            body: body
          })["catch"](function (err) {
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
          onreadystatechange: function onreadystatechange(ajax) {
            if (ajax.readyState === 4 && !ajax.endedCallbackName) {
              ajax.endedCallbackName = 'onreadystatechange';
              ajaxEnded(ajax);
            }
          },
          onloadend: function onloadend(ajax) {
            if (!ajax.endedCallbackName) {
              ajax.endedCallbackName = 'onloadend';
              ajaxEnded(ajax);
            }
          },
          onerror: function onerror(ajax) {
            getAjaxTime();
            ajaxErrResponse(ajax);
          },
          send: function send(data) {
            if (this.args && data && data.length > 0) {
              if (typeof data[0] === 'string') this.args.options = data[0];else {
                if (data[0] !== null && data[0] !== undefined) {
                  this.args.options = Object.prototype.toString.apply(data[0]);
                }
              }
            }
          },
          open: function open(arg) {
            var url = arg[1];
            if (!url.startsWith('http')) url = window.location.origin + url;
            var result = {
              url: url,
              method: arg[0] || 'GET',
              type: 'xmlhttprequest',
              _id: randomString()
            };
            this.args = result;
            conf.ajaxCompleteTemp.push({
              name: url,
              _id: result._id
            });
            conf.ajaxMsg[result._id] = result;
            conf.ajaxLength = conf.ajaxLength + 1;
            conf.haveAjax = true;
          }
        });
      }

      reportData = function reportData() {
        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ReportType.PagePerf;
        var api = opt.api,
            outTime = opt.outTime;
        if (opt.isPage) perforPage(conf);
        if (opt.isResource || opt.isAjax) perforResource({
          conf: conf,
          opt: opt
        });
        filterResource({
          conf: conf,
          opt: opt
        });
        filterResourceError({
          conf: conf,
          opt: opt
        });
        var resourceList = conf.resourceList,
            performance = conf.performance,
            preUrl = conf.preUrl,
            errorList = conf.errorList;
        var time = new Date().getTime();

        if (resourceList && resourceList.length) {
          time = resourceList[0].requestTime;
        }

        var result = getBaseData(type, time);

        if (result.isFirstIn) {
          result = Object.assign(result, {
            performance: performance,
            preUrl: preUrl,
            screenWidth: document.documentElement.clientWidth || document.body.clientWidth,
            screenHeight: document.documentElement.clientHeight || document.body.clientHeight
          });
        }

        if (type !== ReportType.Custom) {
          result = Object.assign(result, {
            resourceList: resourceList,
            errorList: errorList
          });
        }

        var body = JSON.stringify(result);
        clear();

        if (type === ReportType.AjaxPerf && resourceList.length === 0 && errorList.length === 0) {
          return;
        }

        if (type === ReportType.Unload && resourceList.length === 0 && errorList.length === 0) {
          return;
        }

        doReport({
          api: api,
          body: body,
          outTime: outTime,
          type: type
        });
      };

      reportCustomsNow = function reportCustomsNow() {
        var api = opt.api,
            outTime = opt.outTime;
        var customs = conf.customs || [];
        if (!customs.length) return;
        var body = JSON.stringify(_objectSpread(_objectSpread({}, getBaseData(ReportType.Custom)), {}, {
          customs: customs
        }));
        conf.customs = [];
        customsTimer = null;
        doReport({
          api: api,
          body: body,
          outTime: outTime,
          type: ReportType.Custom
        });
      };

      reportCustomsSoon = function reportCustomsSoon() {
        if (customsTimer != null) return;
        customsTimer = window.setTimeout(function () {
          reportCustomsNow();
        }, opt.customsThrottleMs);
      };
    } catch (err) {
      reportSdkError(err);
    }
  }

  function addError(err) {
    var item = {
      msg: err.msg,
      type: 'js',
      data: {
        col: err.col,
        line: err.line,
        resourceUrl: err.resourceUrl
      }
    };

    _conf.errorList.push(item);

    reportData(ReportType.Error);
  }

  function addCustom(_ref5) {
    var customName = _ref5.customName,
        customContent = _ref5.customContent,
        customFilter = _ref5.customFilter;

    if (isObject(customContent)) {
      customContent = JSON.stringify(customContent);
    }

    if (customFilter && !isObject(customFilter)) {
      throw new Error('customFilter 必须是一个对象');
    }

    _conf.customs.push({
      customName: customName,
      customContent: customContent,
      customFilter: customFilter
    });

    reportCustomsSoon();
  }

  function setConfig(config) {
    if (!isObject(config)) throw new Error('setConfig 参数必须是一个对象');
    if (config.uid !== undefined) _conf.opt.user.uid = config.uid;
    if (config.p !== undefined) _conf.opt.user.p = encryptP(config.p);
  }

  function init(options) {
    Performance(options);
    return {
      addError: addError,
      addCustom: addCustom,
      _conf: _conf,
      setConfig: setConfig
    };
  }

  if (typeof window !== 'undefined') {
    window._frontendMonitor = init;
  }

  exports.addCustom = addCustom;
  exports.addError = addError;
  exports["default"] = init;
  exports.setConfig = setConfig;
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
});
