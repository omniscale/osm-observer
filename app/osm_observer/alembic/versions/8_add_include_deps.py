"""add include deps

Revision ID: 8c1d0fe8b7f9
Revises: 5ec04e0cfca4
Create Date: 2019-01-03 20:32:25.419790

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8c1d0fe8b7f9'
down_revision = '5ec04e0cfca4'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('filters', sa.Column('include_deps', sa.Boolean(),  default=False), schema='changes_app')


def downgrade():
    op.drop_column('filters', 'include_deps', schema='changes_app')
