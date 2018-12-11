"""admin

Revision ID: 73fb900c70bb
Revises: 567afb34599c
Create Date: 2018-12-10 09:31:50.191043

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '73fb900c70bb'
down_revision = '567afb34599c'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('admin', sa.Boolean(),  default=False), schema='changes_app')


def downgrade():
    op.drop_column('users', 'admin', schema='changes_app')

