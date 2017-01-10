import os

from osm_observer import create_app
from osm_observer.extensions import db
from osm_observer.lib.review_bots import UsernameReviewBot, TagValueReviewBot

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
def insert_changesets(created_at=None):
    "Add Changeset IDs from imposm-changes to the app"
    from osm_observer.model import changesets, Changeset
    from sqlalchemy.sql import select

    s = select([changesets])
    if created_at is not None:
        s = s.where(changesets.c.created_at >= created_at)

    # import only closed changesets
    s = s.where(changesets.c.closed_at != None)

    conn = db.session.connection()
    queried_changesets = conn.execute(s).fetchall()

    bots = [
        UsernameReviewBot(conn),
        TagValueReviewBot(conn),
    ]

    # todo refactor to speed up
    for changeset in queried_changesets:
        cs = Changeset.by_id(changeset.id)
        if not cs:
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
def update_ng_translation(path='../static/i18n/de.json'):
    "Updates ng2-translations. Path is relative to webapp folder."

    langs = ['en', 'de']

    os.chdir('../app/osm_observer/webapp')

    for lang in langs:
        call([
            'npm', 'run', 'extract-%s' % lang
        ])


manager.add_command("runserver", Server(threaded=True))

if __name__ == '__main__':
    manager.run()
