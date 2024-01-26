from flask_restful import Resource
from ..decorators import roles_required
from flask import request
from ..models import Section, Product
from .. import db, cache


class ProductAPI(Resource):
    @cache.cached(timeout=10)
    def get(self, product_id):
        product = Product.query.filter_by(id=product_id).first()
        product_dict = dict(product.__dict__)
        product_dict.pop('_sa_instance_state', None)
        product_dict['sectionId'] = product.section
        section = Section.query.filter_by(id=product.section).first()
        product_dict['section'] = section.name
        return product_dict

    @roles_required('manager')
    def put(self, product_id):
        name = request.json.get('name', None)
        section_id = request.json.get('sectionId', None)
        product = Product.query.filter_by(name=name, section=section_id).first()
        if product and product.id != int(product_id):
            return {'error': 'Product with the same name already exist in this section!'}
        product = Product.query.filter_by(id=product_id).first()
        if not product:
            return {'error': 'Product not found'}, 404
        manufacturingDate = request.json.get('manufacturingDate', None)
        expiryDate = request.json.get('expiryDate', None)
        if expiryDate <= manufacturingDate:
            return {'error': 'Expiry date cannot be less than or equal to manufacturing date!'}
        section = Section.query.filter_by(id=section_id).first()
        if not section:
            return {'error': 'Section not found!'}, 404
        product.name = request.json.get('name', None)
        product.manufacturingDate = manufacturingDate
        product.expiryDate = expiryDate
        product.unit = request.json.get('unit', None)
        product.rate = request.json.get('rate', None)
        product.quantity = request.json.get('quantity', None)
        product.section = section_id
        db.session.commit()
        return {'message': 'Product updated successfully!'}

    @roles_required('manager')
    def post(self):
        section_name = request.json.get('section', None)
        name = request.json.get('name', None)
        manufacturingDate = request.json.get('manufacturingDate', None)
        expiryDate = request.json.get('expiryDate', None)
        unit = request.json.get('unit', None)
        rate = request.json.get('rate', None)
        quantity = request.json.get('quantity', None)
        section = Section.query.filter_by(name=section_name).first()
        if not section:
            return {'error': 'Section does not exist!'}, 404
        product = Product.query.filter_by(name=name, section=section.id).first()
        if product:
            return {'error': 'Product already exists!'}
        if expiryDate <= manufacturingDate:
            return {'error': 'Expiry date cannot be less than or equal to manufacturing date!'}
        product = Product(name=name, manufacturingDate=manufacturingDate, expiryDate=expiryDate, unit=unit, rate=rate,
                          quantity=quantity, section=section.id)
        db.session.add(product)
        db.session.commit()
        return {'message': 'Product added successfully!'}

    @roles_required('manager')
    def delete(self, product_id):
        product = Product.query.filter_by(id=product_id).first()
        if not product:
            return {'error': 'Product does not exist!'}, 404
        db.session.delete(product)
        db.session.commit()
        return {'message': 'Product deleted successfully!'}


class ProductsAPI(Resource):
    @cache.cached(timeout=10)
    def get(self, section_id):
        products = Product.query.filter_by(section=section_id).all()
        result = []
        for product in products:
            product_dict = dict(product.__dict__)
            product_dict.pop('_sa_instance_state', None)
            result.append(product_dict)
        return result
