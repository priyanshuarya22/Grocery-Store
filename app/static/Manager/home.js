export const managerHome = {
    template: `
        <div>
            <navbar></navbar>
            <div id="toast" class="toast position-absolute start-50 z-3 translate-middle-x align-items-center" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        We have scheduled your job! You will receive an email when it is done.
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
            <div class="row mt-5">
                <div class="col-md-4"></div>
                <div class="col-md-4">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Search for product" @input="searchProducts" v-model="searchTerm">
                        <button class="btn btn-outline-secondary" type="button" @click="searchProducts">Search</button>
                    </div>
                </div>
            </div>
            <div class="row mt-5">
                <div v-if="requestedSections" class="col-md-5">
                    <h1 class="mb-3">Requested Changes</h1>
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
                        </li>
                    </ul>
                </div>
            </div>
            <div class="row mt-5">
                <div v-for="section in filteredSections" class="col-md-4 mb-1 p-3">
                    <div class="card">
                        <div class="card-body">
                            <h3 class="card-title">{{ section.name }}</h3>
                            <p class="card-text">{{ section.description }}</p>
                            <div class="card" v-for="product in section.products">
                                <div class="card-body">
                                    <h4 class="card-title">{{ product.name }}</h4>
                                    <p class="card-text">
                                        <strong>Manufactured Date: </strong>{{ product.manufacturingDate }}
                                        <br>
                                        <strong>Expiry Date: </strong>{{ product.expiryDate }}
                                        <br>
                                        <strong>Unit: </strong>Rs/{{ product.unit }}
                                        <br>
                                        <strong>Rate: </strong>{{ product.rate }}
                                        <br>
                                        <strong>Quantity: </strong>{{ product.quantity }}
                                    </p>
                                    <i class="bi bi-pencil-square btn btn-warning btn-sm me-2" @click="editProduct(product.id)"></i>
                                    <i class="bi bi-trash-fill btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#confirmModal" :data-bs-product-id="product.id" :data-bs-product-name="product.name"></i>
                                </div>
                            </div>
                            <div class="m-1">
                                <router-link class="m-3 d-flex align-items-center text-decoration-none text-center" :to="'/manager/add-product/' + section.name">
                                    <i class="bi bi-plus-circle-fill" style="font-size: 3rem;"></i>
                                    <span class="ms-3 link-dark" style="font-size: 1rem;">Add Product</span>
                                </router-link>
                            </div>
                            <i class="bi bi-pencil-square btn btn-warning btn-sm me-2" @click="requestEditSection(section.name)"></i>
                            <i class="bi bi-trash-fill btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#confirmModal" :data-bs-name="section.name"></i>
                        </div>
                    </div>
                </div>
                <div class="modal fade" id="confirmModal" tabindex="-1" aria-labelledby="confirmModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Request Deletion of Section?</h5>
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
                <div class="col-sm-4">
                    <router-link class="m-3 d-flex align-items-center text-decoration-none text-center" to="/manager/request-add-section">
                        <i class="bi bi-plus-circle-fill" style="font-size: 5rem;"></i>
                        <span class="ms-3 link-dark" style="font-size: 2rem;">Request Category</span>
                    </router-link>
                    <button class="btn btn-primary m-3" @click="exportProducts">Export Products</button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            sections: null,
            requestedSections: null,
            filteredSections: null,
            searchTerm: null
        }
    },
    methods: {
        fetchSections() {
            fetch('/sections', {
                method: 'GET'
            }).then(response => response.json())
                .then(data => {
                    if (data.length === 0) {
                        this.sections = null;
                    } else {
                        this.sections = data;
                        this.sections.forEach(section => {
                            this.fetchProducts(section);
                        });
                        this.filteredSections = this.sections;
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                })
        },
        requestEditSection(name) {
            this.$router.push({path: `/manager/request-edit-section/${name}`});
        },
        requestDeleteSection(name) {
            fetch('/request-section/' + name, {
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
        checkAllowed() {
            let name = sessionStorage.getItem('username');
            fetch('/manager/status/' + name, {
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
                    if (data.allowed === 'false') {
                        this.$router.push('/manager/not-approved');
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
        fetchProducts(section) {
            return fetch('/products/' + section.id, {
                method: 'GET'
            }).then(response => response.json())
                .then(data => {
                    this.$set(section, 'products', data);
                })
                .catch((error) => {
                    console.error('Error:', error);
                })
        },
        editProduct(productId) {
            this.$router.push({path: `/manager/edit-product/${productId}`});
        },
        deleteProduct(productId) {
            fetch('/product/' + productId, {
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
        searchProducts() {
            if (this.searchTerm.length > 2) {
                this.filteredSections = this.sections.map(section => {
                    let filteredProducts = section.products.filter(product =>
                        product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
                    );
                    return { description: section.description, id: section.id, name: section.name, products: filteredProducts };
                });
                this.filteredSections = this.filteredSections.filter(section => section.products.length);
            } else {
                this.filteredSections = this.sections;
            }
        },
        exportProducts() {
            fetch('/manager/export-csv', {
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
                    if (data.message) {
                        const toast = document.getElementById('toast');
                        const toast_bs = bootstrap.Toast.getOrCreateInstance(toast);
                        toast_bs.show();
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
        this.checkAllowed();
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
                if (name) {
                    const modalText = confirmModal.querySelector('.modal-body p');
                    const deleteButton = confirmModal.querySelector('.btn-danger');
                    modalText.innerText = `Do you want to request deletion of ${name}`;
                    deleteButton.addEventListener('click', () => {
                        this.requestDeleteSection(name);
                        bsModal.hide();
                    })
                }
                const product_id = button.getAttribute('data-bs-product-id');
                if (product_id) {
                    const product_name = button.getAttribute('data-bs-product-name');
                    const modalTitle = confirmModal.querySelector('.modal-title');
                    const modalText = confirmModal.querySelector('.modal-body p');
                    const deleteButton = confirmModal.querySelector('.btn-danger');
                    modalTitle.innerText = 'Delete Product?';
                    modalText.innerText = `Do you want to delete ${product_name}`;
                    deleteButton.addEventListener('click', () => {
                        this.deleteProduct(product_id);
                        bsModal.hide();
                    })
                }
            })
        }
    }
}