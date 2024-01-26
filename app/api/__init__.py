from flask import Blueprint
from flask_restful import Api
from .Auth import LoginAPI, SignupAPI
from .Admin import PendingUsersAPI
from .Section import SectionsAPI, SectionAPI, RequestSection, HandleRequestedSection
from .Manager import StatusAPI, ExportCSVAPI
from .Product import ProductAPI, ProductsAPI
from .Checkout import CheckoutAPI

api = Blueprint('api', __name__)
api_ = Api(api)

api_.add_resource(LoginAPI, '/login')
api_.add_resource(SignupAPI, '/signup')
api_.add_resource(PendingUsersAPI, '/admin/pending-user', '/admin/pending-user/<username>')
api_.add_resource(SectionsAPI, '/sections')
api_.add_resource(SectionAPI, '/section', '/section/<name>')
api_.add_resource(RequestSection, '/request-section', '/request-section/<name>')
api_.add_resource(HandleRequestedSection, '/handle-request', '/handle-request/<name>')
api_.add_resource(StatusAPI, '/manager/status/<name>')
api_.add_resource(ProductAPI, '/product', '/product/<product_id>')
api_.add_resource(ProductsAPI, '/products/<section_id>')
api_.add_resource(CheckoutAPI, '/checkout')
api_.add_resource(ExportCSVAPI, '/manager/export-csv')
