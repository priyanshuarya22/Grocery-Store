from flask_restful import Resource
from flask import request, jsonify
from ..models import User, Role
from flask_jwt_extended import create_access_token
from .. import db


class LoginAPI(Resource):
    def post(self):
        username = request.json.get('username', None)
        password = request.json.get('password', None)
        user = User.query.filter_by(username=username).first()
        if user and user.verify_password(password):
            role = user.role.name
            access_token = create_access_token(identity=username, additional_claims={'role': role, 'allowed': user.allowed, 'id': user.id})
            return {'access_token': access_token, 'role': role}, 200
        else:
            return {'error': 'Incorrect Username or Password!'}


class SignupAPI(Resource):
    def post(self):
        name = request.json.get('name', None)
        username = request.json.get('username', None)
        email = request.json.get('email', None)
        password = request.json.get('password', None)
        role = request.json.get('role', 'user')
        if role not in ('user', 'manager'):
            return {'error': role + ' is not allowed!'}
        role_id = Role.query.filter_by(name=role).first()
        user = User.query.filter_by(username=username).first()
        if user:
            return {'error': 'Username already exists!'}
        user = User.query.filter_by(email=email).first()
        if user:
            return {'error': 'Email already exists!'}
        user = User(name=name, username=username, email=email, password=password)
        if role == 'manager':
            user.allowed = False
        user.role = role_id
        db.session.add(user)
        db.session.commit()
        access_token = create_access_token(identity=username, additional_claims={'role': role, 'allowed': user.allowed, 'id': user.id})
        return {'access_token': access_token}
