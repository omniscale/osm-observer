from osm_observer.application import create_app
from osm_observer.config import TestConfig
from osm_observer.extensions import db
from osm_observer.model import fixtures

from flask_testing import TestCase

app = create_app(config=TestConfig)


class BaseTestClass(TestCase):

    def create_app(self):
        return app

    def setUp(self):
        db.create_all()
        db.session.commit()
        db.session.add(fixtures.create_user())
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
