from flask_jwt_extended import jwt_required, get_jwt
from functools import wraps


def roles_required(*required_roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            if claims['role'] not in required_roles and not claims['allowed']:
                return {'msg': 'Access denied'}, 403
            else:
                return fn(*args, **kwargs)

        return wrapper

    return decorator
