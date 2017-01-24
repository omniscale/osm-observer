from sqlalchemy import case, true, literal, union_all
from sqlalchemy.sql import select, func

from sqlalchemy.sql.expression import join, or_

from osm_observer.model import Changeset, Review
from osm_observer.model import changesets, nodes, ways, relations, comments
from osm_observer.extensions import db


def query_changesets(current_user_id, coverages=[], from_time=None,
                     to_time=None, username=None, num_reviews=None,
                     sum_score=None, status_id=None,
                     current_user_reviewed=None, limit=None):

    changeset_join = join(Changeset, changesets,
                          Changeset.osm_id == changesets.c.id)
    # subquery to get informations from reviews
    # add more options e.g. sum score from reviews
    review_select = select([
        Review.changeset_id.label('changeset_id'),
        func.count('*').label('num_reviews'),
        func.coalesce(
            func.sum(Review.score)
        ).label('sum_score'),
        func.max(Review._status).label('status'),
        case(
            [(func.sum(case(
                [(Review.user_id == current_user_id, 1)], else_=0
            )) > 0, True)], else_=False
        ).label('current_user_reviewed'),
    ]).group_by(
        Review.changeset_id).alias('reviews')

    review_join = join(changeset_join, review_select,
                       Changeset.id == review_select.c.changeset_id,
                       isouter=True)

    s = select([
        Changeset.id.label('app_id'),
        changesets,
        review_select.c.num_reviews,
        review_select.c.sum_score,
        review_select.c.status,
        review_select.c.current_user_reviewed,
    ]).select_from(review_join)

    if len(coverages) > 0:
        coverage_comnditions = []
        for coverage in coverages:
            coverage_comnditions.append(changesets.c.bbox.ST_Intersects(coverage.geometry))
        s = s.where(or_(*coverage_comnditions))
    else:
        return []

    if username is not None:
        s = s.where(changesets.c.user_name.like('%s%%' % username))

    if num_reviews is not None:
        if num_reviews == 0:
            s = s.where(review_select.c.num_reviews==None)
        else:
            s = s.where(review_select.c.num_reviews>=num_reviews)

    if sum_score is not None:
        s = s.where(review_select.c.sum_score>=sum_score)

    if status_id is not None:
        s = s.where(review_select.c.status == status_id)

    if current_user_reviewed is not None:
        s = s.where(review_select.c.current_user_reviewed == current_user_reviewed)

    if from_time is not None and to_time is not None:
        s = s.where(changesets.c.closed_at>=from_time)
        s = s.where(changesets.c.closed_at<to_time)

    if from_time is not None and to_time is None:
        s = s.where(changesets.c.closed_at>=from_time)

    s = s.order_by(changesets.c.closed_at.desc())

    if limit is not None:
        s = s.limit(limit)
    conn = db.session.connection()
    return conn.execute(s).fetchall()


def query_changeset_details(current_user_id, changeset_id=None):
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

    changeset_join = join(Changeset, changesets,
                          Changeset.osm_id == changeset_id)

    # subquery to get informations from reviews
    # add more options e.g. sum score from reviews
    review_select = select([
        Review.changeset_id.label('changeset_id'),
        func.count('*').label('num_reviews'),
        func.coalesce(
            func.sum(Review.score)
        ).label('sum_score'),
        func.max(Review._status).label('status'),
        case(
            [(func.sum(case(
                [(Review.user_id == current_user_id, 1)], else_=0
            )) > 0, True)], else_=False
        ).label('current_user_reviewed')
    ]).group_by(
        Review.changeset_id).alias('reviews')

    review_join = join(changeset_join, review_select,
                       Changeset.id == review_select.c.changeset_id,
                       isouter=True)

    stmt = select([
        Changeset.id.label('app_id'),
        changesets,
        review_select.c.num_reviews,
        review_select.c.sum_score,
        review_select.c.status,
        review_select.c.current_user_reviewed,
        n,
        w,
        r,
    ]).select_from(review_join).where(changesets.c.id==changeset_id)

    conn = db.session.connection()
    return conn.execute(stmt).fetchone()


def query_changeset_comments(changeset_id=None):
    stmt = select([comments])
    stmt = stmt.where(comments.c.changeset_id==changeset_id)
    stmt = stmt.order_by(comments.c.timestamp.desc())
    conn = db.session.connection()
    return conn.execute(stmt).fetchall()


def query_changeset_changes(changeset_id=None):
    n = select([
        literal('node').label('type'), nodes.c.id,
        nodes.c['add'], nodes.c.modify, nodes.c.delete, nodes.c.user_name,
        nodes.c.user_id, nodes.c.timestamp, nodes.c.version, nodes.c.tags
    ]).where(nodes.c.changeset==changeset_id)

    w = select([
        literal('way').label('type'), ways.c.id,
        ways.c['add'], ways.c.modify, ways.c.delete, ways.c.user_name,
        ways.c.user_id, ways.c.timestamp, ways.c.version, ways.c.tags
    ]).where(ways.c.changeset==changeset_id)

    r = select([
        literal('relation').label('type'), relations.c.id,
        relations.c['add'], relations.c.modify, relations.c.delete,
        relations.c.user_name, relations.c.user_id, relations.c.timestamp,
        relations.c.version, relations.c.tags
    ]).where(relations.c.changeset==changeset_id)

    stmt = union_all(n, w, r)
    conn = db.session.connection()
    return conn.execute(stmt).fetchall()
