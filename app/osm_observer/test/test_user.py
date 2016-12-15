from osm_observer.test.base import BaseTestClass

from flask import url_for
from flask_login import current_user
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

            assert current_user.is_authenticated

            r = c.get(url_for('user.logout'), follow_redirects=False)

            self.assertEqual(r.status_code, 302)
            parsed_location = urlparse(r.location)
            self.assertEqual(parsed_location.path, url_for('frontend.index'))

            assert not current_user.is_authenticated

    def test_invalid_login(self):
        with self.app.test_client() as c:
            r = c.post(url_for('user.login'), data=dict(
                username='notadmin',
                password='secure'
            ))

            self.assertEqual(r.status_code, 200)
            assert not current_user.is_authenticated

            r = c.post(url_for('user.login'), data=dict(
                username='admin',
                password='insecure'
            ), follow_redirects=False)

            self.assertEqual(r.status_code, 200)
            assert not current_user.is_authenticated
