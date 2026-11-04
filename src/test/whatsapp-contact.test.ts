import { describe, expect, it } from "vitest";

import { INITIAL_SETTINGS } from "@/data/initialCatalog";

// The store has no checkout: every sale is closed on WhatsApp, so the destination
// number is a business fact the owner states, not a placeholder.
describe("WhatsApp contact", () => {
  it("sends orders to the number the owner gave", () => {
    expect(INITIAL_SETTINGS.whatsappNumber).toBe("5565996637773");
    expect(INITIAL_SETTINGS.whatsappDisplay).toBe("+55 65 99663-7773");
  });

  it("keeps the number in the international digits wa.me expects", () => {
    expect(INITIAL_SETTINGS.whatsappNumber.replace(/\D/g, "")).toBe(
      INITIAL_SETTINGS.whatsappNumber,
    );
    expect(INITIAL_SETTINGS.whatsappNumber.startsWith("5565")).toBe(true);
  });
});

// Social and e-mail are the only other ways a customer reaches the store.
describe("Social and e-mail contact", () => {
  it("shows the Instagram the owner gave", () => {
    expect(INITIAL_SETTINGS.instagram).toBe("@grm.sportsbr");
    expect(INITIAL_SETTINGS.instagramUrl).toBe(
      "https://www.instagram.com/grm.sportsbr/",
    );
  });

  it("shows the e-mail the owner gave", () => {
    expect(INITIAL_SETTINGS.email).toBe("grm.sports00@gmail.com");
  });
});
