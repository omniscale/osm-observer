from osm_observer.test.base import BaseTestClass
from osm_observer.helpers import _

from flask import url_for
from urllib.parse import urlparse


class TestUserLogin(BaseTestClass):

    def test_login_logout(self):
        with self.app.test_client() as c:
            r = c.post(url_for('user.login'), data=dict(
                username='admin',
                password='secure'
            ), follow_redirects=False)

            self.assertEqual(r.status_code, 302)
            parsed_location = urlparse(r.location)
            self.assertEqual(parsed_location.path, url_for('frontend.index'))

            r = c.get(url_for('user.logout'), follow_redirects=False)

            self.assertEqual(r.status_code, 302)
            parsed_location = urlparse(r.location)
            self.assertEqual(parsed_location.path, url_for('frontend.index'))

    def test_invalid_login(self):
        with self.app.test_client() as c:
            r = c.post(url_for('user.login'), data=dict(
                username='notadmin',
                password='secure'
            ))

            self.assertEqual(r.status_code, 200)
            assert _('username or password not correct') in str(r.data)

            r = c.post(url_for('user.login'), data=dict(
                username='admin',
                password='insecure'
            ), follow_redirects=False)

            self.assertEqual(r.status_code, 200)
            assert _('username or password not correct') in str(r.data)
