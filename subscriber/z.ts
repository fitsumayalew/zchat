import { Zero } from "@rocicorp/zero";
import { schema } from "../src/zero.schema";
import { SignJWT } from "jose";
import { must } from "./utils";


const PUBLIC_SERVER = must(process.env.PUBLIC_SERVER)
const ZERO_AUTH_SECRET = must(process.env.ZERO_AUTH_SECRET)


const jwtPayload = {
    sub: ZERO_AUTH_SECRET,
    iat: Math.floor(Date.now() / 1000),
    name: ZERO_AUTH_SECRET,
};



const token = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(new TextEncoder().encode(must(ZERO_AUTH_SECRET)));



// intialize client
export const z = new Zero({
    server: PUBLIC_SERVER,
    schema,
    userID: ZERO_AUTH_SECRET,
    kvStore: 'mem',
    auth: () => token
});


// main query
const newMessagesQuery = z.query.message.where('isResponseGenerated', 'IS', false).where('role', '=', 'user')
    .related('chat', (q) => q.related('model'));
export const actualQuery = newMessagesQuery.materialize();

export type newMessagesQueryType = typeof actualQuery.data[0];



