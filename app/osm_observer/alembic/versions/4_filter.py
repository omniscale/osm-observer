"""filter

Revision ID: 567afb34599c
Revises: 3
Create Date: 2018-12-05 14:47:53.921170

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '567afb34599c'
down_revision = '3'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table('filters',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=True),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('code', sa.String(), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        schema='changes_app'
    )

    op.create_table('users_filters',
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('filters_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['filters_id'], ['changes_app.filters.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['changes_app.users.id'], ),
        schema='changes_app'
    )

def downgrade():
    op.drop_table('users_filters', schema='changes_app')
    op.drop_table('filters', schema='changes_app')
