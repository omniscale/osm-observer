from osm_observer.application import create_app
from osm_observer.config import TestConfig
from osm_observer.extensions import db
from osm_observer.model import fixtures, Changeset, Review

from flask_testing import TestCase

app = create_app(config=TestConfig)


class BaseTestClass(TestCase):

    def create_app(self):
        return app

    def create_test_changeset_data(self):
        changesets = [
            {
                'id': '1',
                'created_at': '2016-02-02',
                'closed_at': '2016-02-02',
            },
            {
                'id': '2',
                'created_at': '2016-02-03',
                'closed_at': '2016-02-03',
            },
        ]
        for changeset in changesets:
            cs = Changeset(
                osm_id=changeset['id'],
                created_at=changeset['created_at'],
                closed_at=changeset['closed_at'],
            )
            db.session.add(cs)
        db.session.commit()

        reviews = [
            {
                'changeset_id': 1,
                'score': 100,
                'status': 0,
            },
            {
                'changeset_id': 1,
                'score': 5,
                'status': 99,
            },
            {
                'changeset_id': 2,
                'score': 100,
                'status': 0,
            },
        ]
        for review in reviews:
            cs = Changeset.by_id(review['changeset_id'])
            r = Review(
                changeset_id=cs.id,
                score=review['score'],
                status=review['status'],
            )
            db.session.add(r)
            db.session.commit()

    def setUp(self):
        db.create_all()
        db.session.commit()
        db.session.add_all(fixtures.create_users_coverages())
        db.session.commit()

    def tearDown(self):
        db.session.remove()
        db.drop_all()
