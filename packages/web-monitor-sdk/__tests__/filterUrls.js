/** 简单一点的测试用例会直接放此文件，也可以单独抽离一个文件 */
import "./mock/web.env";
import { filterResourceError } from "../src/utils";
import { filterResource, perforPage } from "../src/performance";

const appId = "appid_test";

test("web options: filterUrls -> filterResourceError", () => {
  let opt = { filterUrls: ["/api/ignore/v1", ".com/api/v2/ignore"] };
  let conf = {
    errorList: [
      {
        testId: 1,
        t: new Date().getTime(),
        type: "bussiness-ajax",
        msg: "业务接口异常",
        data: {
          resourceUrl: ".com/api/ignore/v1",
        },
      },
      {
        testId: 2,
        t: new Date().getTime(),
        type: "bussiness-fetch",
        msg: "业务接口异常",
        data: {
          resourceUrl: ".com/api/v2/ignore",
        },
      },
      {
        testId: 3,
        t: new Date().getTime(),
        type: "bussiness-ajax",
        msg: "业务接口异常",
        data: {
          resourceUrl: ".com/api/noignore/v1",
        },
      },
      {
        testId: 4,
        t: new Date().getTime(),
        type: "bussiness-fetch",
        msg: "业务接口异常",
        data: {
          resourceUrl: ".com/api/v2/noignore",
        },
      },
    ],
  };
  filterResourceError({ conf, opt });

  expect(conf.errorList.length).toEqual(2);
  expect(conf.errorList[0].testId).toEqual(3);
  expect(conf.errorList[1].testId).toEqual(4);
});

test("web options: filterUrls -> filterResource", () => {
  let opt = { filterUrls: ["/api/ignore/v1", ".com/api/v2/ignore"] };
  let conf = {
    resourceList: [
      {
        testId: 1,
        name: "d.com/api/ignore/v1/test",
        entryType: "resource",
        startTime: 90427.23999964073,
        duration: 272.06500014290214,
        initiatorType: '"xmlhttprequest"',
        nextHopProtocol: "h2",
      },
      {
        testId: 2,
        name: "c.com/api/v2/ignore",
        entryType: "resource",
        startTime: 90427.23999964073,
        duration: 272.06500014290214,
        initiatorType: '"xmlhttprequest"',
        nextHopProtocol: "h2",
      },
      {
        testId: 3,
        name: "d.com/api/noignore/v1/test",
        entryType: "resource",
        startTime: 90427.23999964073,
        duration: 272.06500014290214,
        initiatorType: '"xmlhttprequest"',
        nextHopProtocol: "h2",
      },
      {
        testId: 4,
        name: "ccom/api/v2/noignoret",
        entryType: "resource",
        startTime: 90427.23999964073,
        duration: 272.06500014290214,
        initiatorType: '"xmlhttprequest"',
        nextHopProtocol: "h2",
      },
    ],
  };
  filterResource({ conf, opt });

  expect(conf.resourceList.length).toEqual(2);
  expect(conf.resourceList[0].testId).toEqual(3);
  expect(conf.resourceList[1].testId).toEqual(4);
});

test("web options: perforPage", () => {
  let conf = {};
  perforPage(conf);
  expect(conf.performance);
});
