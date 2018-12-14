import pytest

from osm_observer.changes.changesets import collect_changesets_tags

# #################################
# see conftest.py for conn fixture
# #################################


def test_single_node(conn):
    conn.execute('''
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"tag"=>"value1"');
        INSERT INTO changesets VALUES (10090, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        INSERT INTO nodes VALUES (10001, true, false, false, 10091, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"tag"=>"value2"');
        INSERT INTO changesets VALUES (10091, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        INSERT INTO nodes VALUES (10001, false, true, false, 10092, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"foo"=>"bar", "tag"=>"value2a"');
        INSERT INTO changesets VALUES (10092, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        -- node created after our changesets, never returned
        INSERT INTO nodes VALUES (10002, true, false, false, 10099, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"tag"=>"value3"');
        ''', multi=True)

    # TODO
    # cs = collect_changesets(conn, coverages=[])
    # assert cs == set()
    for include_deps in [True, False]:
        cs = collect_changesets_tags(conn, "tags ? 'tag'", include_deps=include_deps)
        assert cs == set([10090, 10091, 10092])

        cs = collect_changesets_tags(conn, "tags->'tag' like 'value_'", include_deps=include_deps)
        assert cs == set([10090, 10091])

        cs = collect_changesets_tags(conn, "tags->'tag' = 'value1'", include_deps=include_deps)
        assert cs == set([10090])

        cs = collect_changesets_tags(conn, "tags->'tag' = 'value2'", include_deps=include_deps)
        assert cs == set([10091])

        cs = collect_changesets_tags(conn, "tags ? 'foo' and tags ? 'tag'", include_deps=include_deps)
        assert cs == set([10092])


def test_way_nodes(conn):
    conn.execute('''
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10001, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 1.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');

        INSERT INTO ways VALUES (10050, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 1, 0, 10000);
        INSERT INTO nds VALUES (10050, 1, 1, 10001);
        INSERT INTO changesets VALUES (10090, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        -- change node that belongs to a matching way
        INSERT INTO nodes VALUES (10000, false, true, false, 10091, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 2, '');
        INSERT INTO changesets VALUES (10091, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        INSERT INTO ways VALUES (10050, false, true, false, 10092, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"comment"=>"new way", "highway"=>"secondary"');
        INSERT INTO nds VALUES (10050, 2, 0, 10000);
        INSERT INTO changesets VALUES (10092, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        -- change node that no longer belongs to way
        INSERT INTO nodes VALUES (10001, false, true, false, 10093, ST_SetSRID(ST_MakePoint(0.0, 1.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 2, '');
        INSERT INTO changesets VALUES (10093, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        -- change tags of existing way and update node
        INSERT INTO ways VALUES (10050, false, true, false, 10094, 'u1', 10080, '2018-11-15 17:20:04+00', 3, '"comment"=>"new way", "highway"=>"primary"');
        INSERT INTO nds VALUES (10050, 3, 0, 10000);
        INSERT INTO changesets VALUES (10094, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        INSERT INTO nodes VALUES (10000, false, true, false, 10095, ST_SetSRID(ST_MakePoint(0.0, 1.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 3, '');
        INSERT INTO changesets VALUES (10095, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        ''', multi=True)

    # TODO
    # cs = collect_changesets(conn, coverages=[])
    # assert cs == set()

    cs = collect_changesets_tags(conn, "tags->'highway' = 'secondary'", include_deps=True)
    assert cs == set([10090, 10091, 10092])

    cs = collect_changesets_tags(conn, "tags->'highway' = 'secondary'")
    assert cs == set([10090, 10092])

    cs = collect_changesets_tags(conn, "tags->'highway' = 'primary'", include_deps=True)
    assert cs == set([10094, 10095])
    cs = collect_changesets_tags(conn, "tags->'highway' = 'primary'")
    assert cs == set([10094])

    cs = collect_changesets_tags(conn, "tags ? 'highway'", include_deps=True)
    assert cs == set([10090, 10091, 10092, 10094, 10095])


def test_relation_nodes(conn):
    conn.execute('''
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nodes VALUES (10001, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 1.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');

        INSERT INTO relations VALUES (10070, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"comment"=>"new rel", "highway"=>"secondary"');
        INSERT INTO members VALUES (10070, 1, 0, 'node', '', 10000, null, null);
        INSERT INTO members VALUES (10070, 1, 1, 'node', '', 10001, null, null);
        INSERT INTO changesets VALUES (10090, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        -- change node that belongs to a matching relation
        INSERT INTO nodes VALUES (10000, false, true, false, 10091, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 2, '');
        INSERT INTO changesets VALUES (10091, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        -- remove node from relation
        INSERT INTO relations VALUES (10070, true, false, false, 10092, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"comment"=>"mod rel", "highway"=>"secondary"');
        INSERT INTO members VALUES (10070, 2, 0, 'node', '', 10000, null, null);
        INSERT INTO changesets VALUES (10092, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        -- change node that no longer belongs to relation
        INSERT INTO nodes VALUES (10001, false, true, false, 10093, ST_SetSRID(ST_MakePoint(0.0, 1.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 2, '');
        INSERT INTO changesets VALUES (10093, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        ''', multi=True)

    # TODO
    # cs = collect_changesets(conn, coverages=[])
    # assert cs == set()

    cs = collect_changesets_tags(conn, "tags->'highway' = 'secondary'", include_deps=True)
    assert cs == set([10090, 10091, 10092])
    cs = collect_changesets_tags(conn, "tags->'highway' = 'secondary'")
    assert cs == set([10090, 10092])


def test_relation_ways(conn):
    conn.execute('''
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');

        INSERT INTO ways VALUES (10050, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '');
        INSERT INTO nds VALUES (10050, 1, 0, 10000);

        INSERT INTO relations VALUES (10070, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"highway"=>"secondary"');
        INSERT INTO members VALUES (10070, 1, 0, 'way', '', null, 10050, null);
        INSERT INTO changesets VALUES (10090, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        -- change way that belongs to matching relation
        INSERT INTO ways VALUES (10050, true, false, false, 10091, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '');
        INSERT INTO nds VALUES (10050, 2, 0, 10000);
        INSERT INTO changesets VALUES (10091, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        -- change way that no longer belongs to relation
        INSERT INTO relations VALUES (10070, false, true, false, 10092, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"highway"=>"secondary"');
        INSERT INTO changesets VALUES (10092, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        INSERT INTO ways VALUES (10050, false, true, false, 10093, 'u1', 10080, '2018-11-15 17:20:04+00', 3, '');
        INSERT INTO nds VALUES (10050, 3, 0, 10000);
        INSERT INTO changesets VALUES (10093, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        ''', multi=True)

    # TODO
    # cs = collect_changesets(conn, coverages=[])
    # assert cs == set()

    cs = collect_changesets_tags(conn, "tags->'highway' = 'secondary'", include_deps=True)
    assert cs == set([10090, 10091, 10092])
    cs = collect_changesets_tags(conn, "tags->'highway' = 'secondary'")
    assert cs == set([10090, 10092])


def test_relation_relation_way_node(conn):
    conn.execute('''
        -- full hierachy of node->way->relation->(master-)relation
        INSERT INTO nodes VALUES (10000, true, false, false, 10090, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"bus"=>"stop"');

        INSERT INTO ways VALUES (10050, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"highway"=>"primary"');
        INSERT INTO nds VALUES (10050, 1, 0, 10000);

        INSERT INTO relations VALUES (10070, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"type"=>"route"');
        INSERT INTO members VALUES (10070, 1, 0, 'way', '', null, 10050, null);

        INSERT INTO relations VALUES (10071, true, false, false, 10090, 'u1', 10080, '2018-11-15 17:20:04+00', 1, '"type"=>"route_master"');
        INSERT INTO members VALUES (10071, 1, 0, 'relation', '', null, null, 10070);
        INSERT INTO changesets VALUES (10090, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        -- change node does not trigger filter, as include_deps works from node-way and node-rel but not node-way-rel
        INSERT INTO nodes VALUES (10000, false, true, false, 10091, ST_SetSRID(ST_MakePoint(0.0, 0.0), 4326), 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"bus"=>"stop"');
        INSERT INTO changesets VALUES (10091, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        -- change way
        INSERT INTO ways VALUES (10050, true, false, false, 10092, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"highway"=>"primary"');
        INSERT INTO nds VALUES (10050, 2, 0, 10000);
        INSERT INTO changesets VALUES (10092, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));

        -- change relation
        INSERT INTO relations VALUES (10070, true, false, false, 10093, 'u1', 10080, '2018-11-15 17:20:04+00', 2, '"type"=>"route"');
        INSERT INTO members VALUES (10070, 2, 0, 'way', '', null, 10050, null);
        INSERT INTO changesets VALUES (10093, '2018-11-15 17:20:04+00', '2018-11-15 17:20:04+00', 1, false, 'u1', 10080, '', ST_MakeEnvelope(0, 0, 0, 0, 4326));
        ''', multi=True)

    # TODO
    # cs = collect_changesets(conn, coverages=[])
    # assert cs == set()

    cs = collect_changesets_tags(conn, "tags->'type' = 'route'", include_deps=True)
    assert cs == set([10090, 10092, 10093])
    cs = collect_changesets_tags(conn, "tags->'type' = 'route'")
    assert cs == set([10090, 10093])

    cs = collect_changesets_tags(conn, "tags->'type' = 'route_master'", include_deps=True)
    assert cs == set([10090, 10093])
    cs = collect_changesets_tags(conn, "tags->'type' = 'route_master'")
    assert cs == set([10090])
