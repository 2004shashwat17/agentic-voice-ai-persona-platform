"""create personas table

Revision ID: 4c51157ece44
Revises:
Create Date: 2026-09-29 11:13:20.162446
"""
from __future__ import annotations

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = '4c51157ece44'
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'personas',
        sa.Column('id', sa.UUID(), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('category', sa.String(length=80), nullable=False),
        sa.Column('personality', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('behavior_instructions', sa.Text(), nullable=True),
        sa.Column('model_config', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('voice_config', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('knowledge_config', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('safety_config', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('capabilities', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('pk_personas')),
    )

    op.create_index(op.f('ix_personas_category'), 'personas', ['category'], unique=False)
    op.create_index(op.f('ix_personas_is_active'), 'personas', ['is_active'], unique=False)
    # Supports the default library listing: active personas, newest first.
    op.create_index('ix_personas_is_active_created_at', 'personas', ['is_active', 'created_at'], unique=False)
    # Names are unique case-insensitively, enforced in the database so that
    # concurrent writes cannot bypass the service-layer check.
    op.create_index('uq_personas_name_lower', 'personas', [sa.text('lower(name)')], unique=True)


def downgrade() -> None:
    op.drop_index('uq_personas_name_lower', table_name='personas')
    op.drop_index('ix_personas_is_active_created_at', table_name='personas')
    op.drop_index(op.f('ix_personas_is_active'), table_name='personas')
    op.drop_index(op.f('ix_personas_category'), table_name='personas')
    op.drop_table('personas')
