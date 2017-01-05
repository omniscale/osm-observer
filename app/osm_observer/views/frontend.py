import os

from flask import (
    Blueprint, render_template
)

from flask_login import login_required

BASE_URL = os.path.abspath(os.path.dirname(__file__))
CLIENT_APP_FOLDER = os.path.join(BASE_URL, "../webapp/dist")

frontend = Blueprint(
    'frontend',
    __name__,
    template_folder='../templates/poster'
)


@frontend.route('/')
@frontend.route('/<path:path>')
@login_required
def index(path=None):
    return render_template('frontend/index.html.j2')
