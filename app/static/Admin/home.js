export const adminHome = {
    template: `
        <div>
            <navbar></navbar>
            <div class="row mt-5">
                <div v-if="pendingUser" class="col-md-5">
                    <h1 class="mb-3">Approve these Users</h1>
                    <ul class="list-group list-group-flush">
                        <li v-for="user in pendingUser" class="list-group-item">
                            <strong>Name: </strong>{{ user.name }}
                            <i class="bi bi-trash-fill btn btn-danger btn-sm float-end" @click="deletePendingUserRequest(user.username)"></i>
                            <i class="bi bi-check-square-fill btn btn-success btn-sm float-end me-2" @click="acceptPendingUserRequest(user.username)"></i>
                        </li>
                    </ul>
                </div>
                <div v-if="requestedSections" class="col-md-5">
                    <h1 class="mb-3">Approve these Changes</h1>
                    <ul class="list-group list-group-flush">
                        <li v-for="section in requestedSections" class="list-group-item">
                            <div v-if="section.deletion">
                                <h3>Delete</h3>
                                <strong>Name: </strong>{{ section.name }}
                                <br>
                                <strong>Description: </strong><span v-if="section.description">{{ section.description }}</span><span v-else>None</span>
                            </div>
                            <div v-else-if="section.old_name">
                                <h3>Edit</h3>
                                <strong>New Name: </strong>{{ section.name }}
                                <br>
                                <strong class="text-danger">Old Name: </strong>{{ section.old_name }}
                                <br><br>
                                <strong v-if="section.description">New Description: </strong><span v-if="section.description">{{ section.description }}</span><span v-else>None</span>
                                <br>
                                <strong class="text-danger">Old Description: </strong><span v-if="section.old_description">{{ section.old_description }}</span><span v-else>None</span>
                            </div>
                            <div v-else>
                                <h3>Add</h3>
                                <span><strong>Name: </strong>{{ section.name }}</span>
                                <br>
                                <strong>Description: </strong><span v-if="section.description">{{ section.description }}</span><span v-else>None</span>
                            </div>
                            <i class="bi bi-trash-fill btn btn-danger btn-sm float-end" @click="deleteRequestedSection(section.name)"></i>
                            <i class="bi bi-check-square-fill btn btn-success btn-sm float-end me-2" @click="acceptRequestedSection(section.name)"></i>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="row mt-5">
                <div v-for="section in sections" class="col-md-4 mb-1 p-3">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">{{ section.name }}</h5>
                            <p class="card-text">{{ section.description }}</p>
                            <i class="bi bi-pencil-square btn btn-warning btn-sm me-2" @click="editSection(section.name)"></i>
                            <i class="bi bi-trash-fill btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#confirmModal" :data-bs-name="section.name"></i>
                        </div>
                    </div>
                </div>
                <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Delete Section?</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p></p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-danger">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-4">
                    <router-link class="m-3 d-flex align-items-center text-decoration-none text-center" to="/admin/add-section">
                        <i class="bi bi-plus-circle-fill" style="font-size: 5rem;"></i>
                        <span class="ms-3 link-dark" style="font-size: 2rem;">Add Category</span>
                    </router-link>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            pendingUser: null,
            sections: null,
            requestedSections: null
        }
    },
    methods: {
        fetchPendingUsers() {
            let result;
            fetch('/admin/pending-user', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
                }
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
                    if (data.length !== 0) {
                        this.pendingUser = data;
                    } else {
                        this.pendingUser = null;
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        },
        acceptPendingUserRequest(username) {
            fetch('/admin/pending-user/' + username, {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
                }
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
                    if (data.message) {
                        this.fetchPendingUsers();
                    } else {
                        console.error(data.error);
                    }
                })
                .catch((error) => {
                    console.log('Error:', error);
                });
        },
        deletePendingUserRequest(username) {
            fetch('/admin/pending-user/' + username, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
                }
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
                    if (data.message) {
                        this.fetchPendingUsers();
                    } else {
                        console.error(data.error);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                })
        },
        fetchSections() {
            fetch('/sections', {
                method: 'GET'
            }).then(response => response.json())
                .then(data => {
                    if (data.length === 0) {
                        this.sections = null;
                    } else {
                        this.sections = data;
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                })
        },
        editSection(name) {
            this.$router.push({path: `/admin/edit-section/${name}`});
        },
        deleteSection(name) {
            fetch('/section/' + name, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
                }
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
                    if (data.message) {
                        this.fetchSections();
                    } else {
                        console.error(data.error);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                })
        },
        fetchRequestedSections() {
            fetch('/handle-request', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
                }
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
                    if (data.length === 0) {
                        this.requestedSections = null;
                    } else {
                        this.requestedSections = data;
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                })
        },
        deleteRequestedSection(name) {
            fetch('/handle-request/' + name, {
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
                }
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
                    if (data.message) {
                        this.fetchRequestedSections();
                        this.fetchSections();
                    } else {
                        console.error(data.error);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                })
        },
        acceptRequestedSection(name) {
            fetch('/handle-request/' + name, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
                }
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
                    if (data.message) {
                        this.fetchRequestedSections();
                        this.fetchSections();
                    } else {
                        console.error(data.error);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                })
        }
    },
    created() {
        this.fetchPendingUsers();
        this.fetchSections();
        this.fetchRequestedSections();
    },
    mounted() {
        const confirmModal = document.getElementById('confirmModal');
        if (confirmModal) {
            const bsModal = new bootstrap.Modal(confirmModal);
            confirmModal.addEventListener('show.bs.modal', event => {
                const button = event.relatedTarget;
                const name = button.getAttribute('data-bs-name');
                const modalText = confirmModal.querySelector('.modal-body p');
                const deleteButton = confirmModal.querySelector('.btn-danger');
                modalText.innerText = `Do you want to delete ${name}`;
                deleteButton.addEventListener('click', () => {
                    this.deleteSection(name);
                    bsModal.hide();
                });
            })
        }
    }
}