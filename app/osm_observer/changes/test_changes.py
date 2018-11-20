import pytest

from osm_observer.changes.changes import collect_changeset

# #################################
# see conftest.py for conn fixture
# #################################

def test_missing_changeset(conn):
    changes = collect_changeset(conn, 1)
    assert changes == {
        'changes': {'nodes': [], 'ways': [], 'relations': []},
        'elements': {'nodes': {}, 'ways': {}, 'relations': {}},
    }


def test_multiple_node_versions(conn):
    conn.execute('''
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10001, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0, 0.1), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"created"');
        INSERT INTO nodes VALUES (10001, false, true, false, 10092, ST_SetSRID(ST_MakePoint(0, 0.2), 4326), 'u1', 10080, '2018-11-15 17:22:04+00', 2, '"comment"=>"mod 2"');
        INSERT INTO nodes VALUES (10001, false, true, false, 10093, ST_SetSRID(ST_MakePoint(0, 0.3), 4326), 'u1', 10080, '2018-11-15 17:23:04+00', 3, '"comment"=>"mod 3"');
        INSERT INTO nodes VALUES (10001, false, true, false, 10094, ST_SetSRID(ST_MakePoint(0, 0.4), 4326), 'u1', 10080, '2018-11-15 17:24:04+00', 4, '"comment"=>"mod 4"');
        INSERT INTO nodes VALUES (10001, false, true, false, 10095, ST_SetSRID(ST_MakePoint(0, 0.5), 4326), 'u1', 10080, '2018-11-15 17:25:04+00', 5, '"comment"=>"mod 5"');
        INSERT INTO nodes VALUES (10001, false, false, true, 10096, ST_SetSRID(ST_MakePoint(0, 0.5), 4326), 'u1', 10080, '2018-11-15 17:26:04+00', 6, '"comment"=>"delete"');

        INSERT INTO ways VALUES (10050, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 1, 0, 10000);
        INSERT INTO nds VALUES (10050, 1, 1, 10001);

        INSERT INTO ways VALUES (10050, false, true, false, 10091, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"comment"=>"mod way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 2, 0, 10000);
        INSERT INTO nds VALUES (10050, 2, 1, 10001);

        INSERT INTO ways VALUES (10050, false, true, false, 10094, 'u1', 10080, '2018-11-15 17:20:04+00', 3, '"comment"=>"mod way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 3, 0, 10000);
        INSERT INTO nds VALUES (10050, 3, 1, 10001);
        ''', multi=True)

    changes = collect_changeset(conn, 10090)
    assert changes['changes']['ways'] == [{'added': True, 'deleted': False, 'id': 10050L, 'key': '10050-1', 'modified': False, 'prev_key': None, 'version': 1}]
    assert changes['elements']['ways']['10050-1']['nds'] == ['10000-1', '10001-1']

    changes = collect_changeset(conn, 10091)
    assert changes['changes']['ways'] == [{'added': False, 'deleted': False, 'id': 10050L, 'key': '10050-2', 'modified': True, 'prev_key': '10050-1', 'version': 2}]
    assert changes['elements']['ways']['10050-1']['nds'] == ['10000-1', '10001-1']
    assert changes['elements']['ways']['10050-2']['nds'] == ['10000-1', '10001-1'] # nodes were not changed
    assert set(changes['elements']['nodes'].keys()) == set(['10000-1', '10001-1'])

    changes = collect_changeset(conn, 10094)
    assert changes['changes']['ways'] == [{'added': False, 'deleted': False, 'id': 10050L, 'key': '10050-3', 'modified': True, 'prev_key': '10050-2', 'version': 3}]
    assert changes['elements']['ways']['10050-2']['nds'] == ['10000-1', '10001-3'] # node changed in 10092 and 10093, old way now points to 10001-3
    assert changes['elements']['ways']['10050-3']['nds'] == ['10000-1', '10001-4'] # 10001 was changed with 10094
    assert set(changes['elements']['nodes'].keys()) == set(['10000-1', '10001-3', '10001-4'])

    changes = collect_changeset(conn, 10096)
    assert changes['changes']['nodes'] == [{'added': False, 'deleted': True, 'id': 10001, 'key': '10001-6', 'modified': False, 'prev_key': '10001-5', 'version': 6}]
    assert set(changes['elements']['nodes'].keys()) == set(['10001-5', '10001-6'])


def test_missing_nodes_of_way(conn):
    conn.execute('''
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');

        INSERT INTO ways VALUES (10050, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 1, 0, 10000);
        INSERT INTO nds VALUES (10050, 1, 1, 10001);
        ''', multi=True)

    changes = collect_changeset(conn, 10090)
    assert changes['changes']['ways'] == [{'added': True, 'deleted': False, 'id': 10050L, 'key': '10050-1', 'modified': False, 'prev_key': None, 'version': 1}]
    assert changes['elements']['ways']['10050-1']['nds'] == ['10000-1', '10001-0'] # node 10001 is missing
    assert set(changes['elements']['nodes'].keys()) == set(['10000-1'])


def test_node_members_of_relation(conn):
    conn.execute('''
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10010, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10011, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');

        INSERT INTO ways VALUES (10050, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 1, 0, 10010);
        INSERT INTO nds VALUES (10050, 1, 1, 10011);

        INSERT INTO relations VALUES (10070, true, false, false, 10091, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "type"=>"route"');

        INSERT INTO members VALUES (10070, 1, 0, 'node', 'stop',10000, null, null);
        INSERT INTO members VALUES (10070, 1, 1, 'node', 'stop', 10001, null, null); -- missing
        INSERT INTO members VALUES (10070, 1, 2, 'way', '', null, 10050, null);
        ''', multi=True)

    changes = collect_changeset(conn, 10091)
    assert changes['changes']['ways'] == []
    assert changes['changes']['nodes'] == []
    assert changes['changes']['relations'] == [{'added': True, 'deleted': False, 'id': 10070L, 'key': '10070-1', 'modified': False, 'prev_key': None, 'version': 1}]

    assert changes['elements']['relations']['10070-1']['members'] ==  [
        {'node': '10000-1', 'role': 'stop'},
        {'node': '10001-0', 'role': 'stop'}, # missing
        {'role': '', 'way': '10050-1'},
    ]
    assert changes['elements']['ways']['10050-1']['nds'] == ['10010-1', '10011-1'] # member way is complete
    assert set(changes['elements']['nodes'].keys()) == set(['10000-1', '10010-1', '10011-1']) # nodes from way and relation member


def test_way_members_of_relation(conn):
    conn.execute('''
        -- complete way
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10001, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO ways VALUES (10050, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 1, 0, 10000);
        INSERT INTO nds VALUES (10050, 1, 1, 10001);

        -- incomplete way
        INSERT INTO nodes VALUES (10002, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO ways VALUES (10051, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10051, 1, 0, 10002);
        INSERT INTO nds VALUES (10051, 1, 1, 10003); -- missing

        -- newer version, not to be returned
        INSERT INTO ways VALUES (10050, true, false, false, 10099, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"comment"=>"new way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 2, 0, 10000);
        INSERT INTO nds VALUES (10050, 2, 1, 10001);

        -- relation with complete, incomplete and missing way members
        INSERT INTO relations VALUES (10070, true, false, false, 10091, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "type"=>"route"');
        INSERT INTO members VALUES (10070, 1, 0, 'way', '', null, 10050, null);
        INSERT INTO members VALUES (10070, 1, 1, 'way', '', null, 10051, null); -- incomplete
        INSERT INTO members VALUES (10070, 1, 2, 'way', '', null, 10052, null); -- missing

        -- newer version, not to be returned
        INSERT INTO relations VALUES (10070, true, false, false, 10099, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"comment"=>"new way", "type"=>"route"');
        INSERT INTO members VALUES (10070, 2, 0, 'way', '', null, 10051, null); -- incomplete
        INSERT INTO members VALUES (10070, 2, 2, 'way', '', null, 10050, null);
        INSERT INTO members VALUES (10070, 2, 1, 'way', '', null, 10052, null); -- missing
        ''', multi=True)

    changes = collect_changeset(conn, 10091)
    assert changes['changes']['ways'] == []
    assert changes['changes']['nodes'] == []
    assert changes['changes']['relations'] == [{'added': True, 'deleted': False, 'id': 10070L, 'key': '10070-1', 'modified': False, 'prev_key': None, 'version': 1}]

    assert changes['elements']['relations']['10070-1']['members'] ==  [
        {'way': '10050-1', 'role': ''},
        {'way': '10051-1', 'role': ''},
        {'way': '10052-0', 'role': ''},
    ]

    assert changes['elements']['ways']['10050-1']['nds'] == ['10000-1', '10001-1']
    assert changes['elements']['ways']['10051-1']['nds'] == ['10002-1', '10003-0']
    assert set(changes['elements']['nodes'].keys()) == set(['10000-1', '10001-1', '10002-1'])

def test_relation_members_of_relation(conn):
    conn.execute('''
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');

        INSERT INTO relations VALUES (10070, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "type"=>"route"');
        INSERT INTO members VALUES (10070, 1, 0, 'node', '', 10000, null, null);

        INSERT INTO relations VALUES (10071, true, false, false, 10091, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "type"=>"route"');
        INSERT INTO members VALUES (10071, 1, 0, 'relation', '', null, null, 10070);

        -- newer version, not to be returned
        INSERT INTO relations VALUES (10071, true, false, false, 10099, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"comment"=>"new way", "type"=>"route"');
        INSERT INTO members VALUES (10071, 2, 0, 'relation', '', null, null, 10070);
        ''', multi=True)

    changes = collect_changeset(conn, 10091)
    assert changes['changes']['ways'] == []
    assert changes['changes']['nodes'] == []
    assert changes['changes']['relations'] == [{'added': True, 'deleted': False, 'id': 10071L, 'key': '10071-1', 'modified': False, 'prev_key': None, 'version': 1}]

    assert changes['elements']['relations']['10071-1']['members'] ==  [
        {'relation': '10070-1', 'role': ''},
    ]

    assert '10070-1' not in changes['elements']['relations'] # relation members are not added recursively!
    assert set(changes['elements']['relations'].keys()) == set(['10071-1'])
    assert set(changes['elements']['nodes'].keys()) == set()

