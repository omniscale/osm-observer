from flask_wtf import FlaskForm

from wtforms import StringField, PasswordField, validators

from osm_observer.helpers import _l


class LoginForm(FlaskForm):
    username = StringField(_l('Username'), [validators.Required()])
    password = PasswordField(_l('Password'), [validators.Required()])
