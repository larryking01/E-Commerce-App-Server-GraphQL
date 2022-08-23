const firebaseAuth = require('../firebase/firebaseConfig.js').firebaseAuth
const fireStore = require('../firebase/firebaseConfig.js').fireStore
const firebaseStorage = require('../firebase/firebaseConfig.js').firebaseStorage
const { UserInputError, AuthenticationError } = require('apollo-server')



// Query resolver
let Query = {
    GetCurrentLoggedInUser: async function ( parent, args, ctx, info ) {
        try{
            let currentUser = await firebaseAuth.currentUser
            if( currentUser ) {
                return {
                    email: currentUser.email
                }
            }
            else {
                return null
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


    FetchAllProducts: async function ( parent, args, ctx, info ) {
        try {
            let addedProductsArray = []
            await fireStore.collection( args.collectionName ).get().then( currentSnapshot => {
                currentSnapshot.forEach( product => {
                    addedProductsArray.push( { ...product.data(), productID: product.id } )
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
            let productsArray = []
            let selectedProduct = await fireStore.collection( args.collectionName ).where('name', '==', args.productName).get()
            if( !selectedProduct.empty ) {
                selectedProduct.forEach( matchingProduct => {
                    productsArray.push( matchingProduct.data() )
                    console.log( productsArray[0] )
                })
                return productsArray[0]
            }
            else {
                return null
            }
        }
        catch( error ) {
            throw new Error(`failed to fetch details of selected product due to error, ${ error.code }: ${ error.message }`)
        }
    }, // end of get selected product details.


    FetchUserCartItems: async function ( parent, args, ctx, info ) {
        try {
            let userCartsArray = []
            let currentUser = await firebaseAuth.currentUser
            // console.log( currentUser.email )
            if ( currentUser ) { 
                await fireStore.collection('Carts Collection').where('userEmail', '==', currentUser.email).get().then( currentSnapshot => {
                    currentSnapshot.forEach( cartItem => {
                        userCartsArray.push( { ...cartItem.data(), cartItemID: cartItem.id } )
                    })
                    //console.log( userCartsArray )
                } )
                //console.log(`info ===${ info }`)
                return userCartsArray
            } 
            else {
                console.log('no current user logged in')
                return null
            }
        }
        catch (error) {
            throw new Error(`failed to fetch products due to error. ${ error.code }: ${ error.message }`)
        }

    },


    FetchParticularUserCartItem: async function( parent, args, ctx, info ) { 
        try {
            let selectedCartItemArray = []
            let currentUser = await firebaseAuth.currentUser
            if( currentUser ) {
                await fireStore.collection('Carts Collection').where('userEmail', '==', currentUser.email ).where('name', '==', args.cartItemName ).get().then( currentSnapshot => {
                    currentSnapshot.forEach( selectedCartItem => {
                        selectedCartItemArray.push( selectedCartItem.data() )
                    })
                })

                return selectedCartItemArray
            }
            else {
                console.log('no current user logged in')
                return null
            }
        }
        catch (error) {
            throw new Error(`failed to fetch products due to error. ${ error.code }: ${ error.message }`)
        }

    }

 






  
}




module.exports = Query