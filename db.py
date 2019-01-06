from pymongo import MongoClient
import os
import requests
import json
import genqrcode as QR

try:
    import configparser
except:
    from six.moves import configparser
# config = configparser.ConfigParser()
# config.read('config.txt')

class DB():
	mongoUrl = os.environ['mongoUrl']
	name = os.environ['name']
	password = os.environ['password']
	dbName = os.environ['dbName']
	collName = os.environ['collName']
	collName_luckydraw = os.environ['collName_luckydraw']
    # mongoUrl = config.get('DB','mongoUrl')
    # print(mongoUrl)
    # name = config.get('DB','name')
    # password = config.get('DB','password')
    # dbName = config.get('DB','dbName')
    # collName = config.get('DB','collName')
    # print(collName)
	client = None
	db = None
	coll = None
	coll_luckydraw = None
	
	def connect(self):
		self.client = MongoClient(self.mongoUrl) # host uri 
		self.db = self.client[self.dbName] # Select the database
		self.db.authenticate(name=self.name,password=self.password)
		self.coll = self.db[self.collName]
		self.coll_luckydraw = self.db[self.collName_luckydraw]
	def close(self):
		self.client.close()

class Member():
	name = None
	alias = None
	department = None
	email = None
	cuisine = None
	accompany = None
	greeting = None

	def __init__(self, name, alias, department, email, cuisine, accompany, greeting):
		self.name = name
		self.alias = alias
		self.department = department
		self.email = email
		self.cuisine = cuisine
		self.accompany = accompany
		self.greeting = greeting

class RegisterMail():
	# mailServiceUrl = os.environ['mailServiceUrl']
	mailServiceUrl = 'https://prod-12.southeastasia.logic.azure.com:443/workflows/b54dbc3d657d4a898de32660cae62042/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=rKNe3qgHLndqU-Ds4p_CFkhK3E9B-mKRSdDf2Mhfako'
	member = None
	msg = None

	def __init__(self, newMember):
		self.member = newMember

	def genMsg(self):
		return QR.genHtml(self.member.alias)

	def genReqBody(self):
		msg = self.genMsg()
		body = {
			"name": self.member.name,
			"alias": self.member.alias,
			"email": self.member.email,
			"message": msg
		}
		return json.dumps(body)

	def send(self):
		header = {'content-type': 'application/json'}
		jsonBody = self.genReqBody()
		requests.post(self.mailServiceUrl, headers = header, data = jsonBody)

class RegisterDB(DB):
	def __init__(self):
		self.connect()
	def register(self, name, alias, department, email, cuisine, accompany,greeting):
		newMember = Member(name, alias, department, email, cuisine, accompany, greeting)
		try:
			self.coll.insert(newMember.__dict__)
			print('success in register')
		except:
			print('failed in register')
			#flash('failed in register')

		mail = RegisterMail(newMember)
		mail.send()
		print('register done')
	def login(self, alias):
		print('login done')

	def remove(self, alias):
		self.coll.remove({"alias": alias})

	def list(self):
		memberList = self.coll_luckydraw.find()
		testList = list(memberList)
		for x in testList:
			del x["_id"]
		testList = json.dumps(testList)
		print(testList)
		#for m in memberList: print(m)
		return testList
	def updateDB(self,alias,isWinner):
		try:
			self.coll_luckydraw.update({'alias':alias},{'$set':{'isWinner':isWinner}})
			print('success in updating')
		except Exception as e:
			print('fail in updating'+str(e))
"""
	# test case
	member = Member('real-aaa', 'aaa', 'bbb@mail.com', 'apple', 'onefriend')
	rdb = RegisterDB()
	rdb.add(member)
	rdb.list()
	print('end')
"""
