from bottle import run, get, post, request, static_file
from pymongo import MongoClient
from random import shuffle
from os import path, getcwd

mongo_client = MongoClient("localhost", 27017)
db = mongo_client.lab5_db
cards_coll = db.cards
card_info = cards_coll.find_one({},{"_id":False})	
deck = []
for s in card_info["Suits"]:
	for r in card_info["Rank"]:
		deck.append({"Suit":s,"Rank":r})

board = []
shuffle(deck)
x=52-15
board.append(deck[:x])
board.append([])
board.append(deck[x:x+11])
x+=11
while len(board)<7:
	board.append(deck[x:x+1])	
	x+=1
while len(board)<15:
	board.append([])
x = 0
shuffle(deck)
while len(board)<19:
	board.append(deck[x:x+1])
	x+=1
board.append(deck[x:x+11])
x+=11
board.append([])
board.append(deck[x:])

game_state = {"board":[],"turn": None, "updating":False, "stateID": 0}
if board[2][0]['Rank'] < board[19][0]['Rank']:
	game_state['turn'] = 0
else:
	game_state['turn'] = 1

for b in board:
	if len(b) > 0:
		game_state['board'].append(b[0])
	else:
		game_state['board'].append(None)

players = []

def update(change_turn = False):
	game_state['updating'] = True
	if change_turn:
		game_state['turn'] = (game_state['turn']+1)%2
	for i in range(len(board)):
		if len(board[i]) > 0:
			game_state['board'][i] = board[i][0]
		else:
			game_state['board'][i] = None
	game_state['stateID'] += 1
	game_state['updating'] = False

@get('/board')
@get('/board/<key:int>')
def get_board(key = 0):
	if not game_state['updating'] or key != 0:
		return game_state

@get('/player_id/<current_id:int>')
def player_id(current_id):
	if current_id == 27:
		players.append(len(players))
		current_id = players[-1]
	return {"playerID":current_id}

@post('/play/<p1:int>/<p2:int>')
def play(p1, p2):	
	card = board[p1][0]
	board[p1].reverse()
	board[p1].pop()
	board[p1].reverse()
	board[p2].reverse()
	board[p2].append(card)
	board[p2].reverse()
	update((p1 == 21 and p2 == 20) or (p1 == 0 and p2 == 1))

@post('/flip/<turn:int>')
def flip(turn):
	board[turn-1] = board[turn+2*(turn-1)]
	board[turn+2*(turn-1)] = []
	board[turn-1].reverse()
	update()

@get('/')
@get('/<filetype>/<filepath:path>')
def server_static(filetype = '', filepath = 'index.html'):
	my_path = path.join(getcwd(), filetype)
	return static_file(filepath, root=my_path)

run(host='localhost', port=8081, debug=True, reloader=True)