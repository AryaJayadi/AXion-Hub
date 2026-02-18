import type { ConfigDiff } from "@/entities/gateway-config";

/**
 * Deep recursive comparison of two objects producing ConfigDiff[].
 * Uses dot-path notation (e.g., "identity.botName") for change paths.
 */
export function computeConfigDiff(
	original: Record<string, unknown>,
	draft: Record<string, unknown>,
	prefix = "",
): ConfigDiff[] {
	const diffs: ConfigDiff[] = [];

	const allKeys = new Set([
		...Object.keys(original),
		...Object.keys(draft),
	]);

	for (const key of allKeys) {
		const path = prefix ? `${prefix}.${key}` : key;
		const oldVal = original[key];
		const newVal = draft[key];

		// Key exists only in original -- removed
		if (!(key in draft)) {
			diffs.push({ path, type: "removed", oldValue: oldVal });
			continue;
		}

		// Key exists only in draft -- added
		if (!(key in original)) {
			diffs.push({ path, type: "added", newValue: newVal });
			continue;
		}

		// Both exist -- compare
		if (oldVal === newVal) continue;

		// Handle null/undefined
		if (oldVal == null || newVal == null) {
			diffs.push({ path, type: "changed", oldValue: oldVal, newValue: newVal });
			continue;
		}

		// Both are plain objects -- recurse
		if (
			typeof oldVal === "object" &&
			typeof newVal === "object" &&
			!Array.isArray(oldVal) &&
			!Array.isArray(newVal)
		) {
			diffs.push(
				...computeConfigDiff(
					oldVal as Record<string, unknown>,
					newVal as Record<string, unknown>,
					path,
				),
			);
			continue;
		}

		// Arrays -- compare by JSON.stringify for simplicity
		if (Array.isArray(oldVal) && Array.isArray(newVal)) {
			if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
				diffs.push({
					path,
					type: "changed",
					oldValue: oldVal,
					newValue: newVal,
				});
			}
			continue;
		}

		// Primitive changed
		diffs.push({ path, type: "changed", oldValue: oldVal, newValue: newVal });
	}

	return diffs;
}

/**
 * Groups diff count by top-level section name (first path segment).
 * e.g., "identity.botName" -> { identity: 1 }
 */
export function countDiffsBySection(
	diffs: ConfigDiff[],
): Record<string, number> {
	const counts: Record<string, number> = {};

	for (const diff of diffs) {
		const section = diff.path.split(".")[0] as string;
		counts[section] = (counts[section] ?? 0) + 1;
	}

	return counts;
}
