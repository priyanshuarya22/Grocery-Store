import {login} from "./Auth/login.js";
import {signup} from "./Auth/signup.js";
import {adminHome} from "./Admin/home.js";
import {addSection} from "./Admin/addSection.js";
import {navbar} from "./Components/navbar.js";
import {notFound} from "./notFound.js";
import {home} from "./home.js";
import {editSection} from "./Admin/editSection.js";
import {managerHome} from "./Manager/home.js";
import {requestEditSection} from "./Manager/requestEditSection.js";
import {requestAddSection} from "./Manager/requestAddSection.js";
import {notAproved} from "./Manager/notAproved.js";
import {unauthorized} from "./unauthorized.js";
import {addProduct} from "./Manager/addProduct.js";
import {editProduct} from "./Manager/editProduct.js";
import {store} from "./store.js";
import {cart} from "./cart.js";
import {checkout} from "./checkout.js";

const routes = [
    {path: '/', component: home},
    {path: '/login', component: login},
    {path: '/signup', component: signup},
    {path: '/admin', component: adminHome, meta: {requiresAuth: true, roleRequired: 'admin'}},
    {path: '/admin/add-section', component: addSection, meta: {requiresAuth: true, roleRequired: 'admin'}},
    {path: '/admin/edit-section/:name', component: editSection, meta: {requiresAuth: true, roleRequired: 'admin'}},
    {path: '/manager', component: managerHome, meta: {requiresAuth: true, roleRequired: 'manager'}},
    {
        path: '/manager/request-add-section',
        component: requestAddSection,
        meta: {requiresAuth: true, roleRequired: 'manager'}
    },
    {
        path: '/manager/request-edit-section/:name',
        component: requestEditSection,
        meta: {requiresAuth: true, roleRequired: 'manager'}
    },
    {path: '/manager/not-approved', component: notAproved, meta: {requiresAuth: true, roleRequired: 'manager'}},
    {path: '/manager/add-product/:name', component: addProduct, meta: {requiresAuth: true, roleRequired: 'manager'}},
    {
        path: '/manager/edit-product/:productId',
        component: editProduct,
        meta: {requiresAuth: true, roleRequired: 'manager'}
    },
    {path: '/unauthorized', component: unauthorized},
    {path: '/cart', component: cart},
    {path: '/checkout', component: checkout, meta: {requiresAuth: true}},
    {path: '*', component: notFound}
];

const router = new VueRouter({
    routes
});

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!sessionStorage.getItem('username')) {
            next({
                path: '/login',
                query: {redirect: to.fullPath}
            })
        } else if (to.matched.some(record => record.meta.roleRequired) && sessionStorage.getItem('role') !== to.meta.roleRequired) {
            next({
                path: '/unauthorized'
            })
        } else {
            next()
        }
    } else {
        next()
    }
});

Vue.component(
    'navbar', navbar
);

const app = new Vue({
    router,
    store,
    created() {
        let access_token = '';
        let role = '';
        let username = '';
        if (localStorage.getItem('username')) {
            access_token = localStorage.getItem('access_token');
            role = localStorage.getItem('role');
            username = localStorage.getItem('username');
            sessionStorage.setItem('access_token', access_token);
            sessionStorage.setItem('role', role);
            sessionStorage.setItem('username', username);
        } else if (sessionStorage.getItem('username')) {
            access_token = sessionStorage.getItem('access_token');
            role = sessionStorage.getItem('role');
            username = sessionStorage.getItem('username');
        }
        this.$store.commit('setUsername', username);
        this.$store.commit('setRole', role);
    }
}).$mount('#app')