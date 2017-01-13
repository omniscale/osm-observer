from flask import jsonify, request

from osm_observer.views import api
from osm_observer.extensions import db
from osm_observer.model import Review


@api.route('/reviews/<int:changeset_id>')
def reviews(changeset_id):
    query = Review.query.filter(Review.changeset_id == changeset_id)
    reviews = query.all()
    return jsonify([i.serialize for i in reviews])


@api.route('/reviews/<int:changeset_id>/add', methods=["POST"])
def add_review(changeset_id):
    data = request.json
    review = Review(
        changeset_id=changeset_id,
        score=data['score'],
        status=data['status'],
        comment=data['comment'],
    )
    db.session.add(review)
    db.session.commit()

    return jsonify(review.serialize)
