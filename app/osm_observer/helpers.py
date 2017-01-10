import logging
import pprint

from flask import request


def request_for_static():
    if request.endpoint == 'static' or request.endpoint == 'favicon':
        return True
    else:
        return False


def serialize_datetime(value):
    if value is None:
        return None
    return [value.strftime("%Y-%m-%d"), value.strftime("%H:%M:%S")]


class LazyPrettyDict(object):
    def __init__(self, dictionary):
        self.dictionary = dictionary

    def __str__(self):
        return pprint.pformat(self.dictionary)


class FlaskLogContext(logging.Filter):
    def filter(self, record):
        if hasattr(record, "environ"):
            # record was already filtered
            return True

        record.environ = LazyPrettyDict(getattr(request, 'environ', {}))

        return True
