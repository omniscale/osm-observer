from flask import jsonify

from flask_login import login_required, current_user
from osm_observer.views import api


@api.route('/coverages')
@login_required
def all():
    coverages = []
    for coverage in current_user.coverages:
        coverages.append(coverage.json)
    return jsonify(coverages)
