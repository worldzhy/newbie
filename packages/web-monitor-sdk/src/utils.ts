export function randomString(len?: number): string {
  const l = len || 10;
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789";
  const maxPos = chars.length;
  let pwd = "";
  for (let i = 0; i < l; i++) {
    pwd = pwd + chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd + new Date().getTime();
}

export const getHeaderMap = (ajax: any): Record<string, string> => {
  const headers: string = ajax.getAllResponseHeaders();
  const arr = headers.trim().split(/[\r\n]+/);
  const headerMap: Record<string, string> = {};
  arr.forEach((line: string) => {
    const parts = line.split(": ");
    const header = parts.shift() as string;
    const value = parts.join(": ");
    headerMap[header.toLocaleLowerCase()] = value;
  });
  return headerMap;
};

const API_ERROR_TYPES = ["bussiness-fetch", "bussiness-ajax"];
export const filterResourceError = ({ conf, opt }: { conf: any; opt: { filterUrls: string[] } }): void => {
  const list = conf.errorList;
  const filterUrls = opt.filterUrls;
  const newlist: any[] = [];
  if (list && list.length && filterUrls && filterUrls.length) {
    for (let i = 0; i < list.length; i++) {
      let isIgnore = false;
      for (let j = 0; j < filterUrls.length; j++) {
        if (
          API_ERROR_TYPES.indexOf(list[i]["type"]) > -1 &&
          list[i]["data"]["resourceUrl"] &&
          list[i]["data"]["resourceUrl"].indexOf(filterUrls[j]) > -1
        ) {
          isIgnore = true;
          break;
        }
      }
      if (!isIgnore) newlist.push(list[i]);
    }
  }
  conf.errorList = newlist;
};
