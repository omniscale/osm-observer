from flask import (
    Blueprint, send_from_directory
)

from flask_login import login_required
import os

BASE_URL = os.path.abspath(os.path.dirname(__file__))
CLIENT_APP_FOLDER = os.path.join(BASE_URL, "../webapp/dist")

frontend = Blueprint(
    'frontend',
    __name__,
    template_folder='../templates/poster'
)


@frontend.route('/')
@login_required
def index():
    """
    Serve angular app index page
    """
    return send_from_directory(CLIENT_APP_FOLDER, 'index.html')


@frontend.route("/<path:filename>")
@login_required
def webapp(filename):
    """
    Serve the Angular2 app created by the angular-cli system.
    """
    return send_from_directory(CLIENT_APP_FOLDER, filename)
