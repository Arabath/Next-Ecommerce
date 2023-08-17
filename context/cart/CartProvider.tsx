import { FC, useEffect, useReducer } from 'react';
import Cookie from 'js-cookie';

import { ICartProduct } from '../../interfaces';
import { CartContext, cartReducer } from './';

export interface CartState {
    cart: ICartProduct[];
    numberOfItems: number;
    subTotal: number;
    tax: number;
    total: number;
}


const CART_INITIAL_STATE: CartState = {
    cart: [],
    numberOfItems: 0,
    subTotal: 0,
    tax: 0,
    total: 0,
}


export const CartProvider:FC = ({ children }) => {

    const [state, dispatch] = useReducer( cartReducer , CART_INITIAL_STATE );

    // Efecto para manejo de cookies guardar selección carrito
    useEffect(() => {
        try {
            const cookieProducts = Cookie.get('cart') ? JSON.parse( Cookie.get('cart')! ): []
            dispatch({ type: '[Cart] - LoadCart from cookies | storage', payload: cookieProducts });
        } catch (error) {
            dispatch({ type: '[Cart] - LoadCart from cookies | storage', payload: [] });
        }
    }, []);

    
    useEffect(() => {
      Cookie.set('cart', JSON.stringify( state.cart ));
    }, [state.cart]);


    useEffect(() => {
        //maneja datos de la Orden del Carrito
        const numberOfItems = state.cart.reduce( ( prev, current ) => current.quantity + prev , 0 );
        console.log('numberOfItems', numberOfItems);
        const subTotal = state.cart.reduce( ( prev, current ) => (current.price * current.quantity) + prev, 0 );
        console.log('subTotal', subTotal)
        const taxRate =  Number(process.env.NEXT_PUBLIC_TAX_RATE || 0);
        console.log('taxRate', taxRate)
    
        const orderSummary = {
            numberOfItems,
            subTotal,
            tax: subTotal * taxRate,
            total: subTotal * ( taxRate + 1 )
        }
        console.log('orderSummary', orderSummary)
        dispatch({ type: '[Cart] - Update order summary', payload: orderSummary });
    }, [state.cart]);



    const addProductToCart = ( product: ICartProduct ) => {

        // Verificar si el producto ya está en el carrito
        const productInCart = state.cart.some( p => p._id === product._id );

        // Agregar el producto al carrito si no está presente
        if ( !productInCart ) return dispatch({ type: '[Cart] - Update products in cart', payload: [...state.cart, product ] })

        // Verificar si un producto con el mismo ID pero diferente tamaño ya está en el carrito
        const productInCartButDifferentSize = state.cart.some( p => p._id === product._id && p.size === product.size );
        if ( !productInCartButDifferentSize ) return dispatch({ type: '[Cart] - Update products in cart', payload: [...state.cart, product ] })

        // Actualizar la cantidad si el producto ya está en el carrito y tiene el mismo ID y tamaño
        const updatedProducts = state.cart.map( p => {
            if ( p._id !== product._id ) return p;
            if ( p.size !== product.size ) return p;

            // Actualizar la cantidad del producto existente en el carrito
            p.quantity += product.quantity;
            return p;
        });
        // Actualizar los productos en el carrito con los cambios realizados
        dispatch({ type: '[Cart] - Update products in cart', payload: updatedProducts });

    }

    const updateCartQuantity = ( product: ICartProduct ) => {
        dispatch({ type: '[Cart] - Change cart quantity', payload: product });
    }

    const removeCartProduct = ( product: ICartProduct ) => {
        dispatch({ type: '[Cart] - Remove product in cart', payload: product });
    }


    return (
        <>
        @ts-expect-error Server Component
            <CartContext.Provider value={{
                ...state,
                
                // Methods
                addProductToCart,
                updateCartQuantity,
                removeCartProduct,
            }}>
                { children }
            </CartContext.Provider>
        </>
    )
};

// Parte de addProductToCart 

        //! Nivel 1
        // dispatch({ type: '[Cart] - Add Product', payload: product });

        //! Nivel 2
        // const productsInCart = state.cart.filter( p => p._id !== product._id && p.size !== product.size );
        // dispatch({ type: '[Cart] - Add Product', payload: [...productsInCart, product] })

