import {
  apiResponse,
  authenticatedFetch,
} from "@/lib/api/authenticated-api";
import handleError from "@/lib/errors/handle-error";

interface DownloadEmployeeDocumentRouteContext {
  params: Promise<{ id: string }>;
}

const forwardedHeaders = [
  "Content-Type",
  "Content-Disposition",
  "Content-Length",
] as const;

export async function GET(
  _request: Request,
  { params }: DownloadEmployeeDocumentRouteContext,
) {
  try {
    const { id } = await params;
    const upstreamResponse = await authenticatedFetch(
      `/employee/documents/${encodeURIComponent(id)}/download`,
    );

    if (!upstreamResponse.ok) {
      await apiResponse<never>(upstreamResponse);
    }

    const headers = new Headers();

    for (const headerName of forwardedHeaders) {
      const value = upstreamResponse.headers.get(headerName);

      if (value) {
        headers.set(headerName, value);
      }
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers,
    });
  } catch (error) {
    return handleError(error, "api");
  }
}
