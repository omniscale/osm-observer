# -:- encoding: utf8 -:-

import os
import logging

from logging.handlers import SMTPHandler

from flask import (
    Flask, request, jsonify, render_template, make_response
)
from flask.ext.babel import Babel, gettext as _

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session

import webassets.loaders
import webassets.env

from osm_observer import model

from osm_observer.config import DefaultConfig
from osm_observer.helpers import FlaskLogContext, request_for_static
from osm_observer.extensions import db, mail, assets, login_manager
from osm_observer.model import DummyUser, User
from osm_observer import views


def create_app(config=None):
    app = Flask(__name__)

    configure_jinja2(app)
    configure_app(app, config)
    configure_extensions(app)
    configure_logging(app)
    configure_login(app)
    configure_errorhandlers(app)
    configure_blueprints(app)

    return app


def configure_jinja2(app):
    app.jinja_env.variable_start_string = '{$'
    app.jinja_env.variable_end_string = '$}'

    @app.before_first_request
    def enable_debug_reloading():
        # Work around run(debug=True)-template reloading issue
        # - https://github.com/pallets/flask/issues/1907
        if app.debug:
            app.jinja_env.auto_reload = True


def configure_app(app, config):
    app.config.from_object(DefaultConfig())

    if config is not None:
        app.config.from_object(config)

    if app.config.get('TESTING'):
        app.config.from_pyfile(
            os.path.abspath('osm_observer_local_test.conf'),
            silent=True)
    else:
        app.config.from_pyfile(
            os.path.abspath('osm_observer_local_develop.conf'),
            silent=True)

    app.config.from_envvar('OSM_OBSERVER_CONFIG', silent=True)


def configure_blueprints(app):
    blueprints = [
        views.frontend,
        views.user
    ]
    for blueprint in blueprints:
        app.register_blueprint(blueprint)


def configure_logging(app):
    if app.debug or app.testing:
        logging.basicConfig(level=logging.DEBUG)
        return

    # use log filter that adds environ, user to log record
    flask_context_filter = FlaskLogContext()

    # formatter for error/debug
    formatter = logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s '
        '[in %(pathname)s:%(lineno)d]')

    # log errors via mail, use custom formatter
    mail_handler = \
        SMTPHandler(
            app.config['MAIL_SERVER'], app.config['MAIL_LOG_SENDER'],
            app.config['ADMINS'], app.config['MAIL_LOG_SUBJECT'],
            (app.config['MAIL_USERNAME'], app.config['MAIL_PASSWORD'],)
        )

    mail_handler.setLevel(logging.ERROR)
    mail_handler.setFormatter(logging.Formatter('''
Message type:       %(levelname)s
Location:           %(pathname)s:%(lineno)d
Module:             %(module)s
Function:           %(funcName)s
Time:               %(asctime)s
Environ:
%(environ)s

Message:
%(message)s
'''))
    mail_handler.addFilter(flask_context_filter)

    if app.config['ENABLE_ERROR_MAILS']:
        app.logger.addHandler(mail_handler)

    # log errors
    main_log = os.path.join(
        app.root_path,
        app.config['LOG_DIR'],
        app.config['MAIN_LOG']
    )
    main_log_handler = logging.FileHandler(main_log)
    main_log_handler.setLevel(logging.DEBUG)
    main_log_handler.setFormatter(formatter)
    main_log_handler.addFilter(flask_context_filter)

    for logger in [app.logger, logging.getLogger('osm_observer')]:
        logger.addHandler(main_log_handler)
        logger.setLevel(logging.DEBUG)


def configure_extensions(app):
    mail.init_app(app)

    if not app.testing:
        engine = create_engine(
            app.config['SQLALCHEMY_DATABASE_URI'],
            echo=app.config['SQLALCHEMY_ECHO'])
        db.session = scoped_session(sessionmaker(bind=engine, autoflush=True))
    db.init_app(app)

    configure_assets(app)
    configure_i18n(app)


def configure_assets(app):
    assets.app = app
    assets.init_app(app)
    if not app.debug:
        assets.cache = False
        assets.manifest = "file:"
        assets.auto_build = False

    try:
        loader = webassets.loaders.YAMLLoader(
            app.config.get('ASSETS_BUNDLES_CONF'))
        for name, bundle in loader.load_bundles().items():
            assets.register(name, bundle)
    except webassets.env.RegisterError:
        # ignore errors when registering bundles multiple times
        if not app.testing:
            raise


def configure_i18n(app):

    babel = Babel(app, default_timezone='Europe/Berlin')

    @babel.localeselector
    def get_locale():
        accept_languages = app.config.get('ACCEPT_LANGUAGES', ['en_GB'])
        return request.accept_languages.best_match(
            accept_languages,
            default=accept_languages[0])


def configure_login(app):
    login_manager.init_app(app)

    # load anonymous user to check permisssions
    login_manager.anonymous_user = model.AnonymousUser

    @login_manager.user_loader
    def load_user(user_id):
        if request_for_static():
            return DummyUser(user_id)
        return User.query.filter(User.id == user_id).first()

    @login_manager.user_loader
    def user_loader(user_id):
        """
        Given *user_id*, return the associated User object.

        :param user_id: user_id user to retrieve
        """
        return User.query.filter(User.id == user_id).first()


def configure_errorhandlers(app):
    if app.testing:
        return

    @app.errorhandler(400)
    def bad_request(error):
        if request.is_xhr:
            return jsonify(error=_('Sorry, bad request'))
        return make_response(
            render_template('osm_observer/errors/400.html.j2', error=error),
            400)

    @app.errorhandler(404)
    def page_not_found(error):
        if request.is_xhr:
            return jsonify(error=_('Sorry, page not found'))
        return make_response(
            render_template('osm_observer/errors/404.html.j2', error=error),
            404)

    @app.errorhandler(403)
    def forbidden(error):
        if request.is_xhr:
            return jsonify(error=_('Sorry, not allowed'))
        return make_response(
            render_template('osm_observer/errors/403.html.j2', error=error),
            403)

    @app.errorhandler(500)
    def server_error(error):
        if request.is_xhr:
            return jsonify(error=_('Sorry, an error has occurred'))
        return make_response(
            render_template('osm_observer/errors/500.html.j2', error=error),
            500)
