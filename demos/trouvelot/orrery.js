var planets=[]
var spaceBackground, spaceMatte
var zoom
var sun
var centerX, centerY
var initX = 0
var initY = 0
var speed = 0
var tOffset = 0
var date
var trailLength = 300

var mercuryYears = [1934,2014]
var venusYears = [1761,2009]
var earthYears = [1816,2016]
var marsYears = [1874,2003]
var jupiterYears = [1874,1991,2009]
var saturnYears = [1874,2004]

var planetYears = [mercuryYears,venusYears,earthYears,marsYears,jupiterYears,saturnYears]

function preload(){
	var thisYear = xpl.dateFromJday(xpl.now,-5).year
	document.getElementById("speedSlider").min = -5
	document.getElementById("speedSlider").max = 5
	document.getElementById("speedSlider").step = .01
	spaceBackground = loadImage("fludd_infinity2.jpg")
	spaceMatte = loadImage("infinity.png")
	sun = loadImage("img/sun.png")
	console.log(thisYear)
	for(var p in planetYears){
		loadPlanetTex(planetYears[p], thisYear, p)
	}
}

function loadPlanetTex(pYears, curYear, planetNum){
					for(var y = pYears.length; y>=0; y--){
						for(var i = curYear;i>1700;i--){
							if(pYears[y]==i){
								var loadString = "img"+"/"+planetNum+"/"+i+".png"
								planets[planetNum] = loadImage(loadString)
								//console.log(curYear)
								//console.log(loadString)
								return 0
						}
				}
		}
}

function setup(){
	createCanvas(windowWidth, windowHeight)
	imageMode(CENTER)
	drawPlanets()
	zoom = 1
	stroke(255,100)
	noFill()
	centerX = width/2
	centerY = height/2
}

function draw(){
	background(0)
	drawPlanets()
	speed = parseFloat(document.getElementById("speedSlider").value)
	if(speed>0){
		tOffset+=speed*speed*speed
	}else{
		tOffset+=speed*speed*speed
	}
	date = xpl.dateFromJday(xpl.now+tOffset,-5)

	noStroke()
	fill(255)
	textSize(30)
	textAlign(CENTER)
	text(date.month + "/",50,70)
	text(date.day + "/",90,70)
	text(date.year,150,70)
}

function mouseWheel(event) {
	zoom-=(event.delta*.01)
	zoom < .5 ? zoom = .5 : {}
	zoom > 20 ? zoom = 20 : {}
}

function drawPlanets(){
	push()
		translate(centerX,centerY)
		scale(zoom)
		push()
		scale(1+(zoom*.1))
		//image(spaceBackground,0,0,spaceBackground.width,spaceBackground.height,0,0,height-100,height-100)
		pop()
		strokeWeight(1/zoom)
		push()
			scale(.03)
			image(sun,0,0)
		pop()
		for(var p in planets){
			push()
				var curPosition = xpl.SolarSystem(xpl.planets[p],xpl.now+tOffset)
				var distanceSq = ((curPosition[0]*25)*(curPosition[0]*25))+((curPosition[1]*25)*(curPosition[1]*25))
				//ellipse(0,0,distance*2,distance*2)
				for(var trail = 0;trail<distanceSq/7;trail+=5){
					var t1 = xpl.SolarSystem(xpl.planets[p],xpl.now+tOffset-trail)
					var t2 = xpl.SolarSystem(xpl.planets[p],xpl.now+tOffset-trail-5)
					line(-t1[0]*25,t1[1]*25,-t2[0]*25,t2[1]*25)
				}

				translate(-curPosition[0]*25,curPosition[1]*25)

				push()
					scale(xpl.planets[p].radius*.000002)
					image(planets[p],0,0)
				pop()

				if(abs(mouseX-(width/2)+(curPosition[0]*25*zoom))<15){
					if(abs(mouseY-(height/2)-(curPosition[1]*25*zoom))<15){
						fill(255)
						noStroke()
						textSize(16/zoom)
						text(xpl.planets[p].name,xpl.planets[p].radius*.0005/zoom,xpl.planets[p].radius*.0005/zoom)
					}
				}
			pop()
		}
		//image(spaceMatte,0,0,spaceMatte.width,spaceMatte.height,0,0,(height-100)*3,(height-100)*3)
	pop()
}

function mousePressed(){
	if(mouseX<0||mouseX>width||mouseY<0||mouseY>height){return 0}
	initX = mouseX-centerX
	initY = mouseY-centerY
}

function mouseReleased(){
	document.getElementById("speedSlider").value = 0
	for(var p in planetYears){
		loadPlanetTex(planetYears[p], date.year, p)
	}
}

function mouseDragged() {
	if(mouseX<0||mouseX>width||mouseY<0||mouseY>height){return 0}

	centerX = mouseX-initX
	centerY = mouseY-initY

	centerX < 0 ? centerX = 0 : {}
	centerY < 0 ? centerY = 0 : {}
	centerX > width ? centerX = width : {}
	centerY > height ? centerY = height : {}
}
