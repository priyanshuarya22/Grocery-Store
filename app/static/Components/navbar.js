export const navbar = {
    template: `
        <div xmlns="http://www.w3.org/1999/html">
            <div class="row">
                <div class="col-6">
                    <h2 v-if="username">Welcome, {{ username }}!</h2>
                    <h2 v-else>Hello, Stranger!</h2>
                </div>
                <div class="col-6 text-end">
                    <router-link to="/" v-if="route === '/cart' || route === '/checkout'">Home</router-link>
                    <router-link to="/cart" v-else>Cart</router-link>
                    |
                    <span v-if="username">
                        <span v-if="role === 'admin' || role === 'manager'">
                            <router-link to="/admin" v-if="role === 'admin' && route !== '/admin'">Dashboard</router-link>
                            <router-link to="/manager" v-else-if="role === 'manager' && route !== '/manager'">Dashboard</router-link>
                            <router-link to="/" v-else>Home</router-link>
                            |
                        </span>
                        <router-link to="/"><span @click="logout">Logout</span></router-link>
                    </span>
                    <span v-else>
                        <router-link to="/" v-if="route === '/login' || route === '/signup'"><span>Home</span></router-link>
                        <router-link to="/login" v-else><span>Login</span></router-link>
                    </span>
                </div>
            </div>
        </div>
    `,
    computed: {
        username() {
            return this.$store.getters.getUsername;
        },
        route() {
            return this.$route.path;
        },
        role() {
            return this.$store.getters.getRole;
        }
    },
    methods: {
        logout() {
            localStorage.clear();
            sessionStorage.clear();
            this.$store.commit('setUsername', null);
            this.$store.commit('setRole', null);
        }
    }
}