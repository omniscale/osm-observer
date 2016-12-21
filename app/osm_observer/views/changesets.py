from flask import Blueprint, render_template

from flask_login import login_required, current_user

from osm_observer.lib.changes import query_changesets
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
        'pages/changesets.html.j2',
        changesets=list(query_changesets(current_user.coverages)))


@changesets.route('/coverage/<id>')
def by_coverage(id):
    coverage = Coverage.by_id(id)
    return render_template(
        'pages/changesets.html.j2',
        changesets=list(query_changesets(coverage)))



# @changesets.route('/last_login')
# @changesets.route('/unchecked')
