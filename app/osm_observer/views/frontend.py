from flask import (
    Blueprint, render_template
)

frontend = Blueprint(
    'frontend',
    __name__,
    template_folder='../templates/poster'
)


@frontend.route('/')
def index():
    return render_template('pages/index.html.j2')
