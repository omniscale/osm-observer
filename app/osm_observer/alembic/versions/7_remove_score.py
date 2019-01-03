"""remove score

Revision ID: 5ec04e0cfca4
Revises: 03da5a59d7d5
Create Date: 2019-01-03 09:02:43.424480

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5ec04e0cfca4'
down_revision = '03da5a59d7d5'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_column('reviews', 'score', schema='changes_app')


def downgrade():
    op.add_column('reviews', sa.Column('score', sa.Integer()), schema='changes_app')
