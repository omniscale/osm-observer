"""Added timezone info to datetime columns

Revision ID: 2
Revises: 1
Create Date: 2017-11-22 10:39:58.028061

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2'
down_revision = '1'
branch_labels = None
depends_on = None


def upgrade():
    op.alter_column(
        table_name='changesets',
        column_name='created_at',
        nullable=False,
        type_=sa.DateTime(timezone=True),
        schema='changes_app',
    )

    op.alter_column(
        table_name='changesets',
        column_name='closed_at',
        nullable=True,
        type_=sa.DateTime(timezone=True),
        schema='changes_app',
    )

    op.alter_column(
        table_name='users',
        column_name='last_login',
        nullable=True,
        type_=sa.DateTime(timezone=True),
        schema='changes_app',
    )

    op.alter_column(
        table_name='reviews',
        column_name='time_created',
        nullable=True,
        type_=sa.DateTime(timezone=True),
        schema='changes_app',
    )


def downgrade():
    op.alter_column(
        table_name='changesets',
        column_name='created_at',
        nullable=False,
        type_=sa.DateTime(),
        schema='changes_app',
    )

    op.alter_column(
        table_name='changesets',
        column_name='closed_at',
        nullable=True,
        type_=sa.DateTime(),
        schema='changes_app',
    )

    op.alter_column(
        table_name='users',
        column_name='last_login',
        nullable=True,
        type_=sa.DateTime(),
        schema='changes_app',
    )

    op.alter_column(
        table_name='reviews',
        column_name='time_created',
        nullable=True,
        type_=sa.DateTime(),
        schema='changes_app',
    )
