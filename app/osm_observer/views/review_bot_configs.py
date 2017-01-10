from flask import jsonify, request

from osm_observer.views import api
from osm_observer.extensions import db
from osm_observer.model import ReviewBotConfig


@api.route('/bots')
def bots():
    bots = ReviewBotConfig.query.all()
    return jsonify([i.serialize for i in bots])


@api.route('/bots/add', methods=['POST'])
def add_bot():
    data = request.json
    review_bot_config = ReviewBotConfig(
        data['botName'], data['active'], data['config'])

    db.session.add(review_bot_config)
    db.session.commit()

    return jsonify(review_bot_config.serialize)
