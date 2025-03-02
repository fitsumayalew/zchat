// use an actual auth library for production apps
import { eq } from "drizzle-orm";
import { db } from "./db";
import { user } from "../../drizzle.schema";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";

export async function signup(name: string,email: string, password: string) {
    // Check if user exists
    const currentUser = await db.query.user.findFirst({
        where: eq(user.email, email)
    });

    if (currentUser) {
        return {
            error: 'User already exists'
        };
    }

    try {
        const newUser = await db.insert(user).values({
            id:nanoid(),
            name,
            email,
            password: await bcrypt.hash(password, 10)
        }
        );

        return { newUser };
    } catch (error) {
        return {
            error: 'Something went wrong'
        };
    }
}
