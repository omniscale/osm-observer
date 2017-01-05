from sqlalchemy import case, true
from sqlalchemy.sql import select, func

from sqlalchemy.sql.expression import join

from osm_observer.model import Changeset, Review
from osm_observer.model import changesets, nodes, ways, relations
from osm_observer.extensions import db

def query_changesets(coverages=None, from_time=None):

    changeset_join = join(Changeset, changesets,
         Changeset.osm_id == changesets.c.id
    )

    # subquery to get informations from reviews
    # add more options e.g. sum score from reviews
    review_select = select([
        Review.changeset_id.label('changeset_id'),
        func.count('*').label('num_reviews')]
    ).group_by(
        Review.changeset_id).alias('reviews'
    )

    review_join = join(changeset_join, review_select,
         Changeset.id == review_select.c.changeset_id, isouter=True,
    )

    s = select([
        Changeset.id.label('app_id'),
        changesets,
        review_select.c.num_reviews
    ]).select_from(review_join)

    if coverages is not None:
        if not isinstance(coverages, list):
            coverages = [coverages]
        for coverage in coverages:
            s = s.where(changesets.c.bbox.ST_Intersects(coverage.geometry))

    if from_time is not None:
        s = s.where(changesets.c.closed_at>=from_time)

    s = s.order_by(changesets.c.closed_at.desc())

    conn = db.session.connection()
    return conn.execute(s).fetchall()


def query_changeset_details(changeset_id=None):
    n = select([
        func.coalesce(func.sum(case([(nodes.c['add']==true(), 1)], else_=0)), 0).label('nodes_add'),
        func.coalesce(func.sum(case([(nodes.c.modify==true(), 1)], else_=0)), 0).label('nodes_modify'),
        func.coalesce(func.sum(case([(nodes.c.delete==true(), 1)], else_=0)), 0).label('nodes_delete'),
    ]).where(nodes.c.changeset==changeset_id).cte('nodes')

    w = select([
        func.coalesce(func.sum(case([(ways.c['add']==true(), 1)], else_=0)), 0).label('ways_add'),
        func.coalesce(func.sum(case([(ways.c.modify==true(), 1)], else_=0)), 0).label('ways_modify'),
        func.coalesce(func.sum(case([(ways.c.delete==true(), 1)], else_=0)), 0).label('ways_delete'),
    ]).where(ways.c.changeset==changeset_id).cte('ways')

    r = select([
        func.coalesce(func.sum(case([(relations.c['add']==true(), 1)], else_=0)), 0).label('relations_add'),
        func.coalesce(func.sum(case([(relations.c.modify==true(), 1)], else_=0)), 0).label('relations_modify'),
        func.coalesce(func.sum(case([(relations.c.delete==true(), 1)], else_=0)), 0).label('relations_delete'),
    ]).where(relations.c.changeset==changeset_id).cte('relations')

    stmt = select([
        changesets,
        n,
        w,
        r,
    ]).where(changesets.c.id==changeset_id)

    conn = db.session.connection()
    return conn.execute(stmt).fetchone()
