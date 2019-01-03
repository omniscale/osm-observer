from __future__ import (absolute_import, division,
                        print_function, unicode_literals)
from sqlalchemy import create_engine
from sqlalchemy.sql import text


SQL_NODES = text('''
select distinct on (n.id, n.version)
    st_x(n.geometry) as long, st_y(n.geometry) as lat,
    n.user_id, n.user_name,
    to_char(n.timestamp, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as timestamp,
    n.add, n.modify, n.delete,
    n.id, n.version, n.add, n.modify, n.delete, n.tags, n.geometry, c.changed
from nodes n inner join collect_nodes c on n.id = c.id and n.version = c.version
order by n.id, n.version, c.changed desc
''')

SQL_RELATIONS = text(
'''
select distinct on (r.id, r.version)
    r.id, r.version, r.changed, rr.tags, m.*,
    rr.user_id, rr.user_name,
    to_char(rr.timestamp, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as timestamp,
    rr.add, rr.modify, rr.delete
from collect_relations r inner join (
    select relation_id, relation_version, array_agg(role) as roles,
    array_agg(member_node_id) as node_ids, array_agg(member_node_version) as node_versions,
    array_agg(member_way_id) as way_ids, array_agg(member_way_version) as way_versions,
    array_agg(member_relation_id) as relation_ids, array_agg(member_relation_version) as relation_versions
    from (select * from collect_members order by relation_id, relation_version, idx) as
    sub
    group by relation_id, relation_version
) m on m.relation_id = r.id and m.relation_version = r.version
inner join relations rr on rr.id = r.id and rr.version = r.version
order by r.id, r.version, r.changed DESC;
''')

SQL_WAYS = text(
'''
select distinct on (w.id, w.version)
    w.id, w.version, w.changed, ww.tags, nds.*,
    ww.user_id, ww.user_name,
    to_char(ww.timestamp, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as timestamp,
    ww.add, ww.modify, ww.delete
from collect_ways w inner join (
    select way_id, way_version,
        array_agg(node_id) as node_ids, array_agg(node_version) as node_versions
    from collect_nds
    group by way_id, way_version) nds on nds.way_id = w.id and nds.way_version = w.version
inner join ways ww on ww.id = w.id and ww.version = w.version
order by w.id, w.version, w.changed DESC;
''')

SQL_CHANGESET = text(
'''
select id,
    to_char(created_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
    to_char(closed_at, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as closed_at,
    num_changes, open, user_name, user_id, tags,
    st_xmin(bbox) as minx, st_ymin(bbox) as miny, st_xmax(bbox) as maxx, st_ymax(bbox) as maxy
from changesets where id = :cid
''')

SQL_COMMENTS = text(
'''
select user_name, user_id, to_char(timestamp, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as timestamp, text
from comments where changeset_id = :cid order by idx
''')

def tokey(id, version):
    return str(id) + '-' + str(version)

def create_elem_dict(row):
    """
    Create new element dictionary from row with metadata common to all
    nodes/ways/relations.
    """
    elem = {
        'id': row.id,
        'version': row.version,
        'userId': row.user_id,
        'userName': row.user_name,
        'timestamp': row.timestamp,
        'tags': row.tags,
    }
    if row.add:
        elem['added'] = True
    if row.delete:
        elem['deleted'] = True
    return elem

def create_changed_elem_dict(key, elements):
    new = elements[key]
    id, version = new['id'], new['version']
    elem = {
        'id': id,
        'version': version,
        'added': new.get('added', False),
        'deleted': new.get('deleted', False),
        'modified': 'added' not in new and 'deleted' not in new,
        'key': tokey(id, version),
        'prevKey': None,
    }
    if version != 1 and tokey(id, version-1) in elements:
        # only add prevKey if it is in our collection
        elem['prevKey'] = tokey(id, version-1)
    return elem

def collect_changeset(conn, cid):
    changed_nodes = []
    changed_ways = []
    changed_relations = []
    changed_node_ids = set()
    changed_way_ids = set()
    changed_relation_ids = set()
    nodes = {}
    ways = {}
    relations = {}

    res = conn.execute(SQL_COLLECT_CHANGESET, {'cid': cid}, multi=True)

#     print()
#     res = conn.execute(
# '''
# select * from collect_relations;
# ''')
#     for row in res:
#         print(row)

    minx, miny, maxx, maxy = 180.1, 90.1, -90.1, -180.1
    res = conn.execute(SQL_NODES)
    for row in res:
        key = tokey(row.id, row.version)
        elem = create_elem_dict(row)
        elem['coordinates'] = [row.long, row.lat]
        nodes[key] = elem
        if row.changed:
            changed_node_ids.add(key)

        if row.long > maxx:
            maxx = row.long
        if row.long < minx:
            minx = row.long
        if row.lat > maxy:
            maxy = row.lat
        if row.lat < miny:
            miny = row.lat

    res = conn.execute(SQL_WAYS)
    for row in res:
        key = tokey(row.id, row.version)
        elem = create_elem_dict(row)
        elem['nds'] = [tokey(id, ver) for id, ver in zip(row.node_ids, row.node_versions)]
        ways[key] = elem
        if row.changed:
            changed_way_ids.add(key)

    res = conn.execute(SQL_RELATIONS)
    for row in res:
        key = tokey(row.id, row.version)
        members = []
        for r, nid, nv, wid, wv, rid, rv in zip(
            row.roles,
            row.node_ids, row.node_versions,
            row.way_ids, row.way_versions,
            row.relation_ids, row.relation_versions,
        ):
            m = {'role': r}
            if nid: m['node'] = tokey(nid, nv)
            if wid: m['way'] = tokey(wid, wv)
            if rid: m['relation'] = tokey(rid, rv)
            members.append(m)
        elem = create_elem_dict(row)
        elem['members'] = members
        relations[key] = elem
        if row.changed:
            changed_relation_ids.add(key)

    conn.execute(SQL_COLLECT_CHANGESET_CLEANUP, multi=True)

    for key in changed_node_ids:
        changed_nodes.append(create_changed_elem_dict(key, nodes))

    for key in changed_way_ids:
        changed_ways.append(create_changed_elem_dict(key, ways))

    for key in changed_relation_ids:
        changed_relations.append(create_changed_elem_dict(key, relations))

    res = conn.execute(SQL_CHANGESET, {'cid': cid})
    row = res.fetchone()
    if not row:
        changeset = {'id': cid}
    else:
        changeset = {
            'id': cid,
            'userName': row.user_name,
            'userID': row.user_name,
            'createdAt': row.created_at,
            'closedAt': row.closed_at,
            'numChanges': row.num_changes,
            'tags': row.tags,
            'open': row.open,
            'dataBBOX': [minx, miny, maxx, maxy],
            'changesetBBOX': [row.minx, row.miny, row.maxx, row.maxy],
        }

        res = conn.execute(SQL_COMMENTS, {'cid': cid})
        comments = []
        for row in res:
            comments.append({
                'userName': row.user_name,
                'userID': row.user_name,
                'timestamp': row.timestamp,
                'text': row.text,
            })

        changeset['comments'] = comments



    result = {
        'changeset': changeset,
        'changes': {
            'relations': changed_relations,
            'nodes': changed_nodes,
            'ways': changed_ways,
        },
        'elements': {
            'relations': relations,
            'nodes': nodes,
            'ways': ways,
        },
    }
    return result


def main():
    dbschema = 'changes,public'
    engine = create_engine(
        # "postgresql+psycopg2://localhost/osm_observer",
        "postgresql+psycopg2://stadtplan_rw:rvr@localhost:55432/stadtplan",
        # connect_args={'options': '-csearch_path={} -cwork_mem=64MB -cenable_seqscan=false -cenable_indexscan=true'.format(dbschema)},
        connect_args={'options': '-csearch_path={}'.format(dbschema)},
    )

    conn = engine.connect()
    import sys
    cid = 64595722 # cs with comments
    cid = 64483586 # larger changeset
    if len(sys.argv) > 1:
        cid = int(sys.argv[1])
    result = collect_changeset(conn, cid)
    import json
    print(json.dumps(result))

    # res = conn.execute(text('select * from members where relation_id = 2069510 and relation_version = 73'))
    # for row in res:
    #     print(row)



SQL_COLLECT_CHANGESET = text('''
CREATE TEMPORARY TABLE collect_nodes (
    id BIGINT,
    version INT,
    changed BOOLEAN
);
CREATE TEMPORARY TABLE collect_ways (
    id BIGINT,
    version INT,
    changed BOOLEAN,
    max_changeset INT
);
CREATE TEMPORARY TABLE collect_nds (
    way_id BIGINT,
    way_version INT,
    idx INT,
    node_id BIGINT,
    node_version INT
);
CREATE TEMPORARY TABLE collect_relations (
    id BIGINT,
    version INT,
    changed BOOLEAN,
    max_changeset INT
);
CREATE TEMPORARY TABLE collect_members (
    relation_id BIGINT,
    relation_version INT,
    idx INT,
    role TEXT,
    member_relation_id BIGINT,
    member_relation_version INT,
    member_way_id BIGINT,
    member_way_version INT,
    member_node_id BIGINT,
    member_node_version INT,
    max_changeset INT
);


-- changed nodes and previous versions
with cnodes as (
    select n.id, n.version, n.changeset from nodes n where n.changeset = :cid
)
insert into collect_nodes
select id, version, true as changed from cnodes
union all
select n.id, n.version, false as changed from nodes n inner join cnodes c on n.id = c.id and n.version = c.version-1
;


-- changed ways and previous versions
with cways as (
    select w.id, w.version, w.changeset from ways w where w.changeset = :cid
)
insert into collect_ways
select id, version, true as changed, changeset as max_changeset from cways
union all
select w.id, w.version, false as changed, c.changeset-1 as max_changeset from ways w inner join cways c on w.id = c.id and w.version = c.version-1;


-- changed relations and previous versions
with crelations as (
    select r.id, r.version, r.changeset from relations r where r.changeset = :cid
)
insert into collect_relations
select id, version, true as changed, changeset as max_changeset from crelations
union all
select r.id, r.version, false as changed, c.changeset-1 as max_changeset from relations r inner join crelations c on r.id = c.id and r.version = c.version-1;

-- collect members

insert into collect_members
select
    distinct on (r.id, r.version, m.idx, m.member_node_id)
    r.id, r.version, m.idx, m.role, null, null, null, null, m.member_node_id,
    coalesce(n.version, 0), r.max_changeset
from
    nodes n
    right join members m on m.member_node_id = n.id
    inner join collect_relations r on m.relation_id = r.id and m.relation_version = r.version
where coalesce(n.changeset, 0) <= r.max_changeset and m.member_node_id is not null
order by r.id, r.version, m.idx, m.member_node_id, n.changeset desc;

insert into collect_members
select
    distinct on (r.id, r.version, m.idx, m.member_way_id)
    r.id, r.version, m.idx, m.role, null, null, m.member_way_id, coalesce(w.version,
    0), null, null, r.max_changeset
from
    ways w
    right join members m on m.member_way_id = w.id
    inner join collect_relations r on m.relation_id = r.id and m.relation_version = r.version
where coalesce(w.changeset, 0) <= r.max_changeset and m.member_way_id is not null
order by r.id, r.version, m.idx, m.member_way_id, w.changeset desc;

insert into collect_members
select
    distinct on (r.id, r.version, m.idx, m.member_relation_id)
    r.id, r.version, m.idx, m.role, m.member_relation_id, coalesce(rr.version, 0), null, null, null, null, r.max_changeset
from
    relations rr
    right join members m on m.member_relation_id = rr.id
    inner join collect_relations r on m.relation_id = r.id and m.relation_version = r.version
where coalesce(rr.changeset, 0) <= r.max_changeset and m.member_relation_id is not null
order by r.id, r.version, m.idx, m.member_relation_id, rr.changeset desc;


insert into collect_nodes
select m.member_node_id, m.member_node_version, false as changed from collect_members m where m.member_node_id is not null;

insert into collect_ways
select m.member_way_id, m.member_way_version, false as changed, max_changeset from collect_members m where m.member_way_id is not null;

insert into collect_relations
select m.member_relation_id, m.member_relation_version, false as changed, max_changeset from collect_members m where m.member_relation_id is not null;


-- nds referenced by changed ways (and previous versions)
insert into collect_nds
select distinct on (w.id, w.version, nds.idx, nds.node_id) w.id as way_id, w.version as
way_version, nds.idx, nds.node_id as node_id, coalesce(n.version, 0) as node_version
from collect_ways w
    inner join nds on nds.way_id = w.id and nds.way_version = w.version
    left join nodes n on n.id = nds.node_id        -- left join to also collect missing nodes
where coalesce(n.changeset, 0) <= w.max_changeset  -- coalesce to include missing nodes
order by w.id, w.version, nds.idx, nds.node_id, n.changeset DESC;

-- nodes referenced by changed ways (and previous versions)
insert into collect_nodes
select node_id, node_version, false as changed
from collect_nds;
''')

SQL_COLLECT_CHANGESET_CLEANUP = text(
'''
    drop table collect_nodes;
    drop table collect_ways;
    drop table collect_relations;
    drop table collect_nds;
    drop table collect_members;
''')

if __name__ == '__main__':
    for _ in range(1):
        main()

