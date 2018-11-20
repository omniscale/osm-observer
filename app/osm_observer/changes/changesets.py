from __future__ import (absolute_import, division,
                        print_function, unicode_literals)
from sqlalchemy import create_engine
from sqlalchemy.sql import text, select


SQL_CHANGESET_NODES_INTERSECTS = text(
'''
-- all nodes for changeset within a bbox including dependent nodes from ways and relations
with recursive
cchangesets as (
    select id as cid from changesets order by id desc limit 50
),
crelations as (
    select r.id, r.version, c.cid from cchangesets c inner join relations r on c.cid = r.changeset
),
cmembers (wid, nid, rid, cid) as (
    select m.member_way_id as wid, m.member_node_id as nid, m.member_relation_id as rid, cid
        from crelations r
            inner join members m on r.id = m.relation_id and r.version = m.relation_version
    union all
    select m.member_way_id as wid, m.member_node_id as nid, m.member_relation_id as rid, cid
        from cmembers cm
        inner join relations r on cm.rid = r.id
        inner join members m on r.id = m.relation_id and r.version = m.relation_version
        where cm.rid is not null and false
),
cways as (
    -- ways changed in this changeset
    select w.id, cid, version from cchangesets c inner join ways w on c.cid = w.changeset
    union all (
    -- ways referenced by a relation in this changeset. return latest version for this changeset
        select distinct on (w.id, cid)
            w.id, cid, version
        from cmembers m
            inner join ways w on m.wid = w.id
        where m.wid is not null and w.changeset <= cid
        order by cid, w.id, w.version desc
    )
),
cnodes as (
    -- nodes directly referenced by this changeset
    select n.id, cid, n.geometry from cchangesets c inner join nodes n on c.cid = n.changeset
    union all (
    -- nodes referenced by a way in this changeset. return latest version for this changeset
        select distinct on (n.id, cid)
            n.id, cid, n.geometry
        from cways w
            inner join nds on nds.way_id = w.id and nds.way_version = w.version
            inner join nodes n on nds.node_id = n.id
        where n.changeset <= cid
        order by cid, n.id, n.version desc
    )
    union all (
    -- nodes referenced by a relation in this changeset. return latest version for this changeset
        select distinct on (n.id, cid)
            n.id, cid, n.geometry
        from cmembers m
            inner join nodes n on m.nid = n.id
        where m.nid is not null and n.changeset <= cid
        order by cid, n.id, n.version desc
    )
)
select distinct cid from cnodes n, coverages co where ST_Intersects(n.geometry, co.geometry) and co.id in :coverage_ids;
''')

SQL_CHANGESET_TAGS_FILTER = text(
'''
-- all changesets that include tags
(
with recursive
cnodes as (
    select n.id, cid, n.tags from cchangesets c inner join nodes n on c.cid = n.changeset
),
cways as (
    select w.id, cid, w.tags, true as direct from cchangesets c inner join ways w on c.cid = w.changeset
    union all
    (
        select id, cid, tags, false as direct from (
            -- reduce multiple joined ways with distinct on to only return the most recent (see order by)
            select distinct on (n.cid, w.id, n.id)
                n.cid, w.id, w.tags,
            -- w.tags,
            w.version, nds.way_version
            from cnodes n
            inner join nds on nds.node_id = n.id
            -- join nds/ways but also include ways that are newer so that we can check if our node is still present in the latest way version
            inner join ways w on nds.way_id = w.id and w.version >= nds.way_version
            where w.changeset < n.cid  -- exclude ways newer than node
            order by n.cid, w.id, n.id, w.changeset desc
        ) as sub where version = way_version -- only include way node was joined with most recent version of way
    )
),
crelations as (
    select r.id, cid, r.tags, true as direct from cchangesets c inner join relations r on c.cid = r.changeset
    union all
    -- select r.id, cid, r.tags, false as direct from cways w inner join members m on m.member_way_id = w.id inner join relations r on m.relation_id = r.id and r.version = m.relation_version where r.changeset != cid
    (
        select id, cid, tags, false as direct from (
            select distinct on (w.cid, r.id, w.id)
                r.id, cid, r.tags,
                r.version, m.relation_version
            from cways w
                inner join members m on m.member_way_id = w.id
                inner join relations r on m.relation_id = r.id and r.version >= m.relation_version
            where r.changeset < w.cid
            order by w.cid, r.id, w.id, r.changeset desc
        ) as sub where version = relation_version
    )
    union all
    (
        select id, cid, tags, false as direct from (
            select distinct on (n.cid, r.id, n.id)
                r.id, cid, r.tags,
                r.version, m.relation_version
            from cnodes n
                inner join members m on m.member_node_id = n.id
                inner join relations r on m.relation_id = r.id and r.version >= m.relation_version
            where r.changeset < n.cid
            order by n.cid, r.id, n.id, r.changeset desc
        ) as sub where version = relation_version
    )
    union all
    (
        select id, cid, tags, false as direct from (
            select distinct on (cr.cid, r.id, cr.id)
                r.id, cid, r.tags,
                r.version, m.relation_version
            from crelations cr
                inner join members m on m.member_relation_id = cr.id
                inner join relations r on m.relation_id = r.id and r.version >= m.relation_version
            where r.changeset < cr.cid
            order by cr.cid, r.id, cr.id, r.changeset desc
        ) as sub where version = relation_version
    )
),
cchangesets as (
    select id as cid from changesets order by id desc limit 150
    -- select id as cid from changesets where st_intersects(bbox, st_makeenvelope(8.405914,52.982963,9.066467,53.257409,4326)) order by id desc limit 50
    -- select distinct changeset as cid from relations order by changeset desc limit 20
    -- select cid from (values (63590586)) as v (cid)
)
select cid, id, 'node' as type, tags, true as direct from cnodes where tags != ''::hstore
union all
select cid, id, 'way' as type, tags, direct from cways where tags != ''::hstore
union all
select cid, id, 'relation' as type, tags, direct from crelations where tags != ''::hstore
) as sub
'''
)

def collect_changesets(conn, coverages=None):
    if not coverages:
        raise NotImplementedError()

    changesets = set()

    res = conn.execute(SQL_CHANGESET_NODES_INTERSECTS, {'coverage_ids': tuple(coverages)})
    for row in res:
        changesets.add(row.cid)

    return changesets

def collect_changesets_tags(conn, filter=None):
    if not filter:
        raise NotImplementedError()

    res = conn.execute(text(
'''
with recursive cnodes as (
    select n.id, cid, n.tags from cchangesets c inner join nodes n on c.cid = n.changeset
),
cchangesets as (
    select id as cid from changesets order by id desc limit 150
)
-- select * from cnodes;

(select id, cid, tags, false as direct from (
        select distinct on (n.cid, w.id, n.id)
            n.cid, w.id, w.tags,
        -- w.tags,
        w.version, nds.way_version
        from cnodes n
        inner join nds on nds.node_id = n.id
        inner join ways w on nds.way_id = w.id and w.version >= nds.way_version
        -- join nds/ways contains no check for way_version, we need to join with all versions to check if latest contains our node
        where w.changeset < n.cid
        order by n.cid, w.id, n.id, w.changeset desc
    ) as sub
        where version = way_version
);
'''))
    print()
    for row in res:
        print(row)
    # return

    changesets = set()
    stmt = select([text('distinct cid')])
    stmt = select([text('cid'), text('id'), text('type'), text('tags')])
    stmt = stmt.where(text(filter)).select_from(SQL_CHANGESET_TAGS_FILTER)

    print()
    res = conn.execute(stmt)
    for row in res:
        print(row)
        changesets.add(row.cid)

    return changesets

def main():
    dbschema = 'changes,public'
    engine = create_engine(
        "postgresql+psycopg2://localhost/osm_observer",
        connect_args={'options': '-csearch_path={}'.format(dbschema)})

    conn = engine.connect()

    result = collect_changesets(conn, 64483586)
    import json
    print(json.dumps(result))

    # res = conn.execute(text('select * from members where relation_id = 2069510 and relation_version = 73'))
    # for row in res:
    #     print(row)



if __name__ == '__main__':
    for _ in range(1):
        main()

