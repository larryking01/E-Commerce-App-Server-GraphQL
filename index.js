// the dependencies.
const { ApolloServer, gql } =  require('apollo-server')
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core')
// import { firebaseAuth, fireStore, firebaseStorage } from './firebase/firebaseConfig.js'


// relative imports.
const Query = require('./graphql/queryResolvers.js')
const Mutation = require('./graphql/mutationResolvers.js')


// to use firebase storage in client sdk instead of admin sdk
global.XMLHttpRequest = require('xhr2')



// the type definitions.
const typeDefs = gql `


    # custom types.
    type User {
        username: String!
        email: String!
        createdAt: String!
        profilePhotoUrl: String!
    
    }


    type Product {
        productID: ID
        name: String!
        manufacturer: String!
        productType: String!
        gender: String!
        price: String!
        collectionName: String!
        dateAdded: String!
        yearReleased: String!
        coverPhotoUrl: String!
        extraPhotoUrl1: String!
        extraPhotoUrl2: String!
        extraPhotoUrl3: String
        extraPhotoUrl4: String
    }


    type CartItem {
        cartItemID: ID!
        name: String!
        price: String!
        coverPhotoUrl: String!
        quantity: Int!
        size: Int!
        userEmail: String
        color: String
        

    }


    type Complaint {
        userEmail: String!
        query: String!
        subject: String!
        description: String!
    }


    # inputs
    input registerNewUserInputType {
        username: String!
        email: String!
        password: String!
        confirmPassword: String!
    }


    input addNewProductInputType {
        name: String!
        manufacturer: String!
        productType: String!
        gender: String!
        price: String!
        collectionName: String!
        dateAdded: String
        yearReleased: String
        coverPhotoUrl: String!
        extraPhotoUrl1: String!
        extraPhotoUrl2: String!
        extraPhotoUrl3: String
        extraPhotoUrl4: String

    }


    input addToCartInputType {
        cartItemID: String!
        name: String!
        price: String!
        coverPhotoUrl: String!
        quantity: Int!
        size: Int!
        color: String
        userEmail: String!

    }


    input complaintInputType {
        userEmail: String!
        query: String!
        subject: String!
        description: String!
    }



    # Queries.
    type Query {
        FetchAllUsers: [ User ]
        FetchParticularUser( email: String! ): User
        GetCurrentLoggedInUser: User
        CheckUserVerifiedStatus: String!
        FetchCurrentUserDetails: User
        FetchProductImages( productName: String!, fileName:String! ) : String!
        FetchAllProducts( collectionName: String! ): [ Product ] 
        GetSelectedProductDetails( collectionName: String!, productName: String! ) : Product
        FetchUserCartItems: [ CartItem ]
        FetchParticularUserCartItem( cartItemName: String! ): [ CartItem ]

    }


    # Mutations.
    type Mutation {
        RegisterNewUser( registerNewUserInput: registerNewUserInputType ): User!
        SignInUser( email: String!, password: String! ): User! 
        Logout: String!
        VerifyUserViaEmail: String!
        UpdateUserEmail( newEmail: String! ): String!
        UpdateUserPassword( newPassword: String! ): String!
        UpdateUserProfile( displayName: String!, photoUrl: String! ): String!
        AddNewProduct( addNewProductInput: addNewProductInputType ) : Product!
        AddProductToCart( addToCartInputType: addToCartInputType ) : CartItem
        AddItemsPurchasedSuccessfully( cartItemID: String! ): CartItem!
        SubmitComplaint( complaintDetails: complaintInputType!) : Complaint!
        DeleteCartItem( cartItemName: String! ) : String

    }

`




// resolvers.
const resolvers = {
    Query,
    Mutation

}


// initializing the graphql server.
const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
    cors: {
        origin: '*'
    },
    introspection: true,
    plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground()
    ],
    debug: true // include stacktrace while in development.
})


server.listen({ port: process.env.PORT || 8000 })
.then( result => console.log(`graphql server running on port ${ result.url }........`))
.catch( error => console.log(`failed to start graphql server due to error: ${ error }`))




/* git hub repo
https://github.com/larryking01/Restaurant_Food_Delivery.git 
*/

