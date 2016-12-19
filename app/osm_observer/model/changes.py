from osm_observer.extensions import db
from geoalchemy2.types import Geometry
from sqlalchemy.dialects.postgresql import HSTORE

__all__ = ['changesets', 'nodes', 'ways', 'relations']

changesets = db.Table(
    'changesets', db.MetaData(),
    db.Column('id', db.Integer, primary_key=True),
    db.Column('bbox', Geometry(geometry_type='Polygon', srid=4326)),
    db.Column('created_at', db.DateTime),
    db.Column('closed_at', db.DateTime),
    db.Column('num_changes', db.Integer),
    db.Column('open', db.Boolean),
    db.Column('user_name', db.String),
    db.Column('user_id', db.Integer),
    db.Column('tags', HSTORE),
    schema='changes'
)


nodes = db.Table(
    'nodes', db.MetaData(),
    db.Column('id', db.Integer, primary_key=True),
    db.Column('add', db.Boolean),
    db.Column('modify', db.Boolean),
    db.Column('delete', db.Boolean),
    db.Column('geometry', Geometry(geometry_type='Point', srid=4326)),
    db.Column('user_name', db.String),
    db.Column('user_id', db.Integer),
    db.Column('timestamp', db.DateTime),
    db.Column('version', db.Integer),
    db.Column('tags', HSTORE),
    db.Column('changeset', db.Integer),
    schema='changes',
)


ways = db.Table(
    'ways', db.MetaData(),
    db.Column('id', db.Integer, primary_key=True),
    db.Column('add', db.Boolean),
    db.Column('modify', db.Boolean),
    db.Column('delete', db.Boolean),
    db.Column('user_name', db.String),
    db.Column('user_id', db.Integer),
    db.Column('timestamp', db.DateTime),
    db.Column('version', db.Integer),
    db.Column('tags', HSTORE),
    db.Column('changeset', db.Integer),
    schema='changes',
)


relations = db.Table(
    'relations', db.MetaData(),
    db.Column('id', db.Integer, primary_key=True),
    db.Column('add', db.Boolean),
    db.Column('modify', db.Boolean),
    db.Column('delete', db.Boolean),
    db.Column('user_name', db.String),
    db.Column('user_id', db.Integer),
    db.Column('timestamp', db.DateTime),
    db.Column('version', db.Integer),
    db.Column('tags', HSTORE),
    db.Column('changeset', db.Integer),
    schema='changes',
)
