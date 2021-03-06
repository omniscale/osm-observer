from datetime import date, timedelta

from flask import jsonify, request, current_app

from flask_login import login_required

from osm_observer.changes.changes import collect_changeset

from osm_observer.views import api
from osm_observer.changes.changesets import changesets
from osm_observer.model import Filter

@api.route('/changesets')
@login_required
def changesets_list():
    # load covarge filter and time from request
    coverage_id = request.args.get('coverageId', False)
    coverages = []
    if coverage_id:
        coverages = [coverage_id]

    include_deps = False
    tag_filter = request.args.get('tagFilterId', None)
    if tag_filter:
       tag_filter = Filter.by_id(tag_filter)
       if tag_filter:
           include_deps = tag_filter.include_deps
           tag_filter = tag_filter.code

    time_range = request.args.get('timeRange', None)


    day = date.today()

    if time_range:
        day = day - timedelta(int(time_range))

    result = changesets(
        current_app.changeset_connection,
        day=day,
        filter=tag_filter,
        include_deps=include_deps,
        coverages=coverages
    )
    return jsonify(result)

@api.route('/changesets/changes/<int:changeset_id>')
def changeset_changes(changeset_id):
    result = collect_changeset(current_app.changeset_connection, changeset_id)
    return jsonify(result)

