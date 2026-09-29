export function isObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.apply(value) === "[object Object]";
}

const middle: Record<number, string> = {
  0: "QR",
  1: "xa",
  2: "cL",
  3: "pF",
  4: "Oe",
  5: "bn",
  6: "sM",
  7: "yt",
  8: "Uv",
  9: "ik",
};

export function encryptP(value: string | number): string {
  const str = typeof value === "number" ? String(value) : value;
  if (typeof str !== "string") throw new Error("p字段格式错误，只能是数字或者数字字符串");
  return str
    .split("")
    .map((item) => {
      const n = Number(item);
      return Number.isInteger(n) && middle[n] ? middle[n] : "";
    })
    .join("");
}

export function isIgnore(url: string, filterUrls: string[]): boolean {
  let ignore = false;
  if (url && filterUrls && filterUrls.length) {
    filterUrls.find((item) => {
      if (url.indexOf(item) !== -1) {
        ignore = true;
        return true;
      }
      return false;
    });
  }
  return ignore;
}

export function endsWith(str: string, endStr: string): boolean {
  const reg = new RegExp(endStr + "$");
  return reg.test(str);
}

function ifGetReasonOrStr(err: any): string {
  if (Object.prototype.toString.apply(err) === "[object PromiseRejectionEvent]") {
    return "PromiseRejectionEvent: " + err.reason;
  } else if (isObject(err)) {
    return JSON.stringify(err);
  }
  return String(err);
}

export function getConsoleErrorMsg(args: any[]): string {
  let msg = "";
  try {
    if (args.length === 1) {
      msg = "" + ifGetReasonOrStr(args[0]);
    } else if (args.length > 1) {
      const arr: string[] = [];
      for (const i in args) {
        arr.push("" + ifGetReasonOrStr(args[i]));
      }
      msg = arr.toString();
    }
  } catch (e) {
    // no-op
  }
  return msg;
}

export const ERRORTYPES = {
  log: "log",
  script: "script",
  ajax: "ajax",
  fetch: "fetch",
  bussinessAjax: "bussiness-ajax",
  bussinessFetch: "bussiness-fetch",
  resource: "resource",
} as const;

export const ERRORAPIS = {
  consoleError: "conso.err",
  onerror: "onerror",
  unhandleReject: "reject",
} as const;
