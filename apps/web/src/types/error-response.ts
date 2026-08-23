export type ErrorResponse = {
  success: false;
  error: {
    message: string;
    details?: Record<string, string[]>;
  };
};
