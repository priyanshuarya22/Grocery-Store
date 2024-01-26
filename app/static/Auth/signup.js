export const signup = {
    template: `
        <div class="row">
            <navbar></navbar>
            <h1 class="text-center">Grocery Store</h1>
            <div class="col-lg-4"></div>
                <div class="col-lg-4">
                    <div class="card mt-5">
                        <div class="card-body">
                            <h3 class="text-center mb-3">Signup</h3>
                            <form @submit.prevent="signup">
                                <div class="mb-3">
                                    <label class="form-label">Name</label>
                                    <input class="form-control" type="text" v-model="name" placeholder="Full Name" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Username</label>
                                    <input class="form-control" type="text" v-model="username" placeholder="username" required>
                                </div>
                                <div>
                                    <label class="form-label">Email</label>
                                    <input class="form-control" type="email" v-model="email" placeholder="email@example.com" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Password</label>
                                    <input class="form-control" type="password" v-model="password" placeholder="********" id="password" required>                    
                                </div>
                                <div class="mb-3">
                                    <label class="form-label">Confirm Password</label>
                                    <input class="form-control" type="password" v-model="confirmPassword" placeholder="********" @change="checkPassword" id="confirmPassword" required>
                                </div>
                                <div class="mb-3 form-check">
                                    <input class="form-check-input" type="checkbox" v-model="isManager" @change="setRole" id="isManager"> 
                                    <label class="form-check-label" for="isManager">Signup for Manager</label>
                                </div>
                                <div class="mb-3 form-text text-danger" v-if="error">
                                    {{ error }}
                                </div>
                                <div class="mb-3">
                                    Already have an account? <router-link to="/login" style="text-decoration: none;">Login</router-link>!
                                </div>
                                <div class="text-center">
                                    <button type="submit" class="btn btn-primary mb-3" id="button">Signup</button>
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
            name: null,
            username: null,
            email: null,
            password: null,
            confirmPassword: null,
            role: 'user',
            isManager: null,
            error: null
        };
    },
    methods: {
        signup() {
            fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: this.name,
                    username: this.username,
                    email: this.email,
                    password: this.password,
                    role: this.role
                })
            }).then(response => response.json())
                .then(data => {
                    if (data.access_token) {
                        sessionStorage.setItem('username', this.username);
                        sessionStorage.setItem('role', this.role);
                        sessionStorage.setItem('access_token', data.access_token);
                        this.$store.commit('setUsername', this.username);
                        this.$store.commit('setRole', this.role);
                        this.$router.push('/');
                    } else {
                        this.error = data.error;
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        },
        checkPassword() {
            let password = document.getElementById('password').value;
            let confirmPassword = document.getElementById('confirmPassword').value;
            if (confirmPassword !== password) {
                document.getElementById('button').disabled = true;
                this.error = 'Password in both the fields should be same!';
            } else {
                document.getElementById('button').disabled = false;
                this.error = null;
            }
        },
        setRole() {
            if (document.getElementById('isManager').checked) {
                this.role = 'manager';
            } else {
                this.role = 'user';
            }
        }
    }
}