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
    return render_template('pages/index.html.j2', page='dashboard')


@frontend.route('/coverages')
def coverages():
    return render_template('pages/coverages.html.j2', page='coverages')
