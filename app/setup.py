# -*- coding: utf-8 -*-
"""
    setup.py
    ~~~~~~~~

    :copyright: (c) 2016 by Omniscale GmbH & Co. KG.

------------
OSM Observer
------------

"""
from setuptools import setup, find_packages

setup(
    name='osm_observer',
    version='0.1.0',
    url='<enter URL here>',
    license='BSD',
    author='Omniscale',
    author_email='support@omniscale.de',
    description='<enter short description here>',
    long_description=__doc__,
    packages=find_packages(),
    zip_safe=False,
    platforms='any',
    install_requires=[],
    include_package_data=True,
)
