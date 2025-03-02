
import { createZeroSchema } from "drizzle-zero";
import * as drizzleSchema from "./drizzle.schema";

import {
  definePermissions,
  type Row,
  type ExpressionBuilder,
  NOBODY_CAN,
} from "@rocicorp/zero";


export const schema = createZeroSchema(drizzleSchema, {
    version:1,
    tables: {
        user:{
            id:true,
            name:true,
            email:true,
            password:true,
            createdAt:true,
            updatedAt:true,
        },
        chat:{
            id:true,
            userID:true,
            modelID:true,
            title:true,
            createdAt:true,
            updatedAt:true,
        },
        message:{
            id:true,
            chatID:true,
            userID:true,
            role:true,
            content:true,
            isMessageFinished:true,
            createdAt:true,
            updatedAt:true,
        },
        model:{
            id:true,
            name:true,
            slug:true,
            createdAt:true,
            updatedAt:true,
        }
    },
    
})

export type Schema = typeof schema;
type TableName = keyof Schema['tables'];
type User = Row<typeof schema.tables.user>;
type Chat = Row<typeof schema.tables.chat>;
type Message = Row<typeof schema.tables.message>;
type Model = Row<typeof schema.tables.model>;


type AuthData = {
  sub: string;
  name:string;
};



export const permissions: ReturnType<typeof definePermissions>

    = definePermissions<AuthData, Schema>(schema, () => {

      const userIsLoggedIn = (
        authData: AuthData,
        {cmpLit}: ExpressionBuilder<Schema, TableName>,
      ) => cmpLit(authData.sub, 'IS NOT', null);
  

      const loggedInUserIsCreator = (
        authData: AuthData,
        eb: ExpressionBuilder<Schema, 'chat' | 'message'>,
      ) =>
        eb.and(
          userIsLoggedIn(authData, eb),
          eb.cmp('userID', '=', authData.sub),
        );
  
 

    return{
      
        user:{
            row:{
                insert: NOBODY_CAN,
                select: NOBODY_CAN,
                delete:NOBODY_CAN,
                update:{
                    preMutation: NOBODY_CAN,
                    postMutation: NOBODY_CAN,
                },
            }
        },
        model:{
            row:{
                insert: NOBODY_CAN,
                select: [userIsLoggedIn],
                delete: NOBODY_CAN,
                update: {
                    preMutation: NOBODY_CAN,
                    postMutation: NOBODY_CAN,
                },
            }
        },
        chat:{
            row:{
                insert: NOBODY_CAN,
                select: [loggedInUserIsCreator],
                delete:[loggedInUserIsCreator],
                update:{
                    preMutation: NOBODY_CAN,
                    postMutation: NOBODY_CAN,
                },
            }
        },
        message:{
            row:{
                insert: NOBODY_CAN,
                select: [loggedInUserIsCreator],
                delete: NOBODY_CAN,
                update:{
                    preMutation: NOBODY_CAN,
                    postMutation: NOBODY_CAN,
                },
            }
        }
    }
  });


