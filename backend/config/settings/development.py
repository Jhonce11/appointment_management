from .base import *  # noqa: F401, F403
from decouple import config

DEBUG = config("DJANGO_DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = config(
    "DJANGO_ALLOWED_HOSTS",
    default="localhost,127.0.0.1",
    cast=lambda v: [s.strip() for s in v.split(",")],
)

INSTALLED_APPS += ["corsheaders"]  # noqa: F405

MIDDLEWARE.insert(1, "corsheaders.middleware.CorsMiddleware")  # noqa: F405

CORS_ALLOW_ALL_ORIGINS = True
