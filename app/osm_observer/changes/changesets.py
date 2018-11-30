from __future__ import (absolute_import, division,
                        print_function, unicode_literals)
from sqlalchemy import create_engine
from sqlalchemy.sql import text, select

from datetime import datetime, timedelta, time, date

SQL_CHANGESETS = text(
'''
select id,
    to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
    to_char(closed_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as closed_at,
    num_changes, open, user_name, user_id, tags,
    st_xmin(bbox) as minx, st_ymin(bbox) as miny, st_xmax(bbox) as maxx, st_ymax(bbox) as maxy
from changesets where id = ANY(:cids ::int[]) order by closed_at
''')

SQL_CHANGESET_NODES_INTERSECTS = text(
'''
-- all nodes for changeset within a bbox including dependent nodes from ways and relations
with recursive
cchangesets as (
    select id as cid from changesets
    where
        closed_at >= :time_from
        and closed_at <= :time_till
    order by id desc
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
),
crelations as (
    select r.id, cid, r.tags, true as direct from cchangesets c inner join relations r on c.cid = r.changeset
),
cchangesets as (
    select id as cid
    from changesets
    where
        closed_at >= :time_from
        and closed_at <= :time_till
        and (:cids ::int[] = array[]::int[] or id = ANY(:cids ::int[]))
    order by id desc
)
select cid, id, 'node' as type, tags, true as direct from cnodes where tags != ''::hstore
union all
select cid, id, 'way' as type, tags, direct from cways where tags != ''::hstore
union all
select cid, id, 'relation' as type, tags, direct from crelations where tags != ''::hstore
) as sub
'''
)

SQL_CHANGESET_TAGS_FILTER_RECURSIVE = text(
'''
-- all changesets that include tags
(
with recursive
cnodes as (
    select n.id, cid, n.tags, true as direct, n.changeset from cchangesets c inner join nodes n on c.cid = n.changeset
),
cways as (
    select w.id, cid, w.tags, true as direct, w.changeset from cchangesets c inner join ways w on c.cid = w.changeset
    union all
    (
        select id, cid, tags, false as direct, ncid as changeset from (
            -- reduce multiple joined ways with distinct on to only return the most recent (see order by)
            select distinct on (n.cid, w.id, n.id)
                n.cid, w.id, w.tags,
                w.version, nds.way_version,
                w.changeset as wcid, n.changeset as ncid
            from cnodes n
            inner join nds on nds.node_id = n.id
            -- join nds/ways but also include ways that are newer so that we can check if our node is still present in the latest way version
            inner join ways w on nds.way_id = w.id and w.version >= nds.way_version
            where w.changeset <= n.cid  -- exclude ways newer than node
            order by n.cid, w.id, n.id, w.changeset desc
        ) as sub
        -- Only include if node was joined with most recent version of way,
        -- but not the same changeset (already included).
        where version = way_version and wcid != ncid
    )
),
crelations as (
    select r.id, cid, r.tags, true as direct, r.changeset from cchangesets c inner join relations r on c.cid = r.changeset
    union all
    -- select r.id, cid, r.tags, false as direct from cways w inner join members m on m.member_way_id = w.id inner join relations r on m.relation_id = r.id and r.version = m.relation_version where r.changeset != cid
    (
        select id, cid, tags, false as direct, wcid as changeset from (
            select distinct on (w.cid, r.id, w.id)
                r.id, cid, r.tags,
                r.version, m.relation_version,
                w.changeset as wcid, r.changeset as rcid
            from cways w
                inner join members m on m.member_way_id = w.id
                inner join relations r on m.relation_id = r.id and r.version >= m.relation_version
            where r.changeset <= w.cid
            order by w.cid, r.id, w.id, r.changeset desc
        ) as sub
        where version = relation_version and wcid != rcid
    )
    union all
    (
        select id, cid, tags, false as direct, ncid as changeset from (
            select distinct on (n.cid, r.id, n.id)
                r.id, cid, r.tags,
                r.version, m.relation_version,
                n.changeset as ncid, r.changeset as rcid
            from cnodes n
                inner join members m on m.member_node_id = n.id
                inner join relations r on m.relation_id = r.id and r.version >= m.relation_version
            where r.changeset <= n.cid
            order by n.cid, r.id, n.id, r.changeset desc
        ) as sub
        where version = relation_version and ncid != rcid
    )
    union all
    (
        select id, cid, tags, false as direct, crcid as changeset from (
            select distinct on (cr.cid, r.id, cr.id)
                r.id, cid, r.tags,
                r.version, m.relation_version,
                cr.changeset as crcid, r.changeset as rcid
            from crelations cr
                inner join members m on m.member_relation_id = cr.id
                inner join relations r on m.relation_id = r.id and r.version >= m.relation_version
            where r.changeset <= cr.cid
            order by cr.cid, r.id, cr.id, r.changeset desc
        ) as sub
        where version = relation_version and crcid != rcid
    )
),
cchangesets as (
    select id as cid
    from changesets
    where
        closed_at >= :time_from
        and closed_at <= :time_till
        and (:cids ::int[] = array[]::int[] or id = ANY(:cids ::int[]))
    order by id desc
)
select cid, id, 'relation' as type, tags, direct from crelations where tags != ''::hstore
union all
select cid, id, 'way' as type, tags, direct from cways where tags != ''::hstore
union all
select cid, id, 'node' as type, tags, direct from cnodes where tags != ''::hstore
) as sub
'''
)

def collect_changesets_coverages(conn, coverages, time_from=None, time_till=None):

    if not time_from:
        time_from = datetime.now()- timedelta(days=99*365)
    if not time_till:
        time_till = datetime.now()


    res = conn.execute(
        SQL_CHANGESET_NODES_INTERSECTS,
        {
            'coverage_ids': tuple(coverages),
            'time_from': time_from,
            'time_till': time_till,
        }
    )
    changesets = set()
    for row in res:
        changesets.add(row.cid)

    return changesets

def collect_changesets_tags(conn, filter=None, recursive=False, time_from=None, time_till=None, cids=None):
    if not time_from:
        time_from = datetime.now() - timedelta(days=99*365)
    if not time_till:
        time_till = datetime.now()

    stmt = select([text('distinct cid')])
    # stmt = select([text('cid'), text('id'), text('type'), text('direct'), text('tags')])
    if filter:
        stmt = stmt.where(text(filter))

    if recursive:
        stmt = stmt.select_from(SQL_CHANGESET_TAGS_FILTER_RECURSIVE)
    else:
        stmt = stmt.select_from(SQL_CHANGESET_TAGS_FILTER)

    res = conn.execute(
        stmt,
        {
            'time_from': time_from,
            'time_till': time_till,
            'cids': list(cids or []),
        }
    )

    changesets = set()
    for row in res:
        changesets.add(row.cid)

    return changesets

def collect_changesets(conn, cids):
    """
    Load metadata for the given changeset IDs.
    """
    if not cids:
        return []
    res = conn.execute(SQL_CHANGESETS, {'cids': list(cids)})
    changesets = []
    for row in res:
        changeset = {
            'id': row.id,
            'userName': row.user_name,
            'userID': row.user_name,
            'createdAt': row.created_at,
            'closedAt': row.closed_at,
            'numChanges': row.num_changes,
            'tags': row.tags,
            'open': row.open,
            'changesetBBOX': [row.minx, row.miny, row.maxx, row.maxy],
        }
        changesets.append(changeset)

    return changesets

def changesets(conn, day, filter=None, recursive=False, coverages=None):
    """
    Return metadata of all changesets from a given day (as datetime.date).

    Optional filter can be an SQL where filter (tags->'building' = 'office').
    Only changesets where at least match is found are returned.
    If recursive is True, the filter is also applied to affected elements (e.g. if a node
    was changed, also check the tags for any way it belongs to).

    Optional coverages can be a list of IDs of geometries in the coverages table. Only
    changesets with at least one node within the geometry are returned.
    """

    cids = []

    time_from = datetime.combine(day, time(hour=0, minute=0, second=0, microsecond=0))
    time_till = datetime.combine(day, time(hour=23, minute=59, second=59, microsecond=999999))

    if coverages:
        cids = collect_changesets_coverages(conn, coverages, time_from=time_from, time_till=time_till)

    cids = collect_changesets_tags(
        conn, filter=filter,
        recursive=recursive, time_from=time_from, time_till=time_till,
        cids=cids,
    )

    return collect_changesets(conn, cids)


def main():
    import sys

    dbschema = 'changes,public'
    engine = create_engine(
        "postgresql+psycopg2://localhost/osm_observer",
        connect_args={'options': '-csearch_path={} -cenable_seqscan=false -cenable_indexscan=true'.format(dbschema)},
        # echo=True,
    )

    conn = engine.connect()

    days_delta = timedelta(int(sys.argv[2]))
    time_from = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - days_delta
    time_till = datetime.now().replace(hour=23, minute=59, second=59, microsecond=0) - days_delta

    day = date.today() - days_delta
    # result = collect_changesets_tags(conn, sys.argv[1], recursive=True, time_from=time_from, time_till=time_till)
    result = changesets(conn, day=day, filter=sys.argv[1], recursive=True, coverages=[1])
    print(result)
    # import json
    # print(json.dumps(result))

    # res = conn.execute(text('select * from members where relation_id = 2069510 and relation_version = 73'))
    # for row in res:
    #     print(row)



if __name__ == '__main__':
    for _ in range(1):
        main()

