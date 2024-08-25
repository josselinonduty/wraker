import { describe, expect, it, vitest } from "vitest";
import { WrakerApp, WrakerAppRequest, WrakerAppResponse } from "../..";

describe("WrakerAppRequest", () => {
  it("should initialize properly", () => {
    const app = new WrakerApp();

    const request = new WrakerAppRequest(app, {
      body: "body",
      headers: {
        "X-Request-Id": "123",
      },
      method: "GET",
      path: "/",
      sendErrorFn: vitest.fn(),
      sendFn: vitest.fn(),
    });

    expect(request).toBeDefined();
    expect(request.app).toBe(app);
    expect(request.body).toEqual("body");
    expect(request.headers.get("x-request-id")).toEqual("123");
    expect(request.method).toEqual("GET");
    expect(request.path).toEqual("/");
    expect(request.res).toBeInstanceOf(WrakerAppResponse);
    expect(request.cookies).toBeDefined();
  });
});
