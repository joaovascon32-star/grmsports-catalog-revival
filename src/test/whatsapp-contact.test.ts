import { describe, expect, it } from "vitest";

import { INITIAL_SETTINGS } from "@/data/initialCatalog";

// The store has no checkout: every sale is closed on WhatsApp, so the destination
// number is a business fact the owner states, not a placeholder.
describe("WhatsApp contact", () => {
  it("sends orders to the number the owner gave", () => {
    expect(INITIAL_SETTINGS.whatsappNumber).toBe("556599019551");
    expect(INITIAL_SETTINGS.whatsappDisplay).toBe("+55 65 9901-9551");
  });

  it("keeps the number in the international digits wa.me expects", () => {
    expect(INITIAL_SETTINGS.whatsappNumber.replace(/\D/g, "")).toBe(
      INITIAL_SETTINGS.whatsappNumber,
    );
    expect(INITIAL_SETTINGS.whatsappNumber.startsWith("5565")).toBe(true);
  });
});
