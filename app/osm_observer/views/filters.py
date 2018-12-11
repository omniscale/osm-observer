from flask import jsonify, request

from flask_login import login_required

from osm_observer.extensions import db
from osm_observer.views import api
from osm_observer.model import Filter


@api.route('/filter/all')
@login_required
def filter_all():
    data = []
    filters = Filter.query.all()
    for tag_filter in filters:
        filter_json = tag_filter.json
        data.append(filter_json)

    return jsonify(data)


@api.route('/filter/load')
@login_required
def filter_load():
    data = request.json
    id = data.get('id', False)

    if id:
        tag_filter = Filter.by_id(id)
        return jsonify(tag_filter.json)
    
    return jsonify({'error': 'Missing ID'})

@api.route('/filter/remove', methods=['POST'])
@login_required
def filter_remove():
    data = request.json
    id = data.get('id', False)

    if not id:
        return jsonify({'error': True})

    tag_filter = Filter.by_id(id)
    db.session.delete(tag_filter)
    db.session.commit()
    return jsonify({'success': True})
    
  
@api.route('/filter/save', methods=['POST'])
@login_required
def filter_save():
    data = request.json
    id = data.get('id', False)

    if id:
        tag_filter = Filter.by_id(id)
        tag_filter.name = data.get('name')
        tag_filter.code = data.get('code')
        tag_filter.description = data.get('description')
        tag_filter.active = data.get('active')
    else:
        tag_filter = Filter(
            name=data.get('name'),
            code=data.get('code'),
            description=data.get('description'),
            active=data.get('active')
        )
        db.session.add(tag_filter)
    
    db.session.commit()

    return jsonify({'success': True})
