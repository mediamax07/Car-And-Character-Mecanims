using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class CharacterScript : MonoBehaviour {
	Animator animator;

	public List<Car> Cars = new List<Car> ();

	GameObject currentCar;

	bool goToCar;
	bool enterCar;
	bool canEnterCar;
	bool canChangeCar;

	float canEnterCarTimer = 1;

	float v;
	float h;

	public float lookAtDamping = 3;

	// Use this for initialization
	void Start () {
		animator = this.gameObject.GetComponent<Animator> ();
		canChangeCar = true;
	}
	
	// Update is called once per frame
	void Update () {
		if (!goToCar || !enterCar) {
			v = Input.GetAxis ("Vertical");
			h = Input.GetAxis ("Horizontal");
		}
		
		if (currentCar != null) {
			GoToCar ();
			EnterCar ();
		}

		CarChecker ();
		CharMov ();
	}

	void CarChecker () {
		foreach (Car c in Cars) {
			if (Vector3.Distance (transform.position, c.carPrefab.transform.position) < 15 && canChangeCar)
				currentCar = c.carPrefab;
		}
	}

	void GoToCar () {
		if (canEnterCar) {
			if (Vector3.Distance (transform.position, currentCar.transform.position) <= 15 && goToCar) {
				v = 1;
				h = 0;

				Quaternion rotation = Quaternion.LookRotation (currentCar.transform.position - transform.position);
				transform.rotation = Quaternion.Slerp (transform.rotation, rotation, Time.deltaTime * lookAtDamping);

				if (Vector3.Distance (transform.position, currentCar.transform.position) <= 2.1f) {
					goToCar = false;
					enterCar = true;
				}
			}
			
			if (Input.GetKeyDown (KeyCode.E)) {
				goToCar = true;
			} else if (Input.anyKeyDown) {
				goToCar = false;
			}
		}
	}

	void EnterCar () {
		if (enterCar) {
			v = 0;
			h = 0;

			transform.position = new Vector3 (currentCar.transform.position.x, currentCar.transform.position.y, currentCar.transform.position.z);
			transform.rotation = currentCar.transform.rotation;
			transform.localScale = new Vector3 (0.001f, 0.001f, 0.001f);

			canEnterCar = false;
			canChangeCar = false;
		} else {
			canEnterCarTimer -= Time.deltaTime;

			if (canEnterCarTimer <= 0) {
				canEnterCarTimer = 0;
				canEnterCar = true;
			}
			canChangeCar = true;
		}
		
		if (Input.GetKey (KeyCode.E) && enterCar) {
			transform.position = new Vector3 (currentCar.transform.position.x + 1.75f, transform.position.y, currentCar.transform.position.z);
			transform.localScale = new Vector3 (1, 1, 1);
			
			enterCar = false;
		}
	}

	void CharMov () {
		animator.SetFloat ("Speed", v);
		animator.SetFloat ("Direction", h);
	}
}

[System.Serializable]
public class Car {
	public string name;
	public GameObject carPrefab;
}
