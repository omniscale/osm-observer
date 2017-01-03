import datetime

from osm_observer.extensions import db
from osm_observer.helpers import _

__all__ = ['Review']


class Review(db.Model):
    __tablename__ = 'reviews'
    __table_args__ = {
        'schema': 'app'
    }

    id = db.Column(db.Integer, primary_key=True)

    score = db.Column(db.Integer, default=0)

    _status = db.Column(db.String, default=False)

    time_created = db.Column(db.DateTime, default=datetime.datetime.utcnow)

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

    @property
    def status(self):
        return self._review_status[self._status]

    @status.setter
    def status(self, value):
        self._status = value
