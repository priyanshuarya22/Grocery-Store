export const login = {
    template: `
        <div class="row">
            <navbar></navbar>
            <h1 class="text-center">Grocery Store</h1>
            <div class="col-lg-4"></div>
                <div class="col-lg-4">
                    <div class="card mt-5">
                        <div class="card-body">
                            <h3 class="text-center mb-3">Login</h3>
                            <form @submit.prevent="login">
                                <div class="mb-3">
                                    <label class="form-label">Username</label>
                                    <input class="form-control" type="text" v-model="username" placeholder="username" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Password</label>
                                    <input class="form-control" type="password" v-model="password" placeholder="********" required>                    
                                </div>
                                <div class="mb-3 form-check">
                                    <input class="form-check-input" type="checkbox" v-model="rememberMe" id="rememberMe"> 
                                    <label class="form-check-label" for="rememberMe">Remember me</label>
                                </div>
                                <div class="mb-3 form-text text-danger" v-if="error">
                                    {{ error }}
                                </div>
                                <div class="mb-3">
                                    New here? <router-link to="/signup" style="text-decoration: none;">Signup</router-link>!
                                </div>
                                <div class="text-center">
                                    <button type="submit" class="btn btn-primary mb-3">Login</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            username: '',
            password: '',
            error: '',
            rememberMe: false
        };
    },
    methods: {
        login() {
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: this.username,
                    password: this.password
                })
            }).then(response => response.json())
                .then(data => {
                    if (data.access_token) {
                        let access_token = data.access_token;
                        if (this.rememberMe) {
                            localStorage.setItem('access_token', access_token);
                            localStorage.setItem('role', data.role);
                            localStorage.setItem('username', this.username);
                        }
                        sessionStorage.setItem('access_token', access_token);
                        sessionStorage.setItem('role', data.role);
                        sessionStorage.setItem('username', this.username);
                        this.$store.commit('setUsername', this.username);
                        this.$store.commit('setRole', data.role);
                        const redirectPath = this.$route.query.redirect || '/';
                        this.$router.push(redirectPath);
                    } else {
                        this.error = data.error;
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    }
}