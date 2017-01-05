from flask import abort, jsonify, request

from flask_login import login_required, current_user

from osm_observer.views import api
from osm_observer.lib.changes import query_changesets, query_changeset_details
from osm_observer.model import Coverage



@api.route('/changesets/all')
@login_required
def changesets_list():
    # TODO add more filter options
    coverage_id = request.args.get('coverage', False)
    if coverage_id:
        coverage = Coverage.by_id(coverage_id)
        if coverage not in current_user.coverages:
            raise abort(403)
        changesets=list(query_changesets(coverages=coverage))
    else:
        changesets=list(query_changesets(current_user.coverages))

    # TODO return changesets as json
    return jsonify()


@api.route('/changesets/details/<int:changeset_id>/details')
def changeset_details(changeset_id):
    details = query_changeset_details(changeset_id)
    # TODO return changeset details as json
    return jsonify()


