var playerID = 27;
var selectedCard = -1;
var board;
var turn;
var intNotSet = true;

function xor(a,b)
{
	if((a && b) || (!a && !b))
		return false;
	else
		return true;
}
function init()
{
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function()
	{
		if(this.readyState == 4)
		{
			data = JSON.parse(this.response);
			playerID = data["playerID"];
			let imgList = document.getElementsByTagName("img");
			for(i in imgList)
			{
				imgList[playerID*(imgList.length -1 )+Math.pow(-1,playerID)*i].onclick = play;
				imgList[playerID*(imgList.length -1 )+Math.pow(-1,playerID)*i].id = i;
				if(intNotSet)
				{
					setInterval(getBoard,333);
					intNotSet = false;
				}
			}
		}
	}
	xhttp.open("GET","/player_id/" + playerID, true);
	xhttp.send();
}

function getBoard()
{
	let xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function()
	{
		if(this.readyState == 4)
		{
			data = JSON.parse(this.response);
			board = data["board"]
			turn = data["turn"]
			for(i in board)
			{
				if(board[i] != null)
					document.getElementById(i).src = "cards/" 
								   + board[i]["Suit"] 
								   + "/" 
								   + board[i]["Rank"] 
							   	   + ".png";
				else
					document.getElementById(i).src = "cards/blank.png"
			}
			document.getElementById(21*turn).src = "cards/back.png"			
	}
	xhttp.open("GET","/board");
	xhttp.send();

}

function play()
{
	if(turn != playerID)
		return;
	id = parseInt(this.id)
	if(selectedCard == -1)
	{
		if(id == 21*playerID + Math.pow(-1,playerID)*21 && this.src.includes("blank"))
		{
			let xhttp = new XMLHttpRequest();
			xhttp.open("POST","/flip/" + turn, true);
			xhttp.send();
		}
		else if(!this.src.includes("blank") && Math.pow(-1,playerID)*id>Math.pow(-1,playerID)*(21*playerID + Math.pow(-1,playerID)*2))
		{
			this.className = "selected";
			selectedCard = parseInt(this.id);
		}
	}
	else if(selectedCard == id)
	{
		selectedCard = -1;
		this.className = "";
	}
	else
	{
		let redSuits = ["Hearts","Diamonds"];
		let valid = false;
		let ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]
		let thisSuit = null;
		let selRank = ranks.indexOf(board[selectedCard].Rank);
		let thisRank = -1;
		let selSuit = board[selectedCard].Suit		
		if(!this.src.includes("blank"))
		{
			thisSuit = board[id].Suit;
			thisRank = ranks.indexOf(board[id].Rank);
		}
		console.log(id)
		console.log(thisSuit);
		console.log(thisRank);
		console.log(selectedCard)
		console.log(selSuit);
		console.log(selRank);
		switch(id)
		{
			case 1: 	if(playerID == 1 && selectedCard == 0)
							valid = true;
			case 2: 	if(thisSuit == selSuit && Math.abs(thisRank-selRank) == 1 && playerID == 0)
							valid = true;
						break;
			case 3:
			case 4:
			case 5:
			case 6:
			case 15:
			case 16:
			case 17:
			case 18: 	if(this.src.includes("blank") || (xor(redSuits.includes(thisSuit),redSuits.includes(selSuit)) && thisRank - selRank == 1))
							valid = true;
						break;
			case 7:
			case 8:
			case 9:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14: 	if(selRank - thisRank == 1 && (thisSuit == selSuit || thisSuit == null))
							valid = true;
						break;						
			case 20: 	if(selectedCard == 21 && playerID == 0)
							valid = true;
			case 19: 	if(thisSuit == selSuit && Math.abs(thisRank-selRank) == 1 && playerID == 1)
							valid = true;
						break;
		}
		if(valid)
		{
			let xhttp = new XMLHttpRequest();
			xhttp.open("POST","/play/" + selectedCard + "/" + id, true);
			xhttp.send();
		}
		document.getElementById(selectedCard).className = "";
		selectedCard = -1;
	}
}