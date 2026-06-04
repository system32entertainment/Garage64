import mimetypes
from pathlib import Path
from urllib.parse import unquote

from django.conf import settings
from django.http import FileResponse, Http404
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['GET', 'PUT'])
def pack_asset(request):
    """
    GET  /api/asset/?path=textures/entity/boat/oak.png  — serve file
    PUT  /api/asset/?path=textures/entity/boat/oak.png  — overwrite file (raw body)
    """
    rel = request.query_params.get('path', '')
    full_path = resolve_pack_asset_path(rel)

    if request.method == 'PUT':
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_bytes(request.body)
        return Response({'status': 'ok'})

    if not full_path.exists() or not full_path.is_file():
        raise Http404

    mime, _ = mimetypes.guess_type(str(full_path))
    return FileResponse(open(full_path, 'rb'), content_type=mime or 'application/octet-stream')


def resolve_pack_asset_path(rel: str) -> Path:
    """Resolve a pack asset path and reject escapes outside assets/minecraft."""
    if not rel:
        raise Http404

    asset_root = (Path(settings.PACK_ROOT) / 'assets' / 'minecraft').resolve()
    candidate = (asset_root / unquote(rel)).resolve()
    try:
        candidate.relative_to(asset_root)
    except ValueError:
        raise Http404 from None
    return candidate
