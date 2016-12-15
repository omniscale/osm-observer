from flask_login import current_user
from sqlalchemy import or_
from osm_observer.model import Changeset


def query_changesets(filters=[]):
    q = Changeset.query.filter(Changeset.open==False)
    if len(current_user.coverages) > 0:
        conditions = []
        for coverage in current_user.coverages:
            conditions.append(Changeset.bbox.ST_Intersects(coverage.geometry))
        q = q.filter(or_(*conditions))
    return q.all()
