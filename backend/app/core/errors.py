from __future__ import annotations

from fastapi import HTTPException, status


def api_http_error(status_code: int, code: str, message: str) -> HTTPException:
    return HTTPException(
        status_code=status_code,
        detail={"code": code, "message": message},
    )


def bad_request(code: str, message: str) -> HTTPException:
    return api_http_error(status.HTTP_400_BAD_REQUEST, code, message)


def not_found(code: str, message: str) -> HTTPException:
    return api_http_error(status.HTTP_404_NOT_FOUND, code, message)

