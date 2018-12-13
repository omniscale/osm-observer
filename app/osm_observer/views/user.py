import datetime
import oauth2 as oauth
from xml.etree import ElementTree

from urllib.parse import parse_qsl

from werkzeug.exceptions import BadRequest

from flask import jsonify, request, current_app, url_for, session, redirect
from flask_login import login_user, logout_user, current_user

from osm_observer.model import User
from osm_observer.extensions import db

from osm_observer.views import api

CONSUMER_KEY = "jXWGsRp4aeOblDesqkHeYV5XlS7PAfHJVdOi8QOl"
CONSUMER_SECRET = "jhrhX1ehJHMNmVbhYmtrG5xqVLP663pwrR5Cgsch"

# OSM oauth URLs
BASE_URL = 'https://www.openstreetmap.org/oauth'

REQUEST_TOKEN_URL = '%s/request_token' % BASE_URL
ACCESS_TOKEN_URL = '%s/access_token' % BASE_URL
AUTHORIZE_URL = '%s/authorize' % BASE_URL

# OSM user details URL
USER_DETAILS_URL = 'https://api.openstreetmap.org/api/0.6/user/details'

consumer = oauth.Consumer(CONSUMER_KEY, CONSUMER_SECRET)

class MESSAGE_ID(object):
    ALREADY_LOGGED_IN = 0
    LOGGED_OUT = 1
    LOGGED_IN = 2
    LDAP_LOGIN_FAILED = 3
    INVALID_CREDENTIALS = 4


@api.route('/login', methods=['POST'])
def login():
    if current_user.is_authenticated and current_user.osm_token:
        return jsonify({
            'message': 'Already logged in',
            'success': True,
            'messageId': MESSAGE_ID.ALREADY_LOGGED_IN
        })

    data = request.json
    json_response = None

    if current_app.config['LDAP_ENABLED']:
        json_response = ldap_login(data['username'], data['password'])
    else:
        json_response = local_login(data['username'], data['password'])

    # if user login is not possbile return error message  
    if not json_response['success']:
        return jsonify(json_response)

    # if user is available check if user has osm_token 
    # to check user has osm_account
    if not current_user.osm_token:
        json_response = request_osm_token()
        return jsonify(json_response)

    response = jsonify(json_response)
    if json_response['success'] is True:
        response.set_cookie('loggedIn', '1')

        if current_user.is_admin:
            response.set_cookie('isAdmin', '1')
        else: 
            response.set_cookie('isAdmin', '', expires=0)

    return response

@api.route('/logout')
def logout():
    logout_user()
    response = jsonify({
        'message': 'Logged out successfully',
        'success': True,
        'messageId': MESSAGE_ID.LOGGED_OUT
    })
    response.set_cookie('loggedIn', '', expires=0)
    return response


def request_osm_token():
    client = oauth.Client(consumer)
    oauth_callback_url = url_for('api.oauth_callback', _external=True)
    url = "%s?oauth_callback=%s" % (REQUEST_TOKEN_URL, oauth_callback_url)
    resp, content = client.request(url, "GET")
  
    if resp['status'] != '200':
        return BadRequest('The OSM authentication server did not respond correctly')

    request_token = dict(parse_qsl(content.decode()))
    session['oauth_token'] = request_token.get('oauth_token') 
    session['oauth_token_secret'] = request_token.get('oauth_token_secret') 
    osm_redirect_url = "%s?oauth_token=%s" % (
        AUTHORIZE_URL, request_token.get('oauth_token') 
    )
    return dict(
        message='Redirect to OpenStreetMap',
        redirect=True,
        url=str(osm_redirect_url)
    )

@api.route('/oauth/callback', methods=['GET', 'POST'])
def oauth_callback():
    oauth_token = request.args.get('oauth_token', False)
    oauth_verifier = request.args.get('oauth_verifier', False)
    if not oauth_token or not oauth_verifier or not current_user.is_authenticated:
        return BadRequest()

    if session.get('oauth_token') != oauth_token:
        return BadRequest()

    # get the access token
    token = oauth.Token(
        session.get('oauth_token'),
        session.get('oauth_token_secret')
    )

    token.set_verifier(oauth_verifier)
    client = oauth.Client(consumer, token)
    resp, content = client.request(ACCESS_TOKEN_URL, "POST")
    access_token = dict(parse_qsl(content.decode()))

    token = access_token['oauth_token']
    token_secret = access_token['oauth_token_secret']

    # get the user details, finally
    token = oauth.Token(token, token_secret)
    client = oauth.Client(consumer, token)
    resp, content = client.request(USER_DETAILS_URL, "GET")

    user_elt = ElementTree.XML(content).find('user')
    # save the user's "display name" in the session
    if 'id' in user_elt.attrib:
        username = user_elt.attrib['display_name']
        current_user.osm_token = access_token['oauth_token']
        current_user.osm_username = username
        db.session.commit()

    return redirect(url_for('api.login'))

def ldap_login(username, password):
    if User.try_ldap_login(username, password):
        user = User.by_username(username)
        if User.by_username(username) is None:
            user = User(username)
            db.session.add(user)
            user.last_login = datetime.datetime.utcnow()
            db.session.commit()
        login_user(user)
        return dict(
            message='Logged in successfully',
            success=True,
            messageId=MESSAGE_ID.LOGGED_IN
        )
    return dict(
        message='LDAP login faild',
        success=False,
        messageId=MESSAGE_ID.LDAP_LOGIN_FAILED
    )


def local_login(username, password):
    user = User.by_username(username)
    if user is not None and user.check_password(password):
        user.last_login = datetime.datetime.utcnow()
        db.session.commit()
        login_user(user)
        return dict(
            message='Logged in successfully',
            success=True,
            messageId=MESSAGE_ID.LOGGED_IN
        )

    return dict(
        message='Invalid username or password',
        success=False,
        messageId=MESSAGE_ID.INVALID_CREDENTIALS
    )
