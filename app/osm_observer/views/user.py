from flask import (
    Blueprint, flash, redirect, url_for, request, render_template, current_app
)
from flask_babel import gettext as _
from flask_login import login_user, logout_user, current_user

from osm_observer.model import User
from osm_observer.form import LoginForm
from osm_observer.extensions import db

user = Blueprint(
    'user',
    __name__,
    template_folder='../templates/osm_observer',
    url_prefix='/user',
)


@user.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        flash(_('You are already logged in'))
        return redirect(url_for('frontend.index'))

    form = LoginForm(request.form)
    if request.method == 'POST' and form.validate():
        username = request.form.get('username')
        password = request.form.get('password')

        user = None
        if (current_app.config['LDAP_ENABLED'] and
                User.try_ldap_login(username, password)):
            user = User.by_username(username)
            if user is None:
                user = User(username, password)
                db.session.add(user)
                db.session.commit()
        else:
            user = User.by_username(username)
            if user is None or not user.check_password(password):
                user = None

        if user is not None:
            login_user(user)
            flash(_('Logged in successfully'), 'success')
            next = request.args.get("next")
            return redirect(next or url_for("frontend.index"))

        flash(_('Invalid username or password. Please try again.'),
              'danger')

    return render_template('user/login.html.j2', form=form)


@user.route('/logout', methods=['GET'])
def logout():
    logout_user()
    return redirect(url_for('frontend.index'))
