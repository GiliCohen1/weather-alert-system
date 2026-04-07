import { AppError } from "../middleware/errorHandler";

describe("AppError", () => {
  it("should create an operational error with status code", () => {
    const error = new AppError(404, "Not found");
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe("Not found");
    expect(error.isOperational).toBe(true);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it("should support non-operational errors", () => {
    const error = new AppError(500, "Internal error", false);
    expect(error.isOperational).toBe(false);
  });
});
