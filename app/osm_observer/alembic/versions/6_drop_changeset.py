"""drop_changeset

Revision ID: 03da5a59d7d5
Revises: 73fb900c70bb
Create Date: 2018-12-10 09:59:33.434684

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '03da5a59d7d5'
down_revision = '73fb900c70bb'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint('reviews_changeset_id_fkey', 'reviews',
                       type_='foreignkey', schema='changes_app')
    op.drop_table('changesets', schema='changes_app')
    # op.create_index('idx_changeset_id', 'reviews', 'changeset_id', unique=True, schema='changes_app')

def downgrade():
    op.create_table('changesets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('osm_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('closed_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        schema='changes_app'
    )