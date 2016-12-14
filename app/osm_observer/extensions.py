from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from flask_assets import Environment
from flask_login import LoginManager

__all__ = ['mail', 'db', 'assets', 'login_manager']

mail = Mail()
db = SQLAlchemy()
assets = Environment()
login_manager = LoginManager()
