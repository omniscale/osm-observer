from osm_observer.extensions import db

__all__ = ['ReviewBotConfig']


class ReviewBotConfig(db.Model):
    __tablename__ = 'review_bot_configs'
    __table_args__ = {
        'schema': 'app'
    }

    id = db.Column(db.Integer, primary_key=True)
    active = db.Column(db.Boolean)
    bot_name = db.Column(db.String)
    config = db.Column(db.JSON)

    def __init__(self, bot_name, active, config):
        self.bot_name = bot_name
        self.active = active
        self.config = config

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first()

    @classmethod
    def by_bot_name(cls, name):
        q = cls.query.filter(cls.bot_name == name)
        return q.all()
