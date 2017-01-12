from datetime import date, timedelta

from flask import abort, jsonify, request

from flask_login import login_required, current_user

from osm_observer.views import api
from osm_observer.lib.changes import query_changesets, query_changeset_details
from osm_observer.model import Coverage


@api.route('/changesets')
@login_required
def changesets_list():
    # filter with coverage
    coverage = None
    coverage_id = request.args.get('coverage', False)
    if coverage_id:
        coverage = Coverage.by_id(coverage_id)
        if coverage not in current_user.coverages:
            raise abort(403)

    # filter with username
    username = request.args.get('username', None)

    # filter with num_reviews
    num_reviews = request.args.get('numReviews', None)

    # filter with average sorce
    average_score = request.args.get('averageScore', None)

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
        coverages=coverage or current_user.coverages,
        from_time=from_time,
        to_time=to_time,
        username=username,
        num_reviews=num_reviews,
        average_score=average_score,
    ))

    return jsonify(serialize_changesets(changesets))


@api.route('/changesets/details/<int:changeset_id>')
def changeset_details(changeset_id):
    details = query_changeset_details(changeset_id)
    return jsonify(serialize_changeset_details(details))


def serialize_changeset_details(changeset):
    return {
        'id': changeset['app_id'],
        'osmId': changeset['id'],
        'createdAt': changeset['created_at'],
        'closedAt': changeset['closed_at'],
        'tags': changeset['tags'],
        'nodesAdd': changeset['nodes_add'],
        'nodesModify': changeset['nodes_modify'],
        'nodesDelete': changeset['nodes_delete'],
        'waysAdd': changeset['ways_add'],
        'waysModify': changeset['ways_modify'],
        'waysDelete': changeset['ways_delete'],
        'relationsAdd': changeset['relations_add'],
        'relationsModify': changeset['relations_modify'],
        'relationsDelete': changeset['relations_delete'],
    }


def serialize_changesets(changesets):
    data = []
    for changeset in changesets:
        data.append({
            'id': changeset.app_id,
            'osmId': changeset.id,
            'createdAt': changeset.created_at,
            'closedAt': changeset.closed_at,
            'username': changeset.user_name,
            'numChanges': changeset.num_changes,
            'userId': changeset.user_id,
            'tags': changeset.tags,
            'numReviews': changeset.num_reviews,
            'averageScore': changeset.average_score,
        })
    return data
