export const cart = {
    template: `
        <div>
            <navbar></navbar>
            <div class="row mt-5">
                <div class="col-md-4"><h1>Cart</h1></div>
                <div class="col-md-4">
                    <div class="input-group m-2">
                        <input type="text" class="form-control" placeholder="Search for product" @input="searchProducts" v-model="searchTerm">
                        <button class="btn btn-outline-secondary" type="button" @click="searchProducts">Search</button>
                    </div>
                </div>
            </div>
            <div class="row mt-5">
                <div class="col-md-4">
                    <div class="row" v-for="product in filteredProducts">
                        <div class="mb-1 p-3">
                            <div class="card">
                                <div class="card-body">
                                    <h2 class="card-title">
                                        {{ product.name }} 
                                        <i class="bi bi-trash-fill btn btn-danger btn-sm float-end me-2" @click="deleteProduct(product.id)"></i>
                                    </h2>
                                    <div v-if="product.stock">
                                        <p class="card-text">
                                            <strong>Section: </strong>{{ product.section }}
                                            <br>
                                            <strong>Rate: </strong>{{ product.rate }}/{{ product.unit }}
                                            <br>
                                            <strong>Quantity: </strong>{{ product.count }}
                                            <div class="btn-group btn-group-sm float-end">
                                                <button type="button" class="btn btn-outline-danger" @click="decreaseCount(product.id)"><i class="bi bi-dash"></i></button>
                                                <button type="button" class="btn btn-danger">{{ product.count }}</button>
                                                <button type="button" class="btn btn-outline-danger" @click="increaseCount(product.id)" :class="{ 'disabled': product.count >= product.quantity }"><i class="bi bi-plus"></i></button>
                                            </div>
                                            <br><hr>
                                            <strong>Total: </strong>{{ product.total }}
                                        </p>
                                    </div>
                                    <p class="card-text text-danger" v-else>
                                        <strong>Out of Stock!</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-2"></div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h2 class="card-title">Bill Summary</h2>
                            <p class="card-text">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Rate</th>
                                            <th>Quantity</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="product in products">
                                            <td>{{ product.name }}</td>
                                            <td>{{ product.rate }}</td>
                                            <td>{{ product.count }}</td>
                                            <td>{{ product.rate * product.count }}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td></td>
                                            <td></td>
                                            <td><strong>Grand Total:</strong></td>
                                            <td>{{ grandTotal }}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                                <div class="float-end">
                                    <button class="btn btn-primary" @click="checkout">Checkout</button>
                                </div>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            products: [],
            filteredProducts: [],
            searchTerm: null
        }
    },
    computed: {
        grandTotal() {
            let total = 0;
            for (let product of this.products) {
                total += product.total;
            }
            return total;
        }
    },
    methods: {
        async fetchProduct(obj) {
            let result = {};
            try {
                const response = await fetch('/product/' + obj.productId, {
                    method: 'GET'
                });
                const data = await response.json();
                result.id = data.id;
                result.name = data.name;
                result.manufacturingDate = data.manufacturingDate;
                result.expiryDate = data.expiryDate;
                result.unit = data.unit;
                result.rate = data.rate;
                result.section = data.section;
                result.stock = data.quantity >= obj.count;
                result.count = result.stock ? obj.count : 0;
                result.quantity = data.quantity;
                result.total = data.rate * result.count;
            } catch (error) {
                console.error('Error:', error);
            }
            return result;
        },
        searchProducts() {
            if (this.searchTerm.length > 2) {
                this.filteredProducts = this.products.filter(product =>
                    product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
                );
            } else {
                this.filteredProducts = this.products;
            }
        },
        increaseCount(productId) {
            let product = this.products.find(item => item.id === productId);
            if (product && product.count < product.quantity) {
                product.count++;
                product.total += product.rate;
                this.$store.commit('increaseCount', productId);
            }
        },
        decreaseCount(productId) {
            let product = this.products.find(item => item.id === productId);
            if (product && product.count > 1) {
                product.count--;
                product.total -= product.rate;
                this.$store.commit('decreaseCount', productId);
            } else if (product && product.count === 1) {
                this.deleteProduct(productId);
            }
        },
        deleteProduct(productId) {
            const index = this.products.findIndex(item => item.id === productId);
            if (index !== -1) {
                this.products.splice(index, 1);
                this.$store.commit('deleteProduct', productId);
            }
        },
        checkout() {
            this.$store.commit('writeCart', this.products);
            this.$store.commit('setGrandTotal', this.grandTotal);
            this.$router.push('/checkout');
        }
    },
    async created() {
        let cartObj = this.$store.getters.getCart;
        this.products = await Promise.all(cartObj.map(obj => this.fetchProduct(obj)));
        this.filteredProducts = this.products;
    }
}