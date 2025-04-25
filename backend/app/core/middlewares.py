from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import traceback


class ExceptionMiddleware(BaseHTTPMiddleware):
    """
    Middleware para capturar excepciones inesperadas y devolver un 500.
    """
    async def dispatch(self, request: Request, call_next):
        try:
            # Ejecuta la siguiente capa o endpoint
            response = await call_next(request)
            return response
        except Exception as exc:
            # Loguear el error con traceback completo
            traceback.print_exc()
            # Devolver respuesta genérica de error interno
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal Server Error"}
            )
