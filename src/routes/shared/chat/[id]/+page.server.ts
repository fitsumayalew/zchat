import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { chat } from '../../../../drizzle.schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
    const { params, locals } = event;
    const user = locals.user;


    return {
        user,
    };
};