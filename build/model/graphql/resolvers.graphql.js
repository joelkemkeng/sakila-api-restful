"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GRAPHQL_RESOLVERS = void 0;
const ORM_1 = require("../../utility/ORM/ORM");
const READ_COLUMNS = ['userId', 'familyName', 'givenName', 'email'];
exports.GRAPHQL_RESOLVERS = {
    Query: {
        users: async (parent, args, contextValue, info) => {
            const users = await ORM_1.ORM.Index({
                table: 'user',
                columns: READ_COLUMNS,
            });
            return users.rows;
        },
        user: async (parent, args, contextValue, info) => {
            return ORM_1.ORM.Read({
                table: 'user',
                idKey: 'userId',
                idValue: args.userId,
                columns: READ_COLUMNS
            });
        },
    },
    User: {
        files: async (parent) => {
            const files = await ORM_1.ORM.Index({
                table: 'user_file',
                columns: ['fileId', 'userId', 'storageKey', 'filename', 'mimeType'],
                where: {
                    userId: parent.userId
                }
            });
            return files.rows;
        }
    },
    Mutation: {
        addUser: async (parent, args, contextValue, info) => {
            const result = await ORM_1.ORM.Create({
                table: 'user',
                body: args,
            });
            return await ORM_1.ORM.Read({
                table: 'user',
                idKey: 'userId',
                idValue: result.id,
                columns: READ_COLUMNS
            });
        },
        updateUser: async (parent, args, contextValue, info) => {
            const result = await ORM_1.ORM.Update({
                table: 'user',
                idKey: 'userId',
                idValue: args.userId,
                body: args.user,
            });
            return await ORM_1.ORM.Read({
                table: 'user',
                idKey: 'userId',
                idValue: result.id,
                columns: READ_COLUMNS
            });
        },
        deleteUser: async (parent, args, contextValue, info) => {
            await ORM_1.ORM.Delete({
                table: 'user',
                idKey: 'userId',
                idValue: args.userId,
            });
            return true;
        },
    }
};
