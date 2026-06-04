from django.core.exceptions import ValidationError
from jsonschema.exceptions import best_match
from jsonschema.validators import Draft202012Validator

NUMBER = {'type': 'number'}
VECTOR_2 = {'type': 'array', 'items': NUMBER, 'minItems': 2, 'maxItems': 2}
VECTOR_3 = {'type': 'array', 'items': NUMBER, 'minItems': 3, 'maxItems': 3}
VECTOR_4 = {'type': 'array', 'items': NUMBER, 'minItems': 4, 'maxItems': 4}
BOX_COORDS = {'type': 'array', 'items': NUMBER, 'minItems': 6, 'maxItems': 6}

BOX_SCHEMA = {
    'type': 'object',
    'properties': {
        'coordinates': BOX_COORDS,
        'textureOffset': VECTOR_2,
        'uvNorth': VECTOR_4,
        'uvSouth': VECTOR_4,
        'uvEast': VECTOR_4,
        'uvWest': VECTOR_4,
        'uvUp': VECTOR_4,
        'uvDown': VECTOR_4,
        'inflate': NUMBER,
    },
    'required': ['coordinates'],
    'additionalProperties': True,
}

MODEL_SCHEMA = {
    '$dynamicAnchor': 'model',
    'type': 'object',
    'properties': {
        'id': {'type': 'string'},
        'part': {'type': 'string'},
        'attach': {'type': 'boolean'},
        'model': {'type': 'string'},
        'invertAxis': {'type': 'string'},
        'mirrorTexture': {'type': 'string'},
        'texture': {'type': 'string'},
        'textureSize': VECTOR_2,
        'translate': VECTOR_3,
        'rotate': VECTOR_3,
        'boxes': {'type': 'array', 'items': BOX_SCHEMA},
        'submodels': {
            'type': 'array',
            'items': {'$dynamicRef': '#model'},
        },
    },
    'additionalProperties': True,
}

JEM_SCHEMA = {
    '$schema': 'https://json-schema.org/draft/2020-12/schema',
    'type': 'object',
    'properties': {
        'texture': {'type': 'string'},
        'textureSize': VECTOR_2,
        'models': {
            'type': 'array',
            'items': MODEL_SCHEMA,
            'minItems': 1,
        },
    },
    'required': ['models'],
    'additionalProperties': True,
}

JPM_SCHEMA = {
    '$schema': 'https://json-schema.org/draft/2020-12/schema',
    'type': 'object',
    'properties': {
        'id': {'type': 'string'},
        'texture': {'type': 'string'},
        'textureSize': VECTOR_2,
        'translate': VECTOR_3,
        'rotate': VECTOR_3,
        'invertAxis': {'type': 'string'},
        'boxes': {'type': 'array', 'items': BOX_SCHEMA},
        'submodels': {'type': 'array', 'items': MODEL_SCHEMA},
    },
    'required': ['id'],
    'anyOf': [
        {'required': ['boxes']},
        {'required': ['submodels']},
    ],
    'additionalProperties': True,
}

ATTACHMENT_META_SCHEMA = {
    '$schema': 'https://json-schema.org/draft/2020-12/schema',
    'type': 'object',
    'properties': {
        'id': {'type': 'string'},
        'part': {'type': 'string'},
        'attach': {'type': 'boolean'},
        'invertAxis': {'type': 'string'},
        'mirrorTexture': {'type': 'string'},
        'texture': {'type': 'string'},
        'textureSize': VECTOR_2,
        'translate': VECTOR_3,
        'rotate': VECTOR_3,
    },
    'not': {'required': ['model']},
    'additionalProperties': True,
}


def validate_jem(data):
    _validate(JEM_SCHEMA, data, 'JEM')


def validate_jpm(data):
    _validate(JPM_SCHEMA, data, 'JPM')


def validate_attachment_meta(data):
    _validate(ATTACHMENT_META_SCHEMA, data, 'attachment metadata')


def _validate(schema: dict, data, label: str):
    validator = Draft202012Validator(schema)
    error = best_match(validator.iter_errors(data))
    if error:
        path = '.'.join(str(part) for part in error.absolute_path)
        prefix = f'{label} is invalid'
        detail = f'{prefix}: {error.message}'
        if path:
            detail = f'{prefix} at {path}: {error.message}'
        raise ValidationError(detail)
