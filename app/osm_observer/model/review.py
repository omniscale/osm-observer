import datetime

from osm_observer.extensions import db
from osm_observer.helpers import _, serialize_datetime

__all__ = ['Review']


class Review(db.Model):
    __tablename__ = 'reviews'
    __table_args__ = {
        'schema': 'app'
    }

    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer, default=0)
    _status = db.Column(db.Integer, default=False)
    time_created = db.Column(
        db.DateTime,
        default=datetime.datetime.utcnow
    )
    changeset_id = db.Column(
        db.Integer,
        db.ForeignKey('app.changesets.id'),
        nullable=True
    )

    class STATUS(object):
        NOTHING = 0
        FIXED = 99

    _review_status = {
        0: _('Nothing'),
        99: _('Fixed')
    }

    def __init__(self, changeset_id, score, status=STATUS.NOTHING):
        self.changeset_id = changeset_id
        self.score = score
        self.status = status

    @property
    def serialize(self):
       return {
           'id': self.id,
           'score': self.score,
           'status': self.status,
           'timeCreated': serialize_datetime(self.time_created)
       }

    @property
    def status(self):
        return self._review_status[self._status]

    @status.setter
    def status(self, value):
        self._status = value

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first()
