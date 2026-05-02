"""Smoke tests — verifies Django boots and the API surface responds.

Real coverage of the exporter, schema validation, and views lands in
Phase 1 (see maintainability-plan in the vault).
"""

import pytest
from django.test import Client


@pytest.mark.django_db
def test_variants_endpoint_responds():
    client = Client()
    response = client.get("/api/variants/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.django_db
def test_parts_endpoint_responds():
    client = Client()
    response = client.get("/api/parts/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
