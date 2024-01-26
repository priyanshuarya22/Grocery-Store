const state = {
    cart: [],
    grandTotal: null,
    username: null,
    role: null
}

const mutations = {
    addToCart(state, productId) {
        state.cart.push({
            productId: productId,
            count: 1
        })
    },
    increaseCount(state, productId) {
        const product = state.cart.find(item => item.productId === productId);
        if (product) {
            product.count++;
        }
    },
    decreaseCount(state, productId) {
        const product = state.cart.find(item => item.productId === productId);
        if (product) {
            if (product.count === 1) {
                const index = state.cart.findIndex(item => item === product);
                state.cart.splice(index, 1);
            } else {
                product.count--;
            }
        }
    },
    deleteProduct(state, productId) {
        const index = state.cart.findIndex(item => item.productId === productId);
        state.cart.splice(index, 1);
    },
    writeCart(state, products) {
        state.cart = products;
    },
    setGrandTotal(state, grandTotal) {
        state.grandTotal = grandTotal;
    },
    setUsername(state, username) {
        state.username = username;
    },
    setRole(state, role) {
        state.role = role;
    }
}

const getters = {
    getProductCount: (state) => (productId) => {
        const product = state.cart.find(item => item.productId === productId);
        return product ? product.count : 0;
    },
    getCart(state) {
        return state.cart;
    },
    getGrandTotal(state) {
        return state.grandTotal;
    },
    getUsername(state) {
        return state.username;
    },
    getRole(state) {
        return state.role;
    }
}

export const store = new Vuex.Store({
    state: state,
    mutations: mutations,
    getters: getters
})