from osm_observer.extensions import db

__all__ = ['Changeset']


class Changeset(db.Model):
    __tablename__ = 'changesets'
    __table_args__ = {
        'schema': 'app'
    }

    id = db.Column(db.Integer, primary_key=True)
    osm_id = db.Column(db.Integer)

    closed_at = db.Column(db.DateTime)

    reviews = db.relationship(
        'Review',
        backref='changeset',
        cascade='all, delete-orphan'
    )
