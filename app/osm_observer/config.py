# -:- encoding: utf8 -:-
from os import path as p


class DefaultConfig(object):
    '''
    Default configuration for a newsmeme application.
    '''

    DEBUG = True

    # allow access to admin URLs without authentication
    # (e.g. for testing with curl)
    ADMIN_PARTY = False

    # change this in your production settings !!!
    SECRET_KEY = 'verysecret'
    # keys for localhost. Change as appropriate.

    SQLALCHEMY_DATABASE_URI = 'postgres://os:os@localhost:5432/osm_observer'
    SQLALCHEMY_BINDS = {}
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = False

    ASSETS_DEBUG = True
    ASSETS_BUNDLES_CONF = p.join(p.dirname(__file__), 'asset_bundles.yaml')

    LOG_DIR = p.abspath(p.join(p.dirname(__file__), '/tmp'))
    MAIN_LOG = 'osm_observer.log'

    ENABLE_ERROR_MAILS = False
    MAIL_LOG_SUBJECT = 'osm-observer error log'
    MAIL_LOG_SENDER = 'info@omniscale.com'

    MAIL_SERVER = 'smtp.omniscale.de'
    MAIL_USERNAME = 'trac@omniscale.de'
    MAIL_PASSWORD = 'tracM41l'
    MAIL_DEBUG = DEBUG
    MAIL_DEFAULT_SENDER = 'osm-observer <info@omniscale.com>'

    LDAP_ENABLED = False
    LDAP_PROVIDER_URL = ''

    ADMINS = ['admin@example.org']
    TEMPLATES_AUTO_RELOAD = True


class TestConfig(object):
    ADMIN_PARTY = True
    DEBUG = True
    TESTING = True
    ASSETS_DEBUG = True
    WTF_CSRF_ENABLED = False
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_ECHO = False
    SAVEPATH = '/tmp/'
    SQLALCHEMY_BINDS = {}
