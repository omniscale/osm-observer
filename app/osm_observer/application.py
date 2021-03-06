# -:- encoding: utf8 -:-

import os
import logging

from logging.handlers import SMTPHandler

from flask import (
    Flask, request, jsonify, render_template, make_response
)
from sqlalchemy import create_engine

import webassets.loaders
import webassets.env

from osm_observer import model

from osm_observer.config import DefaultConfig
from osm_observer.helpers import FlaskLogContext, request_for_static
from osm_observer.extensions import db, mail, assets, login_manager
from osm_observer.model import DummyUser, User
from osm_observer import views


def create_app(config=None):
    app = ReverseProxiedFlask(__name__)

    configure_jinja2(app)
    configure_app(app, config)
    configure_extensions(app)
    configure_db_connections(app)
    configure_logging(app)
    configure_login(app)
    configure_errorhandlers(app)
    configure_blueprints(app)
    # configure_changes_db(app)
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
        views.api,
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
    db.init_app(app)

    configure_assets(app)

def configure_db_connections(app):
    dbschema = 'changes,changes_app,public'
    engine = create_engine(
        app.config.get('SQLALCHEMY_DATABASE_URI'),
        connect_args={'options': '-csearch_path={}'.format(dbschema)},
        # echo=True,
    )
    app.changeset_connection = engine.connect()


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

    def json_error_response(error, status_code):
        response = jsonify(error=error)
        response.status_code = status_code
        return response

    @app.errorhandler(400)
    def bad_request(error):
        if request.is_xhr:
            return json_error_response('Sorry, bad request', 400)
        return make_response(
            render_template('osm_observer/errors/400.html.j2', error=error),
            400)

    @app.errorhandler(404)
    def page_not_found(error):
        if request.is_xhr:
            return json_error_response('Sorry, page not found', 404)
        return make_response(
            render_template('osm_observer/errors/404.html.j2', error=error),
            404)

    @app.errorhandler(403)
    def forbidden(error):
        if request.is_xhr:
            return json_error_response('Sorry, not allowed', 403)
        return make_response(
            render_template('osm_observer/errors/403.html.j2', error=error),
            403)

    @app.errorhandler(500)
    def server_error(error):
        if request.is_xhr:
            return json_error_response('Sorry, an error has occurred', 500)
        return make_response(
            render_template('osm_observer/errors/500.html.j2', error=error),
            500)


class ReverseProxiedFlask(Flask):
    """
    Wrap the application in this middleware and configure the
    front-end server to add these headers, to let you quietly bind
    this to a URL other than / and to an HTTP scheme that is
    different than what is used locally.
    In nginx:
    location /prefix {
        proxy_pass http://192.168.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Scheme $scheme;
        proxy_set_header X-Script-Name /prefix;
        }
    :param app: the WSGI application
    """
    def __call__(self, environ, start_response):
        script_name = environ.get('HTTP_X_SCRIPT_NAME', '')
        if script_name and script_name != '/':
            environ['SCRIPT_NAME'] = script_name
            path_info = environ['PATH_INFO']
            if path_info.startswith(script_name):
                environ['PATH_INFO'] = path_info[len(script_name):]
        server = environ.get(
            'HTTP_X_FORWARDED_SERVER_CUSTOM',
            environ.get(
                'HTTP_X_FORWARDED_HOST',
                environ.get('HTTP_X_FORWARDED_SERVER', '')))
        if server:
            environ['HTTP_HOST'] = server

        scheme = environ.get(
            'HTTP_X_FORWARDED_PROTO',
            environ.get('HTTP_X_SCHEME', ''))

        if scheme:
            environ['wsgi.url_scheme'] = scheme

        return Flask.__call__(self, environ, start_response)


# def configure_changes_db(app):
#     app.changes_engine = db.get_engine(app, bind='changes')
