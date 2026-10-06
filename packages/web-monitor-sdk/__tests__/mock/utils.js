export function overrideFetch(cb) {
  // Override the fetch patched by monitor to skip reporting
  const monitorFetch = window.fetch;
  window.fetch = function () {
    if (arguments[1] && arguments[1].type === "report-data") {
      cb && cb.apply(this, arguments);
      // report
      return Promise.resolve();
    }
    return monitorFetch.apply(this, arguments);
  };
}

const http = require("http");
const path = require("path");
const fs = require("fs");
export function httpServer(config) {
  const server = http.createServer((req, res) => {
    const reqPath = req.url.split("?")[0];
    if (reqPath === config.path) {
      if (config.isBlob) {
        const filePath = path.resolve(__dirname, "./mock.js");
        var stats = fs.statSync(filePath);
        res.writeHead(200, {
          "Content-Type": "application/octet-stream",
          "Content-Disposition": "attachment; filename=mock",
          "Content-length": stats.size,
        });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("x-qexr-trace-id", "Cxaq1.adc");
        res.setHeader("access-control-expose-headers", "x-qexr-trace-id");
        res.end(JSON.stringify(config.res));
      }
    } else {
      res.statusCode = 404;
      res.end();
    }
  });
  server.listen(config.port);
}
