#! /usr/bin/env python3

from time import time
from flask import Flask, jsonify, request, render_template, url_for, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from utility import env_int, env_str, failed, strExceedLimit, succeed
from timepoint import timepoint

# Read environment variables
DB_URI = env_str('DB_URI','sqlite:///kvdata.db')
ROW_COUNT_LIMIT = env_int('ROW_COUNT_LIMIT',1000)
KEY_LENGTH_LIMIT = env_int('KEY_LENGTH_LIMIT', 128)
VALUE_LENGTH_LIMIT = env_int('VALUE_LENGTH_LIMIT', 1024 * 10)   # bytes
USER_SET_INTERVAL_MIN = env_int('USER_SET_INTERVAL_MIN', 60)    # seconds
SYSTEM_SET_INTERVAL_MIN = env_int('SYSTEM_SET_INTERVAL_MIN', 1) # seconds

TABLE_PREFIX = env_str('TABLE_PREFIX','tbt')
KVTABLE_NAME = env_str('KVTABLE_NAME','kv')
COLUMN_PREFIX = env_str('COLUMN_PREFIX',TABLE_PREFIX)
KEY_COLUMN_LENGTH = env_int('KEY_COLUMN_LENGTH', 256)
VALUE_COLUMN_LENGTH = env_int('VALUE_COLUMN_LENGTH', 1024*8)
UPDATE_COLUMN_LENGTH = env_int('UPDATE_COLUMN_LENGTH', 256)
ICOLNAME = f'{COLUMN_PREFIX}_id'
KCOLNAME = f'{COLUMN_PREFIX}_key'
VCOLNAME = f'{COLUMN_PREFIX}_value'
UCOLNAME = f'{COLUMN_PREFIX}_update'

KKEY = env_str('KKEY','key')
VKEY = env_str('VKEY','value')
UKEY = env_str('UKEY','update')

LIST_ROUTE_PART = env_str('LIST_ROUTE_PART', 'None')      # url part to list data
PER_PAGE_DEFAULT = env_int('PER_PAGE_DEFAULT', 10)      # Rows per page
PAGE_DEFAULT = env_int('PAGE_DEFAULT', 1)               # Page number

app = Flask(__name__)
cors = CORS(app)

# Define the database connection
app.config['SQLALCHEMY_DATABASE_URI'] = DB_URI

# Create the database object
db = SQLAlchemy(app)

# Define the model class
class Kv(db.Model):
    __tablename__ = f"{TABLE_PREFIX}_{KVTABLE_NAME}"
    id = db.Column(ICOLNAME, db.Integer, primary_key=True)
    key = db.Column(KCOLNAME, db.String(KEY_COLUMN_LENGTH), nullable=False)
    value = db.Column(VCOLNAME, db.String(VALUE_COLUMN_LENGTH), nullable=False)
    update = db.Column(UCOLNAME, db.Float)

    def __repr__(self):
        return f'<Kv {self.id}>'

# Create the table if it doesn't exist
with app.app_context():
    db.create_all()

@app.route('/assets/<path:path>')
def serve_static(path):
    return send_from_directory('assets', path)

@app.route('/index.html')
def index():
    return render_template('index.html')

@app.route(f'/kv-{LIST_ROUTE_PART}', methods=['GET'])
def get_list():
    if LIST_ROUTE_PART is None:
        return render_template('404.html')
    page = request.args.get('page', PAGE_DEFAULT, type=int)
    per_page = request.args.get('per_page', PER_PAGE_DEFAULT, type=int)
    cpc = Kv.query.paginate(page=page, per_page=per_page)   # cur_page_content
    rows = [{"id": r.id, KKEY: r.key, VKEY: r.value, 'time': r.update} for r in cpc]
    prev_page_url = url_for('get_list', page=page-1, per_page=per_page) if cpc.has_prev else None
    next_page_url = url_for('get_list', page=page+1, per_page=per_page) if cpc.has_next else None
    page_links = [{'link':url_for('get_list', page=p, per_page=per_page), 'number': p} for p in range(1,cpc.pages+1)]
    return render_template('kv.html', kv_list=rows, page_links=page_links,
                           cur_page=page, total_pages=cpc.pages,
                           prev_page_url=prev_page_url,
                           next_page_url=next_page_url)

@app.route('/api/kv/<key>', methods=['GET'])
def get_kv(key):
    record = Kv.query.filter_by(key=key).first()
    if not record:
        return jsonify(failed('record not exist'))
    data = {'key': record.key, 'value': record.value, 'time': record.update}
    return jsonify(succeed("got", data))

@app.route('/api/kv', methods=['POST'])
def set_kv():
    kv = request.get_json()
    # print(kv)
    key = kv[KKEY]
    value = kv[VKEY]
    if strExceedLimit(key, KEY_LENGTH_LIMIT):
        return failed(f'key length exceed {KEY_LENGTH_LIMIT} bytes')
    if strExceedLimit(value, VALUE_LENGTH_LIMIT):
        return failed(f'data length exceed limit: {VALUE_LENGTH_LIMIT} bytes')
    record = Kv.query.filter_by(key=key).first()
    # print(record)
    if record is not None:
        userLastWriteTime = timepoint(record.update)
        if userLastWriteTime.elapsed() < USER_SET_INTERVAL_MIN:
            return failed(f'please wait {USER_SET_INTERVAL_MIN} seconds')
        record.value = value
        record.update = time()
        db.session.commit()
        return succeed('updated')
    if Kv.query.count() > ROW_COUNT_LIMIT:
        msg = f'can not create more than {ROW_COUNT_LIMIT} rows'
        print(msg)
        return failed(msg)
    record = Kv(key=key, value=value, update=time())
    db.session.add(record)
    db.session.commit()
    return succeed('created')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    from waitress import serve
    port = env_int('PORT', 5000)
    host = env_str('HOST','0.0.0.0')
    print(f"running on http://{host}:{port}")
    # app.run(debug=True, host=host, port=port)
    serve(app, host=host, port=port)
