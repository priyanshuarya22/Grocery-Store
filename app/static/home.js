export const home = {
    template: `
        <div>
            <navbar></navbar>
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
                                        <span v-if="product.quantity && product.quantity < 10" class="text-danger">Only {{ product.quantity }} left!</span>
                                    </p>
                                    <div v-if="product.quantity" class="text-end">
                                        <div v-if="$store.getters.getProductCount(product.id)" class="btn-group btn-group-sm">
                                            <button type="button" class="btn btn-outline-danger" @click="decreaseCount(product.id)"><i class="bi bi-dash"></i></button>
                                            <button type="button" class="btn btn-danger">{{ $store.getters.getProductCount(product.id) }}</button>
                                            <button type="button" class="btn btn-outline-danger" @click="increaseCount(product.id)" :class="{ 'disabled': $store.getters.getProductCount(product.id) >= product.quantity }"><i class="bi bi-plus"></i></button>
                                        </div>
                                        <button v-else class="btn btn-danger btn-sm" @click="addToCart(product.id)"><i class="bi bi-cart4"></i> Add to Cart</button>
                                    </div>
                                    <div v-else class="text-danger">Product Out of Stock!</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            sections: null,
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
                        this.sections.forEach(seciton => {
                            this.fetchProducts(seciton);
                        });
                        this.filteredSections = this.sections;
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
        searchProducts() {
            if (this.searchTerm.length > 2) {
                this.filteredSections = this.sections.map(section => {
                    let filteredProducts = section.products.filter(product =>
                        product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
                    );
                    return { description: section.description, id: section.id, name: section.name, products: filteredProducts };
                });
                this.filteredSections = this.filteredSections.filter(seciton => seciton.products.length);
            } else {
                this.filteredSections = this.sections;
            }
        },
        addToCart(productId) {
            this.$store.commit('addToCart', productId);
        },
        increaseCount(productId) {
            this.$store.commit('increaseCount', productId);
        },
        decreaseCount(productId) {
            this.$store.commit('decreaseCount', productId);
        }
    },
    created() {
        this.fetchSections();
    }
}