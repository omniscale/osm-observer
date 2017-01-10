from flask_wtf import FlaskForm

from wtforms import StringField, PasswordField, validators


class LoginForm(FlaskForm):
    username = StringField('Username', [validators.Required()])
    password = PasswordField('Password', [validators.Required()])
