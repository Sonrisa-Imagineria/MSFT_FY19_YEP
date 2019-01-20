from flask import Flask
from flask import render_template
from flask import request
from flask_bootstrap import Bootstrap
from flask_sqlalchemy import SQLAlchemy
import os
import db as DB

app = Flask(__name__)
static_folder_root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "client")
bootstrap = Bootstrap(app)
rdb = DB.RegisterDB()

@app.route("/")
def home():
   return "Hello! 你來錯地方囉!"

@app.route("/MSFT30/EWC/register")
def register():
   content = "Register Time"
   return render_template("index.html")
   # return "Register!"

@app.route("/FY19YEP/register")
def test():
   if "name" in request.args:
      name = request.args.get("name")
      alias = request.args.get("alias")
      department = request.args.get("department")
      email = request.args.get("email")
      cuisine = request.args.get("cuisine")
      accompany = request.args.get("accompany")
      greeting = request.args.get("greeting")
      try:
          rdb.register(name, alias, department, email, cuisine, accompany, greeting)
          return render_template("successful.html")
      except:
          print('failed in register')
          return render_template("registesuc.html")
   return render_template("home.html")

@app.route("/login")
def login():
   if "alias" in request.args:
      print('lohin')
      try:
        result = rdb.login(request.args.get("alias"))
        print('after finding...')
        print(result)
        return render_template("login.html",obj=result)
      except:
        result = {'name':request.args.get("alias"),'accompany':''}
        return render_template("login.html",obj=result)
   else:
      return "Failed to log in!"

@app.route("/luckydraw")
def luckyDraw():
    return render_template("luckydraw.html")
@app.route("/luckydrawtest")
def luckyDrawtest():
    return render_template("luckydraw_test.html")

@app.route("/luckydraw/phase1")
def luckyDraw1():
    return render_template("luckydraw_1.html")
@app.route("/luckydraw/phase2")
def luckyDraw2():
    return render_template("luckydraw_2.html")
@app.route("/luckydraw/phase3")
def luckyDraw3():
    return render_template("luckydraw_3.html")
@app.route("/luckydraw/phase4")
def luckyDraw4():
    return render_template("luckydraw_4.html")

@app.route("/luckydraw/data",methods=['GET','PUT'])
def dbData():
    print('in dbdata...')
    if request.method == 'GET':
        resp = rdb.list()
        return resp
    elif request.method == 'PUT':
        if not request.json:
            return '404'
        else:
            print('req data:{0}'.format(len(request.json)))
            for d in request.json:
                rdb.updateDB(d['alias'],d['isWinner'])
            return '200'
    # print(rdb.list)

