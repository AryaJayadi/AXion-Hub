"use client";

import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

type ActionMenuItem =
	| {
			label: string;
			icon?: ReactNode;
			onClick: () => void;
			variant?: "default" | "destructive";
			disabled?: boolean;
	  }
	| { type: "separator" };

interface ActionMenuProps {
	/** Custom trigger element (defaults to three-dot icon button) */
	trigger?: ReactNode;
	/** Menu items and separators */
	items: ActionMenuItem[];
	/** Additional class names for the trigger container */
	className?: string;
}

function ActionMenu({ trigger, items, className }: ActionMenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				{trigger ?? (
					<Button
						variant="ghost"
						size="icon"
						className={className}
						aria-label="Open actions menu"
					>
						<MoreHorizontal className="size-4" />
					</Button>
				)}
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-[160px]">
				{items.map((item, index) => {
					if ("type" in item && item.type === "separator") {
						return (
							<DropdownMenuSeparator
								key={`sep-${index.toString()}`}
							/>
						);
					}

					const menuItem = item as Exclude<ActionMenuItem, { type: "separator" }>;

					return (
						<DropdownMenuItem
							key={menuItem.label}
							onClick={menuItem.onClick}
							disabled={menuItem.disabled ?? false}
							variant={menuItem.variant ?? "default"}
							className="cursor-pointer"
						>
							{menuItem.icon && (
								<span className="mr-2 shrink-0">{menuItem.icon}</span>
							)}
							{menuItem.label}
						</DropdownMenuItem>
					);
				})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export { ActionMenu };
export type { ActionMenuProps, ActionMenuItem };
