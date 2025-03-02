import type { Handle } from '@sveltejs/kit';
import { ZERO_AUTH_SECRET } from '$env/static/private';
import { jwtVerify } from 'jose';

import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user } from './drizzle.schema';
const handle: Handle = async ({ event, resolve }) => {
	const authCookie = event.cookies.get('jwt');

	if (authCookie) {
		const token = authCookie;

		try {
			const jwtResponse = await jwtVerify(token, new TextEncoder().encode(ZERO_AUTH_SECRET));
			if (typeof jwtResponse === 'string') {
				throw new Error('Something went wrong');
			}

           

            
			const currentUser = await db.query.user.findFirst({
				where: eq(user.id,  jwtResponse.payload.sub as string)
			});

			if (!currentUser) {
				throw new Error('User not found');
			}

			const sessionUser = {
				id: currentUser.id,
				name: currentUser.name,
				jwt: token,
			};

			event.locals.user = sessionUser;
		} catch (error) {
			console.error(error);
		}
	}

	return await resolve(event);
};

export { handle };