interface InitOptions {
    appId: string;
    api: string;
    filterUrls?: string[];
    isPage?: boolean;
    isAjax?: boolean;
    isResource?: boolean;
    isError?: boolean;
    user?: {
        uid?: string;
        p?: string;
    };
    traceIdHeaderName?: string;
    isTraceId?: boolean;
    customsThrottleMs?: number;
    errcodeReport?: (responseData: Record<string, unknown>) => {
        isReport: boolean;
        errMsg: string;
        code: number | string;
    };
}

declare function addError(err: {
    msg: string;
    col: number;
    line: number;
    resourceUrl: string;
}): void;
declare function addCustom({ customName, customContent, customFilter, }: {
    customName: string;
    customContent: string | Record<string, any>;
    customFilter?: Record<string, any>;
}): void;
declare function setConfig(config: {
    uid?: string | number;
    p?: string | number;
}): void;
interface InitReturn {
    addError: typeof addError;
    addCustom: typeof addCustom;
    _conf: any;
    setConfig: typeof setConfig;
}
declare function init(options: InitOptions): InitReturn;
declare global {
    interface Window {
        _frontendMonitor?: typeof init;
    }
}

export { InitReturn, addCustom, addError, init as default, setConfig };
