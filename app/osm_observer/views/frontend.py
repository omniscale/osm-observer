import os

from flask import (
    Blueprint, render_template, send_from_directory, request
)

BASE_PATH = os.path.abspath(os.path.dirname(__file__))
CLIENT_APP_FOLDER = os.path.join(BASE_PATH, "../webapp/dist")
FONTS_FOLDER = os.path.join(BASE_PATH, '../static/libs/font-awesome/fonts')

frontend = Blueprint(
    'frontend',
    __name__,
    template_folder='../templates/osm_observer'
)


@frontend.route('/')
@frontend.route('/<path:path>')
def index(path=None):
    base_href = request.environ.get('HTTP_X_SCRIPT_NAME', '/')
    return render_template('frontend/index.html.j2', base_href=base_href)


@frontend.route('/fonts/<path:filename>')
def fonts(filename):
    return send_from_directory(FONTS_FOLDER, filename)
