import { db } from "./db";
import { eq } from "drizzle-orm";
import { user } from "../../drizzle.schema";
import bcrypt from "bcryptjs";
import { ZERO_AUTH_SECRET } from "$env/static/private";
import { SignJWT } from "jose";


export async function login(email: string, password: string) {
    // Check if user exists
    const currentUser = await db.query.user.findFirst({
        where: eq(user.email, email)
    });

    if (!currentUser) {
        return {
            error: 'Invalid credentials'
        };
    }

    // Verify the password
    const passwordIsValid = await bcrypt.compare(password, currentUser.password);

    if (!passwordIsValid) {
        return {
            error: 'Invalid credentials'
        };
    }

    const jwtPayload = {
        sub: currentUser.id,
        iat: Math.floor(Date.now() / 1000),
        name: currentUser.name,
      };


    const token = await new SignJWT(jwtPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1d')
        .sign(new TextEncoder().encode(must(ZERO_AUTH_SECRET)));

    return { token };
}


function must<T>(val: T) {
    if (!val) {
      throw new Error("Expected value to be defined");
    }
    return val;
  }