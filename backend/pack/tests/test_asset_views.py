import pytest
from django.http import Http404
from django.test import Client, override_settings

from pack.asset_views import resolve_pack_asset_path


def test_resolve_pack_asset_path_allows_asset_root_children(tmp_path):
    target = (
        tmp_path
        / 'assets'
        / 'minecraft'
        / 'textures'
        / 'entity'
        / 'boat'
        / 'oak.png'
    )

    with override_settings(PACK_ROOT=tmp_path):
        resolved = resolve_pack_asset_path('textures/entity/boat/oak.png')

    assert resolved == target.resolve()


@pytest.mark.parametrize('rel', ['../secret.txt', '/etc/passwd', 'textures/%2e%2e/%2e%2e/secret.txt'])
def test_resolve_pack_asset_path_rejects_escapes(tmp_path, rel):
    with override_settings(PACK_ROOT=tmp_path), pytest.raises(Http404):
        resolve_pack_asset_path(rel)


def test_resolve_pack_asset_path_rejects_symlink_escapes(tmp_path):
    asset_root = tmp_path / 'assets' / 'minecraft'
    outside = tmp_path / 'outside'
    asset_root.mkdir(parents=True)
    outside.mkdir()
    (asset_root / 'link').symlink_to(outside)

    with override_settings(PACK_ROOT=tmp_path), pytest.raises(Http404):
        resolve_pack_asset_path('link/secret.txt')


@pytest.mark.django_db
def test_pack_asset_put_and_get_stays_inside_pack_root(tmp_path):
    client = Client()

    with override_settings(PACK_ROOT=tmp_path):
        put_response = client.put(
            '/api/asset/?path=textures/entity/boat/oak.png',
            b'png-bytes',
            content_type='application/octet-stream',
        )
        get_response = client.get('/api/asset/?path=textures/entity/boat/oak.png')

    assert put_response.status_code == 200
    assert get_response.status_code == 200
    assert b''.join(get_response.streaming_content) == b'png-bytes'


@pytest.mark.django_db
def test_pack_asset_rejects_path_escape(tmp_path):
    client = Client()

    with override_settings(PACK_ROOT=tmp_path):
        response = client.put(
            '/api/asset/?path=../escape.txt',
            b'nope',
            content_type='application/octet-stream',
        )

    assert response.status_code == 404
    assert not (tmp_path / 'escape.txt').exists()
