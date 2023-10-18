extends RigidBody2D


func _on_Bullet_body_entered(body):
	print(body)
	if body.is_in_group("enemy"):
		body.queue_free()
	queue_free()
