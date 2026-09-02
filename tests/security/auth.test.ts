import { beforeEach, describe, expect, it, vi } from "vitest";

const loadAuthModule = async () => {
  vi.resetModules();
  vi.doMock("@/server/db", () => ({
    default: {
      user: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
  }));
  return import("@/server/auth");
};

describe("authentication hardening", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("fails fast in production when NEXTAUTH_SECRET is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXTAUTH_SECRET", "");

    await expect(loadAuthModule()).rejects.toThrow("NEXTAUTH_SECRET");
  });

  it("fails fast in production when NEXTAUTH_SECRET is weak", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXTAUTH_SECRET", "short-secret");

    await expect(loadAuthModule()).rejects.toThrow("at least 32 characters");
  });

  it("allows local development without a configured secret", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXTAUTH_SECRET", "");

    const { getValidatedNextAuthSecret } = await loadAuthModule();

    expect(getValidatedNextAuthSecret()).toContain("development-only");
  });

  it("returns generic login errors instead of account-enumerating errors", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXTAUTH_SECRET", "");
    const { authOptions } = await loadAuthModule();
    const authorize = (authOptions.providers[0] as any).options.authorize;

    await expect(
      authorize({
        email: "missing@example.com",
        password: "wrong-password",
      })
    ).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("rate limits repeated failed login attempts without a new dependency", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXTAUTH_SECRET", "");
    const { authOptions } = await loadAuthModule();
    const authorize = (authOptions.providers[0] as any).options.authorize;

    for (let index = 0; index < 5; index += 1) {
      await expect(
        authorize({
          email: "limited@example.com",
          password: "wrong-password",
        })
      ).rejects.toThrow("INVALID_CREDENTIALS");
    }

    await expect(
      authorize({
        email: "limited@example.com",
        password: "wrong-password",
      })
    ).rejects.toThrow("RATE_LIMITED");
  });
});
