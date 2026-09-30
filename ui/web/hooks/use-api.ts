"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

import { apiRequest, type ApiEnvelope } from "@/lib/api-client";

import type {
  AdminStatsPayload,
  CategoriesListPayload,
  CategoryPayload,
  CreateCategoryInput,
  UpdateCategoryInput,
  NotificationsListPayload,
  NotificationPayload,
  CreateNotificationInput,
  UpdateNotificationInput,
  OrganizationsListPayload,
  OrganizationPayload,
  CreateOrganizationInput,
  UpdateOrganizationInput,
  SubscriptionsListPayload,
  SubscriptionPayload,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  UsersListPayload,
  UserPayload,
  CreateUserInput,
  UpdateUserInput,
  DeletePayload,
} from "@/types/api";

type HttpMethod = "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * QUERY
 */

interface ApiQueryOptions<TData, TSelected = TData> {
  queryKey: QueryKey;

  url: string;

  enabled?: boolean;

  select?: (data: ApiEnvelope<TData>) => TSelected;

  options?: Omit<
    UseQueryOptions<ApiEnvelope<TData>, Error, TSelected, QueryKey>,
    "queryKey" | "queryFn"
  >;
}

export function useApiQuery<TData, TSelected = ApiEnvelope<TData>>({
  queryKey,
  url,
  enabled = true,
  select,
  options,
}: ApiQueryOptions<TData, TSelected>) {
  return useQuery<ApiEnvelope<TData>, Error, TSelected>(
    {
      queryKey,
      queryFn: () =>
        apiRequest<TData>({
          url,
          method: "GET",
        }),
      enabled,
      select,
      ...options,
    }
  );
}

/**
 * MUTATION
 */

interface ApiMutationOptions<TResponse, TVariables, TBody = TVariables> {
  method: HttpMethod;

  url: string | ((variables: TVariables) => string);

  body?: (variables: TVariables) => TBody;

  invalidateKeys?: QueryKey[];

  mutationOptions?: Omit<
    UseMutationOptions<ApiEnvelope<TResponse>, Error, TVariables>,
    "mutationFn"
  >;
}

function resolveUrl<TVariables>(
  url: string | ((variables: TVariables) => string),
  variables: TVariables,
) {
  return typeof url === "function" ? url(variables) : url;
}

export function useApiMutation<TResponse, TVariables, TBody = TVariables>({
  method,
  url,
  body,
  invalidateKeys = [],
  mutationOptions,
}: ApiMutationOptions<TResponse, TVariables, TBody>) {
  const queryClient = useQueryClient();

  return useMutation<ApiEnvelope<TResponse>, Error, TVariables>({
    mutationFn: (variables) => {
      return apiRequest<TResponse, TBody>({
        url: resolveUrl(url, variables),

        method,

        data: body ? body(variables) : (variables as unknown as TBody),
      });
    },

    ...mutationOptions,

    onSuccess: async (data, variables, context) => {
      // @ts-ignore
      await mutationOptions?.onSuccess?.(data, variables, context);

      await Promise.all(
        invalidateKeys.map((key) =>
          queryClient.invalidateQueries({
            queryKey: key,
          }),
        ),
      );
    },
  });
}

/**
 * ADMIN
 */

export function useAdminStats() {
  return useApiQuery<AdminStatsPayload, AdminStatsPayload>({
    queryKey: ["admin", "stats"],
    url: "/api/stats",
    select: (envelope) => envelope.data as AdminStatsPayload,
  });
}

/**
 * CATEGORIES
 */

export function useCategoriesApi() {
  return {
    list: useApiQuery<CategoriesListPayload>({
      queryKey: ["categories"],
      url: "/categories",
    }),

    create: useApiMutation<CategoryPayload, CreateCategoryInput>({
      method: "POST",
      url: "/categories",
      invalidateKeys: [["categories"]],
    }),

    update: useApiMutation<
      CategoryPayload,
      {
        id: string;
        data: UpdateCategoryInput;
      },
      UpdateCategoryInput
    >({
      method: "PATCH",

      url: ({ id }) => `/categories/${id}`,

      body: ({ data }) => data,

      invalidateKeys: [["categories"]],
    }),

    remove: useApiMutation<
      DeletePayload,
      {
        id: string;
      },
      undefined
    >({
      method: "DELETE",

      url: ({ id }) => `/categories/${id}`,

      body: () => undefined,

      invalidateKeys: [["categories"]],
    }),
  };
}
