import { SetMetadata } from "@nestjs/common";

/**
 * Use @AllowAnyOrigin() on token-only report endpoints that browsers on any
 * origin must reach (ADR-009 D1). The route is recorded in a metadata-driven
 * registry at startup; NewbieFactory reads that registry to answer CORS `*`
 * (including OPTIONS preflight, which never reaches the Nest pipeline).
 */
export const ALLOW_ANY_ORIGIN_KEY = "allowAnyOrigin";
export const AllowAnyOrigin = () => SetMetadata(ALLOW_ANY_ORIGIN_KEY, true);
