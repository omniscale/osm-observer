from osm_observer.extensions import db

from geoalchemy2.types import Geometry
from geoalchemy2.shape import from_shape
from geoalchemy2.functions import ST_AsGeoJSON
from shapely.geometry import asShape

__all__ = ['Coverage']

user_coverage = db.Table(
    'users_coverages', db.metadata,
    db.Column('user_id', db.Integer, db.ForeignKey('app.users.id')),
    db.Column('coverage_id', db.Integer, db.ForeignKey('app.coverages.id')),
    schema='app'
)


class Coverage(db.Model):
    __tablename__ = 'coverages'
    __table_args__ = {
        'schema': 'app'
    }

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    geometry = db.Column(Geometry(geometry_type='Polygon', srid=4326))

    users = db.relationship(
        'User',
        secondary=user_coverage,
        backref='coverages'
    )

    def __init__(self, users, name, geojson=None):
        self.users = users
        self.name = name
        self.geojson = geojson

    @property
    def geojson(self):
        return ST_AsGeoJSON(self.geometry)

    @geojson.setter
    def geojson(self, geojson):
        self.geometry = from_shape(asShape(geojson['geometry']), srid=4326)

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first()
