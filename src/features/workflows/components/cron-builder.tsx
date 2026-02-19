"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import cronstrue from "cronstrue";
import { Cron } from "croner";
import { format } from "date-fns";
import { Clock, AlertCircle } from "lucide-react";

import { cn } from "@/shared/lib/cn";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { Checkbox } from "@/shared/ui/checkbox";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Frequency = "minute" | "hourly" | "daily" | "weekly" | "monthly" | "custom";

interface BuilderState {
	frequency: Frequency;
	minute: number;
	hour: number;
	dayOfWeek: number[];
	dayOfMonth: number;
}

interface CronBuilderProps {
	value: string;
	onChange: (newExpression: string) => void;
	onSave?: () => void;
}

// ---------------------------------------------------------------------------
// Day labels
// ---------------------------------------------------------------------------

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 0]; // cron: 0=Sun, 1=Mon

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function builderStateToExpression(state: BuilderState): string {
	switch (state.frequency) {
		case "minute":
			return "* * * * *";
		case "hourly":
			return `${state.minute} * * * *`;
		case "daily":
			return `${state.minute} ${state.hour} * * *`;
		case "weekly": {
			const days =
				state.dayOfWeek.length > 0 ? state.dayOfWeek.join(",") : "*";
			return `${state.minute} ${state.hour} * * ${days}`;
		}
		case "monthly":
			return `${state.minute} ${state.hour} ${state.dayOfMonth} * *`;
		case "custom":
			return "* * * * *";
	}
}

function parseExpressionToState(expression: string): BuilderState | null {
	const parts = expression.trim().split(/\s+/);
	if (parts.length !== 5) return null;

	const [min, hr, dom, , dow] = parts;

	// Every minute
	if (min === "*" && hr === "*" && dom === "*" && dow === "*") {
		return { frequency: "minute", minute: 0, hour: 0, dayOfWeek: [], dayOfMonth: 1 };
	}

	// Hourly
	if (hr === "*" && dom === "*" && dow === "*" && min !== "*") {
		const m = Number.parseInt(min as string, 10);
		if (!Number.isNaN(m)) {
			return { frequency: "hourly", minute: m, hour: 0, dayOfWeek: [], dayOfMonth: 1 };
		}
	}

	// Weekly
	if (dom === "*" && dow !== "*" && min !== "*" && hr !== "*") {
		const m = Number.parseInt(min as string, 10);
		const h = Number.parseInt(hr as string, 10);
		const days = (dow as string).split(",").map((d) => Number.parseInt(d, 10)).filter((d) => !Number.isNaN(d));
		if (!Number.isNaN(m) && !Number.isNaN(h) && days.length > 0) {
			return { frequency: "weekly", minute: m, hour: h, dayOfWeek: days, dayOfMonth: 1 };
		}
	}

	// Monthly
	if (dom !== "*" && dow === "*" && min !== "*" && hr !== "*") {
		const m = Number.parseInt(min as string, 10);
		const h = Number.parseInt(hr as string, 10);
		const d = Number.parseInt(dom as string, 10);
		if (!Number.isNaN(m) && !Number.isNaN(h) && !Number.isNaN(d)) {
			return { frequency: "monthly", minute: m, hour: h, dayOfWeek: [], dayOfMonth: d };
		}
	}

	// Daily
	if (dom === "*" && dow === "*" && min !== "*" && hr !== "*") {
		const m = Number.parseInt(min as string, 10);
		const h = Number.parseInt(hr as string, 10);
		if (!Number.isNaN(m) && !Number.isNaN(h)) {
			return { frequency: "daily", minute: m, hour: h, dayOfWeek: [], dayOfMonth: 1 };
		}
	}

	return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CronBuilder({ value, onChange }: CronBuilderProps) {
	const [isRawMode, setIsRawMode] = useState(false);
	const [rawInput, setRawInput] = useState(value);
	const [builderState, setBuilderState] = useState<BuilderState>(() => {
		const parsed = parseExpressionToState(value);
		return parsed ?? { frequency: "daily", minute: 0, hour: 0, dayOfWeek: [], dayOfMonth: 1 };
	});

	// Sync raw input when value changes externally
	useEffect(() => {
		setRawInput(value);
	}, [value]);

	// Generate human-readable description and next runs
	const preview = useMemo(() => {
		try {
			const description = cronstrue.toString(value, { use24HourTimeFormat: true });
			const cron = new Cron(value);
			const nextRuns = cron.nextRuns(5);
			return { description, nextRuns, error: null };
		} catch {
			return { description: null, nextRuns: [], error: "Invalid cron expression" };
		}
	}, [value]);

	// Update expression from builder state
	const updateFromBuilder = useCallback(
		(newState: BuilderState) => {
			setBuilderState(newState);
			const expr = builderStateToExpression(newState);
			onChange(expr);
		},
		[onChange],
	);

	// Handle frequency change
	const handleFrequencyChange = useCallback(
		(freq: string) => {
			if (freq === "custom") {
				setIsRawMode(true);
				setBuilderState((prev) => ({ ...prev, frequency: "custom" }));
				return;
			}
			const newState: BuilderState = {
				...builderState,
				frequency: freq as Frequency,
			};
			updateFromBuilder(newState);
		},
		[builderState, updateFromBuilder],
	);

	// Handle raw expression change
	const handleRawChange = useCallback(
		(raw: string) => {
			setRawInput(raw);
			onChange(raw);
		},
		[onChange],
	);

	// Toggle raw mode
	const handleRawToggle = useCallback(
		(checked: boolean) => {
			setIsRawMode(checked);
			if (!checked) {
				// Switch from raw to visual -- try to parse current expression
				const parsed = parseExpressionToState(value);
				if (parsed) {
					setBuilderState(parsed);
				}
			}
		},
		[value],
	);

	// Day of week toggle
	const toggleDayOfWeek = useCallback(
		(day: number) => {
			const current = builderState.dayOfWeek;
			const next = current.includes(day)
				? current.filter((d) => d !== day)
				: [...current, day].sort((a, b) => a - b);
			updateFromBuilder({ ...builderState, dayOfWeek: next });
		},
		[builderState, updateFromBuilder],
	);

	return (
		<div className="space-y-4">
			{/* Mode toggle */}
			<div className="flex items-center justify-between">
				<Label className="text-sm font-medium">Cron Expression</Label>
				<div className="flex items-center gap-2">
					<Label htmlFor="raw-mode-toggle" className="text-xs text-muted-foreground">
						Raw expression
					</Label>
					<Switch
						id="raw-mode-toggle"
						size="sm"
						checked={isRawMode}
						onCheckedChange={handleRawToggle}
					/>
				</div>
			</div>

			{/* Builder / Raw input */}
			{isRawMode ? (
				<div className="space-y-2">
					<Input
						value={rawInput}
						onChange={(e) => handleRawChange(e.target.value)}
						placeholder="* * * * *"
						className="font-mono"
					/>
					<p className="text-xs text-muted-foreground">
						Standard 5-field cron: minute hour day-of-month month day-of-week
					</p>
				</div>
			) : (
				<div className="space-y-3">
					{/* Frequency select */}
					<div className="space-y-1.5">
						<Label className="text-xs">Frequency</Label>
						<Select
							value={builderState.frequency}
							onValueChange={handleFrequencyChange}
						>
							<SelectTrigger className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="minute">Every Minute</SelectItem>
								<SelectItem value="hourly">Hourly</SelectItem>
								<SelectItem value="daily">Daily</SelectItem>
								<SelectItem value="weekly">Weekly</SelectItem>
								<SelectItem value="monthly">Monthly</SelectItem>
								<SelectItem value="custom">Custom (Raw)</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Conditional fields */}
					{builderState.frequency === "minute" && (
						<p className="text-sm text-muted-foreground">
							Runs every minute
						</p>
					)}

					{builderState.frequency === "hourly" && (
						<div className="space-y-1.5">
							<Label className="text-xs">At minute</Label>
							<Input
								type="number"
								min={0}
								max={59}
								value={builderState.minute}
								onChange={(e) =>
									updateFromBuilder({
										...builderState,
										minute: Math.min(59, Math.max(0, Number.parseInt(e.target.value, 10) || 0)),
									})
								}
								className="w-24"
							/>
						</div>
					)}

					{builderState.frequency === "daily" && (
						<div className="flex items-end gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs">Hour</Label>
								<Select
									value={builderState.hour.toString()}
									onValueChange={(v) =>
										updateFromBuilder({
											...builderState,
											hour: Number.parseInt(v, 10),
										})
									}
								>
									<SelectTrigger className="w-20">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Array.from({ length: 24 }, (_, i) => (
											<SelectItem key={`h-${i.toString()}`} value={i.toString()}>
												{i.toString().padStart(2, "0")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Minute</Label>
								<Select
									value={builderState.minute.toString()}
									onValueChange={(v) =>
										updateFromBuilder({
											...builderState,
											minute: Number.parseInt(v, 10),
										})
									}
								>
									<SelectTrigger className="w-20">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Array.from({ length: 60 }, (_, i) => (
											<SelectItem key={`m-${i.toString()}`} value={i.toString()}>
												{i.toString().padStart(2, "0")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					)}

					{builderState.frequency === "weekly" && (
						<div className="space-y-3">
							<div className="space-y-1.5">
								<Label className="text-xs">Days</Label>
								<div className="flex flex-wrap gap-2">
									{DAY_LABELS.map((label, idx) => {
										const dayVal = DAY_VALUES[idx] as number;
										const checked = builderState.dayOfWeek.includes(dayVal);
										return (
											<label
												key={label}
												className={cn(
													"flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors",
													checked
														? "border-primary bg-primary/10 text-primary"
														: "border-border text-muted-foreground hover:bg-muted",
												)}
											>
												<Checkbox
													checked={checked}
													onCheckedChange={() => toggleDayOfWeek(dayVal)}
													className="sr-only"
												/>
												{label}
											</label>
										);
									})}
								</div>
							</div>
							<div className="flex items-end gap-3">
								<div className="space-y-1.5">
									<Label className="text-xs">Hour</Label>
									<Select
										value={builderState.hour.toString()}
										onValueChange={(v) =>
											updateFromBuilder({
												...builderState,
												hour: Number.parseInt(v, 10),
											})
										}
									>
										<SelectTrigger className="w-20">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Array.from({ length: 24 }, (_, i) => (
												<SelectItem key={`wh-${i.toString()}`} value={i.toString()}>
													{i.toString().padStart(2, "0")}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs">Minute</Label>
									<Select
										value={builderState.minute.toString()}
										onValueChange={(v) =>
											updateFromBuilder({
												...builderState,
												minute: Number.parseInt(v, 10),
											})
										}
									>
										<SelectTrigger className="w-20">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{Array.from({ length: 60 }, (_, i) => (
												<SelectItem key={`wm-${i.toString()}`} value={i.toString()}>
													{i.toString().padStart(2, "0")}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					)}

					{builderState.frequency === "monthly" && (
						<div className="flex items-end gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs">Day of month</Label>
								<Select
									value={builderState.dayOfMonth.toString()}
									onValueChange={(v) =>
										updateFromBuilder({
											...builderState,
											dayOfMonth: Number.parseInt(v, 10),
										})
									}
								>
									<SelectTrigger className="w-20">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Array.from({ length: 31 }, (_, i) => (
											<SelectItem key={`dom-${(i + 1).toString()}`} value={(i + 1).toString()}>
												{(i + 1).toString()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Hour</Label>
								<Select
									value={builderState.hour.toString()}
									onValueChange={(v) =>
										updateFromBuilder({
											...builderState,
											hour: Number.parseInt(v, 10),
										})
									}
								>
									<SelectTrigger className="w-20">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Array.from({ length: 24 }, (_, i) => (
											<SelectItem key={`mh-${i.toString()}`} value={i.toString()}>
												{i.toString().padStart(2, "0")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Minute</Label>
								<Select
									value={builderState.minute.toString()}
									onValueChange={(v) =>
										updateFromBuilder({
											...builderState,
											minute: Number.parseInt(v, 10),
										})
									}
								>
									<SelectTrigger className="w-20">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{Array.from({ length: 60 }, (_, i) => (
											<SelectItem key={`mm-${i.toString()}`} value={i.toString()}>
												{i.toString().padStart(2, "0")}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Preview section -- always visible */}
			<div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
				{preview.error ? (
					<div className="flex items-center gap-2 text-sm text-destructive">
						<AlertCircle className="size-4" />
						<span>{preview.error}</span>
					</div>
				) : (
					<>
						<p className="text-sm font-semibold">{preview.description}</p>
						{preview.nextRuns.length > 0 && (
							<div className="space-y-1">
								<p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
									<Clock className="size-3" />
									Next 5 runs
								</p>
								<ul className="space-y-0.5">
									{preview.nextRuns.map((run, idx) => (
										<li
											key={`nr-${idx.toString()}`}
											className="text-xs text-muted-foreground font-mono"
										>
											{format(run, "yyyy-MM-dd HH:mm:ss")}
										</li>
									))}
								</ul>
							</div>
						)}
					</>
				)}
			</div>

			{/* Current expression readout */}
			<div className="flex items-center gap-2">
				<span className="text-xs text-muted-foreground">Expression:</span>
				<code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
					{value}
				</code>
			</div>
		</div>
	);
}
