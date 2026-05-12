from .base import *  # noqa: F401, F403
from decouple import config

DEBUG = False

ALLOWED_HOSTS = config(
    "DJANGO_ALLOWED_HOSTS",
    cast=lambda v: [s.strip() for s in v.split(",")],
)

INSTALLED_APPS += ["corsheaders"]  # noqa: F405

MIDDLEWARE.insert(1, "corsheaders.middleware.CorsMiddleware")  # noqa: F405
