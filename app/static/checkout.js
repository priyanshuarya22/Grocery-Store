export const checkout = {
    template: `
        <div>
            <navbar></navbar>
            <div class="mt-5 text-center">
                <h1>Thank You!</h1>
                <p>Please Visit again!</p>
            </div>
            <div class="row mt-5">
                <div class="col-md-3"></div>
                <div class="col-md-6">
                    <h2>Your Bill</h2>
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
                    <div class="mt-5 text-center">
                        <button @click="downloadPdf" class="btn btn-primary">Download Receipt</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            products: null,
            grandTotal: null
        }
    },
    methods: {
        checkout() {
            fetch('/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
                },
                body: JSON.stringify({
                    data: this.products
                })
            }).then(response => {
                if (response.status === 401) {
                    localStorage.clear();
                    sessionStorage.clear();
                    this.$store.commit('setUsername', null);
                    this.$store.commit('setRole', null);
                    this.$route.push('/');
                } else {
                    return response.json();
                }
            })
                .then(data => {
                    if (data.error) {
                        console.error('Error:', data.error);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
            this.$store.commit('writeCart', []);
        },
        downloadPdf() {
            let element = document.querySelector('.table');
            html2canvas(element).then((canvas) => {
                let imgData = canvas.toDataURL('image/png');
                let doc = new jsPDF('p', 'mm', 'a4');
                let imgProps = doc.getImageProperties(imgData);
                let pdfWidth = doc.internal.pageSize.getWidth();
                let pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                doc.save('bill.pdf');
            });
        }
    },
    created() {
        this.products = this.$store.getters.getCart;
        this.grandTotal = this.$store.getters.getGrandTotal;
        this.checkout();
    }
}