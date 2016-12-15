from osm_observer.extensions import db

from geoalchemy2.types import Geometry
from geoalchemy2.shape import from_shape
from geoalchemy2.functions import ST_AsGeoJSON
from shapely.geometry import asShape

__all__ = ['Coverage']

user_coverage = db.Table(
    'users_coverages', db.metadata,
    db.Column('user_id', db.Integer, db.ForeignKey('users.id')),
    db.Column('coverage_id', db.Integer, db.ForeignKey('coverages.id')),
)


class Coverage(db.Model):
    __tablename__ = 'coverages'

    id = db.Column(db.Integer, primary_key=True)
    geometry = db.Column(Geometry(geometry_type='Polygon', srid=4326))

    users = db.relationship(
        'User',
        secondary=user_coverage,
        backref='coverages'
    )

    def __init__(self, users, geojson=None):
        self.users = users
        self.geojson = geojson

    @property
    def geojson(self):
        return ST_AsGeoJSON(self.geometry)

    @geojson.setter
    def geojson(self, geojson):
        self.geometry = from_shape(asShape(geojson['geometry']), srid=4326)
