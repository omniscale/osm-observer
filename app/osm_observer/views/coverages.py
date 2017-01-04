from flask import Blueprint, render_template, abort, jsonify

from flask_login import login_required, current_user

from osm_observer.model import Coverage

coverages = Blueprint(
    'coverages',
    __name__,
    template_folder='../templates/poster',
    url_prefix='/coverages'
)


@coverages.route('/all')
@login_required
def all():
    coverages = []
    for coverage in current_user.coverages:
        coverages.append(coverage.json)
    return jsonify(coverages)


