import datetime

from osm_observer.extensions import db
from osm_observer.model import User

__all__ = ['Review', 'REVIEW_STATUS']


class REVIEW_STATUS(object):
    BROKEN = 1
    FIXED = 50
    OK = 99


class Review(db.Model):
    __tablename__ = 'reviews'
    __table_args__ = {
        'schema': 'changes_app'
    }

    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer)
    _status = db.Column(db.Integer)
    comment = db.Column(db.String)
    time_created = db.Column(
        db.DateTime(timezone=True),
        default=datetime.datetime.now
    )
    changeset_id = db.Column(
        db.Integer,
        db.ForeignKey('changes_app.changesets.id'),
        nullable=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('changes_app.users.id'),
        nullable=True
    )

    _review_status = {
        1: 'Broken',
        50: 'Fixed',
        99: 'OK',
    }

    def __init__(self, changeset_id=None, score=0,
                 status=None, comment=None, user_id=None):
        self.changeset_id = changeset_id
        self.score = score
        self.status = status
        self.comment = comment
        self.user_id = user_id

    @property
    def serialize(self):
        data = {
            'id': self.id,
            'score': self.score,
            'status': self._status,
            'comment': self.comment,
            'timeCreated': self.time_created.strftime("%d.%m.%Y %H:%M:%S")
        }
        if self.creator is not None:
            if isinstance(self.creator, User):
                data['creator'] = {
                    'id': self.creator.id,
                    'name': self.creator.username,
                    'type': 'user'
                }
        return data

    @property
    def status(self):
        if self._status is None:
            return None
        return self._review_status[self._status]

    @property
    def creator(self):
        if self.user is not None:
            return self.user
        return None

    @status.setter
    def status(self, value):
        self._status = value

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first()
