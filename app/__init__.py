from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import config, Config
from flask_restful import Api
from flask_jwt_extended import JWTManager
from celery import Celery, Task
from flask_mail import Mail
from . import workers
from flask_caching import Cache

db = SQLAlchemy()
jwt = JWTManager()
mail = Mail()
cache = Cache()


def create_app(config_name):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    config[config_name].init_app(app)

    db.init_app(app)
    jwt.init_app(app)
    mail.init_app(app)
    cache.init_app(app)

    celery = workers.celery
    celery.conf.update(
        broker_url=app.config['CELERY_BROKER_URL'],
        result_backend=app.config['CELERY_RESULT_BACKEND']
    )
    celery.Task = workers.ContextTask

    from .main import main as main_blueprint
    app.register_blueprint(main_blueprint)

    from .api import api as api_blueprint
    app.register_blueprint(api_blueprint)

    app.app_context().push()
    return app, celery
