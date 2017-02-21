"""Review not must have a comment

Revision ID: 1
Revises:
Create Date: 2017-02-21 09:15:21.654361

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column('reviews', 'comment', nullable=True, schema='changes_app')


def downgrade():
    op.alter_column('reviews', 'comment', nullable=False, schema='changes_app')
