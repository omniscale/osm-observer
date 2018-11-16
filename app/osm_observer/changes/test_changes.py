from sqlalchemy import create_engine
from sqlalchemy.sql import text

import os

import pytest

from osm_observer.changes.changes import collect_changeset

# @pytest.fixture(scope="module")
@pytest.fixture(scope="module")
def sqla_conn():
    dbschema = 'osm_changes_test,public'
    engine = create_engine(
        "postgresql+psycopg2://localhost/osm_observer",
        connect_args={'options': '-csearch_path={}'.format(dbschema)})

    conn = engine.connect()

    with open(os.path.join(os.path.dirname(__file__), 'testdata', 'empty-imposm-changes-db.sql')) as f:
        sql = text(f.read())

    # execute and commit fixtures so that we can begin and rollback transactions in conn
    # fixture without loosing our tables
    with conn.begin():
        conn.execute(sql, multi=True)

    yield conn
    conn.close()

@pytest.fixture(scope="function")
def conn(sqla_conn):
    tx = sqla_conn.begin()
    try:
        yield sqla_conn
    except:
        tx.rollback()
        raise
    else:
        tx.rollback()


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
        INSERT INTO nds VALUES (10050, 1, 0, 10001);

        INSERT INTO ways VALUES (10050, false, true, false, 10091, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"comment"=>"mod way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 2, 0, 10000);
        INSERT INTO nds VALUES (10050, 2, 0, 10001);

        INSERT INTO ways VALUES (10050, false, true, false, 10094, 'u1', 10080, '2018-11-15 17:20:04+00', 3, '"comment"=>"mod way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 3, 0, 10000);
        INSERT INTO nds VALUES (10050, 3, 0, 10001);
        ''', multi=True)

    changes = collect_changeset(conn, 10090)
    assert changes['changes']['ways'] == [{u'added': True, u'deleted': False, u'id': 10050L, u'key': u'10050-1', u'modified': False, u'prev_key': None, u'version': 1}]
    assert changes['elements']['ways']['10050-1']['nds'] == ['10000-1', '10001-1']

    changes = collect_changeset(conn, 10091)
    assert changes['changes']['ways'] == [{u'added': False, u'deleted': False, u'id': 10050L, u'key': u'10050-2', u'modified': True, u'prev_key': '10050-1', u'version': 2}]
    assert changes['elements']['ways']['10050-1']['nds'] == ['10000-1', '10001-1']
    assert changes['elements']['ways']['10050-2']['nds'] == ['10000-1', '10001-1'] # nodes were not changed
    assert set(changes['elements']['nodes'].keys()) == set(['10000-1', '10001-1'])

    changes = collect_changeset(conn, 10094)
    assert changes['changes']['ways'] == [{u'added': False, u'deleted': False, u'id': 10050L, u'key': u'10050-3', u'modified': True, u'prev_key': '10050-2', u'version': 3}]
    assert changes['elements']['ways']['10050-2']['nds'] == ['10000-1', '10001-3'] # node changed in 10092 and 10093, old way now points to 10001-3
    assert changes['elements']['ways']['10050-3']['nds'] == ['10000-1', '10001-4'] # 10001 was changed with 10094
    assert set(changes['elements']['nodes'].keys()) == set(['10000-1', '10001-3', '10001-4'])

    changes = collect_changeset(conn, 10096)
    assert changes['changes']['nodes'] == [{u'added': False, u'deleted': True, u'id': 10001, u'key': u'10001-6', u'modified': False, u'prev_key': '10001-5', u'version': 6}]
    assert set(changes['elements']['nodes'].keys()) == set(['10001-5', '10001-6'])


def test_missing_nodes_of_way(conn):
    conn.execute('''
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');

        INSERT INTO ways VALUES (10050, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 1, 0, 10000);
        INSERT INTO nds VALUES (10050, 1, 0, 10001);
        ''', multi=True)

    changes = collect_changeset(conn, 10090)
    assert changes['changes']['ways'] == [{u'added': True, u'deleted': False, u'id': 10050L, u'key': u'10050-1', u'modified': False, u'prev_key': None, u'version': 1}]
    assert changes['elements']['ways']['10050-1']['nds'] == ['10000-1', '10001-1']

