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
          rdb.register(name, alias, department, email, cuisine, accompany)
          return render_template("successful.html")
      except:
          print('failed in register')
          return render_template("registesuc.html")
   return render_template("home.html")

@app.route("/login")
def login():
   if "alias" in request.args:
      rdb.login(request.args.get("alias"))
      return "Log in!"
   else:
      return "Failed to log in!"