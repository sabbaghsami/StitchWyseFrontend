import { ApiError, getApiErrorMessage, requestJson } from "../lib/http";

describe("requestJson", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("throws ApiError for 404 responses", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Product not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      }),
    );

    try {
      await requestJson("https://api.example.com/products/missing");
      throw new Error("Expected requestJson to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(404);
      expect((error as ApiError).code).toBe("HTTP_404");
    }
  });

  it("retries one time for idempotent GET when server returns 500", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: "Server error" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );

    const response = await requestJson<{ ok: boolean }>("https://api.example.com/health");
    expect(response).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not retry non-idempotent POST requests", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ message: "Server error" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(
      requestJson("https://api.example.com/cart", {
        method: "POST",
        body: { productId: "beanie-rust" },
      }),
    ).rejects.toBeInstanceOf(ApiError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("getApiErrorMessage", () => {
  it("returns a message from ApiError instances", () => {
    const error = new ApiError({
      message: "Bad request. Please review your input and try again.",
      status: 400,
      code: "HTTP_400",
      retryable: false,
    });

    expect(getApiErrorMessage(error)).toBe("Bad request. Please review your input and try again.");
  });
});
