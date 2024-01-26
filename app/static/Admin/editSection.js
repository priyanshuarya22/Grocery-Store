export const editSection = {
    template: `
        <div>
            <navbar></navbar>
            <div class="row mt-5">
                <router-link class="text-decoration-none" to="/admin">
                    Go Back
                </router-link>
            </div>
            <div class="row mt-5">
                <div class="col-md-3"></div>
                <div class="col-md-6">
                    <h1>Edit Section</h1>
                    <form @submit.prevent="editSection(oldName)" class="mt-5">
                        <div class="mb-3">
                            <label class="form-label">Name</label>
                            <input class="form-control" type="text" v-model="name" placeholder="Grocery" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Description</label>
                            <textarea class="form-control" v-model="description" placeholder="Fresh Vegetables and Fruits..." rows="3"></textarea>
                        </div>
                        <div class="mb-3 form-text text-danger">
                            {{ error }}
                        </div>
                        <div class="mb-3 text-end">
                            <button type="submit" class="btn btn-primary">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            oldName: null,
            name: null,
            description: null,
            error: null
        }
    },
    methods: {
        editSection(name) {
            fetch('/section/' + name, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
                },
                body: JSON.stringify({
                    name: this.name,
                    description: this.description
                })
            }).then(response => {
                if (response.status === 401) {
                    localStorage.clear();
                    sessionStorage.clear();
                    this.$store.commit('setUsername', null);
                    this.$store.commit('setRole', null);
                    this.$router.push('/');
                } else {
                    return response.json();
                }
            })
                .then(data => {
                    if (data.error) {
                        this.error = data.error;
                    } else {
                        this.$router.push('/admin');
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        },
        fetchSection(name) {
            fetch('/section/' + name, {
                method: 'GET'
            }).then(response => response.json())
                .then(data => {
                    if (data.error) {
                        this.error = data.error;
                    } else {
                        this.name = data.name;
                        this.description = data.description;
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                })
        }
    },
    created() {
        this.oldName = this.$route.params.name;
        this.fetchSection(this.oldName);
    }
}