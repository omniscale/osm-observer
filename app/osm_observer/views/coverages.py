from flask import jsonify, request

from flask_login import login_required, current_user

from osm_observer.extensions import db
from osm_observer.views import api
from osm_observer.model import Coverage


@api.route('/coverages/all')
@login_required
def all():
    data = []
    coverages = Coverage.query.all()
    for coverage in coverages:
        coverage_json = coverage.json
        if coverage in current_user.coverages:
            coverage_json['active'] = True

        data.append(coverage_json)
    return jsonify(data)


@api.route('/coverages/actives')
def actives():
    data = []
    for coverage in current_user.coverages:
        data.append(coverage.json)

    return jsonify(data)


@api.route('/coverages/set-actives', methods=['POST'])
@login_required
def set_actives():
    data = request.json
    ids = data.get('coverageIds', [])

    coverages = Coverage.by_ids(ids)
    current_user.coverages = coverages
    db.session.commit()

    return jsonify({'success': True})
