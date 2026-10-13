import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";
import { NewbieException } from "../exceptions/newbie.exception";

@Catch(NewbieException)
export class NewbieExceptionFilter implements ExceptionFilter {
  catch(exception: NewbieException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    const { code, error } = exception.getResponse() as {
      code: number;
      error: object;
    };

    // The semantic status is carried by the exception itself (ADR-001);
    // the filter must never force 200 over it.
    response.status(exception.getStatus()).json({ code, error, data: null });
  }
}
