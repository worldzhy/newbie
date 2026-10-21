import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { parseObjectLiteral } from "../utilities/parse-object-literal.util";
import { CURSOR_PIPE_FORMAT } from "../exceptions/errors.constants";

/** Convert a string like "slug: "ok", name: 'Anand'" to { slug: "ok", name: "Anand" } */
@Injectable()
export class CursorSlugPipe implements PipeTransform {
  transform(value: string): Record<string, string> | undefined {
    if (value == null) return undefined;
    if (!value.includes(":")) value = `slug:${value}`;
    try {
      const rules = parseObjectLiteral(value);
      const items: Record<string, string> = {};
      rules.forEach((rule) => {
        if (rule[1]) items[rule[0]] = rule[1];
      });
      return items;
    } catch (_) {
      throw new BadRequestException(CURSOR_PIPE_FORMAT);
    }
  }
}
