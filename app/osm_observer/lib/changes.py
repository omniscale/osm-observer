from flask_login import current_user
from sqlalchemy import or_
from sqlalchemy.sql import select

from osm_observer.model import changesets
from osm_observer.extensions import db


def query_changesets(coverages=None):

    s = select([changesets])
    if coverages is not None:
        if not isinstance(coverages, list):
            coverages = list(coverages)
        for coverage in coverages:
            s = s.where(changesets.c.bbox.ST_Intersects(coverage.geometry))

    conn = db.session.connection()
    return conn.execute(s).fetchall()
