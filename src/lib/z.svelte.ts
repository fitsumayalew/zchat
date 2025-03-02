import { Z } from "zero-svelte";
import { schema, type Schema } from '../zero.schema';
import { PUBLIC_SERVER } from "$env/static/public";

export const z = new Z<Schema>({
	server: PUBLIC_SERVER,
	schema,
	userID: 'anon',
});