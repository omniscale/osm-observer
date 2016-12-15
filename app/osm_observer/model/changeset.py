from osm_observer.extensions import db
from geoalchemy2.types import Geometry
from sqlalchemy.dialects.postgresql import HSTORE

__all__ = ['Changeset']


class Changeset(db.Model):
    __tablename__ = 'changesets'
    __bind_key__ = 'changes'
    __table_args__ = {
        'schema': 'changes'
    }

    id = db.Column(db.Integer, primary_key=True)
    bbox = db.Column(Geometry(geometry_type='Polygon', srid=4326))
    created_at = db.Column(db.DateTime)
    closed_at = db.Column(db.DateTime)
    num_changes = db.Column(db.Integer)
    open = db.Column(db.Boolean)
    user_name = db.Column(db.String)
    user_id = db.Column(db.Integer)
    tags = db.Column(HSTORE)
