import { Z } from "zero-svelte";
import { schema, type Schema } from '../zero.schema';
import { PUBLIC_SERVER } from "$env/static/public";
import type { Zero } from "@rocicorp/zero";

export const z = new Z<Schema>({
	server: PUBLIC_SERVER,
	schema,
	userID: 'anon',
});



let didPreload = false;


export function preload(z: Z<Schema>) {
	if (didPreload) {
		return;
	}

	didPreload = true;


	z.current.query.chat
		.related('messages', q =>
			q.orderBy('createdAt', 'desc')
				.orderBy('role', 'asc')
				.related('user', q => q.one()))
		.limit(100)
		.preload();

	// const baseIssueQuery = z.query.issue
	//   .related('labels')
	//   .related('viewState', q => q.where('userID', z.userID));


	// const {cleanup, complete} = baseChatQuery.preload();
	// complete.then(() => {
	//   console.log('preload complete');
	//   cleanup();
	//   	baseChatQuery
	// 	.related('creator')
	// 	.related('assignee')
	// 	.related('emoji', emoji => emoji.related('creator'))
	// 	.related('comments', comments =>
	// 	  comments
	// 		.related('creator')
	// 		.related('emoji', emoji => emoji.related('creator'))
	// 		.limit(INITIAL_COMMENT_LIMIT)
	// 		.orderBy('created', 'desc'),
	// 	)
	// 	.preload({ttl: days(1)});
	// });

	// z.query.user.preload({ ttl: days(1) });
	// z.query.label.preload({ ttl: days(1) });

	z.current.query.model.preload();
}