from osm_observer.test.base import BaseTestClass
from osm_observer.model import Changeset, Review
from osm_observer.extensions import db

from flask import url_for


class TestReviews(BaseTestClass):

    def test_list_review(self):
        self.create_test_changeset_data()
        # self.create_test_review_data()

        changeset = Changeset.by_id(1)
        reviews = Review.query.filter(Review.changeset_id == 1).all()

        with self.app.test_client() as c:
            r = c.get(url_for('api.reviews', changeset_id=changeset.id))
            self.assertEqual(r.status_code, 200)

            # TODO check json input if the structure in app is final
            assert (len(r.json)) == len(reviews)

class TestEditReviews(BaseTestClass):

    def test_create_review(self):
        self.create_test_changeset_data()
        changeset = Changeset.by_id(1)
        with self.app.test_client() as c:

            r = c.post(url_for('api.add_review', changeset_id=changeset.id), data=dict(
                score=120,
                status=99
            ))
            self.assertEqual(r.status_code, 200)

            review_resposne = r.json
            review = Review.by_id(review_resposne['id'])

            assert review.score == 120
            assert review._status == 99
            assert review.status == Review._review_status[review._status]
