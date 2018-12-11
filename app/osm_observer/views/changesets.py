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

    tag_filter = request.args.get('tagFilterId', None)
    if tag_filter:
       tag_filter = Filter.by_id(tag_filter)
       if tag_filter:
           tag_filter = tag_filter.code

    time_range = request.args.get('timeRange', None)


    day = date.today()
    # TODO remove
    day = date(2018, 11, 20)
    if time_range:
        day = day - timedelta(int(time_range))

    result = changesets(
        current_app.changeset_connection, 
        day=day,
        filter=tag_filter,
        recursive=True,
        coverages=coverages
    )
    return jsonify(result)

@api.route('/changesets/changes/<int:changeset_id>')
def changeset_changes(changeset_id):
    result = collect_changeset(current_app.changes_connection, changeset_id)
    return jsonify(result)

def serialize_changeset_comments(comments):
    data = []
    for comment in comments:
        data.append({
            'changesetId': comment.changeset_id,
            'idx': comment.idx,
            'userName': comment.user_name,
            'userId': comment.user_id,
            'timestamp': comment.timestamp,
            'text': comment.text
        })
    return data

