from flask import jsonify

from osm_observer.views import api
from osm_observer.model import ReviewBotConfig


@api.route('/bots')
def bots():
    bots = ReviewBotConfig.query.all()
    return jsonify([i.serialize for i in bots])
