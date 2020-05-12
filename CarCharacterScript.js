#pragma strict
var canControle : boolean;

var centerOfMass : Vector3; // Center of mass

var wheelFLCollider : WheelCollider; // Wheel front left collider
var wheelFRCollider : WheelCollider; // Wheel front right collider
var wheelRLCollider : WheelCollider; // Wheel rear left collider
var wheelRRCollider : WheelCollider; // Wheel rear right collider

var wheelFLTransform : Transform; // Wheel front left transform
var wheelFRTransform : Transform; // Wheel front right transform
var wheelRLTransform : Transform; // Wheel rear left transform
var wheelRRTransform : Transform; // Wheel rear right transform

var BackLightObj : GameObject;
var SecondBackLightObj : GameObject;

var leftNitroFlame : ParticleEmitter;
var rightNitroFlame : ParticleEmitter;

var IdleStateMat : Material;
var BrakeStateMat : Material;
var ReverseStateMat : Material;

var speedTorque : float; // Speed of Torque
var currentSpeed : float; // Current speed of the car
var maxSpeed : float = 150; // Maximum car speed
var maxReverseSpeed : float = 50; // Maximum reverse speed of the car
var CurrentSteerAngel : float;
var heighestSteerAngel : float = 50;
var lowSteerAtSpeed : float = 10;
var highSteerAtSpeed : float = 1;

var nitroValue : int = 1000;

var characterToDriveThisCar : GameObject;

private var useNitro : boolean = false; // If the car nitro is on
private var braked : boolean = false; // If the car is on braking the braked boolean is gone be true
private var mySidewayFriction : float;
private var myForwardFriction : float;
private var slipSidewayFriction: float;
private var slipForwardFriction: float;

function Start () {
	nitroValue = 1000;
	SetValues ();
	rigidbody.centerOfMass = Vector3(centerOfMass.x * transform.localScale.x, centerOfMass.y * transform.localScale.y, centerOfMass.z * transform.localScale.z);
	Debug.Log ("Center of mass : " + rigidbody.centerOfMass);
}

function SetValues () {
	myForwardFriction = wheelFLCollider.forwardFriction.stiffness;
	mySidewayFriction = wheelFLCollider.sidewaysFriction.stiffness;
	slipForwardFriction = 0.04;
	slipSidewayFriction = 0.08;
}

function FixedUpdate () {
	if (canControle) {
		var speedFactor = rigidbody.velocity.magnitude/heighestSteerAngel;
		var currentSteerAngel = Mathf.Lerp(lowSteerAtSpeed,highSteerAtSpeed,speedFactor);
		currentSteerAngel *= Input.GetAxis("Horizontal");
		CurrentSteerAngel = currentSteerAngel;

		wheelFLCollider.steerAngle = currentSteerAngel;
		wheelFRCollider.steerAngle = currentSteerAngel;
		wheelRLCollider.motorTorque = speedTorque * Input.GetAxis("Vertical");
		wheelRRCollider.motorTorque = speedTorque * Input.GetAxis("Vertical");
	}
}

function Update () {
	if (Vector3.Distance (transform.position, characterToDriveThisCar.transform.position) <= 0.25f)
		canControle = true;
	else
		canControle = false;
		
	if (canControle && characterToDriveThisCar != null) {
		CalculateSpeed (); // Car calculation function
		MaxSpeed (); // Car decelaration function
		BackLight (); // Car back light function
		Nitro (); // Car nitro function
	}
	
	OnCarBraked (); // Car breaking function
	WheelRotation (); // Car wheel rotation function
	WheelPosition (); // Car wheel position function
	rigidbody.drag = rigidbody.velocity.magnitude / 100;
	
	
}

function OnCarBraked () {
	if (Input.GetButton("Jump")) {
		braked = true;
	} else {
		braked = false;
	}

	if (braked || !canControle) {
		wheelRLCollider.brakeTorque = 50;
		wheelRRCollider.brakeTorque = 50;
		wheelRLCollider.motorTorque = 0;
		wheelRRCollider.motorTorque = 0;

		if (rigidbody.velocity.magnitude > 1)
			SetSlip (slipForwardFriction, slipSidewayFriction);
		else
			SetSlip (1, 1);
	} else {
		wheelRLCollider.brakeTorque = 0;
		wheelRRCollider.brakeTorque = 0;
		wheelRLCollider.motorTorque = 50;
		wheelRRCollider.motorTorque = 50;

		SetSlip (myForwardFriction, mySidewayFriction);
	}

	if (Input.GetAxis("Vertical")) {
		wheelRLCollider.brakeTorque = 0;
		wheelRRCollider.brakeTorque = 0;
	} else {
		wheelRLCollider.motorTorque = 0;
		wheelRRCollider.motorTorque = 0;
		wheelRLCollider.brakeTorque = 50;
		wheelRRCollider.brakeTorque = 50;
	}
}

function CalculateSpeed () {
	currentSpeed = rigidbody.velocity.magnitude * 3.6f;
	currentSpeed = Mathf.Round (currentSpeed);
}

function MaxSpeed () {
	if (currentSpeed >= maxSpeed || currentSpeed  <= -maxReverseSpeed) {
		wheelRLCollider.motorTorque = 00;
		wheelRRCollider.motorTorque = 00;
		wheelRLCollider.brakeTorque = 50;
		wheelRRCollider.brakeTorque = 50;
	}
}

function WheelRotation () {
	// Wheel Rotation
	wheelFLTransform.Rotate (wheelFLCollider.rpm / 60 * 360 * Time.deltaTime, 0, 0);
	wheelFRTransform.Rotate (wheelFRCollider.rpm / 60 * 360 * Time.deltaTime, 0, 0);
	wheelRLTransform.Rotate (wheelRLCollider.rpm / 60 * 360 * Time.deltaTime, 0, 0);
	wheelRRTransform.Rotate (wheelRRCollider.rpm / 60 * 360 * Time.deltaTime, 0, 0);
	// Wheel Steer Rotation
	wheelFLTransform.localEulerAngles.y =  wheelFLCollider.steerAngle - wheelFLTransform.localEulerAngles.z;
	wheelFRTransform.localEulerAngles.y =  wheelFRCollider.steerAngle - wheelFRTransform.localEulerAngles.z;
}

function WheelPosition () {
	var hit : RaycastHit;
	var wheelPos : Vector3;

	// For Wheel Front Left
	if (Physics.Raycast (wheelFLCollider.transform.position, -wheelFLCollider.transform.up, hit, wheelFLCollider.radius + wheelFLCollider.suspensionDistance)) {
		wheelPos = hit.point + wheelFLCollider.transform.up * wheelFLCollider.radius;
	} else {
		wheelPos = wheelFLCollider.transform.position -wheelFLCollider.transform.up * wheelFLCollider.suspensionDistance;
	}
	wheelFLTransform.position = wheelPos;

	// For Wheel Front Right
	if (Physics.Raycast (wheelFRCollider.transform.position, -wheelFRCollider.transform.up, hit, wheelFRCollider.radius + wheelFRCollider.suspensionDistance)) {
		wheelPos = hit.point + wheelFRCollider.transform.up * wheelFRCollider.radius;
	} else {
		wheelPos = wheelFRCollider.transform.position -wheelFRCollider.transform.up * wheelFRCollider.suspensionDistance;
	}
	wheelFRTransform.position = wheelPos;

	// For Wheel Rear Left
	if (Physics.Raycast (wheelRLCollider.transform.position, -wheelRLCollider.transform.up, hit, wheelRLCollider.radius + wheelRLCollider.suspensionDistance)) {
		wheelPos = hit.point + wheelRLCollider.transform.up * wheelRLCollider.radius;
	} else {
		wheelPos = wheelRLCollider.transform.position -wheelRLCollider.transform.up * wheelRLCollider.suspensionDistance;
	}
	wheelRLTransform.position = wheelPos;

	// For Wheel Rear Right
	if (Physics.Raycast (wheelRRCollider.transform.position, -wheelRRCollider.transform.up, hit, wheelRRCollider.radius + wheelRRCollider.suspensionDistance)) {
		wheelPos = hit.point + wheelRRCollider.transform.up * wheelRRCollider.radius;
	} else {
		wheelPos = wheelRRCollider.transform.position -wheelRRCollider.transform.up * wheelRRCollider.suspensionDistance;
	}
	wheelRRTransform.position = wheelPos;
}

function BackLight () {
	if (currentSpeed > 0 && Input.GetAxis("Vertical") < 0) {
		BackLightObj.renderer.material = BrakeStateMat;
	} else if (currentSpeed < 0 && Input.GetAxis("Vertical") > 0) {
		BackLightObj.renderer.material = BrakeStateMat;
	} else if (currentSpeed < 0 && Input.GetAxis("Vertical") < 0) {
		BackLightObj.renderer.material = ReverseStateMat;
	} else if (braked) {
		BackLightObj.renderer.material = BrakeStateMat;
	} else {
		BackLightObj.renderer.material = IdleStateMat;
	}
	
	if (SecondBackLightObj != null) {
		if (currentSpeed > 0 && Input.GetAxis("Vertical") < 0) {
			SecondBackLightObj.renderer.material = BrakeStateMat;
		} else if (currentSpeed < 0 && Input.GetAxis("Vertical") > 0) {
			SecondBackLightObj.renderer.material = BrakeStateMat;
		} else if (currentSpeed < 0 && Input.GetAxis("Vertical") < 0) {
			SecondBackLightObj.renderer.material = ReverseStateMat;
		} else if (braked) {
			SecondBackLightObj.renderer.material = BrakeStateMat;
		} else {
			SecondBackLightObj.renderer.material = IdleStateMat;
		}
	}
}

function OnGUI () {
	GUI.color = Color.black;
	GUI.Label (Rect (5, 5, Screen.width, 30), "Nitro : " + nitroValue/10 + "%");
}

function Nitro () {
	if (Input.GetButton ("Fire2")) {
		useNitro = true;
	} else {
		useNitro = false;
	}

	if (useNitro && currentSpeed > 5 && nitroValue > 0) {
		speedTorque = 70;
		leftNitroFlame.emit = true;
		rightNitroFlame.emit = true;
		nitroValue --;
	} else {
		speedTorque = 50;
		leftNitroFlame.emit = false;
		rightNitroFlame.emit = false;
	}

	if (nitroValue < 1000 && !Input.GetButton ("Fire2") && currentSpeed > 20) {
		nitroValue ++;
	} else if (nitroValue > 1000) {
		nitroValue = 1000;
	}
}

function SetSlip (currentForwardFriction : float, currentSidewayFriction) {
	wheelRLCollider.forwardFriction.stiffness = currentForwardFriction;
	wheelRLCollider.sidewaysFriction.stiffness = currentSidewayFriction;
	wheelRRCollider.forwardFriction.stiffness = currentForwardFriction;
	wheelRRCollider.sidewaysFriction.stiffness = currentSidewayFriction;
}


