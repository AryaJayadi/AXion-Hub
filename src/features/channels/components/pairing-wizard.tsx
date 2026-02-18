"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/ui/button";
import { usePairingStore } from "../model/pairing-store";
import { PairingStepPlatform } from "./pairing-step-platform";
import { PairingStepAuthenticate } from "./pairing-step-authenticate";
import { PairingStepConfigure } from "./pairing-step-configure";
import { PairingStepConfirm } from "./pairing-step-confirm";

const STEPS = [
	{ label: "Platform", description: "Choose messaging platform" },
	{ label: "Authenticate", description: "Connect to the platform" },
	{ label: "Configure", description: "Set up channel options" },
	{ label: "Confirm", description: "Review and complete" },
] as const;

export function PairingWizard() {
	const currentStep = usePairingStore((s) => s.currentStep);
	const setStep = usePairingStore((s) => s.setStep);
	const resetWizard = usePairingStore((s) => s.resetWizard);

	// Reset wizard on unmount to clear stale state
	useEffect(() => {
		return () => {
			resetWizard();
		};
	}, [resetWizard]);

	function handleBack() {
		if (currentStep > 0) {
			setStep(currentStep - 1);
		}
	}

	return (
		<div className="space-y-8">
			{/* Step Progress Indicator */}
			<nav aria-label="Pairing wizard progress" className="px-4">
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
									<button
										type="button"
										onClick={() => {
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

			{/* Step Title and Description */}
			<div className="text-center">
				<h2 className="text-lg font-semibold">{STEPS[currentStep]?.label}</h2>
				<p className="text-sm text-muted-foreground">
					{STEPS[currentStep]?.description}
				</p>
			</div>

			{/* Step Content */}
			<div className="min-h-[400px]">
				{currentStep === 0 && <PairingStepPlatform />}
				{currentStep === 1 && <PairingStepAuthenticate />}
				{currentStep === 2 && <PairingStepConfigure />}
				{currentStep === 3 && <PairingStepConfirm />}
			</div>

			{/* Back Navigation */}
			{currentStep > 0 && currentStep < 3 && (
				<div className="flex items-center border-t pt-6">
					<Button
						variant="outline"
						onClick={handleBack}
						disabled={currentStep === 0}
					>
						Back
					</Button>
				</div>
			)}
		</div>
	);
}
