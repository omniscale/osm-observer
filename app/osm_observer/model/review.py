import datetime

from osm_observer.extensions import db
from osm_observer.model import User, ReviewBotConfig

__all__ = ['Review']


class REVIEW_STATUS(object):
    BROKEN = 1
    FIXED = 50
    OK = 99


class Review(db.Model):
    __tablename__ = 'reviews'
    __table_args__ = {
        'schema': 'app'
    }

    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer)
    _status = db.Column(db.Integer)
    comment = db.Column(db.String, nullable=False)
    time_created = db.Column(
        db.DateTime,
        default=datetime.datetime.utcnow
    )
    changeset_id = db.Column(
        db.Integer,
        db.ForeignKey('app.changesets.id'),
        nullable=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('app.users.id'),
        nullable=True
    )

    review_bot_config_id = db.Column(
        db.Integer,
        db.ForeignKey('app.review_bot_configs.id'),
        nullable=True
    )

    _review_status = {
        1: 'Broken',
        50: 'Fixed',
        99: 'OK',
    }

    def __init__(self, changeset_id=None, score=0,
                 status=None, comment=None, user_id=None,
                 review_bot_config_id=None):
        self.changeset_id = changeset_id
        self.score = score
        self.status = status
        self.comment = comment
        self.user_id = user_id
        self.review_bot_config_id = review_bot_config_id

    @property
    def serialize(self):
        data = {
            'id': self.id,
            'score': self.score,
            'status': self._status,
            'comment': self.comment,
            'timeCreated': self.time_created.timestamp() * 1000
        }
        if self.creator is not None:
            if isinstance(self.creator, User):
                data['creator'] = {
                    'id': self.creator.id,
                    'name': self.creator.username,
                    'type': 'user'
                }
            elif isinstance(self.creator, ReviewBotConfig):
                data['creator'] = {
                    'id': self.creator.id,
                    'name': self.creator.bot_name,
                    'type': 'bot'
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
        if self.review_bot_config is not None:
            return self.review_bot_config
        return None

    @status.setter
    def status(self, value):
        self._status = value

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first()
