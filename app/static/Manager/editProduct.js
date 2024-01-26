export const editProduct = {
    template: `
        <div>
            <navbar></navbar>
            <div class="row mt-5">
                <router-link class="text-decoration-none" to="/manager">
                    Go Back
                </router-link>
            </div>
            <div class="row mt-5">
                <div class="col-md-3"></div>
                <div class="col-md-6">
                    <h1>Edit Product</h1>
                    <form @submit.prevent="editProduct" class="mt-5">
                        <div class="mb-3">
                            <label class="form-label">Section</label>
                            <select class="form-select" v-model="sectionId" required>
                                <option v-for="section in sections" :value="section.id">{{ section.name }}</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Name</label>
                            <input class="form-control" type="text" v-model="name" placeholder="Beans" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Manufacturing Date</label>
                            <input class="form-control" type="date" v-model="manufacturingDate" id="manufacturingDate" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Expiry Date</label>
                            <input class="form-control" type="date" v-model="expiryDate" id="expiryDate" @change="validateExpiry" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Unit</label>
                            <select class="form-select" v-model="unit" required>
                                <option value="kg">Rs/kg</option>
                                <option value="litre">Rs/Litre</option>
                                <option value="dozen">Rs/dozen</option>
                                <option value="gram">Rs/gram</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Rate/unit</label>
                            <input class="form-control" type="number" v-model="rate" placeholder="10" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Quantity</label>
                            <input class="form-control" type="number" v-model="quantity" placeholder="100" required>
                        </div>
                        <div class="mb-3 form-text text-danger" v-if="error">
                            {{ error }}
                        </div>
                        <div class="mb-3 text-end">
                            <button type="submit" class="btn btn-primary" id="button">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            productId: null,
            name: null,
            manufacturingDate: null,
            expiryDate: null,
            unit: null,
            rate: null,
            quantity: null,
            sectionId: null,
            error: null,
            sections: []
        }
    },
    methods: {
        fetchProduct() {
            fetch('/product/' + this.productId, {
                method: 'GET'
            }).then(response => response.json())
                .then(data => {
                    this.name = data.name;
                    this.manufacturingDate = data.manufacturingDate;
                    this.expiryDate = data.expiryDate;
                    this.unit = data.unit;
                    this.rate = data.rate;
                    this.quantity = data.quantity;
                    this.sectionId = data.sectionId;
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        },
        editProduct() {
            fetch('/product/' + this.productId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
                },
                body: JSON.stringify({
                    name: this.name,
                    manufacturingDate: this.manufacturingDate,
                    expiryDate: this.expiryDate,
                    unit: this.unit,
                    rate: this.rate,
                    quantity: this.quantity,
                    sectionId: this.sectionId
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
                        this.$router.push('/manager');
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        },
        validateExpiry() {
            let manufacturingDate = document.getElementById('manufacturingDate').value;
            let expiryDate = document.getElementById('expiryDate').value;
            if (expiryDate <= manufacturingDate) {
                document.getElementById('button').disabled = true;
                this.error = 'Expiry Date connot be older than manufacturing date!';
            } else {
                document.getElementById('button').disabled = false;
                this.error = null;
            }
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
        }
    },
    created() {
        this.productId = this.$route.params.productId;
        this.fetchSections();
        this.fetchProduct();
    }
}