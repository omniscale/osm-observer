import time
from datetime import date, timedelta

from flask import abort, jsonify, request, current_app

from flask_login import login_required, current_user

from geoalchemy2.shape import to_shape
from osm_observer.changes.changes import collect_changeset

from osm_observer.views import api
from osm_observer.changes.changesets import changesets
from osm_observer.lib.changes import (
    query_changeset_comments,
)
from osm_observer.model import Coverage
from sqlalchemy import create_engine


@api.route('/changesets')
@login_required
def changesets_list():
    # filter with coverage
    coverages = []
    coverage_id = request.args.get('coverageId', False)
    if coverage_id:
        coverage = Coverage.by_id(coverage_id)
        if coverage not in current_user.coverages:
            raise abort(403)
        coverages.append(coverage)

    # TODO 
    # filter with username
    # username = request.args.get('username', None)

    # # filter with num_reviews
    # num_reviews = request.args.get('numReviews', None)

    # # filter with status
    # status_id = request.args.get('statusId', None)

    # # filter with current user reviewed
    # current_user_reviewed = request.args.get('currentUserReviewed', None)

    time_range = request.args.get('timeRange', None)

    day = date.today()
    # TODO remove
    day = date(2018, 11, 20)
    
    if time_range:
        day = day - timedelta(int(time_range))

    # TODO move engine
    dbschema = 'changes,public'
    engine = create_engine(
        "postgresql+psycopg2://localhost/osm_observer",
        connect_args={'options': '-csearch_path={} -cenable_seqscan=false -cenable_indexscan=true'.format(dbschema)},
        # echo=True,
    )
    conn = engine.connect()

    result = changesets(
        conn, day=day, filter=None, recursive=True, coverages=coverages
    )
    return jsonify(result)

@api.route('/changesets/comments/<int:changeset_id>')
@login_required
def changeset_comments(changeset_id):
    comments = query_changeset_comments(changeset_id)
    return jsonify(serialize_changeset_comments(comments))


@api.route('/changesets/changes/<int:changeset_id>')
def changeset_changes(changeset_id):
    # TODO move engine
    dbschema = 'changes,public'
    engine = create_engine(
        "postgres://os:os@localhost:5432/osm_observer",
        connect_args={'options': '-csearch_path={}'.format(dbschema)})

    conn = engine.connect()

    result = collect_changeset(conn, changeset_id)
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

