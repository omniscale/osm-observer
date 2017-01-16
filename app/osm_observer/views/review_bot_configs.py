from flask import jsonify, request
from flask_login import login_required

from osm_observer.views import api
from osm_observer.extensions import db
from osm_observer.model import ReviewBotConfig


@api.route('/review-bot-configs')
@login_required
def review_bot_configs():
    review_bot_configs = ReviewBotConfig.query.all()
    return jsonify([i.serialize for i in review_bot_configs])


@api.route('/review-bot-configs/<int:review_bot_config_id>')
@login_required
def review_bot_config(review_bot_config_id):
    review_bot_config = ReviewBotConfig.by_id(review_bot_config_id)
    return jsonify(review_bot_config.serialize)


@api.route('/review-bot-configs/add', methods=['POST'])
@login_required
def add_review_bot_config():
    data = request.json
    review_bot_config = ReviewBotConfig(
        data['botName'], data['active'], data['config'])

    db.session.add(review_bot_config)
    db.session.commit()

    return jsonify(review_bot_config.serialize)


@api.route('/review-bot-configs/<int:review_bot_config_id>/update',
           methods=['POST'])
@login_required
def update_review_bot_config(review_bot_config_id):
    data = request.json
    review_bot_config = ReviewBotConfig.by_id(review_bot_config_id)
    review_bot_config.botName = data['botName']
    review_bot_config.active = data['active']
    review_bot_config.config = data['config']

    db.session.commit()

    return jsonify(review_bot_config.serialize)


@api.route('/review-bot-configs/<int:review_bot_config_id>/delete',
           methods=['GET'])
@login_required
def delete_review_bot_config(review_bot_config_id):
    review_bot_config = ReviewBotConfig.by_id(review_bot_config_id)

    db.session.delete(review_bot_config)
    db.session.commit()

    return jsonify({'success': True})
