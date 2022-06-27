const firebaseAuth = require('../firebase/firebaseConfig.js').firebaseAuth
const fireStore = require('../firebase/firebaseConfig.js').fireStore
const firebaseStorage = require('../firebase/firebaseConfig.js').firebaseStorage
const { UserInputError } = require('apollo-server')



// Query resolver
let Query = {
    GetCurrentLoggedInUser: async function ( parent, args, ctx, info ) {
        try{
            let currentUser = await firebaseAuth.currentUser
            if( currentUser ) {
                return `you are currently logged in as ${ currentUser.email }`
            }
            else {
                return 'no user is logged in currently'
            }
        }
        catch ( error ) {
            // return `failed to get details of logged in user due to error. ${ error.code }: ${ error.message }`
            throw new UserInputError(`failed to get details of logged in user due to error. ${ error.code }: ${ error.message }`)
        }

    }, // end of get current user.


    CheckUserVerifiedStatus: async function( parent, args, ctx, info ) {
        try {
            let currentUser = await firebaseAuth.currentUser
            if( currentUser ) {
                if( currentUser.emailVerified === true ) {
                    return 'user is verified....'
                }
                else {
                    return 'user is currently not verified....'
                }
            } 
            else {
                return 'there is no current user.....'
            }
        }
        catch( error ) {
            return `failed to check user verified status due to error: ${ error.code }: ${ error.message }`
        }

    }, // end of check verified status.


    FetchCurrentUserDetails: async function( parent, args, ctx, info ) {
        try {
            let currentUser = await firebaseAuth.currentUser
            if( currentUser ) {
                let currentUserDetails = {
                    username: currentUser.email,
                    email: currentUser.email,
                    profilePhotoUrl: currentUser.photoUrl,
                    createdAt: new Date().toLocaleTimeString()
                }
                return currentUserDetails
            }
            else {
                return null
            }
        }
        catch ( error ) {
            return `failed to fetch user details due to error: ${ error.code }: ${ error.message }`
        }

    }, // end of fetch user details.


    FetchProductImages: async function( parent, args, ctx, info ) {
        try {
            let imageUrl = await firebaseStorage.ref().child(`Product Images/${ args.productName }/${ args.fileName }`).getDownloadURL()
            return `download url === ${ imageUrl }`

        }
        catch( error ) {
            throw new Error (`failed to download image due to error; ${ error.code }: ${ error.message } `) 
 
        }

    }, // end of fetch product images.


    FetchAllProducts: async function ( ) {
        try {
            let addedProductsArray = []
            await fireStore.collection('Added Products Collection').get().then( currentSnapshot => {
                currentSnapshot.forEach( product => {
                    addedProductsArray.push( product.data() )
                })
                console.log( addedProductsArray )
            } )
            return addedProductsArray

        }
        catch (error) {
            throw new Error(`failed to fetch products due to error. ${ error.code }: ${ error.message }`)
        }

    }, // end of fetch all products.


    GetSelectedProductDetails: async function ( parent, args, ctx, info ) {
        try {
            let myArray = []
            let selectedProduct = await fireStore.collection('Added Products Collection').where('name', '==', args.productName).get()
            if( !selectedProduct.empty ) {
                selectedProduct.forEach( matchingProduct => {
                    //console.log( matchingProduct.data() )
                    myArray.push( matchingProduct.data() )
                })
                return myArray[0]
            }
            else {
                return null
            }
            
        }
        catch( error ) {
            throw new Error(`failed to fetch details of selected product due to error, ${ error.code }: ${ error.message }`)
        }


    }

 






  
}




module.exports = Query