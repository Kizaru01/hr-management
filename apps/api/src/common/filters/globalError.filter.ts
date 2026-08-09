import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const response = context.getResponse();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error.';
    let errors: Record<string, string> | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObject = exceptionResponse as {
          message?: string;
          errors?: unknown[];
        };

        if (typeof responseObject.message === 'string') {
          message = responseObject.message;
        }

        if (Array.isArray(responseObject.errors)) {
          errors = Object.fromEntries(
            responseObject.errors.map((error) => {
              const issue = error as {
                path?: Array<string | number>;
                message?: string;
              };

              const field = issue.path?.join('.') ?? 'unknown';

              return [field, issue.message ?? 'Invalid value.'];
            }),
          );
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      ...(errors && { errors }),
    });
  }
}
