export function errorResponse(message: unknown) {
  return {
    success: false,
    message,
  };
}
