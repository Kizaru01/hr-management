import { NextResponse } from "next/server";

import { ErrorResponse } from "@/types/error-response";
import { RequestError } from "./http-errors";

export type ResponseType = "api" | "server";

function formatResponse(
  responseType: "api",
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined,
): NextResponse<ErrorResponse>;
function formatResponse(
  responseType: "server",
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined,
): ErrorResponse;
function formatResponse(
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined,
): NextResponse<ErrorResponse> | ErrorResponse;
function formatResponse(
  responseType: ResponseType,
  status: number,
  message: string,
  errors?: Record<string, string[]> | undefined,
) {
  const responseContent: ErrorResponse = {
    success: false,
    error: {
      message,
      details: errors,
    },
  };

  return responseType === "api"
    ? NextResponse.json(responseContent, { status })
    : responseContent;
}

function handleError(
  error: unknown,
  responseType: "api",
): NextResponse<ErrorResponse>;
function handleError(error: unknown, responseType?: "server"): ErrorResponse;
function handleError(error: unknown, responseType: ResponseType = "server") {
  if (error instanceof RequestError) {
    console.error(
      {
        statusCode: error.statusCode,
        message: error.message,
        details: error.errors,
      },
      `${responseType.toUpperCase()} Error: ${error.message}`,
    );

    return formatResponse(
      responseType,
      error.statusCode,
      error.message,
      error.errors,
    );
  }

  if (error instanceof Error) {
    console.error(
      {
        statusCode: 500,
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      `${responseType.toUpperCase()} Error: unexpected failure`,
    );
    return formatResponse(responseType, 500, "Internal server error");
  }

  console.error(
    { statusCode: 500, valueType: typeof error },
    `${responseType.toUpperCase()} Error: unexpected non-Error value`,
  );
  return formatResponse(responseType, 500, "Internal server error");
}

export default handleError;
