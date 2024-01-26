from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt
from flask import request
from ..models import Order, Product
from .. import db


class CheckoutAPI(Resource):
    @jwt_required()
    def post(self):
        data = request.json.get('data', None)
        user_id = get_jwt()['id']
        for product_info in data:
            product = Product.query.filter_by(id=product_info['id']).first()
            if product is None:
                return {'error': 'Product with id {} not found!'.format(product_info['id'])}
            product.quantity -= product_info['count']
            order = Order(product_id=product_info['id'], user_id=user_id, quantity=product_info['count'])
            db.session.add(order)
        db.session.commit()
        return {'message': 'Order placed successfully!'}