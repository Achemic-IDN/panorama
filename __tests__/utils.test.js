import { escapeHtml } from "@/lib/utils";

describe("escapeHtml utility", () => {
  it("should escape special characters to HTML entities", () => {
    const raw = `"<>&'`;
    expect(escapeHtml(raw)).toBe("&quot;&lt;&gt;&amp;&#39;");
  });

  it("should return empty string for null/undefined", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });
});
