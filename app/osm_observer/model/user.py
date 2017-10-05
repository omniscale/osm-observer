import datetime
import ldap3

from flask_login import UserMixin, AnonymousUserMixin as LoginAnonymousUser
from werkzeug.security import generate_password_hash, check_password_hash

from flask import current_app
from osm_observer.extensions import db

__all__ = ['User', 'DummyUser', 'AnonymousUser']


class AnonymousUser(LoginAnonymousUser):
    '''
    AnonymousUser to load permissions or group
    if the user is not logged in
    '''

    @property
    def permissions(self):
        return []


class DummyUser(UserMixin):
    '''
    DummyUser used for static requests
    '''
    def __init__(self, id):
        self.id = id


class User(db.Model, UserMixin):
    __tablename__ = 'users'
    __table_args__ = {
        'schema': 'changes_app'
    }

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(db.String(256), unique=True, nullable=False)
    password = db.Column(db.String(256))
    last_login = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    reviews = db.relationship(
        'Review',
        backref='user',
        cascade='all, delete-orphan'
    )

    def __init__(self, username, password=None):
        self.username = username
        if password:
            self.update_password(password)

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first()

    @classmethod
    def by_username(cls, username):
        q = cls.query.filter(cls.username == username)
        return q.first()

    @staticmethod
    def try_ldap_login(username, password):
        try:
            conn = ldap3.Connection(current_app.config['LDAP_PROVIDER_URL'],
                                    user=username,
                                    password=password,
                                    auto_bind=True)
        except ldap3.core.exceptions.LDAPException:
            return False
        if not conn.bind():
            return False
        conn.unbind()
        return True

    def update_password(self, password):
        if not password:
            raise ValueError('Password must be non empty.')
        self.password = generate_password_hash(password.encode('utf-8'))

    def check_password(self, password):
        if not self.password:
            return False
        return check_password_hash(self.password, password.encode('utf-8'))

    def update_last_login(self):
        self.last_login = datetime.datetime.utcnow()

    def __repr__(self):
        return '<User username=%s>' % (
            self.username,
        )

    def __str__(self):
        return '%s' % (
            self.username
        )
