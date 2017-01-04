import os

from osm_observer import create_app
from osm_observer.extensions import db

from flask_script import Manager, Server, prompt_bool
from subprocess import call

manager = Manager(create_app)


#############################
# SQLAlchemy commands
#############################
@manager.command
def create_db(alembic_ini='alembic.ini'):
    "Creates database tables"
    db.create_all()

    from alembic.config import Config
    from alembic import command
    alembic_cfg = Config(alembic_ini)
    command.stamp(alembic_cfg, "head")

    from osm_observer.model import fixtures
    db.session.add_all(fixtures.create_users_coverages())
    db.session.commit()
    print("--- database with admin user was created ---")


@manager.command
def drop_db(force=False):
    "Drops all database tables"
    if force or prompt_bool("Are you sure ? You will lose all your data !"):
        db.drop_all()


@manager.command
def recreate_db():
    "Recreates database tables (same as issuing 'drop' and then 'create'"
    drop_db(force=True)
    create_db()


@manager.command
def insert_changesets(created_at=None):
    "Add Changeset IDs from imposm-changes to the app"
    from osm_observer.model import changesets, Changeset
    from sqlalchemy.sql import select

    s = select([changesets])
    if created_at is not None:
        s = s.where(changesets.c.created_at >= created_at)

    conn = db.session.connection()
    queried_changesets = conn.execute(s).fetchall()

    # todo refactor to speed up
    for changeset in queried_changesets:
        cs = Changeset.by_id(changeset.id)
        if not cs:
            cs = Changeset(
                osm_id=changeset.id,
                created_at=changeset.created_at,
                closed_at=changeset.closed_at,
            )
            db.session.add(cs)
        elif not cs.closed_at:
            cs.closed_at = changeset.closed_at

    db.session.commit()


#############################
# Babel commands
#############################
@manager.command
def babel_init_lang(lang='de'):
    "Initialize new language."
    call([
        'pybabel', 'init',
        '-i', '../app/osm_observer/translations/messages.pot',
        '-d', '../app/osm_observer/translations',
        '-l', lang
    ])


@manager.command
def babel_refresh():
    "Extract messages and update translation files."
    call([
        'pybabel', 'extract',
        '-F', '../app/osm_observer/babel.cfg',
        '-k', 'lazy_gettext', '-k', '_l',
        '-o', '../app/osm_observer/translations/messages.pot',
        '../app/osm_observer'
    ])

    call([
        'pybabel', 'update',
        '-i', '../app/osm_observer/translations/messages.pot',
        '-d', '../app/osm_observer/translations'
    ])

    call([
        'perl', '-p', '-i',
        '-e', '''s|#: /.*?/lib/python3.4/site-packages/| #: venv/lib/python3.4/site-packages/|''',
        '../app/osm_observer/translations/*/LC_MESSAGES/messages.po',
        '../app/osm_observer/translations/messages.pot'
    ])


@manager.command
def babel_compile():
    "Compile translations."
    call([
        'pybabel', 'compile',
        '-d', '../app/osm_observer/translations'
    ])


@manager.command
def watch_webapp():
    "Watches changes in angular webapp and rebuild it"
    os.chdir('../app/osm_observer/webapp')
    call([
        'ng', 'build', '--watch'
    ])


manager.add_command("runserver", Server(threaded=True))

if __name__ == '__main__':
    manager.run()
