from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt
from ..models import User
from ..decorators import roles_required
from ..tasks import generate_product_report


class StatusAPI(Resource):
    @jwt_required()
    def get(self, name):
        role = get_jwt()['role']
        if role != 'manager':
            return {'error': 'Only manager can see this!'}
        manager = User.query.filter_by(username=name).first()
        if not manager:
            return {'error': 'Manager does not exist!'}
        if manager.allowed:
            return {'allowed': 'true'}
        return {'allowed': 'false'}


class ExportCSVAPI(Resource):
    @roles_required('manager')
    def get(self):
        user_id = get_jwt()['id']
        user = User.query.filter_by(id=user_id).first()
        generate_product_report.delay(user.email)
        return {'message': 'Job exported successfully!'}
