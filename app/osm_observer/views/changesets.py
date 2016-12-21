from flask import Blueprint, render_template

from flask_login import login_required, current_user

from osm_observer.lib.changes import query_changesets, query_changeset_details
from osm_observer.model import Coverage

changesets = Blueprint(
    'changesets',
    __name__,
    template_folder='../templates/poster',
    url_prefix='/changesets'
)


@changesets.route('/all')
@login_required
def index():
    return render_template(
        'changesets/changesets.html.j2',
        changesets=list(query_changesets(current_user.coverages)))


@changesets.route('/coverage/<coverage_id>')
def by_coverage(coverage_id):
    coverage = Coverage.by_user_and_id(coverage_id)
    return render_template(
        'changesets/changesets.html.j2',
        changesets=list(query_changesets(coverages=coverage)),
        page='coverages')


@changesets.route('/details/<changeset_id>')
def changeset_details(changeset_id):
    details = query_changeset_details(changeset_id)
    return render_template(
        'changesets/changeset_details.html.j2',
        details=details)


@changesets.route('/last_login')
def last_login():
    return render_template(
        'changesets/changesets.html.j2',
        changesets=list(query_changesets(
            coverages=current_user.coverages,
            from_time=current_user.last_login
        )),
        page='last_login',
    )

# @changesets.route('/unchecked')
