/**
 * @devbie/newbie public entry.
 *
 * Note: `pipes/errors.constants` is intentionally NOT re-exported here because
 * it shares symbol names with `exceptions/errors.constants` (a pre-existing
 * duplication in the framework). Both files remain available via subpaths:
 *   @devbie/newbie/pipes/errors.constants
 *   @devbie/newbie/exceptions/errors.constants
 */

// Published package version, read at runtime (package.json sits one level
// above both src/ during development and dist/ in the published tarball).
export const VERSION = (require("../package.json") as { version: string })
  .version;

// Application bootstrap
export * from "./newbie-factory";
export * from "./port-race";
export * from "./graceful-shutdown";

// Framework module & configuration
export * from "./framework.module";
export * from "./framework.config";

// Shared DTOs
export * from "./common.dto";

// Decorators
export * from "./decorators/cookie.decorator";

// Exception filters
export * from "./exception-filters/all.exception-filter";
export * from "./exception-filters/http.exception-filter";
export * from "./exception-filters/newbie.exception-filter";
export * from "./exception-filters/prisma.exception-filter";
export * from "./exception-filters/throttler.exception-filter";

// Exceptions & error constants (superset)
export * from "./exceptions/newbie.exception";
export * from "./exceptions/errors.constants";

// Interceptors & middlewares
export * from "./interceptors/http-response.interceptor";
export * from "./middlewares/http.middleware";
export * from "./middlewares/raw-body.middleware";

// Built-in backend monitor probe (disabled unless forRoot({enabled:true}))
export * from "./monitoring/backend-monitor.module";
export * from "./monitoring/backend-monitor.types";
export * from "./monitoring/backend-monitor.reporter";

// Pipes (their local errors.constants is subpath-only, see note above)
export * from "./pipes/cursor-slug.pipe";
export * from "./pipes/cursor.pipe";
export * from "./pipes/order-by.pipe";
export * from "./pipes/select-include.pipe";
export * from "./pipes/where.pipe";

// Prisma
export * from "./prisma/prisma.exception";
export * from "./prisma/prisma.extension";
export * from "./prisma/prisma.module";
export * from "./prisma/prisma.service";

// Transformers
export * from "./transformers/boolean.transformer";

// Utilities
export * from "./utilities/array.util";
export * from "./utilities/bool.util";
export * from "./utilities/common.util";
export * from "./utilities/crypto.util";
export * from "./utilities/datetime.util";
export * from "./utilities/delay.util";
export * from "./utilities/file.util";
export * from "./utilities/int.util";
export * from "./utilities/parse-object-literal.util";
export * from "./utilities/random.util";
export * from "./utilities/timezone.util";
