"use client";

import { useQuery } from "@tanstack/react-query";

import type { Model } from "@/entities/model-provider/model/types";
import { queryKeys } from "@/shared/lib/query-keys";

import { useProviders } from "./use-providers";

/** A model with its provider info attached */
export interface CatalogModel extends Model {
	providerName: string;
}

/** Hook returning all models from all providers, flattened with provider info */
export function useModelCatalog() {
	const { data: providers } = useProviders();

	return useQuery({
		queryKey: queryKeys.models.catalog(),
		queryFn: async (): Promise<CatalogModel[]> => {
			if (!providers) return [];

			return providers.flatMap((provider) =>
				provider.models.map((model) => ({
					...model,
					providerName: provider.name,
				})),
			);
		},
		staleTime: Number.POSITIVE_INFINITY,
		enabled: !!providers,
	});
}
