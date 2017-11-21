from datetime import date, timedelta

from flask import abort, jsonify, request, current_app

from flask_login import login_required, current_user

from geoalchemy2.shape import to_shape

from osm_observer.views import api
from osm_observer.lib.changes import (
    query_changesets, query_changeset_comments,
    query_changeset_changes
)
from osm_observer.model import Coverage


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

    # filter with username
    username = request.args.get('username', None)

    # filter with num_reviews
    num_reviews = request.args.get('numReviews', None)

    # filter with average sorce
    sum_score = request.args.get('sumScore', None)

    # filter with status
    status_id = request.args.get('statusId', None)

    # filter with current user reviewed
    current_user_reviewed = request.args.get('currentUserReviewed', None)

    # filter with time_range
    # actually we support today, yesterday and last_week
    time_range = request.args.get('timeRange', None)
    if time_range == 'today':
        from_time = date.today()
        to_time = date.today() + timedelta(1)
    elif time_range == 'yesterday':
        from_time = date.today() - timedelta(1)
        to_time = date.today()
    elif time_range == 'last_week':
        from_time = date.today() - timedelta(7)
        to_time = date.today()
    else:
        from_time = None
        to_time = None

    changesets = list(query_changesets(
        current_user_id=current_user.id,
        coverages=coverages or current_user.coverages,
        from_time=from_time,
        to_time=to_time,
        username=username,
        num_reviews=num_reviews,
        sum_score=sum_score,
        status_id=status_id,
        current_user_reviewed=current_user_reviewed,
        limit=current_app.config.get('CHANGESETS_LIMIT')
    ))

    return jsonify(serialize_changesets(changesets))


@api.route('/changesets/comments/<int:changeset_id>')
@login_required
def changeset_comments(changeset_id):
    comments = query_changeset_comments(changeset_id)
    return jsonify(serialize_changeset_comments(comments))


@api.route('/changesets/changes/<int:changeset_id>')
@login_required
def changeset_changes(changeset_id):
    changes = query_changeset_changes(changeset_id)
    return jsonify(serialize_changeset_changes(changes))


def serialize_changeset(changeset):
    bbox_wkt = to_shape(changeset.bbox)
    return {
        'id': changeset.app_id,
        'osmId': changeset.id,
        'createdAt': str(changeset.created_at),
        'closedAt': str(changeset.closed_at),
        'username': changeset.user_name,
        'numChanges': changeset.num_changes,
        'userId': changeset.user_id,
        'tags': changeset.tags,
        'numReviews': changeset.num_reviews,
        'sumScore': changeset.sum_score,
        'status': changeset.status,
        'currentUserReviewed': changeset.current_user_reviewed,
        'bbox': bbox_wkt.bounds
    }


def serialize_changesets(changesets):
    data = []
    for changeset in changesets:
        data.append(serialize_changeset(changeset))
    return data


def serialize_changeset_comments(comments):
    data = []
    for comment in comments:
        data.append({
            'changesetId': comment.changeset_id,
            'idx': comment.idx,
            'userName': comment.user_name,
            'userId': comment.user_id,
            'timestamp': str(comment.timestamp),
            'text': comment.text
        })
    return data


def serialize_changeset_changes(changes):
    data = []
    for change in changes:
        data.append({
            'type': change.type,
            'id': change.id,
            'added': change.add,
            'modified': change.modify,
            # changed to deleted cause delete is js keyword
            'deleted': change.delete,
            'userName': change.user_name,
            'userId': change.user_id,
            'timestamp': str(change.timestamp),
            'version': change.version,
            'tags': change.tags,
        })
    return data
