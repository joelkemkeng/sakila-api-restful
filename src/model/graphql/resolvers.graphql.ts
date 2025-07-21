import { IUser, IUserCreate, IUserUpdate, customerToUser, userToCustomer, ICustomer } from "../../model/types/IUser";
import { IUserFile } from "../../model/types/IUserFile";
import { ORM } from "../../utility/ORM/ORM";
import { GraphQLResolveInfo } from "graphql";
import { RowDataPacket } from "mysql2";

const READ_COLUMNS = ['customer_id', 'last_name', 'first_name', 'email', 'active'];
const USER_COLUMNS = ['userId', 'familyName', 'givenName', 'email', 'active'];

// Type pour les résultats de MySQL
type CustomerRow = ICustomer & RowDataPacket;

export const GRAPHQL_RESOLVERS = {
  Query: {
    users: async (parent: any, args: any, contextValue: any, info: GraphQLResolveInfo) => {
      const result = await ORM.Index<CustomerRow>({
        table: 'customer',
        columns: READ_COLUMNS,
      });
      
      // Convertir les résultats de customers à users
      return result.rows.map(customer => customerToUser(customer as ICustomer));     
    }, 
    user: async (parent: any, args: any, contextValue: any, info: GraphQLResolveInfo) => {
      const customer = await ORM.Read<CustomerRow>({
        table: 'customer', 
        idKey: 'customer_id', 
        idValue: args.userId, 
        columns: READ_COLUMNS
      });
      
      // Convertir le résultat de customer à user
      return customerToUser(customer as ICustomer);
    },    
  },  
  User: {
    files: async (parent: any) => {
      // Utiliser la propriété userId de l'objet parent (déjà converti via customerToUser)
      const files = await ORM.Index<IUserFile & RowDataPacket>({
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
    addUser: async (parent: any, args: IUserCreate, contextValue: any, info: GraphQLResolveInfo) => {
      // Convertir les données de user à customer
      const customerData = userToCustomer(args);
      
      // Ajouter le customer dans la base de données
      const result = await ORM.Create({
        table: 'customer',
        body: customerData
      });
      
      // Lire le customer nouvellement créé
      const newCustomer = await ORM.Read<CustomerRow>({
        table: 'customer',
        idKey: 'customer_id',
        idValue: result.id,
        columns: READ_COLUMNS
      });
      
      // Retourner le customer converti en user
      return customerToUser(newCustomer as ICustomer);
    },
    updateUser: async (parent: any, args: { userId: number, user: IUserUpdate }, contextValue: any, info: GraphQLResolveInfo) => {
      // Convertir les données de user à customer
      const customerData = userToCustomer(args.user);
      
      // Mettre à jour le customer dans la base de données
      const updateResult = await ORM.Update({
        table: 'customer',
        idKey: 'customer_id',
        idValue: args.userId,
        body: customerData
      });
      
      // Lire le customer mis à jour
      const updatedCustomer = await ORM.Read<CustomerRow>({
        table: 'customer',
        idKey: 'customer_id',
        idValue: args.userId,
        columns: READ_COLUMNS
      });
      
      // Retourner le customer converti en user
      return customerToUser(updatedCustomer as ICustomer);
    },
    deleteUser: async (parent: any, args: { userId: number }, contextValue: any, info: GraphQLResolveInfo) => {
      // Supprimer le customer de la base de données
      await ORM.Delete({
        table: 'customer',
        idKey: 'customer_id',
        idValue: args.userId
      });
      
      return true;
    }
  }
};