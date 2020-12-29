# Pandora's Network

Pandora's Network is an online puzzle game I developed in NodeJS/Express. You play as a system administrator who needs to root out a sentient virus from their computer network. This game was created as part of the WANIC Cybersecurity Course, which I took July 2017.

# Running the Game

To run this game, make sure you have ```npm```, ```node```, and ```git``` installed. Then, clone this repo. Once you have the repo, run ```npm install``` to fetch all the dependencies. 
On Linux, start the database in the background by typing ```mongod --dbpath="/path/to/repo/data" &```. Then, type ```npm start``` to start the server. You can access the game by going to ```https://localhost:8181``` on your background. Run ```mongo``` to connect to and view the database.

Note: A similar set of commands on Windows should start the server.

