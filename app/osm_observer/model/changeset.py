from osm_observer.extensions import db

__all__ = ['Changeset']


class Changeset(db.Model):
    __tablename__ = 'changesets'
    __table_args__ = {
        'schema': 'app'
    }

    osm_id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, nullable=False)
    closed_at = db.Column(db.DateTime, nullable=True)

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
        q = cls.query.filter(cls.osm_id == id)
        return q.first()

    def __repr__(self):
        return '<Changeset osm_id=%s>' % (
            self.osm_id,
        )
