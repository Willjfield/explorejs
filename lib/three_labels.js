var ThreeLabel = function(parameters){
	if(typeof parameters!='undefined'){
		this.height = typeof parameters.size=='undefined' ? 1 : parameters.height
		this.width = typeof parameters.width=='undefined' ? 2 : parameters.width
		this.labelText = typeof parameters.labelText=='undefined' ? "label" : parameters.labelText
		this.parent = typeof parameters.parent=='undefined' ? scene : parameters.parent
		this.labelPosition = typeof parameters.labelPosition=='undefined' ? new THREE.Vector3(0,0,0) : parameters.labelPosition
		this.parentScale = typeof parameters.parentScale=='undefined' ? 1 : parameters.parentScale
		this.labelScale = typeof parameters.labelScale=='undefined' ? 1 : parameters.labelScale
		this.color = typeof parameters.color=='undefined' ? 0xfffff : parameters.color
		this.unrotate = typeof parameters.unrotate=='undefined' ? true : false
	}else{		
		this.height = 1 
		this.width = 2
		this.labelText = "label"
		this.parent = scene
		this.labelPosition = new THREE.Vector3(0,0,0)
		this.parentScale = 1
		this.labelScale = 1
		this.color = 0xfffff
		this.unrotate = true
	}

	this.lineheight = .1

	var canvas = document.createElement('canvas')

	canvas.className='label'
	document.body.appendChild(canvas)
	var ctx = canvas.getContext('2d');
	canvas.width = this.width*128
	canvas.height = this.height*128
	ctx.font = '48pt Arial';
	ctx.fontWeight = 'bolder'
	ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle="rgba(0, 0, 200, 1)";
    ctx.fill();
	ctx.fillStyle = 'white';
	ctx.textAlign = "center";
	ctx.textBaseline = "bottom";
	ctx.fillText(this.labelText, canvas.width/2, canvas.height);

	var stexture = new THREE.Texture(canvas);
	stexture.needsUpdate = true;

	this.parentObj = new THREE.Object3D()

	var smaterial = new THREE.MeshBasicMaterial({map: stexture, alphaMap:stexture, transparent: true});
	var sgeometry = new THREE.PlaneGeometry( this.width, this.height );
	this.smesh = new THREE.Mesh( sgeometry, smaterial );
	this.smesh.scale.set(this.labelScale,this.labelScale,this.labelScale)
	this.smesh.position.y=this.lineheight+(this.height*this.labelScale)

	var pointerLineGeo = new THREE.Geometry()
	pointerLineGeo.vertices.push(new THREE.Vector3(0,0,0),new THREE.Vector3(0,this.lineheight,0))
	var pointerLineMat = new THREE.LineBasicMaterial({
		color: 0xffffff});
	this.pointerLine = new THREE.Line(pointerLineGeo,pointerLineMat );
	this.pointerLine.name=this.labelText+"_labelLine"
	this.pointerLine.position.copy(this.labelPosition)
	this.pointerLine.geometry.verticesNeedUpdate = true
	
	this.parentObj.add(this.pointerLine)
	this.parentObj.add(this.smesh)
	this.parentObj.position.copy(this.labelPosition)

	this.parentObj.name=this.labelText+"_parent_label"
	
	this.parentObj.scale.set(this.parentScale,this.parentScale,this.parentScale)

	this.parentObj.position.copy(this.labelPosition)
	if(!this.unrotate){
		this.parent.add( this.parentObj );
	}else{
		this.parentObj.position.add(this.parent.position)
		scene.add(this.parentObj)
	}
}

ThreeLabel.prototype.update = function(parameters){
	//console.log("updating "+this.labelText)
	if(typeof parameters!='undefined'){
		this.labelPosition = typeof parameters.labelPosition!='undefined' ? parameters.labelPosition : this.labelPosition

	}

			this.parentObj.position.copy(this.labelPosition)
		
		if(this.unrotate){
			this.parentObj.position.add(this.parent.position)
			//scene.add(this.parentObj)
		}
	this.parentObj.lookAt(camera.position)

	if(camera.position.distanceTo(this.parentObj.position)<50){
		this.labelScale = this.parentObj.position.distanceTo(camera.position)*15
		this.smesh.scale.set(this.labelScale,this.labelScale,this.labelScale)
	}else{
		this.labelScale = 1000
		this.smesh.scale.set(this.labelScale,this.labelScale,this.labelScale)
	}
	this.smesh.position.y=this.lineheight+(this.height*this.labelScale/2)
}

ThreeLabel.prototype.hide = function(){
	this.parent.remove(this.parentObj)
}

ThreeLabel.prototype.show = function(){
	this.parent.add(this.parentObj)
}
