from flask import current_app




def query_changesets(filters=[]):
    query = 'SELECT * FROM %(schema)s.changesets WHERE open=false' % dict(
        schema=current_app.config['CHANGES_DB_SCHEMA'])

    if len(filters) > 0:
        query += ' AND ' + ' AND'.join([f.sql_filter for f in filters])

    query += ' ORDER BY closed_at DESC;'

    with current_app.changes_engine.connect() as conn:
        rp = conn.execute(query)

        for r in rp.fetchall():
            yield dict(r)
