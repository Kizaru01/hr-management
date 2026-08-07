import { loginSchema, type LoginInput } from "@hr-management/validation";

const sampleLogin: LoginInput = {
  email: "charles@example.com",
  password: "password123",
};

export const result = loginSchema.safeParse(sampleLogin);