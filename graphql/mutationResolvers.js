const { UserInputError, AuthenticationError } = require('apollo-server')
const firebaseAuth = require('../firebase/firebaseConfig.js').firebaseAuth
const fireStore = require('../firebase/firebaseConfig.js').fireStore
const firebaseStorage = require('../firebase/firebaseConfig.js').firebaseStorage

// stripe.
const stripe = require('stripe')('sk_test_51LwPglHwow1F0TNq45A6ly1U5ztHftbQHTuVteKFZaxojo3yffpO2aTSxQoUNu2hsTLs5OKXbc2XT2Ph3daKpl1I00gz7mNeHN')





// Mutation resolver.
let Mutation = {
    RegisterNewUser: async function ( parent, args, ctx, info) {
        try {
            let existingUser = firebaseAuth.currentUser
            if ( !existingUser ) {
                let newUser = await firebaseAuth.createUserWithEmailAndPassword( args.registerNewUserInput.email, args.registerNewUserInput.password )
                return {
                    username: args.registerNewUserInput.username,
                    email: newUser.user.email,
                    createdAt: new Date().toLocaleDateString() + ' @ ' + new Date().toLocaleTimeString()
                }
           }
           else {
                throw new AuthenticationError('a user is currently logged in....you need to log out first')
           }
           
        }
        catch ( error ) {
            switch( error.code ) {
                case 'auth/network-request-failed':
                    throw new AuthenticationError('Server could not be reached. Please make sure you have a good internet connection and try again.')
                case 'auth/invalid-email':
                    throw new AuthenticationError('Your email is invalid. Please enter a valid email and try again')
                default:
                    throw new AuthenticationError(`${ error.message }`)
            }
        }

    }, // end of register new user.


    SignInUser: async function( parent, args, ctx, info ) {
        try {
            let existingUser = await firebaseAuth.currentUser
            if( !existingUser ) {
                let signedInUser = await firebaseAuth.signInWithEmailAndPassword( args.email, args.password )
                return {
                    email: signedInUser.user.email
                }    
            } 
            else {
                throw new AuthenticationError(`A user is already logged in... you need to logout first`)
            }
        }
        catch( error ) {
            switch( error.code ) {
                case 'auth/network-request-failed':
                    throw new AuthenticationError('Server could not be reached. Please make sure you have a good internet connection and try again.')
                case 'auth/invalid-email':
                    throw new AuthenticationError('Your email is invalid. Please enter a valid email and try again')
                case 'auth/wrong-password':
                    throw new AuthenticationError('Incorrect password entered. Please enter the correct password and try again')
                case 'auth/user-not-found':
                    throw new AuthenticationError('The entered email does not exist. Please enter an existing email or sign up to create your new account')
                default:
                    throw new AuthenticationError(`${ error.message }`)
            }
        }

    }, //end of sign in.


    Logout: async function( parent, args, ctx, info ) {
        try {
            let currentUser = await firebaseAuth.currentUser
            if( currentUser ) {
                firebaseAuth.signOut()
                return 'you have signed out successfully'    
            }
            else {
                return 'no user is currently logged in'
            }
        }
        catch( error ) {
            return `failed to sign out user due to error: ${ error.code } : ${ error.message }`
        }

    }, // end of logout


    VerifyUserViaEmail: async function( parent, args, ctx, info ) {
        try {
            let currentUser = await firebaseAuth.currentUser
            if( currentUser ){
                await currentUser.sendEmailVerification()
                return `verification link sent to ${ currentUser.email }`
                
            }
            else {
                return `failed to send verification link as there is no current user`
            }
        }
        catch ( error ) {
            throw new Error (`failed to send verification link user due to error: ${ error.code } : ${ error.message }`)
        }

    }, // end of verify user email.


    UpdateUserEmail: async function ( parent, args, ctx, info ) {
        try {
            let currentUser = await firebaseAuth.currentUser
            if ( currentUser ) {
                let oldEmail = currentUser.email
                await currentUser.updateEmail( args.newEmail )
                return `user email updated successfully from ${ oldEmail } to ${ args.newEmail }`
            }
            else {
                return 'there is no current user'
            }
        }
        catch ( error ) {
            throw new Error(`failed to update user email due to error: ${ error.code }: ${ error.message }`)
        }

    }, //


    UpdateUserPassword: async function ( parent, args, ctx, info ) {
        try {
            let currentUser = await firebaseAuth.currentUser
            if ( currentUser ) {
                await currentUser.updatePassword( args.newPassword )
                return `user password updated successfully to ${ args.newPassword }`
            }
            else {
                return 'there is no current user'
            }
        }
        catch ( error ) {
            return `failed to update user password due to error: ${ error.code }: ${ error.message }`
        }

    }, // end of update password.


    UpdateUserProfile: async function (parent, args, ctx, info) {
        try {
            let currentUser = await firebaseAuth.currentUser
            if( currentUser ) {
                await currentUser.updateProfile({
                    displayName: args.displayName,
                    photoUrl: args.photoUrl
                })
                return `user profile updated successfully.....`
            }
            else {
                return 'failed to update user profile'
            }

        }
        catch ( error ) {
            throw new UserInputError(`failed to update user password due to error: ${ error.code }: ${ error.message }`)
        }

    }, // end of update user profile.


    AddNewProduct: async function( parent, args, ctx, info ) {
        try {
            let product = {
                name: args.addNewProductInput.name,
                manufacturer: args.addNewProductInput.manufacturer,
                productType: args.addNewProductInput.productType,
                gender: args.addNewProductInput.gender,
                price: args.addNewProductInput.price,
                collectionName: args.addNewProductInput.collectionName,
                dateAdded: new Date().toLocaleDateString() + ' @ ' + new Date().toLocaleTimeString(),
                yearReleased: args.addNewProductInput.yearReleased,
                coverPhotoUrl: args.addNewProductInput.coverPhotoUrl,
                extraPhotoUrl1: args.addNewProductInput.extraPhotoUrl1,
                extraPhotoUrl2: args.addNewProductInput.extraPhotoUrl2,
                extraPhotoUrl3: args.addNewProductInput.extraPhotoUrl3,
                extraPhotoUrl4: args.addNewProductInput.extraPhotoUrl4
        
            }

            await fireStore.collection( args.addNewProductInput.collectionName ).add( product )
            return product

        }
        catch( error ) {
            throw new Error(`failed to upload new data due to error; ${ error.code }: ${ error.message }`)
        }

    }, // end of add new product.


    AddProductToCart: async function ( parent, args, ctx, info ) {
        try {
            let currentUser = await firebaseAuth.currentUser
            if ( currentUser ) {
                let newCartItem = {
                    cartItemID: args.addToCartInputType.cartItemID,
                    name: args.addToCartInputType.name,
                    price: args.addToCartInputType.price,
                    coverPhotoUrl: args.addToCartInputType.coverPhotoUrl,
                    quantity: args.addToCartInputType.quantity,
                    size: args.addToCartInputType.size,
                    userEmail: currentUser.email,
                    color: args.addToCartInputType.color
                }
                await fireStore.collection('Carts Collection').add( newCartItem )
                return newCartItem
            } 
            else {
                console.log('cannot add item to cart as no current user was found')
            }
        }
        catch( error ) {
            throw new Error(`couldn't add item to cart due to error, ${ error.message }`)
        }
    }, // end of add products to cart.


    AddItemsPurchasedSuccessfully: async function( parent, args, ctx, info ) {
        try {
            let currentUser = await firebaseAuth.currentUser
            let purchasedItem = await fireStore.collection( 'Carts Collection' ).doc( args.purchasedItemID )
            purchasedItem.get().then( document => {
                if( document.exists ) {
                    // add to the purchased items collection
                    let purchasedItem = {
                        name: document.data().name,
                        price: document.data().price,
                        coverPhotoUrl: document.data().coverPhotoUrl,
                        quantity: document.data().quantity,
                        userEmail: currentUser.email    
                    }
                    fireStore.collection('Successfully Purchased Products Collection').add( purchasedItem )
                    .then( doc => {
                        return doc.data() 
                    })
                    
                }
                else {
                    throw new Error('no matching document')
                }
            })

        }
        catch ( error ) {

        }

    },

    SubmitComplaint: async function( parent, args, ctx, info ) {
        try {
            let complaint = {
                userEmail: args.complaintDetails.userEmail,
                query: args.complaintDetails.query,
                subject: args.complaintDetails.subject,
                description: args.complaintDetails.description
            }

            await fireStore.collection('User Submitted Complaints').add( complaint )
            return complaint

        }
        catch ( error ) {
            throw new Error(`failed to submit complaint due to error: ${ error.message }`)
        }

    },

    DeleteCartItem: async function( parent, args, ctx, info ) {
        try {
            let currentUser = await firebaseAuth.currentUser
            if( currentUser ) {
                await fireStore.collection('Carts Collection').where('userEmail', '==', currentUser.email ).where('name', '==', args.cartItemName)
                .get().then( currentSnapshot => {
                    currentSnapshot.forEach( deleteCartItem => {
                        console.log(`matching item found, ${ deleteCartItem.id }`)
                        fireStore.collection('Carts Collection').doc( deleteCartItem.id ).delete().then(() => {
                            console.log(`${ deleteCartItem.id } deleted successfully`)
                        })
                        .catch( error => console.log(`failed to delete due to error, ${ error }`))
                        return `returned matching item found`
                    })
                })
            }
            else {
                console.log(`cannot complete action. no user found`)
                return `cannot complete action. no user found`
            }
        }
        catch ( error ) {
            throw new Error(`failed to delete cart item due to error: ${ error.message }`)
        }

    }, // end of delete cart item mutation.


    Payment: async function( parent, args, ctx, info ) {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 2000,
            currency: "usd",
            automatic_payment_methods: {
              enabled: true,
            },
          });
        
          return 'stripe successful'

    }





}

module.exports = Mutation