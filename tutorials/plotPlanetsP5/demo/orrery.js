//Declare variables that will be the center of our Solar System
var centerX, centerY

//Declare and set the play speed and the date
var speed = 0
var tOffset = 0
var date

//Set variables that will control the size of the orbits and the size of the planets
var solarScale  = 15
var planetScale = .001

//setup() sets up our sketch
function setup(){
	//Create a canvas that fills our window
	createCanvas(windowWidth, windowHeight)
	//Store the center of our screen
	centerX = width/2
	centerY = height/2
	
}

function draw(){
	//Every frame will update the current time. 
	//If we let our sketch play, it will track the planets in real-time
	xpl.updateTime()
	//We begin drawing by making a black background
	background(0)
	//We will describe the position of everything we draw from its center
	imageMode(CENTER)
	//We do not want strokes around our planets
	noStroke()
	//We will start by drawing the Sun as a white circle in the center of our screen
	fill(255)
	ellipse(centerX,centerY,5,5)

	//The following for loop will look through every planet in the explore.js planet catalogue
	for(var p=0;p<xpl.planets.length;p++){
		//Call the planet we're currently dealing with "planet"
		var planet = xpl.planets[p]
		//Find the position of the planet in our solar system given:
		//the current time(xpl.now)
		//the time we've offset with our controls(tOffset)
		var position = xpl.SolarSystem(planet,xpl.now+tOffset)
		//Find the radius of the current planet
		var radius = planet.radius*planetScale
		//Find the rgb color of the current planet. Each planet has a default color stored in the catalogue.
		var planetColor = color(planet.rgbColor.r,planet.rgbColor.g,planet.rgbColor.b)
		//Everything between push() and pop() exists in its own coordinate system
		//This way, we don't have to worry about transformations conflicting with each other
		push()
			//First, we'll move the origin of our coordinate system to the center of the screen
			translate(centerX,centerY)
			//Next, we'll draw the paths of the orbits of the planets
			//trailStep is the number of segements we'll want in our orbit path
			//We get this by getting the year length of the planet and dividing it by
			//the number of segments we want
			var trailStep = (planet.yearLength/64)
			//This for loop is going to draw each segment of the orbit
			//We do this by looking back over the last year in intervals equal to our trailStep
			for(var trail = 0;trail<planet.yearLength;trail+=trailStep){
				var t1 = xpl.SolarSystem(planet,xpl.now+tOffset-trail)
				var t2 = xpl.SolarSystem(planet,xpl.now+tOffset-trail-trailStep)
				//We'll make the paths white
				stroke(255)
				//And draw a line connecting each location with the previous one
				line(t1[0]*solarScale,t1[1]*solarScale,t2[0]*solarScale,t2[1]*solarScale)
			}
			//Finally, we'll draw the planets themselves
			//First, set the fill color to the planet's fill color
			fill(planetColor)
			noStroke()
			//Each planet will be represented as an ellipse
			ellipse(position[0]*solarScale,position[1]*solarScale,radius,radius)
		pop()
	}
	//manageSlider() manages our time controls
	manageSlider()
}

function manageSlider(){
	//When a button is clicked, the speed is incremented in one direction or the other
	var dir = speed > 0
	dir *= 2
	dir -= 1
	//Depending on how many times a button was pressed, we will set the step to a fraction of a day
	//step will be added to the timeOffset each frame
	switch(Math.abs(speed)){
		case 0:
			step = 0
			document.getElementById("timescale").innerHTML = 'Second'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 1:
			step = 0.00001157407 * dir// 1 min/sec
			document.getElementById("timescale").innerHTML = 'Minute'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 2:
			step = 0.00069166666 * dir// 1 hr/sec
			document.getElementById("timescale").innerHTML = 'Hour'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 3:
			step = 0.0166 * dir// 1 day/sec
			document.getElementById("timescale").innerHTML = 'Day'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 4:
		 	step = 0.498 * dir// 1 month/sec
		 	document.getElementById("timescale").innerHTML = 'Month'
		 	speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
		case 5:
			step = 5.976 * dir// 1 yr/sec
			document.getElementById("timescale").innerHTML = 'Year'
			speed<0 ? document.getElementById("timescale").innerHTML+=' backwards' : {}
		break;
	}
	//add step to tOffset which used throughout the sketch
	tOffset+=step
	//the date takes the current time and adds the offset. This is stored as a Julian Date
	//We need to convert the date from a Julian date to a calendar date. -5 is our timezone offset from gmt
	date = xpl.dateFromJday(xpl.now+tOffset,-5)
	//now we'll draw the date
	noStroke()
	fill(255)
	textSize(30)
	textAlign(CENTER)
	text(date.month + "/",50,height-50)
	text(date.day + "/",90,height-50)
	text(date.year,150,height-50)
}

//This simply resizes the sketch when the window dimensions change
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  centerX = windowWidth/2
  centerY = windowHeight/2
}

//The following are event listeners that change the speed and time when a button is clicked.
document.getElementById("fastForward").addEventListener('click',function(){
	document.getElementById("rewind").innerHTML = "<div id='speed-1' class='speedRW'></div><div id='speed-2' class='speedRW'></div>"
	speed++
	speed < 0 ? speed = 0 : {}
	if(speed<6){
		for(var s=0; s<speed; s++){
			var name = "speed"+speed+1
			document.getElementById("fastForward").innerHTML+="<div id="+name+" class='speedFF'></div>"
			document.getElementById(name).style.borderColor = "transparent transparent transparent #0f0"
			document.getElementById(name).style.left = (speed*20)+'px'
		}
	}
})

document.getElementById("rewind").addEventListener('click',function(){
	document.getElementById("fastForward").innerHTML = "<div id='speed1' class='speedFF'></div><div id='speed2' class='speedFF'></div>"
	speed--
	speed > 0 ? speed = 0 : {}
	if(speed>-6){
		for(var s=0; s>speed; s--){
			var name = "speed-"+speed
			document.getElementById("rewind").innerHTML+="<div id="+name+" class='speedRW'></div>"
			document.getElementById(name).style.borderColor = "transparent transparent transparent #f00"
			document.getElementById(name).style.left = (speed*20)+'px'
		}
	}
})

document.getElementById("play").addEventListener('click',function(){
	speed=0
	document.getElementById("fastForward").innerHTML = "<div id='speed1' class='speedFF'></div><div id='speed2' class='speedFF'></div>"
	document.getElementById("rewind").innerHTML = "<div id='speed-1' class='speedRW'></div><div id='speed-2' class='speedRW'></div>"
})

document.getElementById("resetTime").addEventListener("click",function(event){
	tOffset = 0
})

