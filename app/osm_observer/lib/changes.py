from flask_login import current_user
from sqlalchemy import or_
from sqlalchemy.sql import select

from osm_observer.model import changesets
from osm_observer.extensions import db


def query_changesets(coverage=None):

    s = select([changesets])
    if coverage is not None:
        s = s.where(changesets.c.bbox.ST_Intersects(coverage.geometry))

    conn = db.session.connection()
    return conn.execute(s).fetchall()
