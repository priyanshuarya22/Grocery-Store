import os
from app import create_app, db
from app.models import User, Role


def create_database(app):
    basedir = os.path.abspath(os.path.dirname(__file__))
    filename = os.path.join(basedir, 'database.sqlite')
    if not os.path.isfile(filename):
        with app.app_context():
            db.create_all()
            Role.insert_roles()
            role = Role.query.filter_by(name='admin').first()
            admin = User(email='admin@example.com', username='admin', password='admin', role=role, name='Home')
            db.session.add(admin)
            db.session.commit()


app, celery  = create_app(os.getenv('FLASK_CONFIG') or 'default')

if __name__ == '__main__':
    create_database(app)
    app.run()
