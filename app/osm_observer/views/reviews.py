from flask import jsonify

from osm_observer.views import api

@api.route('reviews/<int:changeset_id>/list')
def reviews(changeset_id):
    # TODO return all reviews from changeset
    return jsonify()
