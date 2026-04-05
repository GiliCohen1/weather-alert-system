import {
  registerSchema,
  loginSchema,
  createAlertSchema,
  paginationSchema,
} from "../utils/schemas";

describe("Zod Validation Schemas", () => {
  describe("registerSchema", () => {
    it("should accept valid registration data", () => {
      const result = registerSchema.safeParse({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "secure123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject short name", () => {
      const result = registerSchema.safeParse({
        name: "J",
        email: "jane@example.com",
        password: "secure123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = registerSchema.safeParse({
        name: "Jane",
        email: "not-an-email",
        password: "secure123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const result = registerSchema.safeParse({
        name: "Jane",
        email: "jane@example.com",
        password: "short",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("should accept valid login data", () => {
      const result = loginSchema.safeParse({
        email: "jane@example.com",
        password: "password",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing password", () => {
      const result = loginSchema.safeParse({
        email: "jane@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createAlertSchema", () => {
    it("should accept city-based alert", () => {
      const result = createAlertSchema.safeParse({
        name: "Heat alert",
        locationType: "city",
        city: "Tel Aviv",
        parameter: "temperature",
        operator: ">",
        threshold: 35,
      });
      expect(result.success).toBe(true);
    });

    it("should accept coords-based alert", () => {
      const result = createAlertSchema.safeParse({
        locationType: "coords",
        lat: 32.08,
        lon: 34.78,
        parameter: "windSpeed",
        operator: ">=",
        threshold: 20,
      });
      expect(result.success).toBe(true);
    });

    it("should reject city-based alert without city", () => {
      const result = createAlertSchema.safeParse({
        locationType: "city",
        parameter: "temperature",
        operator: ">",
        threshold: 35,
      });
      expect(result.success).toBe(false);
    });

    it("should reject coords-based alert without lat/lon", () => {
      const result = createAlertSchema.safeParse({
        locationType: "coords",
        lat: 32.08,
        parameter: "temperature",
        operator: ">",
        threshold: 35,
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid parameter", () => {
      const result = createAlertSchema.safeParse({
        locationType: "city",
        city: "Berlin",
        parameter: "invalidParam",
        operator: ">",
        threshold: 10,
      });
      expect(result.success).toBe(false);
    });

    it("should reject out-of-range latitude", () => {
      const result = createAlertSchema.safeParse({
        locationType: "coords",
        lat: 91,
        lon: 34,
        parameter: "temperature",
        operator: ">",
        threshold: 35,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("paginationSchema", () => {
    it("should use defaults when empty", () => {
      const result = paginationSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it("should coerce string values", () => {
      const result = paginationSchema.parse({ page: "3", limit: "50" });
      expect(result.page).toBe(3);
      expect(result.limit).toBe(50);
    });

    it("should reject limit over 100", () => {
      const result = paginationSchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });
  });
});
