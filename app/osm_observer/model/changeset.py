from sqlalchemy import func

from osm_observer.extensions import db
from osm_observer.helpers import serialize_datetime

__all__ = ['Changeset']


class Changeset(db.Model):
    __tablename__ = 'changesets'
    __table_args__ = {
        'schema': 'changes_app'
    }

    id = db.Column(db.Integer, primary_key=True)
    osm_id = db.Column(db.Integer, nullable=False, index=True)
    created_at = db.Column(db.DateTime, nullable=False)
    closed_at = db.Column(db.DateTime, nullable=True, index=True)

    reviews = db.relationship(
        'Review',
        backref='changeset',
        cascade='all, delete-orphan'
    )

    def __init__(self, osm_id, created_at, closed_at=None):
        self.osm_id = osm_id
        self.created_at = created_at
        if closed_at:
            self.closed_at = closed_at

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first()

    @classmethod
    def by_osm_id(cls, id):
        q = cls.query.filter(cls.osm_id == id)
        return q.first()

    @classmethod
    def last_closed_changeset_time(cls):
        q = cls.query.with_entities(func.max(cls.closed_at))
        return q.first()[0]

    def __repr__(self):
        return '<Changeset id="%s", osm_id=%s>' % (
            self.id, self.osm_id,
        )
