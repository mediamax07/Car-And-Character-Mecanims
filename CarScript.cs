using UnityEngine;
using System.Collections;

public class CarScript : MonoBehaviour {
	public Car thisCar;
	public GameObject currentCharacter;

	// Use this for initialization
	void Start () {
		thisCar.name = this.gameObject.name;
		thisCar.carPrefab = this.gameObject;

		currentCharacter.GetComponent <CharacterScript> ().Cars.Add (thisCar);
	}
}
