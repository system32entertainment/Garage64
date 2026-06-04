import pytest
from django.core.exceptions import ValidationError
from django.test import Client

from pack.models import EntityBody, ModelPart

VALID_JEM = {
    'texture': 'textures/entity/boat/oak.png',
    'textureSize': [128, 128],
    'models': [
        {
            'id': 'front',
            'part': 'front',
            'invertAxis': 'xy',
            'translate': [0, -2, 0],
            'boxes': [{'coordinates': [0, 0, 0, 1, 1, 1], 'textureOffset': [0, 0]}],
        },
    ],
}

VALID_JPM = {
    'id': 'miata_wheels',
    'textureSize': [32, 32],
    'submodels': [
        {
            'id': 'wheel_root',
            'translate': [0, 0, 0],
            'boxes': [{'coordinates': [-1, -1, -1, 2, 2, 2], 'textureOffset': [0, 0]}],
        },
    ],
}

VALID_ATTACHMENT_META = {
    'id': 'miata_wheels',
    'part': 'front',
    'attach': True,
    'translate': [0, -2, -5.5],
    'rotate': [0, -180, 0],
}


@pytest.mark.django_db
def test_entity_body_full_clean_rejects_invalid_jem():
    body = EntityBody(
        name='bad_body',
        jem_file_name='boat',
        entity_type='boat',
        body_data={'texture': 'missing-models.png'},
    )

    with pytest.raises(ValidationError):
        body.full_clean()


@pytest.mark.django_db
def test_model_part_full_clean_rejects_invalid_jpm():
    part = ModelPart(
        name='bad_part',
        jpm_path='minecraft:optifine/cem/parts/bad.jpm',
        part_data={'id': 'bad_part'},
        attachment_meta=VALID_ATTACHMENT_META,
    )

    with pytest.raises(ValidationError):
        part.full_clean()


@pytest.mark.django_db
def test_model_part_full_clean_rejects_model_key_in_attachment_meta():
    part = ModelPart(
        name='bad_part',
        jpm_path='minecraft:optifine/cem/parts/bad.jpm',
        part_data=VALID_JPM,
        attachment_meta={**VALID_ATTACHMENT_META, 'model': 'minecraft:optifine/cem/parts/bad.jpm'},
    )

    with pytest.raises(ValidationError):
        part.full_clean()


@pytest.mark.django_db
def test_body_api_rejects_invalid_jem():
    client = Client()

    response = client.post(
        '/api/bodies/',
        {
            'name': 'bad_body',
            'jem_file_name': 'boat',
            'entity_type': 'boat',
            'body_data': {'texture': 'missing-models.png'},
        },
        content_type='application/json',
    )

    assert response.status_code == 400
    assert 'body_data' in response.json()


@pytest.mark.django_db
def test_part_api_accepts_valid_jpm_and_attachment_meta():
    client = Client()

    response = client.post(
        '/api/parts/',
        {
            'name': 'miata_wheels',
            'jpm_path': 'minecraft:optifine/cem/parts/miata_wheels.jpm',
            'part_data': VALID_JPM,
            'attachment_meta': VALID_ATTACHMENT_META,
            'slot': 'wheels',
        },
        content_type='application/json',
    )

    assert response.status_code == 201


@pytest.mark.django_db
def test_part_api_rejects_invalid_attachment_meta():
    client = Client()

    response = client.post(
        '/api/parts/',
        {
            'name': 'bad_part',
            'jpm_path': 'minecraft:optifine/cem/parts/bad.jpm',
            'part_data': VALID_JPM,
            'attachment_meta': {**VALID_ATTACHMENT_META, 'translate': [0, 1]},
        },
        content_type='application/json',
    )

    assert response.status_code == 400
    assert 'attachment_meta' in response.json()
