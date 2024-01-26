from datetime import datetime
from . import db
from werkzeug.security import check_password_hash, generate_password_hash


class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    users = db.relationship('User', backref='role', lazy='dynamic')

    @staticmethod
    def insert_roles():
        roles = ['admin', 'manager', 'user']
        for r in roles:
            role = Role.query.filter_by(name=r).first()
            if role is None:
                role = Role(name=r)
                db.session.add(role)
        db.session.commit()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))
    username = db.Column(db.String(255), unique=True)
    email = db.Column(db.String(255), unique=True)
    password_hash = db.Column(db.String(255))
    role_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    allowed = db.Column(db.Boolean, default=True)

    @property
    def password(self):
        raise AttributeError('Password is not a readable attribute!')

    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)


class Section(db.Model):
    __tablename__ = 'sections'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.String(1024))


class RequestedSection(db.Model):
    __tablename__ = 'requested_sections'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)
    description = db.Column(db.String(1024))
    deletion = db.Column(db.Boolean, default=False)
    parent_section = db.Column(db.Integer, db.ForeignKey('sections.id'), default=None)


class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), nullable=False)
    manufacturingDate = db.Column(db.String(10), nullable=False)
    expiryDate = db.Column(db.String(10), nullable=False)
    unit = db.Column(db.String(10), nullable=False)
    rate = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    section = db.Column(db.Integer, db.ForeignKey('sections.id'))
    orders = db.relationship('Order', backref='product', lazy='select')
    __table_args__ = (db.UniqueConstraint('name', 'section', name='_name_section_uc'),)


class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
