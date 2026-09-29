export interface PerformanceOptions {
  appId: string;
  api: string;
  outTime: number;
  filterUrls: string[];
  isPage: boolean;
  isAjax: boolean;
  isResource: boolean;
  isError: boolean;
  user?: { uid?: string; p?: string };
  traceIdHeaderName: string;
  isTraceId: boolean;
  customsThrottleMs: number;
  errcodeReport?: (responseData: Record<string, unknown>) => {
    isReport: boolean;
    errMsg: string;
    code: number | string;
  };
}

export interface InitOptions {
  appId: string;
  api: string;
  filterUrls?: string[];
  isPage?: boolean;
  isAjax?: boolean;
  isResource?: boolean;
  isError?: boolean;
  user?: { uid?: string; p?: string };
  traceIdHeaderName?: string;
  isTraceId?: boolean;
  customsThrottleMs?: number;
  errcodeReport?: (responseData: Record<string, unknown>) => {
    isReport: boolean;
    errMsg: string;
    code: number | string;
  };
}

export enum ReportType {
  PagePerf = "PagePerf",
  AjaxPerf = "AjaxPerf",
  Error = "Error",
  Custom = "Custom",
  Unload = "Unload",
  SdkError = "SdkError",
}
