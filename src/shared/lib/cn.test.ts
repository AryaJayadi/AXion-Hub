import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
	it("merges class names correctly", () => {
		expect(cn("px-2", "py-1")).toBe("px-2 py-1");
	});

	it("handles conflicting Tailwind classes", () => {
		expect(cn("px-2", "px-4")).toBe("px-4");
	});

	it("handles conditional classes", () => {
		expect(cn("base", false && "hidden", "visible")).toBe("base visible");
	});
});
