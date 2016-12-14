from osm_observer import model


def create_user():
    user = model.User('admin', 'secure')
    return user
