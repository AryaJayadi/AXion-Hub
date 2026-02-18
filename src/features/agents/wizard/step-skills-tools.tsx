"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { skillsToolsSchema, type SkillsToolsFormValues } from "../schemas/wizard-schemas";
import { useWizardStore } from "../model/wizard-store";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";

const AVAILABLE_SKILLS = [
	{ id: "code-analysis", label: "Code Analysis" },
	{ id: "web-search", label: "Web Search" },
	{ id: "git-operations", label: "Git Operations" },
	{ id: "summarization", label: "Summarization" },
	{ id: "data-processing", label: "Data Processing" },
];

const AVAILABLE_TOOLS = [
	{ id: "Read", label: "Read" },
	{ id: "Write", label: "Write" },
	{ id: "Bash", label: "Bash" },
	{ id: "Grep", label: "Grep" },
	{ id: "Glob", label: "Glob" },
	{ id: "WebFetch", label: "WebFetch" },
	{ id: "WebSearch", label: "WebSearch" },
];

interface StepSkillsToolsProps {
	onNext: () => void;
}

function CheckboxGroup({
	items,
	value,
	onChange,
	name,
}: {
	items: { id: string; label: string }[];
	value: string[];
	onChange: (val: string[]) => void;
	name: string;
}) {
	function handleToggle(id: string, checked: boolean) {
		if (checked) {
			onChange([...value, id]);
		} else {
			onChange(value.filter((v) => v !== id));
		}
	}

	return (
		<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
			{items.map((item) => (
				<label
					key={item.id}
					className="flex items-center gap-2 rounded-md border border-border p-3 cursor-pointer transition-colors hover:bg-accent/50 has-[:checked]:bg-accent has-[:checked]:border-primary/30"
				>
					<Checkbox
						id={`${name}-${item.id}`}
						checked={value.includes(item.id)}
						onCheckedChange={(checked) =>
							handleToggle(item.id, checked === true)
						}
					/>
					<span className="text-sm">{item.label}</span>
				</label>
			))}
		</div>
	);
}

export function StepSkillsTools({ onNext }: StepSkillsToolsProps) {
	const skillsTools = useWizardStore((s) => s.skillsTools);
	const setSkillsTools = useWizardStore((s) => s.setSkillsTools);

	const { handleSubmit, control } = useForm<SkillsToolsFormValues>({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Zod v4 input/output type mismatch with exactOptionalPropertyTypes
		resolver: zodResolver(skillsToolsSchema) as any,
		defaultValues: {
			skills: skillsTools?.skills ?? [],
			tools: skillsTools?.tools ?? [],
			deniedTools: skillsTools?.deniedTools ?? [],
		},
	});

	function onSubmit(data: SkillsToolsFormValues) {
		setSkillsTools(data);
		onNext();
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
			<div className="space-y-2">
				<h2 className="text-lg font-semibold">Skills & Tools</h2>
				<p className="text-sm text-muted-foreground">
					Select the skills and tools your agent can use. You can also specify
					tools that should be explicitly denied.
				</p>
			</div>

			{/* Skills */}
			<div className="space-y-3">
				<Label>Skills</Label>
				<Controller
					name="skills"
					control={control}
					render={({ field }) => (
						<CheckboxGroup
							items={AVAILABLE_SKILLS}
							value={field.value}
							onChange={field.onChange}
							name="skill"
						/>
					)}
				/>
			</div>

			<Separator />

			{/* Allowed Tools */}
			<div className="space-y-3">
				<Label>Allowed Tools</Label>
				<Controller
					name="tools"
					control={control}
					render={({ field }) => (
						<CheckboxGroup
							items={AVAILABLE_TOOLS}
							value={field.value}
							onChange={field.onChange}
							name="tool"
						/>
					)}
				/>
			</div>

			<Separator />

			{/* Denied Tools */}
			<div className="space-y-3">
				<Label>Denied Tools</Label>
				<p className="text-xs text-muted-foreground">
					Tools listed here will be explicitly blocked from use.
				</p>
				<Controller
					name="deniedTools"
					control={control}
					render={({ field }) => (
						<CheckboxGroup
							items={AVAILABLE_TOOLS}
							value={field.value}
							onChange={field.onChange}
							name="denied"
						/>
					)}
				/>
			</div>

			<div className="flex justify-end">
				<Button type="submit">Next</Button>
			</div>
		</form>
	);
}
