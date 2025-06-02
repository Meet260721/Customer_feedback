from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_session import Session
from datetime import timedelta

app = Flask(__name__)


app.config['MONGO_URI'] = "mongodb://localhost:27017/database"
app.config['SECRET_KEY'] = 'supersecretkey'


app.config.update({
    'SESSION_TYPE': 'filesystem',
    'SESSION_PERMANENT': True,
    'PERMANENT_SESSION_LIFETIME': timedelta(days=7),
    'SESSION_COOKIE_SECURE': False,
    'SESSION_COOKIE_HTTPONLY': True,
    'SESSION_COOKIE_SAMESITE': 'Lax',
    'SESSION_COOKIE_NAME': 'session',
    'SESSION_COOKIE_PATH': '/',
    'SESSION_COOKIE_DOMAIN': None,
})


CORS(app, 
     supports_credentials=True,
     origins=["http://localhost:3000"],
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Set-Cookie"],
     methods=["GET", "POST", "OPTIONS"])


Session(app)
mongo = PyMongo(app)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    print("Signup attempt - Email:", email)

    if not all([name, email, password]):
        return jsonify({'message': 'All fields are required'}), 400

    existing_user = mongo.db.user.find_one({'email': email})
    if existing_user:
        print("User already exists:", email)
        return jsonify({'message': 'User already exists'}), 409
    

    new_user = {
        'name': name,
        'email': email,
        'password': password
    }
    
    print("Creating new user:", new_user)
    result = mongo.db.user.insert_one(new_user)
    
    print("User created successfully:", email)
    return jsonify({
        'id': str(result.inserted_id),
        'name': name,
        'email': email
    }), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    print("\nLogin attempt details:")
    print("Email:", email)
    print("Provided password length:", len(password) if password else 0)

    if not all([email, password]):
        return jsonify({'message': 'Email and password are required'}), 400


    user = mongo.db.user.find_one({'email': email})
    print("\nDatabase lookup results:")
    print("User found:", bool(user))
    
    if not user:
        return jsonify({'message': 'User not found'}), 401


    if user['password'] != password:
        print("\nPassword mismatch:")
        print("Stored password :", repr(user['password']))
        print("Provided password:", repr(password))
        return jsonify({'message': 'Invalid password'}), 401


    session.clear()
    session['email'] = email
    session['user_id'] = str(user['_id'])
    session.permanent = True
    
    print("\nSession data set:")
    print("Session ID:", session.sid if hasattr(session, 'sid') else 'No session ID')
    print("Session data:", dict(session))

    response = jsonify({
        'id': str(user['_id']),
        'name': user.get('name'),
        'email': user.get('email')
    })
    
    print("\nLogin successful for:", email)
    print("Response headers:", dict(response.headers))
    return response, 200

@app.route('/@me', methods=['GET'])
def me():
    print("\nSession check request:")
    print("Current session:", dict(session))
    print("Headers:", dict(request.headers))

    if 'email' not in session:
        print("No email in session")
        return jsonify({'message': 'Unauthorized'}), 401

    user = mongo.db.user.find_one({'email': session['email']})
    if not user:
        print("User not found in database")
        session.clear()
        return jsonify({'message': 'User not found'}), 404

    print("Session check successful for:", session['email'])
    return jsonify({
        'id': str(user['_id']),
        'name': user.get('name'),
        'email': user.get('email')
    }), 200

@app.route('/logout', methods=['POST'])
def logout():
    print("\nLogout request:")
    print("Session before clear:", dict(session))
    session.clear()
    print("Session after clear:", dict(session))
    return jsonify({'message': 'Logged out'}), 200

@app.route('/debug/users', methods=['GET'])
def debug_users():
    users = list(mongo.db.user.find())
    for user in users:
        user['_id'] = str(user['_id'])
    return jsonify(users)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
