#pragma strict
private var animator : Animator;

function Start () {
	animator = gameObject.GetComponent (Animator);
}

function Update () {
	animator.SetFloat ("Speed", Input.GetAxis ("Vertical"));
	animator.SetFloat ("Direction", Input.GetAxis ("Horizontal"));
}