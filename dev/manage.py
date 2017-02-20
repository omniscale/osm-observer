import os
import gzip
import json

from datetime import timedelta

from osm_observer import create_app
from osm_observer.extensions import db, assets
from osm_observer.lib.review_bots import UsernameReviewBot, TagValueReviewBot
from osm_observer.model import Coverage, User

from flask_script import Manager, Server, prompt_bool
from subprocess import call
from flask_assets import ManageAssets

manager = Manager(create_app)


#############################
# SQLAlchemy commands
#############################
@manager.command
def create_db(alembic_ini='alembic.ini', users_only=False):
    "Creates database tables"
    db.create_all()

    from alembic.config import Config
    from alembic import command
    alembic_cfg = Config(alembic_ini)
    command.stamp(alembic_cfg, "head")

    from osm_observer.model import fixtures
    if users_only:
        db.session.add_all(fixtures.create_users())
    else:
        db.session.add_all(fixtures.all())
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
def insert_changesets():
    "Add Changeset IDs from imposm-changes to the app"
    from osm_observer.model import changesets, Changeset
    from sqlalchemy.sql import select

    last_closed_changeset_time = Changeset.last_closed_changeset_time()

    s = select([changesets])
    if last_closed_changeset_time is not None:
        buffer_time = timedelta(hours=24)
        s = s.where(changesets.c.closed_at >= (last_closed_changeset_time - buffer_time))

    # import only closed changesets
    s = s.where(changesets.c.closed_at != None)

    conn = db.session.connection()
    queried_changesets = conn.execute(s).fetchall()

    bots = [
        UsernameReviewBot(conn),
        TagValueReviewBot(conn),
    ]

    for changeset in queried_changesets:
        cs = Changeset.by_osm_id(changeset.id)
        if cs is not None:
            continue

        cs = Changeset(
            osm_id=changeset.id,
            created_at=changeset.created_at,
            closed_at=changeset.closed_at,
        )

        for bot in bots:
            review = bot.review(changeset)
            if review is not None:
                print (bot, 'reviewed', changeset.id, 'with score', review.score)
                cs.reviews.append(review)

        db.session.add(cs)
    db.session.commit()


@manager.command
def watch_webapp():
    "Watches changes in angular webapp and rebuild it"
    os.chdir('../app/osm_observer/webapp')
    call([
        'ng', 'build', '--watch', '--output-path', '../static/webapp'
    ])


@manager.command
def build_webapp():
    "Build webapp"
    os.chdir('../app/osm_observer/webapp')
    call([
        'ng', 'build', '--prod', '--output-hashing', 'none', '--output-path', '../static/webapp'
    ])


@manager.command
def update_ng_translation(path='../static/i18n/de.json'):
    "Updates ng2-translations. Path is relative to webapp folder."

    langs = ['en', 'de']

    os.chdir('../app/osm_observer/webapp')

    for lang in langs:
        call([
            'npm', 'run', 'extract-%s' % lang
        ])


@manager.command
def coverages_from_geojson(geojson_file=None, name_prop=None):
    if geojson_file is None:
        print('no file given to')
        exit(0)
    if name_prop is None:
        print('no name prop given')
        exit(0)
    if not os.path.exists(geojson_file):
        print('given file does not exist')
        exit(0)

    try:
        with gzip.open(geojson_file, 'rt') as f:
            geojson = json.loads(f.read())
    except OSError:
        with open(geojson_file, 'rt') as f:
            geojson = json.loads(f.read())

    for feature in geojson['features']:
        try:
            name = feature['properties'][name_prop]
        except KeyError:
            print('feature has no property %s' % name_prop)
            continue
        if Coverage.query.filter(Coverage.name == name).count() > 0:
            print('%s already exists' % name)
            continue
        coverage = Coverage([], name, feature)
        db.session.add(coverage)
        print('Added %s' % name)
    db.session.commit()


@manager.command
def create_user(username=None, password=None):
    if None in [username, password]:
        print('Username and Password are required')
        exit(0)
    user = User(username=username, password=password)
    db.session.add(user)
    db.session.commit()
    print('User %s created' % username)


manager.add_command("assets", ManageAssets(assets))

manager.add_command("runserver", Server(threaded=True))

if __name__ == '__main__':
    manager.run()
