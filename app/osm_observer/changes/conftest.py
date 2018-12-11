from sqlalchemy import create_engine
from sqlalchemy.sql import text

import os

import pytest

from osm_observer.changes.changes import collect_changeset

@pytest.fixture(scope="module")
def sqla_conn():
    dbschema = 'osm_changes_test,public'
    engine = create_engine(
        "postgresql+psycopg2://localhost/osm_observer",
        connect_args={'options': '-csearch_path={}'.format(dbschema)},
        # echo=True,
    )

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

