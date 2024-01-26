from flask_restful import Resource
from ..decorators import roles_required
from ..models import User
from .. import db
from ..tasks import send_async_email


class PendingUsersAPI(Resource):
    @roles_required('admin')
    def get(self):
        pending_users = User.query.filter_by(allowed=False).all()
        result = []
        for pending_user in pending_users:
            pending_user_dict = dict(pending_user.__dict__)
            pending_user_dict.pop('_sa_instance_state', None)
            result.append(pending_user_dict)
        return result

    @roles_required('admin')
    def put(self, username):
        user = User.query.filter_by(username=username).first()
        if not user:
            return {'error': 'User not found!'}, 404
        user.allowed = True
        db.session.commit()
        return {'message': 'User approved!'}

    @roles_required('admin')
    def delete(self, username):
        user = User.query.filter_by(username=username).first()
        if not user:
            return {'error': 'User not found!'}, 404
        email_msg = {
            'subject': 'Manager Signup Request Rejected',
            'to': user.email,
            'body': """
            Dear User,
            
            We regret you to inform that the admin rejected your request to be a store manager.
            
            Thank you
            Admin
            Grocery
            """
        }
        send_async_email.delay(email_msg)
        db.session.delete(user)
        db.session.commit()
        return {'message': 'User rejected!'}, 200
