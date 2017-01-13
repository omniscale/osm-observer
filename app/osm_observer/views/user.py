import datetime

from flask import jsonify, request, current_app
from flask_login import login_user, logout_user, current_user

from osm_observer.model import User
from osm_observer.extensions import db

from osm_observer.views import api


@api.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated:
        return jsonify({
            'message': 'Already logged in',
            'success': True
        })

    data = request.json

    if current_app.config['LDAP_ENABLED']:
        return ldap_login(data['username'], data['password'])
    else:
        return local_login(data['username'], data['password'])


@api.route('/logout')
def logout():
    logout_user()
    return jsonify({
        'message': 'Logged out successfully',
        'success': True
    })


@api.route('/is-logged-in')
def is_logged_in():
    return jsonify({
        'message': 'login status',
        'success': current_user.is_authenticated
    })


def ldap_login(username, password):
    if User.try_ldap_login(username, password):
        user = User.by_username(username)
        if User.by_username(username) is None:
            user = User(username)
            db.session.add(user)
            user.last_login = datetime.datetime.utcnow()
            db.session.commit()
        login_user(user)
        return jsonify({
            'message': 'Logged in successfully',
            'success': True
        })
    return jsonify({
        'message': 'LDAP login faild',
        'success': False
    })


def local_login(username, password):
    user = User.by_username(username)
    if user is not None and user.check_password(password):
        user.last_login = datetime.datetime.utcnow()
        db.session.commit()
        login_user(user)
        return jsonify({
            'message': 'Logged in successfully',
            'success': True
        })

    return jsonify({
        'message': 'Invalid username or password',
        'success': False
    })
