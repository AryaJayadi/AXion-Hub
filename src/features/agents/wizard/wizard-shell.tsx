"use client";

import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { useWizardStore } from "../model/wizard-store";
import { StepBasics } from "./step-basics";
import { StepModelConfig } from "./step-model-config";
import { StepIdentity } from "./step-identity";
import { StepSkillsTools } from "./step-skills-tools";
import { StepSandbox } from "./step-sandbox";
import { StepChannels } from "./step-channels";
import { StepReview } from "./step-review";

const STEPS = [
	{ label: "Basics", index: 0 },
	{ label: "Model", index: 1 },
	{ label: "Identity", index: 2 },
	{ label: "Skills & Tools", index: 3 },
	{ label: "Sandbox", index: 4 },
	{ label: "Channels", index: 5 },
	{ label: "Review", index: 6 },
] as const;

interface WizardShellProps {
	onComplete: () => void;
}

export function WizardShell({ onComplete }: WizardShellProps) {
	const currentStep = useWizardStore((s) => s.currentStep);
	const setStep = useWizardStore((s) => s.setStep);

	function handleNext() {
		if (currentStep < STEPS.length - 1) {
			setStep(currentStep + 1);
		}
	}

	function handleBack() {
		if (currentStep > 0) {
			setStep(currentStep - 1);
		}
	}

	function handleSkip() {
		// Step 0 (basics) cannot be skipped -- name is required
		if (currentStep === 0) return;
		handleNext();
	}

	return (
		<div className="space-y-8">
			{/* Step Progress Indicator */}
			<nav aria-label="Wizard progress" className="px-4">
				<ol className="flex items-center justify-between">
					{STEPS.map((step, index) => {
						const isCompleted = index < currentStep;
						const isCurrent = index === currentStep;

						return (
							<li
								key={step.label}
								className="flex flex-1 items-center last:flex-none"
							>
								<div className="flex flex-col items-center gap-2">
									{/* Step circle */}
									<button
										type="button"
										onClick={() => {
											// Allow navigating to completed steps or current step
											if (index <= currentStep) setStep(index);
										}}
										disabled={index > currentStep}
										className={cn(
											"flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all",
											isCompleted &&
												"border-primary bg-primary text-primary-foreground",
											isCurrent &&
												"border-primary bg-background text-primary ring-4 ring-primary/20",
											!isCompleted &&
												!isCurrent &&
												"border-muted-foreground/30 bg-background text-muted-foreground",
											index > currentStep && "cursor-not-allowed",
										)}
									>
										{isCompleted ? (
											<Check className="size-4" />
										) : (
											index + 1
										)}
									</button>
									{/* Step label */}
									<span
										className={cn(
											"text-xs whitespace-nowrap",
											isCurrent
												? "font-medium text-foreground"
												: "text-muted-foreground",
										)}
									>
										{step.label}
									</span>
								</div>

								{/* Connector line */}
								{index < STEPS.length - 1 && (
									<div
										className={cn(
											"mx-2 mt-[-1.5rem] h-0.5 flex-1",
											index < currentStep
												? "bg-primary"
												: "bg-muted-foreground/20",
										)}
									/>
								)}
							</li>
						);
					})}
				</ol>
			</nav>

			{/* Step Content */}
			<div className="min-h-[400px]">
				{currentStep === 0 && <StepBasics onNext={handleNext} />}
				{currentStep === 1 && <StepModelConfig onNext={handleNext} />}
				{currentStep === 2 && <StepIdentity onNext={handleNext} />}
				{currentStep === 3 && <StepSkillsTools onNext={handleNext} />}
				{currentStep === 4 && <StepSandbox onNext={handleNext} />}
				{currentStep === 5 && <StepChannels onNext={handleNext} />}
				{currentStep === 6 && <StepReview onComplete={onComplete} />}
			</div>

			{/* Navigation Buttons */}
			{currentStep < 6 && (
				<div className="flex items-center justify-between border-t pt-6">
					<Button
						variant="outline"
						onClick={handleBack}
						disabled={currentStep === 0}
					>
						Back
					</Button>

					<div className="flex items-center gap-3">
						{currentStep > 0 && (
							<Button variant="ghost" onClick={handleSkip}>
								Skip
							</Button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
