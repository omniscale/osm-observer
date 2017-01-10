# -:- encoding: utf8 -:-
from itertools import chain
from osm_observer import model


def all():
    users = [
        model.User('admin', 'secure'),
        model.User('user', 'secure'),
    ]

    coverages = [
        model.Coverage(
            users=[users[0]],
            name='Köln',
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
            name='Düsseldorf',
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
            name='Essen und Bochum',
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

    review_bot_configs = [
        model.ReviewBotConfig('UsernameReviewBot', True, dict(
            username='wheelmap_android',
            score=20,
        )),
        model.ReviewBotConfig('UsernameReviewBot', True, dict(
            username='Bman',
            score=-20,
        )),
        model.ReviewBotConfig('TagValueReviewBot', True, dict(
            tag='created_by',
            value='JOSM/1.5',
            score=10,
        )),
        model.ReviewBotConfig('TagValueReviewBot', True, dict(
            tag='created_by',
            value='MAPS.ME',
            score=-10,
        ))
    ]

    return chain(users, coverages, review_bot_configs)
