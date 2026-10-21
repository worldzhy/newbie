import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { parseObjectLiteral } from "../utilities/parse-object-literal.util";
import { WHERE_PIPE_FORMAT } from "../exceptions/errors.constants";

/** Convert a string like "id: 12, b: 'Anand'" to { id: 12, name: "Anand" } */
@Injectable()
export class WherePipe implements PipeTransform {
  transform(value: string): Record<string, any> | undefined {
    if (value == null) return undefined;
    try {
      const rules = parseObjectLiteral(value);
      const items: Record<string, any> = {};
      rules.forEach((rule) => {
        const ruleKey = rule[0];
        const rawValue: string = rule[1] ?? "";
        let ruleValue: string | number | boolean = rawValue;

        if (rawValue.endsWith(")")) {
          const inner = /\(([^)]+)\)/.exec(rawValue)?.[1];
          if (inner !== undefined) {
            if (rawValue.startsWith("int(")) ruleValue = parseInt(inner, 10);
            else if (rawValue.startsWith("date(") || rawValue.startsWith("datetime("))
              ruleValue = new Date(inner).toISOString();
            else if (rawValue.startsWith("float(")) ruleValue = parseFloat(inner);
            else if (rawValue.startsWith("string(")) ruleValue = inner;
            else if (rawValue.startsWith("boolean(") || rawValue.startsWith("bool(")) ruleValue = inner === "true";
          }
        }

        const operators = [
          "lt",
          "lte",
          "gt",
          "gte",
          "equals",
          "not",
          "contains",
          "startsWith",
          "endsWith",
          "every",
          "some",
          "none",
        ];
        for (const val of operators) {
          if (rawValue.startsWith(`${val} `)) {
            const data: Record<string, any> = {};
            data[val] = rawValue.replace(`${val} `, "");
            if (data[val].includes(":") && !data[val].endsWith(":")) {
              const record: Record<string, any> = {};
              record[data[val].split(":")[0].trim()] = data[val].split(":")[1].trim();
              data[val] = record;
            }
            items[ruleKey] = data;
            break;
          }
        }

        if (ruleValue != null && ruleValue !== "") items[ruleKey] = items[ruleKey] || ruleValue;
      });
      return items;
    } catch {
      throw new BadRequestException(WHERE_PIPE_FORMAT);
    }
  }
}
