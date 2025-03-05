import type { LayoutServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutServerLoad = (event) => {
	const { locals } = event;
	const user = locals.user;

	if (!user) {
		throw error(401, {
			message: 'You must be logged in to access the chat'
		});
	}
	return {
		user
	};
}


