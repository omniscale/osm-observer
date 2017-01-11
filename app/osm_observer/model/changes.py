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
    schema='changes',
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
    db.Column('version', db.Integer, primary_key=True),
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
    db.Column('version', db.Integer, primary_key=True),
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
    db.Column('version', db.Integer, primary_key=True),
    db.Column('tags', HSTORE),
    db.Column('changeset', db.Integer),
    schema='changes',
)

comments = db.Table(
    'comments', db.MetaData(),
    db.Column('changeset_id', db.BigInteger, db.ForeignKey('changesets.id'),
              nullable=False, primary_key=True),
    db.Column('idx', db.Integer, primary_key=True),
    db.Column('user_name', db.String),
    db.Column('user_id', db.Integer),
    db.Column('timestamp', db.DateTime),
    db.Column('text', db.String),
    schema='changes',
)

nds = db.Table(
    'nds', db.MetaData(),
    db.Column('way_id', db.Integer, db.ForeignKey('ways.id'), nullable=False,
              primary_key=True),
    db.Column('way_version', db.Integer, db.ForeignKey('ways.version'),
              nullable=False, primary_key=True),
    db.Column('idx', db.Integer, primary_key=True),
    db.Column('node_id', db.BigInteger, nullable=False, primary_key=True),
    schema='changes',
)

members = db.Table(
    'members', db.MetaData(),
    db.Column('relation_id', db.Integer, db.ForeignKey('relations.id'),
              nullable=False, primary_key=True),
    db.Column('relation_version', db.Integer,
              db.ForeignKey('relations.version'), primary_key=True),
    db.Column('type', db.String),
    db.Column('role', db.String),
    db.Column('idx', db.Integer, primary_key=True),
    db.Column('member_node_id', db.BigInteger),
    db.Column('member_way_id', db.Integer),
    db.Column('member_relation_id', db.Integer)
)
