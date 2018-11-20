import pytest

from osm_observer.changes.changesets import collect_changesets

# #################################
# see conftest.py for conn fixture
# #################################


def test_single_node(conn):
    conn.execute('''
        INSERT INTO coverages VALUES (1, 'null island', ST_MakeEnvelope(-10, -10, 10, 10, 4326));
        INSERT INTO coverages VALUES (2, 'somewhere island', ST_MakeEnvelope(100, 0, 110, 10, 4326));
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO changesets VALUES (10090, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        ''', multi=True)

    # TODO
    # cs = collect_changesets(conn, coverages=[])
    # assert cs == set()

    cs = collect_changesets(conn, coverages=[1])
    assert cs == set([10090])

    cs = collect_changesets(conn, coverages=[2])
    assert cs == set()


def test_node_moves(conn):
    # node moves through various coverages
    conn.execute('''
        INSERT INTO coverages VALUES (1, 'null island', ST_MakeEnvelope(-10, -10, 10, 10, 4326));
        INSERT INTO coverages VALUES (2, 'another island', ST_MakeEnvelope(10, -10, 30, 10, 4326));
        INSERT INTO coverages VALUES (3, 'all', ST_MakeEnvelope(-10, -10, 50, 10, 4326));
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10000, false, true, false, 10091, ST_SetSRID(ST_MakePoint(20.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 2, '');
        INSERT INTO nodes VALUES (10000, false, true, false, 10092, ST_SetSRID(ST_MakePoint(40.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 3, '');
        INSERT INTO changesets VALUES (10090, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO changesets VALUES (10091, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO changesets VALUES (10092, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        ''', multi=True)

    # TODO
    # cs = collect_changesets(conn, coverages=[])
    # assert cs == set()

    cs = collect_changesets(conn, coverages=[1])
    assert cs == set([10090])

    cs = collect_changesets(conn, coverages=[2])
    assert cs == set([10091])

    cs = collect_changesets(conn, coverages=[1, 2])
    assert cs == set([10090, 10091])

    cs = collect_changesets(conn, coverages=[1, 2, 3])
    assert cs == set([10090, 10091, 10092])
    cs = collect_changesets(conn, coverages=[3])

def test_way(conn):
    # way references nodes in various coverages
    conn.execute('''
        INSERT INTO coverages VALUES (1, 'null island', ST_MakeEnvelope(-10, -10, 10, 10, 4326));
        INSERT INTO coverages VALUES (2, 'another island', ST_MakeEnvelope(10, -10, 30, 10, 4326));
        INSERT INTO coverages VALUES (3, 'all', ST_MakeEnvelope(-10, -10, 50, 10, 4326));

        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10001, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 1.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10002, true, false, false, 10090, ST_SetSRID(ST_MakePoint(20.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10003, true, false, false, 10090, ST_SetSRID(ST_MakePoint(20.0, 1.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');

        -- in coverage 1
        INSERT INTO ways VALUES (10050, true, false, false, 10091, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 1, 0, 10000);
        INSERT INTO nds VALUES (10050, 1, 1, 10001);

        -- same nodes in coverage 1
        INSERT INTO ways VALUES (10050, false, true, false, 10092, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"comment"=>"mod way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 2, 0, 10000);
        INSERT INTO nds VALUES (10050, 2, 1, 10001);

        -- nodes in coverage 1 and 2
        INSERT INTO ways VALUES (10050, false, true, false, 10093, 'u1', 10080, '2018-11-15 17:20:04+00', 3, '"comment"=>"mod way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 3, 0, 10002);
        INSERT INTO nds VALUES (10050, 3, 1, 10001);

        -- nodes in coverage 2
        INSERT INTO ways VALUES (10050, false, true, false, 10094, 'u1', 10080, '2018-11-15 17:20:04+00', 4, '"comment"=>"mod way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 4, 0, 10002);
        INSERT INTO nds VALUES (10050, 4, 1, 10003);

        -- move nodes to coverage 1
        INSERT INTO nodes VALUES (10002, false, true, false, 10095, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 2, '');
        INSERT INTO nodes VALUES (10003, false, true, false, 10095, ST_SetSRID(ST_MakePoint(0.0, 1.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 2, '');
        INSERT INTO ways VALUES (10050, false, true, false, 10096, 'u1', 10080, '2018-11-15 17:20:04+00', 5, '"comment"=>"mod way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 5, 0, 10002);
        INSERT INTO nds VALUES (10050, 5, 1, 10003);

        -- we only have changesets for our ways
        INSERT INTO changesets VALUES (10091, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO changesets VALUES (10092, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO changesets VALUES (10093, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO changesets VALUES (10094, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO changesets VALUES (10096, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        ''', multi=True)

    # TODO
    # cs = collect_changesets(conn, coverages=[])
    # assert cs == set()

    cs = collect_changesets(conn, coverages=[1])
    assert cs == set([10091, 10092, 10093, 10096])

    cs = collect_changesets(conn, coverages=[2])
    assert cs == set([10093, 10094])

    cs = collect_changesets(conn, coverages=[1, 2])
    assert cs == set([10091, 10092, 10093, 10094, 10096])

    cs = collect_changesets(conn, coverages=[1, 2, 3])
    assert cs == set([10091, 10092, 10093, 10094, 10096])
    cs = collect_changesets(conn, coverages=[3])
    assert cs == set([10091, 10092, 10093, 10094, 10096])

def test_relation_with_node_members(conn):
    # Relation references nodes in different coverages.
    # Changes to way and relation are interleaved. Check that the changeset of the
    # relation only contains the change of the previous way change, but not any other.
    conn.execute('''
        INSERT INTO coverages VALUES (1, 'null island', ST_MakeEnvelope(-10, -10, 10, 10, 4326));
        INSERT INTO coverages VALUES (2, 'another island', ST_MakeEnvelope(10, -10, 30, 10, 4326));
        INSERT INTO coverages VALUES (3, 'all', ST_MakeEnvelope(-10, -10, 50, 10, 4326));

        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10001, true, false, false, 10090, ST_SetSRID(ST_MakePoint(20.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10002, true, false, false, 10090, ST_SetSRID(ST_MakePoint(20.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');

        -- initial relation, node in coverage 1
        INSERT INTO relations VALUES (10070, true, false, false, 10091, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new rel", "highway"=>"secondary"');
        INSERT INTO members VALUES (10070, 1, 0, 'node', '', 10000, null, null);

        -- change relation to use node in coverage 2
        INSERT INTO relations VALUES (10070, true, false, false, 10092, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"comment"=>"mod rel", "highway"=>"secondary"');
        INSERT INTO members VALUES (10070, 2, 0, 'node', '', 10001, null, null);

        -- move node back to coverage 1
        INSERT INTO nodes VALUES (10001, false, true, false, 10093, ST_SetSRID(ST_MakePoint(5.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 2, '');
        INSERT INTO relations VALUES (10070, true, false, false, 10094, 'u1', 10080, '2018-11-15 17:20:04+00', 3, '"comment"=>"mod rel", "highway"=>"secondary"');
        INSERT INTO members VALUES (10070, 3, 0, 'node', '', 10001, null, null);

        -- add node in coverage 2
        INSERT INTO relations VALUES (10070, false, true, false, 10095, 'u1', 10080, '2018-11-15 17:20:04+00', 4, '"comment"=>"mod rel", "highway"=>"secondary"');
        INSERT INTO members VALUES (10070, 4, 0, 'node', '', 10001, null, null);
        INSERT INTO members VALUES (10070, 4, 1, 'node', '', 10002, null, null);

        -- we only have changesets for our relations
        INSERT INTO changesets VALUES (10091, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO changesets VALUES (10092, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO changesets VALUES (10094, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO changesets VALUES (10095, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        ''', multi=True)

    # TODO
    # cs = collect_changesets(conn, coverages=[])
    # assert cs == set()

    cs = collect_changesets(conn, coverages=[1])
    assert cs == set([10091, 10094, 10095])

    cs = collect_changesets(conn, coverages=[2])
    assert cs == set([10092, 10095])

    cs = collect_changesets(conn, coverages=[1, 2])
    assert cs == set([10091, 10092, 10094, 10095])

    cs = collect_changesets(conn, coverages=[1, 2, 3])
    assert cs == set([10091, 10092, 10094, 10095])
    cs = collect_changesets(conn, coverages=[3])
    assert cs == set([10091, 10092, 10094, 10095])


def test_relation_with_way_members(conn):
    # Relation references way with nodes in different coverages
    # Changes to way and relation are interleaved. Check that the changeset of the
    # relation only contains the change of the previous way change, but not any other.
    conn.execute('''
        INSERT INTO coverages VALUES (1, 'null island', ST_MakeEnvelope(-10, -10, 10, 10, 4326));
        INSERT INTO coverages VALUES (2, 'another island', ST_MakeEnvelope(10, -10, 30, 10, 4326));
        INSERT INTO coverages VALUES (3, 'all', ST_MakeEnvelope(-10, -10, 50, 10, 4326));

        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10001, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 1.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10002, true, false, false, 10090, ST_SetSRID(ST_MakePoint(20.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10003, true, false, false, 10090, ST_SetSRID(ST_MakePoint(20.0, 1.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');

        INSERT INTO ways VALUES (10050, true, false, false, 10091, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 1, 0, 10000);
        INSERT INTO nds VALUES (10050, 1, 1, 10001);

        INSERT INTO relations VALUES (10070, true, false, false, 10092, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new rel", "highway"=>"secondary"');
        INSERT INTO members VALUES (10070, 1, 0, 'way', '', null, 10050, null);

        INSERT INTO ways VALUES (10050, false, true, false, 10093, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"comment"=>"mod way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 2, 0, 10000);
        INSERT INTO nds VALUES (10050, 2, 1, 10001);

        INSERT INTO relations VALUES (10070, true, false, false, 10094, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"comment"=>"new rel", "highway"=>"secondary"');
        INSERT INTO members VALUES (10070, 2, 0, 'way', '', null, 10050, null);

        INSERT INTO ways VALUES (10050, false, true, false, 10095, 'u1', 10080, '2018-11-15 17:20:04+00', 3, '"comment"=>"mod way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 3, 0, 10002);
        INSERT INTO nds VALUES (10050, 3, 1, 10001);

        INSERT INTO relations VALUES (10070, true, false, false, 10096, 'u1', 10080, '2018-11-15 17:20:04+00', 3, '"comment"=>"new rel", "highway"=>"secondary"');
        INSERT INTO members VALUES (10070, 3, 0, 'way', '', null, 10050, null);

        INSERT INTO ways VALUES (10050, false, true, false, 10097, 'u1', 10080, '2018-11-15 17:20:04+00', 4, '"comment"=>"mod way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 4, 0, 10002);
        INSERT INTO nds VALUES (10050, 4, 1, 10003);

        INSERT INTO relations VALUES (10070, true, false, false, 10098, 'u1', 10080, '2018-11-15 17:20:04+00', 4, '"comment"=>"new rel", "highway"=>"secondary"');
        INSERT INTO members VALUES (10070, 4, 0, 'way', '', null, 10050, null);


        -- we only have changesets for our relations
        INSERT INTO changesets VALUES (10092, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO changesets VALUES (10094, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO changesets VALUES (10096, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO changesets VALUES (10098, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        ''', multi=True)

    # TODO
    # cs = collect_changesets(conn, coverages=[])
    # assert cs == set()

    cs = collect_changesets(conn, coverages=[1])
    assert cs == set([10092, 10094, 10096])

    cs = collect_changesets(conn, coverages=[2])
    assert cs == set([10096, 10098])

    cs = collect_changesets(conn, coverages=[1, 2])
    assert cs == set([10092, 10094, 10096, 10098])

    cs = collect_changesets(conn, coverages=[1, 2, 3])
    assert cs == set([10092, 10094, 10096, 10098])
    cs = collect_changesets(conn, coverages=[3])
    assert cs == set([10092, 10094, 10096, 10098])
