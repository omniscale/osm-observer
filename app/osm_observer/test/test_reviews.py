import json

from osm_observer.test.base import BaseTestClass
from osm_observer.model import Changeset, Review
from osm_observer.extensions import db

from flask import url_for

class TestEditReviews(BaseTestClass):

    def create_test_data(self):
        changeset = {
            'id': '1',
            'created_at': '2016-02-02',
            'closed_at': '2016-02-02',
        }
        cs = Changeset(
            osm_id=changeset['id'],
            created_at=changeset['created_at'],
            closed_at=changeset['closed_at'],
        )
        db.session.add(cs)
        db.session.commit()

    def test_create_review(self):
        self.create_test_data()
        changeset = Changeset.by_id(1)
        with self.app.test_client() as c:

            r = c.post(url_for('api.add_review', changeset_id=changeset.id), data=dict(
                score=120,
                status=99
            ), follow_redirects=False)
            self.assertEqual(r.status_code, 200)

            review_resposne = r.json
            review = Review.by_id(review_resposne['id'])

            assert review.score == 120
            assert review._status == 99
            assert review.status == Review._review_status[review._status]
