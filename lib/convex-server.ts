import { auth } from "@clerk/nextjs/server";
import {
  fetchQuery as convexFetchQuery,
  fetchMutation as convexFetchMutation,
  preloadQuery as convexPreloadQuery,
} from "convex/nextjs";
import { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";
import { Preloaded } from "convex/react";

const JWT_TEMPLATE = "convex";

/**
 * Get the Clerk auth token for Convex
 */
export async function getAuthToken() {
  const { getToken } = await auth();
  const token = await getToken({ template: JWT_TEMPLATE });
  return token ?? undefined;
}

/**
 * Fetch a Convex query with authentication
 */
export async function fetchQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query>
): Promise<FunctionReturnType<Query>> {
  const token = await getAuthToken();
  return convexFetchQuery(query, args, { token });
}

/**
 * Execute a Convex mutation with authentication
 */
export async function fetchMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
  args: FunctionArgs<Mutation>
): Promise<FunctionReturnType<Mutation>> {
  const token = await getAuthToken();
  return convexFetchMutation(mutation, args, { token });
}

/**
 * Preload a Convex query with authentication (for server components)
 */
export async function preloadQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args: FunctionArgs<Query>
): Promise<Preloaded<Query>> {
  const token = await getAuthToken();
  return convexPreloadQuery(query, args, { token });
}
