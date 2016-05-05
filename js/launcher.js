/******************************************************************************
This file is part of PIRATES.

PIRATES is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

PIRATES is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with PIRATES.  If not, see <http://www.gnu.org/licenses/>.
*******************************************************************************/

var button = document.getElementById("button");
var pseudo = document.getElementById("pseudo");
var counter = document.getElementById("counter");

function emitJoin(){
  socket.emit("join", pseudo.value);
};

button.addEventListener("click", emitJoin);
pseudo.addEventListener("keyup", function(e){
  if(e.keyCode === 13){
	emitJoin();
  }
});

socket.on('nbPlayersRequired', function(nbPlayersRequired){
  counter.innerHTML = nbPlayersRequired;
});

  socket.on('addMemberConnected', function(pseudo){
		if (typeof(pseudo) == "string" )
		{
			var li = document.createElement('li');
			li.innerHTML = pseudo;
			li.setAttribute("id", pseudo);
			document.getElementById('liste').appendChild(li);
			
			var currVal = parseFloat(counter.innerHTML);
			counter.innerHTML = currVal - 1;
		}
		else{
			for(var i in pseudo) {
			  var player = pseudo[i];
			  if(player.stat != 'None'){
				  var li = document.createElement('li');
				  li.innerHTML = player.pseudo;
				  li.setAttribute("id", player.pseudo);
				  document.getElementById('liste').appendChild(li);
				  
				  var currVal = parseFloat(counter.innerHTML);
				  counter.innerHTML = currVal - 1;
				}
			}
		}
  });
	
  
  socket.on('removeMemberConnected', function(pseudo){
			var child = document.getElementById(pseudo);
			document.getElementById('liste').removeChild(child);
			
			var currVal = parseFloat(counter.innerHTML);
			counter.innerHTML = currVal + 1;

  });

socket.on('pseudoError', function(msg){
  if(msg === 'alreadyGiven'){
	var error = document.getElementById("error")
	error.innerText = "Error : Pseudo already taken !";
	error.style.display = "block";
  }
});

// We need to know if the pseudo is already used before change label
socket.on('initId', function(){
  document.getElementsByClassName("dialog")[0].innerHTML = "<h3> Awaiting players to begin the game </h3>";
});