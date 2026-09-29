import { encryptP, isObject } from "./common/utils";
//_conf引用类型，谨慎使用
import report, { _conf, reportCustomsSoon, reportData } from "./core";
import { InitOptions, ReportType } from "./types";

export function addError(err: { msg: string; col: number; line: number; resourceUrl: string }): void {
  const item = {
    msg: err.msg,
    type: "js",
    data: { col: err.col, line: err.line, resourceUrl: err.resourceUrl },
  };
  (_conf as any).errorList.push(item);
  reportData(ReportType.Error);
}

export function addCustom({
  customName,
  customContent,
  customFilter,
}: {
  customName: string;
  customContent: string | Record<string, any>;
  customFilter?: Record<string, any>;
}): void {
  if (isObject(customContent)) {
    customContent = JSON.stringify(customContent);
  }
  if (customFilter && !isObject(customFilter)) {
    throw new Error("customFilter 必须是一个对象");
  }
  (_conf as any).customs.push({ customName, customContent, customFilter });
  reportCustomsSoon();
}

export function setConfig(config: { uid?: string | number; p?: string | number }): void {
  if (!isObject(config)) throw new Error("setConfig 参数必须是一个对象");
  if (config.uid !== undefined) (_conf as any).opt.user.uid = config.uid;
  if (config.p !== undefined) (_conf as any).opt.user.p = encryptP(config.p);
}

export interface InitReturn {
  addError: typeof addError;
  addCustom: typeof addCustom;
  _conf: any;
  setConfig: typeof setConfig;
}

export default function init(options: InitOptions): InitReturn {
  report(options);

  return { addError, addCustom, _conf, setConfig };
}

declare global {
  interface Window {
    _frontendMonitor?: typeof init;
  }
}

if (typeof window !== "undefined") {
  (window as any)._frontendMonitor = init;
}
