from flask import Flask, render_template, request, jsonify
from functools import wraps
import string
import random
import datetime
import configparser
import io
import mysql.connector
import bcrypt
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0


class DBManager:
    def connect_db(self):
        connection = mysql.connector.connect(
            user=DB_USERNAME, database=DB_NAME, password=DB_PASSWORD)
        return connection

    def get_unread_message_count(self, channel):
        connection = self.connect_db()
        cursor = connection.cursor()
        query = "SELECT COUNT(*) FROM messages m LEFT JOIN users u ON m.email = u.email WHERE m.channelname = (%s) AND m.replyid IS NULL AND m.id > (%s)"
        try:
            cursor.execute(
                query, (channel["channelName"], channel['lastMessageID']))
            count = cursor.fetchone()[0]
            return count
        except Exception as e:
            print(e)
        finally:
            cursor.close()
            connection.close()

    def signup(self, user):
        user = hash_password_manager(user)
        connection = self.connect_db()
        cursor = connection.cursor()
        query = "INSERT INTO users(email, username, password, timestamp) VALUES(%s, %s, %s, %s)"
        try:
            timestamp = self.get_time()
            cursor.execute(
                query, (user['email'], user['username'], user['password'], timestamp))
            connection.commit()
            return "Success!"
        except Exception as e:
            print(e)
            return "An account with that username or email already exists."
        finally:
            cursor.close()
            connection.close()

    def get_channels(self):
        connection = self.connect_db()
        cursor = connection.cursor()
        query = "SELECT channelname FROM channels"
        try:
            cursor.execute(query)
            channels = cursor.fetchall()
            return channels
        except Exception as e:
            print(e)
            return "An error occured while fetching channel information."
        finally:
            cursor.close()
            connection.close()

    def create_channel(self, channel):
        connection = self.connect_db()
        cursor = connection.cursor()
        query = "INSERT INTO channels(channelname, timestamp) VALUES(%s, %s)"
        try:
            timestamp = self.get_time()
            cursor.execute(query, (channel['channelName'], timestamp))
            connection.commit()
            return "Siuccessfully create a new channel!"
        except Exception as e:
            print(e)
            return "An error occured while creating a new channel."
        finally:
            cursor.close()
            connection.close()

    def load_thread_message(self, thread):
        connection = self.connect_db()
        cursor = connection.cursor()
        query = "SELECT u.username, m.id, m.timestamp, m.text FROM messages m LEFT JOIN users u ON m.email = u.email WHERE m.replyId = (%s) ORDER BY m.id"
        try:
            cursor.execute(query, (thread['threadMessageID'], ))
            messages = cursor.fetchall()
            return messages
        except Exception as e:
            print(e)
        finally:
            cursor.close()
            connection.close()

    def change_password(self, user):
        user = hash_password_manager(user)
        connection = self.connect_db()
        cursor = connection.cursor()
        query = "UPDATE users SET password = %s WHERE email = %s"
        try:
            cursor.execute(query, (user['password'], user['email']))
            connection.commit()
            return "Successfully changed password!"
        except Exception as e:
            print(e)
            return "An error occured while attempting to change password."
        finally:
            cursor.close()
            connection.close()

    def post_next_message(self, message):
        pass

    def post_message(self, message):
        connection = self.connect_db()
        cursor = connection.cursor()
        query = "INSERT INTO messages(email, channelname, text, timestamp) VALUES(%s, %s, %s, %s)"
        try:
            timestamp = self.get_time()
            cursor.execute(
                query, (message['email'], message["channelName"], message['message'], timestamp))
            connection.commit()
            return "Successfully posted a new message!"
        except Exception as e:
            print(e)
            return "Failed to post new message."
        finally:
            cursor.close()
            connection.close()

    def more_message(self, channel):
        connection = self.connect_db()
        cursor = connection.cursor()

        try:
            if channel["firstLoad"] == "true":
                query = "SELECT u.username, m.id, m.timestamp, m.text FROM messages m LEFT JOIN users u ON m.email = u.email WHERE m.channelname = (%s) AND m.replyid IS NULL ORDER BY m.id DESC LIMIT 20"
                cursor.execute(query, (channel["channelName"],))
            else:
                query = "SELECT u.username, m.id, m.timestamp, m.text FROM messages m LEFT JOIN users u ON m.email = u.email WHERE m.channelname = (%s) AND m.replyid IS NULL AND m.id < (%s) AND m.id > (%s) - 20 + 1 ORDER BY m.id DESC"
                cursor.execute(
                    query, (channel["channelName"], channel['firstMessageID'], channel['firstMessageID']))
            messages = {"content": cursor.fetchall()}
            query = "SELECT replyid, COUNT(*) AS cnt FROM messages WHERE channelname = (%s) GROUP BY replyid"
            cursor.execute(query, (channel["channelName"],))
            count = cursor.fetchall()
            messages["count"] = count

            return messages
        except Exception as e:
            print(e)
        finally:
            cursor.close()
            connection.close()

    def change_username(self, user):
        connection = self.connect_db()
        cursor = connection.cursor()
        query = "UPDATE users SET username = %s WHERE email = %s"
        try:
            cursor.execute(query, (user['username'], user['email']))
            connection.commit()
            return "Successfully changed username!"
        except Exception as e:
            print(e)
            return "An error occured while attempting to change username."
        finally:
            cursor.close()
            connection.close()

    def get_time(self):
        return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def get_next_message(self):
        pass

    def get_message(self, channel):
        connection = self.connect_db()
        cursor = connection.cursor()
        query = "SELECT u.username, m.id, m.timestamp, m.text FROM messages m LEFT JOIN users u ON m.email = u.email WHERE m.channelname = (%s) AND m.replyid IS NULL AND m.id > (%s) ORDER BY m.id DESC"
        try:
            cursor.execute(
                query, (channel["channelName"], channel['lastMessageID']))
            messages = {"content": cursor.fetchall()}
            query = "SELECT replyid, COUNT(*) AS cnt FROM messages WHERE channelname = (%s) GROUP BY replyid"
            cursor.execute(query, (channel["channelName"],))
            count = cursor.fetchall()
            messages["count"] = count
            return messages
        except Exception as e:
            print(e)
        finally:
            cursor.close()
            connection.close()

    def send_thread_message(self, message):
        connection = self.connect_db()
        cursor = connection.cursor()
        query = "INSERT INTO messages(email, channelname, text, timestamp, replyid) VALUES(%s, %s, %s, %s, %s)"
        try:
            timestamp = self.get_time()
            cursor.execute(query, (message['email'], message["channelName"],
                                   message['message'], timestamp, message['replyid']))
            connection.commit()
            return "Successfully posted new message!"
        except Exception as e:
            print(e)
            return "Failed to post new message."
        finally:
            cursor.close()
            connection.close()

    def login(self, user):
        connection = self.connect_db()
        cursor = connection.cursor()
        query = "SELECT * FROM users WHERE email = (%s)"
        try:
            cursor.execute(query, (user['email'],))
            data = cursor.fetchall()
            success = bcrypt.checkpw(user['password'].encode(
                'utf-8'), data[0][2].encode('utf-8'))

            if success:
                return data
            return {}, 404

        except Exception as e:
            print(e)
            return "Invalid login."
        finally:
            cursor.close()
            connection.close()


db_manager = DBManager()
session_tokens = set()


def generate_session_token():
    session_token = ''.join(random.choice(
        string.ascii_letters + string.digits) for _ in range(6))
    while (session_token in session_tokens):
        session_token = ''.join(random.choice(
            string.ascii_letters + string.digits) for _ in range(6))
    session_tokens.add(session_token)
    return session_token


@app.route('/')
@app.route('/forgetpassword')
def index(chat_id=None):
    return app.send_static_file('index.html')


@app.route('/api/loadthreadmassage', methods=['POST'])
def load_thread_message():
    if request.cookies['cookie'] not in session_tokens:
        return "", 401
    thread = {key: request.form.get(key) for key in request.form}
    print(thread)
    messages = db_manager.load_thread_message(thread)
    return jsonify(messages)


@app.route('/api/createchannel', methods=['POST'])
def create_channel():
    if request.cookies['cookie'] not in session_tokens:
        return "", 401
    channel = {key: request.form.get(key) for key in request.form}
    status = db_manager.create_channel(channel)
    return jsonify(status)


@app.route('/api/login', methods=['POST'])
def login():
    user = {key: request.form.get(key) for key in request.form}
    data = db_manager.login(user)
    token = generate_session_token()
    return jsonify({"data": data, "token": token})


@app.route('/api/moremessage', methods=['POST'])
def more_message():
    if request.cookies['cookie'] not in session_tokens:
        return "", 401
    channel = {key: request.form.get(key) for key in request.form}
    messages = db_manager.more_message(channel)
    return jsonify(messages)


@app.route('/api/signup', methods=['POST'])
def signup():
    user = {key: request.form.get(key) for key in request.form}
    status = db_manager.signup(user)
    return jsonify(status)


@app.route('/api/sendthreadmessage', methods=['POST'])
def send_thread_message():
    if request.cookies['cookie'] not in session_tokens:
        return "", 401
    message = {key: request.form.get(key) for key in request.form}
    status = db_manager.send_thread_message(message)
    return jsonify(status)


@app.route('/api/forgetpassword', methods=['POST'])
def forget_password():
    user = {key: request.form.get(key) for key in request.form}
    user['url'] = request.url_root
    status = forget_password_manager(user)
    return jsonify(status)


@app.route('/api/changepassword', methods=['POST'])
def change_password():
    if request.cookies['cookie'] not in session_tokens:
        return "", 401
    user = {key: request.form.get(key) for key in request.form}
    status = db_manager.change_password(user)
    return jsonify(status)


@app.route('/api/getmessage', methods=['POST'])
def get_message():
    if request.cookies['cookie'] not in session_tokens:
        return "", 401
    channel = {key: request.form.get(key) for key in request.form}
    messages = db_manager.get_message(channel)
    return jsonify(messages)


@app.route('/api/getunreadmessagecount', methods=['POST'])
def get_unread_message_count():
    if request.cookies['cookie'] not in session_tokens:
        return "", 401
    channel = {key: request.form.get(key) for key in request.form}
    count = db_manager.get_unread_message_count(channel)
    return jsonify(count)


@app.route('/api/postmessage', methods=['POST'])
def post_message():
    if request.cookies['cookie'] not in session_tokens:
        return "", 401
    message = {key: request.form.get(key) for key in request.form}
    result = db_manager.post_message(message)
    return jsonify(result)


@app.route('/api/changeusername', methods=['POST'])
def change_username():
    if request.cookies['cookie'] not in session_tokens:
        return "", 401
    user = {key: request.form.get(key) for key in request.form}
    status = db_manager.change_username(user)
    return jsonify(status)


@app.route('/api/getchannels', methods=['POST'])
def get_channels():
    if request.cookies['cookie'] not in session_tokens:
        return "", 401
    channels = db_manager.get_channels()
    return jsonify(channels)


def forget_password_manager(user):
    magic_link = user['url'] + 'forgetpassword?magic=' + user['email']
    message = Mail(
        from_email='admin@belay.com',
        to_emails=user['email'],
        subject='Reset your Belay password',
        html_content='Click to reset your password <strong>{}</strong>!'.format(magic_link))
    try:
        sg = SendGridAPIClient(
            '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')
        sg.send(message)
        return "A password recovery link has been sent to your email."
    except Exception as e:
        print(str(e))
        return "An error occurred while sending the recovery link via email"


def hash_password_manager(user):
    hashed = bcrypt.hashpw(user['password'].encode('utf-8'), bcrypt.gensalt(9))
    user['password'] = hashed
    return user


config = configparser.ConfigParser()
config.read('secrets.cfg')
DB_NAME = config['secrets']['DB_NAME']
DB_USERNAME = config['secrets']['DB_USERNAME']
DB_PASSWORD = config['secrets']['DB_PASSWORD']


if __name__ == '__main__':
    app.run(debug=True)
