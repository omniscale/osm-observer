# -:- encoding: utf8 -:-
from itertools import chain
from osm_observer import model


def create_users_coverages():
    users = [
        model.User('admin', 'secure'),
        model.User('user', 'secure'),
    ]

    coverages = [
        model.Coverage(
            users=[users[0]],
            geojson={
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [
                            6.8767547607421875,
                            50.88007698161951
                        ],
                        [
                            6.8767547607421875,
                            50.98826013045302
                        ],
                        [
                            7.0539093017578125,
                            50.98826013045302
                        ],
                        [
                            7.0539093017578125,
                            50.88007698161951
                        ],
                        [
                            6.8767547607421875,
                            50.88007698161951
                        ]
                    ]]
                }
            }
        ),
        model.Coverage(
            users=users,
            geojson={
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [
                            6.7291259765625,
                            51.184508061068165
                        ],
                        [
                            6.7291259765625,
                            51.270077975363925
                        ],
                        [
                            6.9069671630859375,
                            51.270077975363925
                        ],
                        [
                            6.9069671630859375,
                            51.184508061068165
                        ],
                        [
                            6.7291259765625,
                            51.184508061068165
                        ]
                    ]]
                }
            }
        ),
        model.Coverage(
            users=[users[1]],
            geojson={
                "type": "Feature",
                "properties": {},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [
                            6.944732666015625,
                            51.42661449707482
                        ],
                        [
                            6.944732666015625,
                            51.520707104039275
                        ],
                        [
                            7.263336181640625,
                            51.520707104039275
                        ],
                        [
                            7.263336181640625,
                            51.42661449707482
                        ],
                        [
                            6.944732666015625,
                            51.42661449707482
                        ]
                    ]]
                }
            }
        )
    ]

    return chain(users, coverages)
