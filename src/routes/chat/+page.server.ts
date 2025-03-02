import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
	logout: async (event) => {
		event.cookies.delete('jwt', { path: '/' });
		throw redirect(302, '/login');
	},
	
}; 