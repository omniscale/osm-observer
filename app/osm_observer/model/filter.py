from osm_observer.extensions import db

__all__ = ['Filter']


user_filter = db.Table(
    'users_filters', db.metadata,
    db.Column('user_id', db.Integer, db.ForeignKey('changes_app.users.id')),
    db.Column('filters_id', db.Integer, db.ForeignKey('changes_app.filters.id')),
    schema='changes_app'
)

class Filter(db.Model):
    __tablename__ = 'filters'
    __table_args__ = {
        'schema': 'changes_app'
    }

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    description = db.Column(db.String)
    code = db.Column(db.String)

    # TODO add include_deps Boolean field

    active = db.Column(db.Boolean, default=True)

    users = db.relationship(
        'User',
        secondary=user_filter,
        backref='filters'
    )

    def __init__(self, name, description, code, active=True):
        self.name = name
        self.description = description
        self.code = code
        self.active = active

    @property
    def json(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'code': self.code,
            'active': self.active
        }

    @classmethod
    def by_id(cls, id):
        q = cls.query.filter(cls.id == id)
        return q.first()
