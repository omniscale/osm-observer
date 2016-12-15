from flask import Blueprint, render_template

from flask_login import login_required

from osm_observer.lib.changes import query_changesets

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
        changesets=list(query_changesets()))

# @changesets.route('/last_login')
# @changesets.route('/unchecked')
