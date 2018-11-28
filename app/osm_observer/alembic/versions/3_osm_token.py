"""osm_token

Revision ID: 9a08d2f34c5c
Revises: 2
Create Date: 2018-11-28 11:26:36.607836

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3'
down_revision = '2'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('osm_token', sa.String(length=256),  nullable=True), schema='changes_app')
    op.add_column('users', sa.Column('osm_username', sa.String(length=256),  nullable=True), schema='changes_app')

def downgrade():
    op.drop_column('users', 'osm_token', schema='changes_app')
    op.drop_column('users', 'osm_username', schema='changes_app')
