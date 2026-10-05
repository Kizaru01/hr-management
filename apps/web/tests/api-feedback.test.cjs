const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

// Compile the actual client modules without booting Next.js or a backend.
function load(relativePath) {
  const filename = path.resolve(__dirname, relativePath);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)(
    (id) => id.startsWith(".") ? load(path.relative(__dirname, path.resolve(path.dirname(filename), `${id}.ts`))) : require(id),
    module, module.exports,
  );
  return module.exports;
}

const { safeMessage } = load("../src/lib/api/safe-message.ts");
const { apiClient, ApiError } = load("../src/lib/api/api.client.ts");

test("preserves actionable credential and other action messages", () => {
  for (const message of ["Invalid email or password.", "Password must contain at least 8 characters.", "Please enter a valid email address.", "Account is not active.", "Department already exists.", "Activation token has expired."]) {
    assert.equal(safeMessage(message, "Fallback"), message);
  }
});

test("still suppresses diagnostics and credential values", () => {
  for (const message of ["password=hunter2", '"password": "hunter2"', "secret: abc", "token=abc", "Bearer abc", "Prisma exception", "Internal server error", "Error\nat /app/file.js", "<html>Error</html>", "", null]) {
    assert.equal(safeMessage(message, "Fallback"), "Fallback");
  }
});

test("client preserves 401 and validation details but masks server failures", async (t) => {
  for (const scenario of [
    { status: 401, message: "Invalid email or password." },
    { status: 409, message: "Department already exists." },
    { status: 400, message: "Validation failed", details: { password: ["Password must contain at least 8 characters."] } },
    { status: 500, message: "Database failed", expected: "Unable to sign in." },
  ]) {
    t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({ success: false, error: { message: scenario.message, details: scenario.details } }), { status: scenario.status }));
    await assert.rejects(apiClient("/api/auth/login", { method: "POST", fallbackMessage: "Unable to sign in." }), (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.message, scenario.expected ?? scenario.message);
      assert.deepEqual(error.details, scenario.details);
      return true;
    });
    t.mock.restoreAll();
  }
});
